const BASE = import.meta.env.VITE_API_URL || 'https://study-forge-usyo.onrender.com';

export async function apiFetch(endpoint, body = null) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not logged in');
    const opts = {
        method: body ? 'POST' : 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    };
    if (body) opts.body = JSON.stringify(body);
    const r = await fetch(`${BASE}${endpoint}`, opts);

    // Guard: if response is HTML (e.g. 404 page, Render sleep page), throw clearly
    const contentType = r.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
        throw new Error(`Server error (${r.status}) — backend may be waking up, try again`);
    }

    const d = await r.json();
    if (!r.ok) throw new Error(d.message || d.error || 'Request failed');
    return d;
}

export function parseJSON(text) {
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    try { return JSON.parse(clean); } catch { }
    const m = clean.match(/\[[\s\S]*\]/);
    if (m) try { return JSON.parse(m[0]); } catch { }
    return null;
}
