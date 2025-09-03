const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./config/database');
const { setupCronJobs } = require('./cronJobs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
// Increase request size limit for images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Check subscription status for all routes
const checkSubscriptionStatus = require('./middleware/subscriptionCheck');
app.use(checkSubscriptionStatus);


// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/renewal', require('./routes/renewal'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/subscription', require('./routes/subscription'));
app.use('/api/websites', require('./routes/website'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/courier', require('./routes/courier'));
app.use('/api/pixel', require('./routes/pixel'));
app.use('/api/domain', require('./routes/domain'));

// Banner route
app.use('/api/banner', require('./routes/banner'));

// Serve banner uploads statically
const path = require('path');
app.use('/uploads/banners', express.static(path.join(__dirname, 'uploads/banners')));

// Database connection
sequelize.authenticate()
  .then(async () => {
    console.log('Database connected successfully.');
    await sequelize.sync();
  })
  .then(() => {
    console.log('Database synchronized.');
    // Setup cron jobs after database is ready
    setupCronJobs();
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
