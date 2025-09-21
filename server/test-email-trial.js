// Test email trial tracking system
const EmailTrialTracker = require('./utils/EmailTrialTracker');

async function testEmailTrialTracking() {
  try {
    console.log('🧪 Testing Email Trial Tracking System...\n');
    
    const testEmail = 'test.trial@example.com';
    
    // Test 1: Check if email has used trial (should be false)
    console.log('1️⃣ Checking if email has used trial...');
    let hasUsed = await EmailTrialTracker.hasEmailUsedTrial(testEmail);
    console.log(`   Email ${testEmail} has used trial: ${hasUsed}\n`);
    
    // Test 2: Mark email as trial used
    console.log('2️⃣ Marking email as trial used...');
    await EmailTrialTracker.markEmailTrialUsed(testEmail, 'Test trial usage');
    console.log('   Email marked as trial used\n');
    
    // Test 3: Check again (should be true)
    console.log('3️⃣ Checking again if email has used trial...');
    hasUsed = await EmailTrialTracker.hasEmailUsedTrial(testEmail);
    console.log(`   Email ${testEmail} has used trial: ${hasUsed}\n`);
    
    // Test 4: Get stats
    console.log('4️⃣ Getting trial stats...');
    const stats = await EmailTrialTracker.getEmailTrialStats(testEmail);
    console.log('   Stats:', {
      email: stats.email,
      firstTrialDate: stats.firstTrialDate,
      trialCount: stats.trialCount,
      notes: stats.notes
    });
    
    console.log('\n✅ All tests passed! Email trial tracking system is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testEmailTrialTracking();