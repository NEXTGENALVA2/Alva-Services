// Email Trial Tracking Helper Functions
const { EmailTrialTracking } = require('../models');

class EmailTrialTracker {
  
  // Check if email has already used trial
  static async hasEmailUsedTrial(email) {
    try {
      const record = await EmailTrialTracking.findOne({ 
        where: { email: email.toLowerCase() } 
      });
      return record !== null;
    } catch (error) {
      console.error('Error checking email trial status:', error);
      return false; // Default to allowing trial on error
    }
  }
  
  // Mark email as having used trial
  static async markEmailTrialUsed(email, notes = null) {
    try {
      const normalizedEmail = email.toLowerCase();
      const now = new Date();
      
      // Check if record already exists
      let record = await EmailTrialTracking.findOne({ 
        where: { email: normalizedEmail } 
      });
      
      if (record) {
        // Update existing record
        await record.update({
          lastTrialDate: now,
          trialCount: record.trialCount + 1,
          notes: notes || record.notes
        });
        console.log(`Updated trial tracking for ${email}: count = ${record.trialCount + 1}`);
      } else {
        // Create new record
        record = await EmailTrialTracking.create({
          email: normalizedEmail,
          firstTrialDate: now,
          lastTrialDate: now,
          trialCount: 1,
          notes: notes
        });
        console.log(`Created trial tracking for ${email}`);
      }
      
      return record;
    } catch (error) {
      console.error('Error marking email trial used:', error);
      throw error;
    }
  }
  
  // Get trial usage stats for an email
  static async getEmailTrialStats(email) {
    try {
      const record = await EmailTrialTracking.findOne({ 
        where: { email: email.toLowerCase() } 
      });
      return record;
    } catch (error) {
      console.error('Error getting email trial stats:', error);
      return null;
    }
  }
  
  // Admin: Block/unblock email from trials permanently
  static async toggleEmailTrialBlock(email, isBlocked, adminNotes = null) {
    try {
      const normalizedEmail = email.toLowerCase();
      let record = await EmailTrialTracking.findOne({ 
        where: { email: normalizedEmail } 
      });
      
      if (!record) {
        // Create record if doesn't exist
        record = await EmailTrialTracking.create({
          email: normalizedEmail,
          firstTrialDate: new Date(),
          lastTrialDate: new Date(),
          trialCount: 0,
          isPermanentlyBlocked: isBlocked,
          notes: adminNotes
        });
      } else {
        // Update existing record
        await record.update({
          isPermanentlyBlocked: isBlocked,
          notes: adminNotes || record.notes
        });
      }
      
      console.log(`Email ${email} trial access ${isBlocked ? 'blocked' : 'unblocked'} by admin`);
      return record;
    } catch (error) {
      console.error('Error toggling email trial block:', error);
      throw error;
    }
  }
  
  // Get all trial usage stats (for admin dashboard)
  static async getAllTrialStats() {
    try {
      const records = await EmailTrialTracking.findAll({
        order: [['lastTrialDate', 'DESC']]
      });
      return records;
    } catch (error) {
      console.error('Error getting all trial stats:', error);
      return [];
    }
  }
}

module.exports = EmailTrialTracker;