/**
 * Gestão de sons de alarme usando expo-av.
 * Carrega e reproduz sons em loop até dismiss.
 */

import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

let soundInstance: Audio.Sound | null = null;
let isLooping = false;

const SOUNDS: Record<string, string> = {
  default: require('../../assets/sounds/alarm_default.mp3'),
  gentle: require('../../assets/sounds/alarm_gentle.mp3'),
  loud: require('../../assets/sounds/alarm_loud.mp3'),
  nature: require('../../assets/sounds/alarm_nature.mp3'),
};

export async function loadSound(name: string): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    const asset = SOUNDS[name] ?? SOUNDS.default;
    const { sound } = await Audio.Sound.createAsync(asset, { isLooping: true, volume: 1.0 });
    soundInstance = sound;
  } catch (error) {
    console.error('Erro ao carregar som:', error);
  }
}

export async function playAlarmSound(name = 'default'): Promise<void> {
  await stopAlarmSound();
  await loadSound(name);
  if (soundInstance) {
    isLooping = true;
    await soundInstance.playAsync();
    // Vibração contínua em background
    vibrateLoop();
  }
}

export async function stopAlarmSound(): Promise<void> {
  isLooping = false;
  if (soundInstance) {
    try {
      await soundInstance.stopAsync();
      await soundInstance.unloadAsync();
    } catch {
      // ignora
    }
    soundInstance = null;
  }
}

async function vibrateLoop(): Promise<void> {
  while (isLooping) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await new Promise((r) => setTimeout(r, 1000));
  }
}

export async function playCompletionSound(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      staysActiveInBackground: false,
      playsInSilentModeIOS: true,
    });
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/sounds/completion.mp3'),
      { volume: 0.8 },
    );
    await sound.playAsync();
    await sound.unloadAsync();
  } catch {
    // ignora
  }
}

export async function playErrorSound(): Promise<void> {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/sounds/error.mp3'),
      { volume: 0.6 },
    );
    await sound.playAsync();
    await sound.unloadAsync();
  } catch {
    // ignora
  }
}