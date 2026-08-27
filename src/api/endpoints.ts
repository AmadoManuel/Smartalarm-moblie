/**
 * Endpoints da API SmartAlarm — um único sítio para todos os caminhos.
 */

import { api } from './client';
import type {
  Alarm,
  AuthResponse,
  ChallengeTask,
  CreateAlarmPayload,
  UpdateAlarmPayload,
  User,
  ValidateChallengePayload,
  ValidateChallengeResponse,
} from '../domain/types';

export const authApi = {
  register: (payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    fcm_token?: string;
  }) => api.post<AuthResponse>('/auth/register', payload),

  login: (payload: { email: string; password: string; fcm_token?: string }) =>
    api.post<AuthResponse>('/auth/login', payload),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<User>('/auth/me'),

  updateFcmToken: (fcm_token: string) =>
    api.put('/auth/fcm-token', { fcm_token }),
};

export const alarmsApi = {
  list: () => api.get<{ data: Alarm[] }>('/alarms'),

  get: (id: string) => api.get<{ data: Alarm }>(`/alarms/${id}`),

  create: (payload: CreateAlarmPayload) =>
    api.post<{ data: Alarm }>('/alarms', payload),

  update: (id: string, payload: UpdateAlarmPayload) =>
    api.put<{ data: Alarm }>(`/alarms/${id}`, payload),

  remove: (id: string) => api.delete(`/alarms/${id}`),

  snooze: (id: string) => api.post<{ data: Alarm }>(`/alarms/${id}/snooze`),

  dismiss: (id: string) => api.post<{ data: Alarm }>(`/alarms/${id}/dismiss`),

  trigger: (id: string) => api.post<{ data: Alarm }>(`/alarms/${id}/trigger`),

  challenges: (id: string) =>
    api.get<{ data: ChallengeTask[] }>(`/alarms/${id}/challenges`),

  validateChallenge: (
    alarmId: string,
    challengeId: string,
    payload: ValidateChallengePayload,
  ) =>
    api.post<ValidateChallengeResponse>(
      `/alarms/${alarmId}/challenges/${challengeId}/validate`,
      payload,
    ),
};
