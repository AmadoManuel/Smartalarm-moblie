/**
 * Tipos de domínio — espelho do backend Laravel.
 * Mantém o contrato da API alinhado com o Domain PHP.
 */

export enum AlarmDifficulty {
  EASY = 1,
  MEDIUM = 2,
  HARD = 3,
  EXTREME = 5,
}

export enum ChallengeType {
  MATH_EQUATION = 'math_equation',
  MEMORY_SEQUENCE = 'memory_sequence',
  SHAKE_DEVICE = 'shake_device',
  TYPE_PHRASE = 'type_phrase',
  PATTERN_DRAW = 'pattern_draw',
  SCAN_QR_CODE = 'scan_qr_code',
}

export enum AlarmState {
  IDLE = 'idle',
  RINGING = 'ringing',
  CHALLENGE_ACTIVE = 'challenge_active',
  DISMISSED = 'dismissed',
  SNOOZED = 'snoozed',
}

export enum ChallengeResultStatus {
  PENDING = 'pending',
  CORRECT = 'correct',
  INCORRECT = 'incorrect',
  TIMEOUT = 'timeout',
  MAX_ATTEMPTS_EXCEEDED = 'max_attempts_exceeded',
}

export interface User {
  id: string;
  name: string;
  email: string;
  fcm_token: string | null;
  created_at: string | null;
}

export interface AuthResponse {
  token: string;
  token_type: string;
  user: User;
}

export interface Alarm {
  id: string;
  user_id: string;
  name: string;
  trigger_time: string;
  repeat_days: number[];
  difficulty: AlarmDifficulty;
  difficulty_label: string;
  is_active: boolean;
  sound: string;
  snooze_minutes: number;
  state: AlarmState;
  state_label: string;
  next_trigger_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  challenges: ChallengeTask[];
}

export interface ChallengeTask {
  id: string;
  alarm_id: string;
  type: ChallengeType;
  type_label: string;
  order_index: number;
  parameters: ChallengeParameters;
  time_limit_seconds: number;
  max_attempts: number;
  created_at: string | null;
}

export type ChallengeParameters =
  | MathEquationParams
  | MemorySequenceParams
  | ShakeDeviceParams
  | TypePhraseParams
  | PatternDrawParams
  | ScanQrCodeParams;

export interface MathEquationParams {
  operand1: number;
  operand2: number;
  operator: '+' | '-' | '*';
  expected_result: number;
}

export interface MemorySequenceParams {
  sequence: number[];
  grid_size: number;
  display_time_ms: number;
}

export interface ShakeDeviceParams {
  required_shakes: number;
  threshold: number;
  time_window_seconds: number;
}

export interface TypePhraseParams {
  phrase: string;
  case_sensitive: boolean;
  allow_typos: number;
}

export interface PatternDrawParams {
  pattern_points: Array<{ x: number; y: number }>;
  tolerance: number;
}

export interface ScanQrCodeParams {
  expected_content: string;
  qr_type: string;
}

export interface CreateAlarmPayload {
  name: string;
  trigger_time: string;
  repeat_days: number[];
  difficulty: AlarmDifficulty;
  is_active?: boolean;
  sound?: string;
  snooze_minutes?: number;
}

export interface UpdateAlarmPayload {
  name?: string;
  trigger_time?: string;
  repeat_days?: number[];
  difficulty?: AlarmDifficulty;
  is_active?: boolean;
  sound?: string;
  snooze_minutes?: number;
}

export interface ValidateChallengePayload {
  answer: unknown;
  time_taken_seconds?: number;
}

export interface ValidateChallengeResponse {
  success: boolean;
  current_challenge: ChallengeTask | null;
  next_challenge: ChallengeTask | null;
  attempt: {
    challenge_id: string;
    user_answer: unknown;
    status: ChallengeResultStatus;
    attempts: number;
    time_taken_seconds: number;
  };
  all_completed: boolean;
  error_message: string | null;
}

export const DIFFICULTY_LABELS: Record<AlarmDifficulty, string> = {
  [AlarmDifficulty.EASY]: 'Fácil',
  [AlarmDifficulty.MEDIUM]: 'Médio',
  [AlarmDifficulty.HARD]: 'Difícil',
  [AlarmDifficulty.EXTREME]: 'Extremo',
};

export const WEEKDAY_LABELS: Record<number, string> = {
  0: 'Dom',
  1: 'Seg',
  2: 'Ter',
  3: 'Qua',
  4: 'Qui',
  5: 'Sex',
  6: 'Sáb',
};

export const CHALLENGE_TYPE_LABELS: Record<ChallengeType, string> = {
  [ChallengeType.MATH_EQUATION]: 'Equação Matemática',
  [ChallengeType.MEMORY_SEQUENCE]: 'Sequência de Memória',
  [ChallengeType.SHAKE_DEVICE]: 'Sacudir Dispositivo',
  [ChallengeType.TYPE_PHRASE]: 'Digitar Frase',
  [ChallengeType.PATTERN_DRAW]: 'Desenhar Padrão',
  [ChallengeType.SCAN_QR_CODE]: 'Escanear QR Code',
};
