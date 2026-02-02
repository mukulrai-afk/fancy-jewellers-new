import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { onMessage } from 'firebase/messaging';
import { Platform } from 'react-native';
import FirebaseService from './firebaseConfig';

interface NotificationHandler {
  onNotificationReceived?: (notification: any) => void;
  onNotificationResponse?: (response: any) => void;
}

export class PushNotificationService {
  private firebaseService: FirebaseService;

  constructor() {
    this.firebaseService = FirebaseService.getInstance();
  }

  /**
   * Register both Expo push token and FCM token with backend.
   * backend expects an object: { expoToken?: string, fcmToken?: string, platform: 'android'|'ios'|'web' }
   */
  /**
   * Register device using server model: { token: string, meta?: object }
   * `token` is required by server (unique index). `meta` may include expoToken, fcmToken, platform, device info, etc.
   */
  private async registerTokenWithBackend(registration: { token: string; meta?: any }): Promise<void> {
    try {
      const response = await fetch('https://admin-pearl-kappa-34.vercel.app/api/notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registration),
      });

      if (!response.ok) {
        throw new Error(`Failed to persist notification token: ${response.status}`);
      }

      console.log('Notification token registered with backend.', registration);
    } catch (error) {
      console.error('Error storing notification token with backend:', error);
    }
  }

  public async initialize(): Promise<void> {
    if (Platform.OS !== 'web') {
      await this.firebaseService.initialize();
    }
  }

  public async requestNotificationPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.warn('Must use physical device for Push Notifications');
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Failed to get push notification permissions');
        return false;
      }

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          // Include newer iOS fields to satisfy NotificationBehavior in newer SDKs
          shouldShowBanner: true,
          shouldShowList: true,
        } as Notifications.NotificationBehavior),
      });

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default Channel',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  public async getPushToken(): Promise<string | null> {
    try {
      const permissionsGranted = await this.requestNotificationPermissions();
      if (!permissionsGranted) return null;

      // Get Expo push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        throw new Error('Missing EAS Project ID in app config');
      }

      const { data: expoToken } = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      // Get Firebase token if available
      let fcmToken: string | null = null;
      if (this.firebaseService.isInitialized()) {
        try {
          fcmToken = await this.firebaseService.getMessagingToken();
        } catch (error) {
          console.warn('Failed to get FCM token:', error);
        }
      }

      // Prepare registration payload compatible with server model
      const primaryToken = expoToken ?? fcmToken ?? '';
      const meta = {
        expoToken: expoToken ?? null,
        fcmToken: fcmToken ?? null,
        platform: Platform.OS,
        device: {
          modelName: Device.modelName ?? null,
          manufacturer: (Device as any).manufacturer ?? null,
          osName: (Device as any).osName ?? null,
        },
        appVersion: Constants.expoConfig?.version ?? null,
      };

      if (primaryToken) {
        try {
          await this.registerTokenWithBackend({ token: primaryToken, meta });
        } catch (e) {
          // logged inside registerTokenWithBackend
        }
      } else {
        console.warn('No push token available to register with backend');
      }

      return expoToken;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  public setupNotificationListeners({
    onNotificationReceived,
    onNotificationResponse
  }: NotificationHandler) {
    let unsubscribeFirebase = () => {};

    const messaging = this.firebaseService.getMessaging();
    if (messaging) {
      unsubscribeFirebase = onMessage(messaging, async (remoteMessage) => {
        console.log('Firebase Foreground Message:', remoteMessage);
        onNotificationReceived?.(remoteMessage);
      });
    }

    const receivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        onNotificationReceived?.(notification);
      }
    );

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        onNotificationResponse?.(response);
      }
    );

    return () => {
      unsubscribeFirebase();
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }
}