const express = require('express');
const cors = require('cors');
require('dotenv').config();
const ringRoutes = require('./routes/ring');
const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' })); // lock down in production
app.use(express.json({ limit: '10kb' }));
app.use('/api/ring', ringRoutes);
// Central error handler: JSON in, JSON out, no stack-trace leaks
app.use((err, req, res, next) => {
 console.error(err);
 res.status(err.status || 500).json({ error: err.status ? err.message : 'Internal server error' });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));