// Tiny module-level singleton tracking whether mobileAds().initialize()
// (plus the UMP consent flow) has finished. AdReward.js checks this
// before attempting to load/show an ad — previously there was no guard
// at all, so tapping "Watch Ad" immediately after app launch could fail
// simply because the SDK wasn't ready yet, and that failure looked
// identical to every other ad error ("Failed to show ad. Please try
// again.") with no way to tell them apart.

let ready = false;
const listeners = new Set();

export function setAdsReady(value) {
  ready = value;
  listeners.forEach((cb) => cb(value));
}

export function isAdsReady() {
  return ready;
}

export function subscribeAdsReady(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}
