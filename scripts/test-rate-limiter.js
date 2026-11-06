const { RateLimiter, RATE_LIMIT_CONFIG } = require('../src/utils/rate-limiter');

function runRateLimiterTests() {
  console.log('🛡️ Starting Rate Limiter Security Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  const actionKey = 'test_login';
  RateLimiter.reset(actionKey);

  // Test 1: Initial state is allowed
  const initCheck = RateLimiter.check(actionKey);
  assert(initCheck.allowed === true, 'Initial attempt is allowed');
  assert(initCheck.attemptsLeft === 5, 'Initial attempts left is 5');

  // Test 2: Rapid throttling
  RateLimiter.record(actionKey, false);
  const fastCheck = RateLimiter.check(actionKey);
  assert(fastCheck.allowed === false, 'Immediate consecutive attempt throttled');

  // Test 3: Multiple failed attempts lead to lockout
  RateLimiter.reset(actionKey);
  for (let i = 0; i < RATE_LIMIT_CONFIG.MAX_FAILURES; i++) {
    RateLimiter.record(actionKey, false);
  }

  const lockedCheck = RateLimiter.check(actionKey);
  assert(lockedCheck.allowed === false, 'User is locked out after 5 consecutive failures');
  assert(lockedCheck.waitSeconds > 0, `Lockout wait time is active (${lockedCheck.waitSeconds}s remaining)`);

  // Test 4: Reset restores allowed state
  RateLimiter.reset(actionKey);
  const resetCheck = RateLimiter.check(actionKey);
  assert(resetCheck.allowed === true, 'Resetting rate limit clears lockout');

  console.log(`\n========================================`);
  console.log(`Rate Limiter Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runRateLimiterTests();
