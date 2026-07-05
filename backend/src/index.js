const express = require('express');
const cors = require('cors');
require('dotenv').config();

const productsRouter = require('./routes/products');
const promotionsRouter = require('./routes/promotions');
const hallOfFameRouter = require('./routes/hallOfFame');
const activitiesRouter = require('./routes/activities');
const contactRouter = require('./routes/contact');
const membersRouter = require('./routes/members');
const ordersRouter = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/products', productsRouter);
app.use('/api/promotions', promotionsRouter);
app.use('/api/hall-of-fame', hallOfFameRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/contact', contactRouter);
app.use('/api/members', membersRouter);
app.use('/api/orders', ordersRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
