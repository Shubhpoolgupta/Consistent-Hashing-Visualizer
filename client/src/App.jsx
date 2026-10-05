import React, { useEffect, useState } from 'react';
import axios from 'axios';
import HashRing from './components/HashRing';
import LogPanel from './components/LogPanel';

const API = 'https://consistent-hashing-visualizer.onrender.com/api/ring';

function App() {
  const [nodes, setNodes] = useState([]);
  const [dataKeys, setDataKeys] = useState([]);
  const [nodeName, setNodeName] = useState('');
  const [keyName, setKeyName] = useState('');
  const [logs, setLogs] = useState([]);

  const logEvent = (msg) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const fetchState = async () => {
    const res = await axios.get(`${API}/state`);
    setNodes(res.data.nodes);
    setDataKeys(res.data.dataKeys);
  };

  useEffect(() => {
    fetchState();
  }, []);

  const addNode = async () => {
    if (!nodeName.trim()) return;
    await axios.post(`${API}/add-node`, { name: nodeName });
    logEvent(`Node "${nodeName}" added`);
    fetchState();
    setNodeName('');
  };

  const removeNode = async () => {
    if (!nodeName.trim()) return;
    await axios.post(`${API}/remove-node`, { name: nodeName });
    logEvent(`Node "${nodeName}" removed`);
    fetchState();
    setNodeName('');
  };

  const addKey = async () => {
    if (!keyName.trim()) return;
    await axios.post(`${API}/add-key`, { key: keyName });
    logEvent(`Key "${keyName}" added`);
    fetchState();
    setKeyName('');
  };

  const reset = async () => {
    await axios.post(`${API}/reset`);
    logEvent(`System reset`);
    fetchState();
  };

  // Group keys by assigned node
  const keysByNode = {};
  nodes.forEach(node => {
    keysByNode[node.name] = [];
  });
  dataKeys.forEach(d => {
    if (d.assignedNode && d.assignedNode.name) {
      if (!keysByNode[d.assignedNode.name]) keysByNode[d.assignedNode.name] = [];
      keysByNode[d.assignedNode.name].push(d.key);
    }
  });

  return (
    <div className="min-h-screen bg-white text-black pt-8 pb-4">
      <div className="max-w-5xl mx-auto">
        {/* <div className="bg-blue-50 p-6 rounded-xl mb-8 shadow">
          <h2 className="text-3xl font-bold text-black mb-2">What is Consistent Hashing?</h2>
          <p className="text-base text-gray-700 mt-2">
            Consistent hashing is a distributed hashing technique that minimizes key redistribution
            when nodes are added or removed. It’s widely used in systems like distributed caches,
            load balancers, and DHTs (like Amazon Dynamo or Apache Cassandra).
          </p>
        </div> */}
        <h1 className="text-5xl mb-8 font-extrabold text-center text-black drop-shadow-lg">Consistent Hashing Visualizer</h1>
        <div className="flex flex-wrap gap-4 mb-10 justify-center">
          <input
            value={nodeName}
            onChange={e => setNodeName(e.target.value)}
            placeholder="Node Name"
            className="p-3 text-black bg-white rounded-lg border-2 border-blue-400 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            onClick={addNode}
            className="bg-blue-500 hover:bg-blue-600 p-3 rounded-lg font-semibold text-white transition"
          >
            Add Node
          </button>
          <button
            onClick={removeNode}
            className="bg-red-500 hover:bg-red-600 p-3 rounded-lg font-semibold text-white transition"
          >
            Remove Node
          </button>
          <input
            value={keyName}
            onChange={e => setKeyName(e.target.value)}
            placeholder="Key"
            className="p-3 text-black bg-white rounded-lg border-2 border-blue-400 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            onClick={addKey}
            className="bg-blue-500 hover:bg-blue-600 p-3 rounded-lg font-semibold text-white transition"
          >
            Add Key
          </button>
          <button
            onClick={reset}
            className="bg-gray-200 hover:bg-gray-300 p-3 rounded-lg font-semibold text-black transition"
          >
            Reset
          </button>
        </div>

        {/* Node-Key Mapping Section */}
        <div className="mb-10 bg-gray-100 p-6 rounded-xl shadow">
          <h3 className="text-xl font-bold mb-4 text-black">Node-Key Mapping</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {nodes.length === 0 ? (
              <div className="text-gray-400 col-span-2">No nodes present.</div>
            ) : (
              nodes.map((node, idx) => (
                <div key={node.name} className="bg-white p-4 rounded-lg shadow border border-blue-100">
                  <div
                    className="font-bold text-black mb-2 text-lg flex items-center gap-2"
                    title={`Node: ${node.name} (Node #${idx + 1})`}
                  >
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                    {node.name}
                  </div>
                  <div className="text-sm flex flex-wrap gap-2">
                    {keysByNode[node.name] && keysByNode[node.name].length > 0
                      ? keysByNode[node.name].map((key, kidx) => (
                          <span
                            key={key}
                            className="inline-block bg-blue-50 px-3 py-1 rounded-full text-blue-700 border border-blue-400"
                            title={`Key: ${key} (Key #${kidx + 1})`}
                          >
                            {key}
                          </span>
                        ))
                      : <span className="text-gray-400">No keys</span>
                    }
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <HashRing nodes={nodes} dataKeys={dataKeys} />
          </div>
          <div>
            <LogPanel logs={logs} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
