import { Platform } from 'react-native';
import { RewardedAd, TestIds } from 'react-native-google-mobile-ads';

export const AD_UNITS = {
  android: {
    reward_6h: 'ca-app-pub-8589950233987350/2910110659',
    reward_12h: 'ca-app-pub-8589950233987350/8744891264',
    reward_24h: 'ca-app-pub-8589950233987350/7970865647',
  },
  ios: {
    reward_6h: 'ca-app-pub-8589950233987350/5044786578',
    reward_12h: 'ca-app-pub-8589950233987350/1328902848',
    reward_24h: 'ca-app-pub-8589950233987350/8600888207',
  },
};

export const TEST_IDS = {
  android: 'ca-app-pub-3940256099942544/5224354917',
  ios: 'ca-app-pub-3940256099942544/1712485313',
};

export function getAdUnitId(adUnitName, isTest = false) {
  const platform = Platform.OS;
  const unit = AD_UNITS[platform]?.[adUnitName];

  if (isTest) {
    return TEST_IDS[platform] || TEST_IDS.android;
  }

  return unit || TEST_IDS[platform];
}

export function createRewardedAd(adUnitName, isTest = false) {
  const adUnitId = getAdUnitId(adUnitName, isTest);
  const rewarded = RewardedAd.createForAdRequest(adUnitId, {
    requestNonPersonalizedAdsOnly: true,
  });
  return rewarded;
}

export async function loadAd(rewarded) {
  return new Promise((resolve, reject) => {
    rewarded.load();

    const timeout = setTimeout(() => {
      reject(new Error('Ad load timeout'));
    }, 10000);

    const unsubscribeLoad = rewarded.addAdEventListener('loaded', () => {
      clearTimeout(timeout);
      unsubscribeLoad();
      resolve();
    });

    const unsubscribeError = rewarded.addAdEventListener('error', (error) => {
      clearTimeout(timeout);
      unsubscribeError();
      reject(error);
    });
  });
}

export async function showAd(rewarded) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Ad show timeout'));
    }, 15000);

    const unsubscribeEarned = rewarded.addAdEventListener('rewarded', (reward) => {
      clearTimeout(timeout);
      unsubscribeEarned();
      resolve(reward);
    });

    const unsubscribeError = rewarded.addAdEventListener('error', (error) => {
      clearTimeout(timeout);
      unsubscribeError();
      reject(error);
    });

    rewarded.show();
  });
}
