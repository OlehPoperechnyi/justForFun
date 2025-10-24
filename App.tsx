import { Alert, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, requestPermission, AuthorizationStatus, onMessage, getToken } from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import {PermissionsAndroid} from 'react-native';

const firebaseApp = getApp();
const messaging = getMessaging(firebaseApp);


async function getFCMToken() {
  console.log('getToken:');
  const token = await getToken(messaging);
  console.log('FCM Token:', token);
  return token;
}


const sendTestNotification = () => {};

async function requestUserPermission() {

  const authStatus = await requestPermission(messaging);
  const enabled =
    authStatus === AuthorizationStatus.AUTHORIZED ||
    authStatus === AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }

  if (!enabled) {
    console.log('Push notifications permission denied');
    return null;
  }

  await getFCMToken();
  if (Platform.OS === 'android') {
    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  }
}

export const initPush = async () => {
  await requestUserPermission();
  await getFCMToken();

  onMessage(messaging, async remoteMessage => {
    console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
  });
};

function App() {
  const colorScheme = useColorScheme()
  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    initPush();
  }, []);
  console.log('Firebase name: ', firebaseApp?.name);


  useEffect(() => {
    const unsubscribe = onMessage(messaging, async remoteMessage => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.testPushButton} onPress={sendTestNotification}>
        <Text>Get test push</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testPushButton: {
    backgroundColor: 'lightblue',
    padding: 10,
  }
});

export default App;
