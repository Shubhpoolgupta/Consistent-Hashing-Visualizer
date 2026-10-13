const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const VNODES = Number(process.env.VNODES) || 50; // virtual nodes per physical node
const MAX_KEYS = 500; // basic abuse protection
const hashFn = (s) =>
 parseInt(crypto.createHash('md5').update(s).digest('hex').slice(0, 8), 16);
const nodes = new Map(); // name -> { name, hash, points: [vnode hashes] }
const dataKeys = new Map(); // key -> { key, hash, assignedNode }
let ring = []; // [{ hash, node }] sorted by hash (all virtual nodes)
const clean = (v) =>
 typeof v === 'string' && v.trim() && v.trim().length <= 64 ? v.trim() : null;
function rebuildRing() {
 ring = [];
 for (const n of nodes.values()) {
 n.points = [];
 for (let i = 0; i < VNODES; i++) {
 const h = hashFn(`${n.name}#${i}`);
 n.points.push(h);
 ring.push({ hash: h, node: n.name });
 }
 }
 ring.sort((a, b) => a.hash - b.hash);
}
// Binary search: first ring point with hash >= h, wrapping to index 0
function lookup(h) {
 let lo = 0, hi = ring.length;
 while (lo < hi) {
 const mid = (lo + hi) >> 1;
 if (ring[mid].hash >= h) hi = mid; else lo = mid + 1;
 }
 return ring[lo % ring.length].node;
}
// Re-assign every key; return how many keys CHANGED owner (the whole point!)
function redistribute() {
 let moved = 0;
 for (const d of dataKeys.values()) {
 const next = ring.length ? nodes.get(lookup(d.hash)) : null;
 const prevName = d.assignedNode ? d.assignedNode.name : null;
 if (prevName !== null && (next ? next.name : null) !== prevName) moved++;
 d.assignedNode = next;
 }
 return moved;
}
const snapshot = (extra = {}) =>
 ({ nodes: [...nodes.values()], dataKeys: [...dataKeys.values()], ...extra });
router.get('/state', (req, res) => res.json(snapshot()));
router.post('/add-node', (req, res) => {
 const name = clean(req.body?.name);
 if (!name) return res.status(400).json({ error: 'name must be a non-empty string (max 64 chars)' });
 if (nodes.has(name)) return res.status(409).json({ error: `node "${name}" already exists` });
 nodes.set(name, { name, hash: hashFn(name), points: [] });
 rebuildRing();
 res.status(201).json(snapshot({ moved: redistribute() }));
});
router.post('/remove-node', (req, res) => {
 const name = clean(req.body?.name);
 if (!name) return res.status(400).json({ error: 'name must be a non-empty string (max 64 chars)' });
 if (!nodes.delete(name)) return res.status(404).json({ error: `node "${name}" not found` });
 rebuildRing();
 res.json(snapshot({ moved: redistribute() }));
});
router.post('/add-key', (req, res) => {
 const key = clean(req.body?.key);
 if (!key) return res.status(400).json({ error: 'key must be a non-empty string (max 64 chars)' });
 if (dataKeys.has(key)) return res.status(409).json({ error: `key "${key}" already exists` });
 if (dataKeys.size >= MAX_KEYS) return res.status(429).json({ error: `limit of ${MAX_KEYS} keys reached` });
 dataKeys.set(key, { key, hash: hashFn(key), assignedNode: null });
 redistribute();
 res.status(201).json(snapshot());
});
router.post('/reset', (req, res) => {
 nodes.clear(); dataKeys.clear(); ring = [];
 res.json(snapshot());
});
module.exports = router;
