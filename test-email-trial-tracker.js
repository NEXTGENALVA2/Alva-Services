const EmailTrialTracker = require('./server/utils/EmailTrialTracker');

async function testEmailTrialTracker() {
  try {
    console.log('🧪 Testing EmailTrialTracker...\n');

    const testEmail = 'efty@gmail.com';
    
    console.log(`Step 1: Checking if ${testEmail} has used trial...`);
    const hasUsed = await EmailTrialTracker.hasEmailUsedTrial(testEmail);
    console.log(`   Result: ${hasUsed ? 'YES' : 'NO'}\n`);

    if (!hasUsed) {
      console.log(`Step 2: Marking ${testEmail} as having used trial...`);
      await EmailTrialTracker.markEmailTrialUsed(testEmail, 'Manual test marking');
      console.log(`   ✅ Marked successfully\n`);

      console.log(`Step 3: Checking again if ${testEmail} has used trial...`);
      const hasUsedAfter = await EmailTrialTracker.hasEmailUsedTrial(testEmail);
      console.log(`   Result: ${hasUsedAfter ? 'YES' : 'NO'}\n`);
    }

    console.log('Step 4: Getting email trial stats...');
    const stats = await EmailTrialTracker.getEmailTrialStats(testEmail);
    console.log('   Stats:', stats);

  } catch (error) {
    console.error('❌ EmailTrialTracker test failed:', error.message);
    console.error('Full error:', error);
  }
}

testEmailTrialTracker();