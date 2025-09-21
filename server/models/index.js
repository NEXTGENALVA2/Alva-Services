const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Admin model
const Admin = sequelize.define('Admin', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'super_admin'), defaultValue: 'admin' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
});

// User model
const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  phone: DataTypes.STRING,
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  trialEndsAt: DataTypes.DATE,
  subscriptionType: { type: DataTypes.ENUM('trial', 'monthly', '6month', 'yearly'), defaultValue: 'trial' },
  subscriptionEndsAt: DataTypes.DATE,
  // Trial tracking fields
  hasUsedTrial: { type: DataTypes.BOOLEAN, defaultValue: false },
  trialEnabledByAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
  // Payment fields
  paymentMethod: DataTypes.STRING,
  transactionId: DataTypes.STRING,
  paymentPhone: DataTypes.STRING,
  paymentScreenshot: DataTypes.STRING,
  paymentPlanId: DataTypes.STRING,
  paymentApproved: { type: DataTypes.BOOLEAN, defaultValue: false },
  paymentApprovedAt: DataTypes.DATE,
});

// Website model
const Website = sequelize.define('Website', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  domain: { type: DataTypes.STRING, unique: true },
  theme: { type: DataTypes.STRING, defaultValue: 'default' },
  logo: DataTypes.STRING,
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  settings: { type: DataTypes.JSONB, defaultValue: {} },
  userId: { type: DataTypes.UUID, allowNull: true, references: { model: 'Users', key: 'id' } }, // Allow null for auto-generated websites
});

// Product model
const Product = sequelize.define('Product', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  desc: DataTypes.TEXT, // Full Description field
  shortDesc: DataTypes.TEXT,
  brand: DataTypes.STRING,
  sku: DataTypes.STRING,
  category: DataTypes.STRING,
  subcategory: DataTypes.STRING, // Added subcategory field
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  oldPrice: DataTypes.DECIMAL(10, 2),
  buyPrice: DataTypes.DECIMAL(10, 2),
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  condition: { type: DataTypes.STRING, defaultValue: 'New' },
  status: { type: DataTypes.STRING, defaultValue: 'ACTIVE' },
  video: DataTypes.STRING,
  images: { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
  variations: { type: DataTypes.JSONB, defaultValue: {} },
  details: { type: DataTypes.JSONB, defaultValue: [] },
  unit: DataTypes.STRING,
  warranty: DataTypes.STRING,
  deliveryApplied: { type: DataTypes.BOOLEAN, defaultValue: true },
  deliveryCharge: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  websiteId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Websites', key: 'id' } },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
});

// Banner model
const Banner = sequelize.define('Banner', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: DataTypes.STRING,
  subtitle: DataTypes.STRING,
  image: DataTypes.TEXT,
  imageUrl: DataTypes.STRING,
  link: DataTypes.STRING,
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
  websiteId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Websites', key: 'id' }
  }
});

// Associations
Website.hasMany(Product, { foreignKey: 'websiteId', as: 'products' });
Product.belongsTo(Website, { foreignKey: 'websiteId' });

// Order model
const Order = sequelize.define('Order', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  customerName: { type: DataTypes.STRING, allowNull: false },
  customerEmail: DataTypes.STRING,
  customerPhone: { type: DataTypes.STRING, allowNull: false },
  customerAddress: { type: DataTypes.TEXT, allowNull: false },
  customerDivision: DataTypes.STRING,
  customerDistrict: DataTypes.STRING,
  totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  subTotal: DataTypes.DECIMAL(10, 2),
  deliveryCharge: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  deliveryType: { type: DataTypes.ENUM('normal', 'express'), defaultValue: 'normal' },
  advancePayment: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  note: DataTypes.TEXT,
  status: { type: DataTypes.ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'), defaultValue: 'pending' },
  paymentStatus: { type: DataTypes.ENUM('pending', 'paid', 'failed'), defaultValue: 'pending' },
  paymentMethod: { type: DataTypes.STRING, defaultValue: 'cash_on_delivery' },
  trackingNumber: DataTypes.STRING,
  courierService: DataTypes.STRING,
  websiteId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Websites', key: 'id' } },
});

// Order Items model
const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  productName: { type: DataTypes.STRING, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  totalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  variation: DataTypes.JSONB,
});

// Subscription model
const Subscription = sequelize.define('Subscription', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  type: { type: DataTypes.ENUM('monthly', '6month', 'yearly'), allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.ENUM('active', 'cancelled', 'expired'), defaultValue: 'active' },
  startDate: { type: DataTypes.DATE, allowNull: false },
  endDate: { type: DataTypes.DATE, allowNull: false },
  paymentId: DataTypes.STRING,
});

// Define associations
User.hasMany(Website, { foreignKey: 'userId' });
Website.belongsTo(User, { foreignKey: 'userId' });

Website.hasMany(Product, { foreignKey: 'websiteId' });
Product.belongsTo(Website, { foreignKey: 'websiteId' });

Website.hasMany(Banner, { foreignKey: 'websiteId' });
Banner.belongsTo(Website, { foreignKey: 'websiteId' });

Website.hasMany(Order, { foreignKey: 'websiteId' });
Order.belongsTo(Website, { foreignKey: 'websiteId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(OrderItem, { foreignKey: 'productId' });

User.hasMany(Subscription, { foreignKey: 'userId' });
Subscription.belongsTo(User, { foreignKey: 'userId' });

// Email Trial Tracking - permanently tracks which emails have used trial
const EmailTrialTracking = sequelize.define('EmailTrialTracking', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true }, // Email that used trial
  firstTrialDate: { type: DataTypes.DATE, allowNull: false }, // When first trial was used
  lastTrialDate: { type: DataTypes.DATE, allowNull: false }, // When last trial was used
  trialCount: { type: DataTypes.INTEGER, defaultValue: 1 }, // How many times trial was used
  isPermanentlyBlocked: { type: DataTypes.BOOLEAN, defaultValue: false }, // Admin can block
  notes: { type: DataTypes.TEXT }, // Admin notes
}, {
  tableName: 'email_trial_tracking',
  timestamps: true
});

module.exports = {
  Admin,
  User,
  Website,
  Product,
  Banner,
  Order,
  OrderItem,
  Subscription,
  EmailTrialTracking,
  sequelize
};
