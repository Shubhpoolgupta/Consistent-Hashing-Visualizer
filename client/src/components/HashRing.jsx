import { motion, AnimatePresence } from 'framer-motion';
const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c', '#0891b2', '#ca8a04', '#db2777'];
const SIZE = 500, C = SIZE / 2, R = 200;
const RING_SIZE = 2 ** 32; // 32-bit hash space
const angle = (h) => (h / RING_SIZE) * 2 * Math.PI - Math.PI / 2; // 0 at 12 o'clock
const pos = (h, r) => ({ x: C + r * Math.cos(angle(h)), y: C + r * Math.sin(angle(h)) });
const HashRing = ({ nodes, dataKeys }) => {
 const colorOf = Object.fromEntries(nodes.map((n, i) => [n.name, COLORS[i % COLORS.length]]));
 return (
 <div className="mt-8 flex justify-center">
 <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[500px]">
 <circle cx={C} cy={C} r={R} stroke="#444" fill="none" />
 <AnimatePresence>
 {nodes.flatMap((n) =>
 n.points.map((h, i) => {
 const { x, y } = pos(h, R);
 return (
 <motion.circle key={`${n.name}#${i}`} cx={x} cy={y} r={4} fill={colorOf[n.name]}
 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
 <title>{`Node: ${n.name} (virtual node ${i})`}</title>
 </motion.circle>
 );
 })
 )}
 </AnimatePresence>
 <AnimatePresence>
 {dataKeys.map((d) => {
 const { x, y } = pos(d.hash, R - 30);
 return (
 <motion.circle key={d.key} cx={x} cy={y} r={6} stroke="#fff" strokeWidth={1.5}
 fill={d.assignedNode ? colorOf[d.assignedNode.name] : '#9ca3af'}
 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
 <title>{`Key: ${d.key} -> ${d.assignedNode ? d.assignedNode.name : 'unassigned'}`}</title>
 </motion.circle>
 );
 })}
 </AnimatePresence>
 </svg>
 </div>
 );
};
export default HashRing;
