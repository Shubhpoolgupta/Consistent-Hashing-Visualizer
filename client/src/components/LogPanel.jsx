import React from 'react';

const LogPanel = ({ logs }) => {
  return (
    <div className="bg-white p-4 rounded mt-6 max-h-64 overflow-y-auto shadow border border-blue-100">
      <h3 className="text-lg font-semibold text-black mb-2">Event Logs</h3>
      <ul className="text-sm text-black space-y-1">
        {logs.slice().reverse().map((log, idx) => (
          <li key={idx} className="border-b border-gray-700 pb-1">{log}</li>
        ))}
      </ul>
    </div>
  );
};

export default LogPanel;
