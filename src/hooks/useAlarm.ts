/**
 * Hooks TanStack Query para operações de alarme.
 * Encapsula chamadas à API e invalidações de cache.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { alarmsApi } from '../api/endpoints';
import type { Alarm, CreateAlarmPayload, UpdateAlarmPayload } from '../domain/types';
import { getErrorMessage } from '../api/client';

const ALARMS_KEY = ['alarms'];

export function useAlarms() {
  return useQuery({
    queryKey: ALARMS_KEY,
    queryFn: async () => {
      const { data } = await alarmsApi.list();
      return data.data as Alarm[];
    },
    retry: 1,
    staleTime: 30_000,
  });
}

export function useAlarm(id: string) {
  return useQuery({
    queryKey: [...ALARMS_KEY, id],
    queryFn: async () => {
      const { data } = await alarmsApi.get(id);
      return data.data as Alarm;
    },
    enabled: !!id,
    retry: 1,
  });
}

export function useCreateAlarm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateAlarmPayload) => {
      const { data } = await alarmsApi.create(payload);
      return data.data as Alarm;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALARMS_KEY });
    },
    onError: (error) => {
      throw new Error(getErrorMessage(error));
    },
  });
}

export function useUpdateAlarm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateAlarmPayload }) => {
      const { data } = await alarmsApi.update(id, payload);
      return data.data as Alarm;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ALARMS_KEY });
      queryClient.invalidateQueries({ queryKey: [...ALARMS_KEY, variables.id] });
    },
    onError: (error) => {
      throw new Error(getErrorMessage(error));
    },
  });
}

export function useDeleteAlarm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await alarmsApi.remove(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALARMS_KEY });
    },
    onError: (error) => {
      throw new Error(getErrorMessage(error));
    },
  });
}

export function useSnoozeAlarm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await alarmsApi.snooze(id);
      return data.data as Alarm;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ALARMS_KEY });
      queryClient.invalidateQueries({ queryKey: [...ALARMS_KEY, id] });
    },
    onError: (error) => {
      throw new Error(getErrorMessage(error));
    },
  });
}

export function useDismissAlarm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await alarmsApi.dismiss(id);
      return data.data as Alarm;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ALARMS_KEY });
      queryClient.invalidateQueries({ queryKey: [...ALARMS_KEY, id] });
    },
    onError: (error) => {
      throw new Error(getErrorMessage(error));
    },
  });
}

export function useTriggerAlarm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await alarmsApi.trigger(id);
      return data.data as Alarm;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ALARMS_KEY });
      queryClient.invalidateQueries({ queryKey: [...ALARMS_KEY, id] });
    },
    onError: (error) => {
      throw new Error(getErrorMessage(error));
    },
  });
}

export function useAlarmChallenges(alarmId: string) {
  return useQuery({
    queryKey: ['alarms', alarmId, 'challenges'],
    queryFn: async () => {
      const { data } = await alarmsApi.challenges(alarmId);
      return data.data;
    },
    enabled: !!alarmId,
  });
}

export function useValidateChallenge() {
  return useMutation({
    mutationFn: async ({
      alarmId,
      challengeId,
      payload,
    }: {
      alarmId: string;
      challengeId: string;
      payload: { answer: unknown; time_taken_seconds?: number };
    }) => {
      const { data } = await alarmsApi.validateChallenge(alarmId, challengeId, payload);
      return data;
    },
    onError: (error) => {
      throw new Error(getErrorMessage(error));
    },
  });
}