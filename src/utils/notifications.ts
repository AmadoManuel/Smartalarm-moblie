/**
 * Configuração e helpers de notificações locais (Expo Notifications).
 * Usado como fallback quando FCM não está disponível ou para testes.
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type { Alarm } from '../domain/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token = null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alarms', {
      name: 'Alarmes',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
      enableVibrate: true,
      enableLights: true,
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('Permissão de notificações não concedida');
      return null;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.expoConfig?.extra?.projectId;
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  } else {
    console.warn('Deve usar um dispositivo físico para notificações push');
  }

  return token;
}

export async function scheduleAlarmNotification(alarm: Alarm): Promise<string | null> {
  const { hour, minute } = parseTriggerTime(alarm.trigger_time);
  const now = new Date();
  let triggerDate = new Date();
  triggerDate.setHours(hour, minute, 0, 0);

  if (triggerDate <= now) {
    triggerDate.setDate(triggerDate.getDate() + 1);
  }

  const secondsUntilTrigger = Math.floor((triggerDate.getTime() - now.getTime()) / 1000);

  if (secondsUntilTrigger <= 0) {
    return null;
  }

  const days = alarm.repeat_days ?? [];
  const repeats = days.length > 0 && days.length < 7;

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Alarme',
      body: alarm.name,
      sound: 'default',
      data: { alarmId: alarm.id, type: 'alarm' },
      categoryIdentifier: 'ALARM',
    },
    trigger: repeats
      ? {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour,
          minute,
          repeats: true,
        }
      : {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsUntilTrigger,
          repeats: false,
        },
  });

  return identifier;
}

export async function cancelAlarmNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function showLocalAlarm(alarm: Alarm): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Alarme',
      body: alarm.name,
      sound: 'default',
      data: { alarmId: alarm.id, type: 'alarm_ringing' },
      categoryIdentifier: 'ALARM_RINGING',
    },
    trigger: null, // imediato
  });
}

function parseTriggerTime(time: string): { hour: number; minute: number } {
  const [hour, minute] = time.split(':').map(Number);
  return { hour, minute };
}

export function addAlarmNotificationListener(
  listener: (notification: Notifications.Notification) => void,
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(listener);
}

export function addNotificationResponseListener(
  listener: (response: Notifications.NotificationResponse) => void,
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(listener);
}