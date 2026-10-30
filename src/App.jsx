import { useEffect, useMemo, useState } from 'react'
import { api, countDays, calcAmount, money } from './api.js'

const TABS = ['Home', 'Vehicles', 'Customers', 'Rentals']
const TYPE_ICON = { SUV: '🚙', Car: '🚗', Bike: '🏍️', Scooter: '🛵', Van: '🚐' }
const today = () => new Date().toISOString().slice(0, 10)

export default function App() {
  const [tab, setTab] = useState('Home')
  const [vehicles, setVehicles] = useState([])
  const [customers, setCustomers] = useState([])
  const [rentals, setRentals] = useState([])
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  
  // Auth state
  const [user, setUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const loadAll = async () => {
    try {
      const [v, c, r] = await Promise.all([
        api.getAll('vehicles'),
        api.getAll('customers'),
        api.getAll('rentals'),
      ])
      setVehicles(v)
      setCustomers(c)
      setRentals(r)
      setError('')
    } catch {
      setError('Cannot reach JSON Server. Run "npx json-server --watch db.json --port 3000"')
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const notify = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2600)
  }

  const run = async (fn, okMsg) => {
    try {
      await fn()
      await loadAll()
      if (okMsg) notify(okMsg)
    } catch (e) {
      setError(e.message)
    }
  }

  const handleGoogleLogin = () => {
    setUser({
      name: 'Puja Sri',
      email: 'pujasri@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    })
    setShowAuthModal(false)
    notify('Signed in successfully!')
  }

  const stats = useMemo(() => {
    const revenue = rentals.filter((r) => r.status !== 'Cancelled').reduce((s, r) => s + r.amount, 0)
    return {
      total: vehicles.length,
      available: vehicles.filter((v) => v.available).length,
      active: rentals.filter((r) => r.status === 'Active').length,
      revenue,
    }
  }, [vehicles, rentals])

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="editorial-topbar">
        <div className="brand-logo">
          VANTAGE<b style={{ color: '#e11d48' }}>RENT</b>
        </div>
        <nav className="nav-links">
          {TABS.map((t) => (
            <button key={t} className={tab === t ? 'nav-link active' : 'nav-link'} onClick={() => setTab(t)}>
              {t.toUpperCase()}
            </button>
          ))}
        </nav>
        <div className="auth-corner">
          {user ? (
            <div className="user-profile-badge">
              <img src={user.avatar} alt={user.name} className="user-avatar" />
              <span>{user.name}</span>
              <button className="btn ghost small logout-btn" onClick={() => setUser(null)}>Logout</button>
            </div>
          ) : (
            <button className="btn neon-btn login-nav-btn" onClick={() => setShowAuthModal(true)}>
              Login / Sign Up
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="banner error" onClick={() => setError('')}>
          {error}
        </div>
      )}

      <main>
        {tab === 'Home' && <Home setTab={setTab} />}
        {tab === 'Vehicles' && (
          <Vehicles vehicles={vehicles} customers={customers} run={run} reload={loadAll} setTab={setTab} />
        )}
        {tab === 'Customers' && <Customers customers={customers} run={run} />}
        {tab === 'Rentals' && <Rentals rentals={rentals} vehicles={vehicles} customers={customers} run={run} />}
      </main>

      <section className="stats">
        <Stat label="Total Fleet" value={stats.total} tone="blue" />
        <Stat label="Available Vehicles" value={stats.available} tone="green" />
        <Stat label="Active Rentals" value={stats.active} tone="red" />
        <Stat label="Total Revenue" value={money(stats.revenue)} tone="rose" />
      </section>

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          onGoogleAuth={handleGoogleLogin} 
          setUser={setUser} 
          notify={notify} 
        />
      )}

      {toast && <div className="toast">{toast}</div>}
      <footer>© 2026 VantageRent Vehicle Rental Portal</footer>
    </div>
  )
}

