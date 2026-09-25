"""Limits repeated failed sign-ins, so passwords cannot be guessed by brute force.

Failures are counted in memory, per server process. That is enough for one
uvicorn process; running several workers or servers needs a shared store
(e.g. Redis) instead, or each process would keep its own count.
"""

import math
import threading
import time
from collections import deque


class FailureLimiter:
    """Blocks a key (an email or an IP address) after `max_failures` failures
    within the last `window_seconds`."""

    # Above this many tracked keys, stale ones are dropped so memory stays bounded.
    _PRUNE_THRESHOLD = 10_000

    def __init__(self, max_failures: int, window_seconds: int):
        self.max_failures = max_failures
        self.window_seconds = window_seconds
        self._failures: dict[str, deque[float]] = {}
        self._lock = threading.Lock()  # sync endpoints run in a thread pool

    def _recent(self, key: str, now: float) -> deque[float]:
        failures = self._failures.get(key, deque())
        while failures and failures[0] <= now - self.window_seconds:
            failures.popleft()
        return failures

    def retry_after(self, key: str) -> int:
        """Seconds until `key` may try again; 0 when it is not blocked."""
        now = time.monotonic()
        with self._lock:
            failures = self._recent(key, now)
            if len(failures) < self.max_failures:
                return 0
            return max(1, math.ceil(failures[-self.max_failures] + self.window_seconds - now))

    def record_failure(self, key: str) -> None:
        now = time.monotonic()
        with self._lock:
            if len(self._failures) > self._PRUNE_THRESHOLD:
                for stale in [k for k in self._failures if not self._recent(k, now)]:
                    del self._failures[stale]
            failures = self._recent(key, now)
            failures.append(now)
            self._failures[key] = failures

    def reset(self, key: str) -> None:
        with self._lock:
            self._failures.pop(key, None)

    def clear(self) -> None:
        with self._lock:
            self._failures.clear()


# 5 wrong passwords lock that email for 15 minutes. The per-IP limit is looser
# because many learners can share one address (school Wi-Fi, mobile networks).
login_failures_by_email = FailureLimiter(max_failures=5, window_seconds=15 * 60)
login_failures_by_ip = FailureLimiter(max_failures=50, window_seconds=15 * 60)
