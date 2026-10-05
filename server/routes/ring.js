const express = require('express');
const router = express.Router();

let ring = {}; // { hash: nodeId }
let nodes = []; // [{ id, name, hash }]
let dataKeys = []; // [{ key, hash, assignedNode }]

const hashFn = (str) =>
  parseInt(
    require('crypto').createHash('md5').update(str).digest('hex').slice(0, 8),
    16
  );

function redistribute() {
  if (nodes.length === 0) {
    dataKeys.forEach(d => d.assignedNode = null);
    return;
  }
  // Sort nodes by hash
  const sortedNodes = [...nodes].sort((a, b) => a.hash - b.hash);
  dataKeys.forEach((d) => {
    // Find the first node with hash >= key's hash
    let assigned = sortedNodes.find(n => n.hash >= d.hash);
    // If not found, wrap around to the first node (smallest hash)
    if (!assigned) assigned = sortedNodes[0];
    d.assignedNode = assigned;
  });
}

router.get('/state', (req, res) => {
  res.json({ nodes, dataKeys });
});

router.post('/add-node', (req, res) => {
  const { name } = req.body;
  const hash = hashFn(name);
  const node = { id: Date.now(), name, hash };
  nodes.push(node);
  redistribute();
  res.json({ nodes, dataKeys });
});

router.post('/remove-node', (req, res) => {
  const { name } = req.body;
  const hash = hashFn(name);
  nodes = nodes.filter((n) => n.hash !== hash);
  redistribute();
  res.json({ nodes, dataKeys });
});

router.post('/add-key', (req, res) => {
  const { key } = req.body;
  const hash = hashFn(key);
  dataKeys.push({ key, hash, assignedNode: null });
  redistribute();
  res.json({ nodes, dataKeys });
});

router.post('/reset', (req, res) => {
  nodes = [];
  dataKeys = [];
  ring = {};
  res.json({ nodes, dataKeys });
});

module.exports = router;