function Stat({ label, value, tone }) {
  return (
    <div className={`stat ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

/* ---------------- Home Page ---------------- */

function Home({ setTab }) {
  return (
    <div className="home-view">
      {/* Full Screen Edge-to-Edge Hero Banner */}
      <section className="cinematic-hero-fullscreen">
        <div className="hero-fullscreen-content">
          <span className="hero-subtag">LUXURY & PERFORMANCE FLEET</span>
          <h1 className="hero-title">
            Your Next Ride <br /><span className="red-text">Awaits!</span>
          </h1>
          <p className="hero-desc">
            Rent premium vehicles for your next adventure, business trip or everyday travel. Fast. Easy. Reliable.
          </p>

          {/* Quick Search Floating Bar */}
          <div className="quick-search-bar">
            <div className="search-field">
              <label>Pick-up Location</label>
              <input type="text" defaultValue="Bangalore" />
            </div>
            <div className="search-field">
              <label>Drop-off Location</label>
              <input type="text" defaultValue="Bangalore" />
            </div>
            <div className="search-field">
              <label>Pick-up Date</label>
              <input type="date" defaultValue={today()} />
            </div>
            <div className="search-field">
              <label>Drop-off Date</label>
              <input type="date" defaultValue={today()} />
            </div>
            <button className="btn neon-btn search-btn" onClick={() => setTab('Vehicles')}>
              Search
            </button>
          </div>

          <div className="hero-badges">
            <div className="badge-item">🚘 Wide Range of Vehicles</div>
            <div className="badge-item">🏷️ Affordable Prices</div>
            <div className="badge-item">🎧 24/7 Support</div>
            <div className="badge-item">🔒 Secure & Trusted</div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Features */}
      <section className="features-section">
        <h2>Why Choose VantageRent?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <span>🛡️</span>
            <h3>Premium Fleet</h3>
            <p className="muted">Top brands, well-maintained vehicles for ultimate comfort.</p>
          </div>
          <div className="feature-card">
            <span>⚡</span>
            <h3>Flexible Rentals</h3>
            <p className="muted">Daily, weekly, & monthly rental plans tailored for you.</p>
          </div>
          <div className="feature-card">
            <span>🎧</span>
            <h3>24/7 Support</h3>
            <p className="muted">We're always here to help you on the road.</p>
          </div>
          <div className="feature-card">
            <span>🔒</span>
            <h3>Secure Payments</h3>
            <p className="muted">Multiple payment options with full transaction security.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ---------------- Auth Modal ---------------- */

function AuthModal({ onClose, onGoogleAuth, setUser, notify }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setUser({
      name: name || email.split('@')[0],
      email: email,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
    })
    notify(isSignUp ? 'Account created successfully!' : 'Signed in successfully!')
    onClose()
  }

  return (
    <Modal title={isSignUp ? "Create Account" : "Welcome Back"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="form">
        {isSignUp && (
          <label>
            Full Name
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
          </label>
        )}
        <label>
          Email Address
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
        </label>
        <label>
          Password
          <input type="password" required placeholder="••••••••" />
        </label>
        <button className="btn neon-btn" type="submit">
          {isSignUp ? "Sign Up" : "Sign In"}
        </button>
      </form>

      <div className="auth-divider">
        <span>OR</span>
      </div>

      <button className="google-auth-btn" onClick={onGoogleAuth}>
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        Continue with Google
      </button>

      <p className="auth-toggle-text">
        {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
        <span onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? "Sign In" : "Sign Up"}
        </span>
      </p>
    </Modal>
  )
}

/* ---------------- Vehicles ---------------- */

const emptyVehicle = { name: '', type: 'Car', plate: '', pricePerDay: '', available: true, image: '' }

function Vehicles({ vehicles, customers, run }) {
  const [filter, setFilter] = useState('All')
  const [form, setForm] = useState(null)
  const [renting, setRenting] = useState(null)

  const types = ['All', ...new Set(vehicles.map((v) => v.type))]
  const shown = vehicles.filter((v) => filter === 'All' || v.type === filter)

  const save = (e) => {
    e.preventDefault()
    const body = { ...form, pricePerDay: Number(form.pricePerDay) }
    run(
      () => (form.id ? api.update('vehicles', form.id, body) : api.create('vehicles', body)),
      form.id ? 'Vehicle updated' : 'Vehicle added'
    )
    setForm(null)
  }

  const del = (v) => {
    if (confirm(`Delete ${v.name}?`)) run(() => api.remove('vehicles', v.id), 'Vehicle deleted')
  }

  return (
    <>
      <div className="toolbar" style={{ marginTop: '20px' }}>
        <div className="chips">
          {types.map((t) => (
            <button key={t} className={filter === t ? 'chip on' : 'chip'} onClick={() => setFilter(t)}>
              {t}
            </button>
          ))}
        </div>
        <button className="btn neon-btn" onClick={() => setForm({ ...emptyVehicle })}>
          + Add vehicle
        </button>
      </div>

      <div className="grid">
        {shown.map((v) => (
          <article key={v.id} className={v.available ? 'card' : 'card dim'}>
            <div className="vehicle-image-wrap">
              <img 
                src={v.image && v.image.trim() !== '' ? v.image : "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80"} 
                alt={v.name} 
                className="vehicle-img" 
              />
              <span className={v.available ? 'pill green' : 'pill red'}>
                {v.available ? 'Available' : 'Rented'}
              </span>
            </div>
            
            <div className="card-content">
              <h3>{v.name}</h3>
              <p className="muted">
                {TYPE_ICON[v.type] || '🚘'} {v.type} · {v.plate}
              </p>
              <div className="price-row">
                <div className="price">
                  {money(v.pricePerDay)} <small>/ day</small>
                </div>
              </div>
              <div className="actions">
                <button className="btn blue" disabled={!v.available} onClick={() => setRenting(v)}>
                  Rent now
                </button>
                <button className="btn ghost" onClick={() => setForm({ ...v })}>
                  Edit
                </button>
                <button className="btn ghost danger" onClick={() => del(v)}>
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
        {shown.length === 0 && <p className="muted">No vehicles found.</p>}
      </div>

      {form && (
        <Modal title={form.id ? 'Edit vehicle' : 'Add vehicle'} onClose={() => setForm(null)}>
          <form onSubmit={save} className="form">
            <label>
              Name
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              Type
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {Object.keys(TYPE_ICON).map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              Plate number
              <input required value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} />
            </label>
            <label>
              Price per day (₹)
              <input
                required
                type="number"
                min="1"
                value={form.pricePerDay}
                onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })}
              />
            </label>
            <label>
              Image URL
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={form.image || ''}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
              />
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) => setForm({ ...form, available: e.target.checked })}
              />
              Available for rent
            </label>
            <button className="btn neon-btn" type="submit">
              Save
            </button>
          </form>
        </Modal>
      )}

      {renting && (
        <RentModal vehicle={renting} customers={customers} run={run} onClose={() => setRenting(null)} />
      )}
    </>
  )
}

function RentModal({ vehicle, customers, run, onClose }) {
  const [customerId, setCustomerId] = useState(customers[0]?.id || '')
  const [startDate, setStartDate] = useState(today())
  const [endDate, setEndDate] = useState('')
  const days = countDays(startDate, endDate)
  const amount = calcAmount(days, vehicle.pricePerDay)

  const submit = (e) => {
    e.preventDefault()
    if (!customerId) return alert('Add a customer first.')
    if (days < 1) return alert('End date must be after start date.')
    run(async () => {
      await api.create('rentals', {
        vehicleId: vehicle.id,
        customerId: Number(customerId),
        startDate,
        endDate,
        days,
        pricePerDay: vehicle.pricePerDay,
        amount,
        status: 'Active',
      })
      await api.update('vehicles', vehicle.id, { ...vehicle, available: false })
    }, 'Vehicle rented')
    onClose()
  }

  return (
    <Modal title={`Rent ${vehicle.name}`} onClose={onClose}>
      <form onSubmit={submit} className="form">
        <label>
          Customer
          <select required value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            {customers.length === 0 && <option value="">No customers yet</option>}
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phone})
              </option>
            ))}
          </select>
        </label>
        <div className="row">
          <label>
            Start date
            <input type="date" required value={startDate} min={today()} onChange={(e) => setStartDate(e.target.value)} />
          </label>
          <label>
            End date
            <input type="date" required value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>
        </div>
        <div className="summary">
          <div>
            <span>Days</span>
            <b>{days}</b>
          </div>
          <div>
            <span>Price / day</span>
            <b>{money(vehicle.pricePerDay)}</b>
          </div>
          <div className="total">
            <span>Rental amount</span>
            <b>{money(amount)}</b>
          </div>
        </div>
        <button className="btn neon-btn" type="submit">
          Confirm rental
        </button>
      </form>
    </Modal>
  )
}

/* ---------------- Customers ---------------- */

const emptyCustomer = { name: '', phone: '', email: '', licenseNo: '' }

function Customers({ customers, run }) {
  const [form, setForm] = useState(null)

  const save = (e) => {
    e.preventDefault()
    run(
      () => (form.id ? api.update('customers', form.id, form) : api.create('customers', form)),
      form.id ? 'Customer updated' : 'Customer added'
    )
    setForm(null)
  }

  const del = (c) => {
    if (confirm(`Delete ${c.name}?`)) run(() => api.remove('customers', c.id), 'Customer deleted')
  }

  return (
    <>
      <div className="toolbar" style={{ marginTop: '20px' }}>
        <h2>Customers</h2>
        <button className="btn neon-btn" onClick={() => setForm({ ...emptyCustomer })}>
          + Add customer
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>License</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.phone}</td>
                <td>{c.email}</td>
                <td>{c.licenseNo}</td>
                <td className="right">
                  <button className="btn ghost small" onClick={() => setForm({ ...c })}>
                    Edit
                  </button>
                  <button className="btn ghost danger small" onClick={() => del(c)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan="5" className="muted">
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {form && (
        <Modal title={form.id ? 'Edit customer' : 'Add customer'} onClose={() => setForm(null)}>
          <form onSubmit={save} className="form">
            <label>
              Full name
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              Phone
              <input
                required
                pattern="[0-9]{10}"
                title="10 digit phone number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>
            <label>
              Email
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <label>
              Driving license no.
              <input required value={form.licenseNo} onChange={(e) => setForm({ ...form, licenseNo: e.target.value })} />
            </label>
            <button className="btn neon-btn" type="submit">
              Save
            </button>
          </form>
        </Modal>
      )}
    </>
  )
}

/* ---------------- Rentals ---------------- */

function Rentals({ rentals, vehicles, customers, run }) {
  const vName = (id) => vehicles.find((v) => v.id === id)?.name || `Vehicle #${id}`
  const cName = (id) => customers.find((c) => c.id === id)?.name || `Customer #${id}`

  const setStatus = (r, status) => {
    run(async () => {
      await api.update('rentals', r.id, { ...r, status })
      const v = vehicles.find((x) => x.id === r.vehicleId)
      if (v) await api.update('vehicles', v.id, { ...v, available: true })
    }, status === 'Returned' ? 'Vehicle returned' : 'Rental cancelled')
  }

  const del = (r) => {
    if (!confirm(`Delete rental #${r.id}?`)) return
    run(async () => {
      await api.remove('rentals', r.id)
      const v = vehicles.find((x) => x.id === r.vehicleId)
      if (v && r.status === 'Active') await api.update('vehicles', v.id, { ...v, available: true })
    }, 'Rental deleted')
  }

  return (
    <>
      <div className="toolbar" style={{ marginTop: '20px' }}>
        <h2>Rental transactions</h2>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Vehicle</th>
              <th>Customer</th>
              <th>Period</th>
              <th>Days × Rate</th>
              <th>Amount</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {[...rentals].reverse().map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{vName(r.vehicleId)}</td>
                <td>{cName(r.customerId)}</td>
                <td>
                  {r.startDate} → {r.endDate}
                </td>
                <td>
                  {r.days} × {money(r.pricePerDay)}
                </td>
                <td className="amt">{money(r.amount)}</td>
                <td>
                  <span className={`pill ${r.status === 'Active' ? 'blue' : r.status === 'Returned' ? 'green' : 'red'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="right">
                  {r.status === 'Active' && (
                    <>
                      <button className="btn ghost small" onClick={() => setStatus(r, 'Returned')}>
                        Return
                      </button>
                      <button className="btn ghost small" onClick={() => setStatus(r, 'Cancelled')}>
                        Cancel
                      </button>
                    </>
                  )}
                  <button className="btn ghost danger small" onClick={() => del(r)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {rentals.length === 0 && (
              <tr>
                <td colSpan="8" className="muted">
                  No rentals yet. Rent a vehicle from the Vehicles tab.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

/* ---------------- Shared Modal ---------------- */

function Modal({ title, onClose, children }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="x" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}