const API_BASE_URL = "https://vantagerent.onrender.com";

export const api = {
  async getAll(resource) {
    const res = await fetch(`${API_BASE}/${resource}`);
    if (!res.ok) throw new Error(`Failed to fetch ${resource}`);
    return res.json();
  },
  async getById(resource, id) {
    const res = await fetch(`${API_BASE}/${resource}/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch ${resource}/${id}`);
    return res.json();
  },
  async create(resource, data) {
    const res = await fetch(`${API_BASE}/${resource}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create ${resource}`);
    return res.json();
  },
  async update(resource, id, data) {
    const res = await fetch(`${API_BASE}/${resource}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update ${resource}/${id}`);
    return res.json();
  },
  async remove(resource, id) {
    const res = await fetch(`${API_BASE}/${resource}/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`Failed to delete ${resource}/${id}`);
    return true;
  },
};

export function countDays(start, end) {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff + 1 : 0;
}

export function calcAmount(days, pricePerDay) {
  return (days || 0) * (pricePerDay || 0);
}

export function money(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}