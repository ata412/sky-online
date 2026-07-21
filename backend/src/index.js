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
const chatbotRouter = require('./routes/chatbot');
const videoStudioRouter = require('./routes/videoStudio');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use('/api/video-studio', express.json({ limit: '20mb' }), videoStudioRouter);
app.use(express.json({ limit: '1mb' }));

app.use('/api/products', productsRouter);
app.use('/api/promotions', promotionsRouter);
app.use('/api/hall-of-fame', hallOfFameRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/contact', contactRouter);
app.use('/api/members', membersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/chatbot', chatbotRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
