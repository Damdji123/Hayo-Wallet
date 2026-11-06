/**
 * Client-Side Rate Limiter & Brute-Force Defense for Financial Operations.
 * Aligns with Section 28 (Security Requirements) and API Architecture Diagram.
 */

interface RateLimitState {
  failures: number;
  lastAttemptTime: number;
  lockedUntil: number;
}

const rateLimitRegistry: Record<string, RateLimitState> = {};

export const RATE_LIMIT_CONFIG = {
  MAX_FAILURES: 5,
  LOCKOUT_DURATION_MS: 30 * 1000, // 30 seconds
  THROTTLE_INTERVAL_MS: 1500, // 1.5 seconds between fast taps
};

export const RateLimiter = {
  /**
   * Check if an action is currently allowed or locked out / throttled.
   */
  check(key: string): { allowed: boolean; waitSeconds: number; attemptsLeft: number } {
    const now = Date.now();
    const state = rateLimitRegistry[key] ?? {
      failures: 0,
      lastAttemptTime: 0,
      lockedUntil: 0,
    };

    // If currently locked out
    if (state.lockedUntil > now) {
      const waitSeconds = Math.ceil((state.lockedUntil - now) / 1000);
      return { allowed: false, waitSeconds, attemptsLeft: 0 };
    }

    // If rapid tap throttling applies
    if (now - state.lastAttemptTime < RATE_LIMIT_CONFIG.THROTTLE_INTERVAL_MS) {
      return { allowed: false, waitSeconds: 1, attemptsLeft: Math.max(0, RATE_LIMIT_CONFIG.MAX_FAILURES - state.failures) };
    }

    return {
      allowed: true,
      waitSeconds: 0,
      attemptsLeft: Math.max(0, RATE_LIMIT_CONFIG.MAX_FAILURES - state.failures),
    };
  },

  /**
   * Record attempt outcome.
   */
  record(key: string, success: boolean) {
    const now = Date.now();
    if (!rateLimitRegistry[key]) {
      rateLimitRegistry[key] = {
        failures: 0,
        lastAttemptTime: now,
        lockedUntil: 0,
      };
    }

    const state = rateLimitRegistry[key];
    state.lastAttemptTime = now;

    if (success) {
      // Reset on success
      state.failures = 0;
      state.lockedUntil = 0;
    } else {
      state.failures += 1;
      if (state.failures >= RATE_LIMIT_CONFIG.MAX_FAILURES) {
        state.lockedUntil = now + RATE_LIMIT_CONFIG.LOCKOUT_DURATION_MS;
      }
    }
  },

  /**
   * Get remaining lockout seconds if locked.
   */
  getRemainingLockout(key: string): number {
    const now = Date.now();
    const state = rateLimitRegistry[key];
    if (!state || state.lockedUntil <= now) return 0;
    return Math.ceil((state.lockedUntil - now) / 1000);
  },

  /**
   * Manually reset limit state.
   */
  reset(key: string) {
    delete rateLimitRegistry[key];
  },
};
