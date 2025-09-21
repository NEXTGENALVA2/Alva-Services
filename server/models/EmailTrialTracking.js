// Create email trial tracking table
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

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

module.exports = { EmailTrialTracking };