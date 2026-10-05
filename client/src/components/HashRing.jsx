import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HashRing = ({ nodes, dataKeys }) => {
  const size = 500;
  const center = size / 2;
  const radius = 200;

  return (
    <div className="mt-8 flex justify-center items-center">
      <svg width={size} height={size}>
        <circle cx={center} cy={center} r={radius} stroke="#444" fill="none" />
        <AnimatePresence>
          {nodes.map((node, idx) => {
            const theta = (node.hash / 0xffffffff) * 2 * Math.PI;
            const x = center + radius * Math.cos(theta);
            const y = center + radius * Math.sin(theta);
            return (
              <motion.circle
                key={node.hash}
                cx={x}
                cy={y}
                r={10}
                fill="lime"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.3 }}
              >
                <title>{`Node: ${node.name} (Node #${idx + 1})`}</title>
              </motion.circle>
            );
          })}
        </AnimatePresence>

        <AnimatePresence>
          {dataKeys.map((d, kidx) => {
            const theta = (d.hash / 0xffffffff) * 2 * Math.PI;
            const x = center + (radius - 30) * Math.cos(theta);
            const y = center + (radius - 30) * Math.sin(theta);
            return (
              <motion.circle
                key={d.hash + d.key}
                cx={x}
                cy={y}
                r={6}
                fill="skyblue"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <title>{`Key: ${d.key} (Key #${kidx + 1})`}</title>
              </motion.circle>
            );
          })}
        </AnimatePresence>
      </svg>
    </div>
  );
};

export default HashRing;
