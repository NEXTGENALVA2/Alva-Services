const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./config/database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/subscription', require('./routes/subscription'));
app.use('/api/website', require('./routes/website'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/courier', require('./routes/courier'));

// Database connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
    return sequelize.sync();
  })
  .then(() => {
    console.log('Database synchronized.');
  })
  .catch(err => {
    console.warn('Database connection failed, running without database:');
    console.warn('- Install PostgreSQL and create database "ecommerce_saas"');
    console.warn('- Or use online database service like Supabase/Railway');
    console.warn('- Server will run but auth/data features will not work');
  });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
