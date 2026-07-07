import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from './src/context/AppContext';
import { SocketProvider } from './src/context/SocketContext';
import { TabNavigator } from './src/navigation/TabNavigator';
import { LoadingScreen } from './src/components/LoadingScreen';

// Firebase & AdMob.
// @react-native-firebase/app auto-initializes from the native
// google-services.json / GoogleService-Info.plist files that are bundled
// via app.json's `googleServicesFile` fields, so no JS-side config object
// or manual initializeApp() call is required.
import firebase from '@react-native-firebase/app';
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import mobileAds from '@react-native-google-mobile-ads';

function Root() {
  const { isLoading } = useApp();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SocketProvider>
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </SocketProvider>
  );
}

export default function App() {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (firebase.apps.length) {
        console.log('✅ Firebase initialized');
      }

      try {
        await mobileAds().initialize();
        console.log('✅ AdMob initialized');
      } catch (error) {
        console.warn('AdMob failed to initialize:', error);
      }

      try {
        await crashlytics().setCrashlyticsCollectionEnabled(true);
      } catch (error) {
        console.warn('Crashlytics failed to initialize:', error);
      }

      try {
        if (!cancelled) {
          await analytics().logEvent('app_open');
        }
      } catch (error) {
        console.warn('Analytics failed to log app_open:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SafeAreaProvider>
      <AppProvider>
        <Root />
        <ExpoStatusBar style="light" />
      </AppProvider>
    </SafeAreaProvider>
  );
}
