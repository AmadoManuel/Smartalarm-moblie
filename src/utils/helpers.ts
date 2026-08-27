/**
 * Funções utilitárias partilhadas.
 */

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(date: Date): string {
  return `${formatDate(date)} às ${formatTime(date)}`;
}

export function getWeekdayLabel(day: number): string {
  const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return labels[day] ?? '';
}

export function getWeekdayLabels(days: number[]): string {
  if (days.length === 0) return 'Nunca';
  if (days.length === 7) return 'Todos os dias';
  const sorted = [...days].sort((a, b) => a - b);
  return sorted.map(getWeekdayLabel).join(', ');
}

export function getNextTriggerLabel(nextTriggerAt: string | null): string {
  if (!nextTriggerAt) return 'Sem próxima ativação';
  const date = new Date(nextTriggerAt);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return `Hoje às ${formatTime(date)}`;
  }
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString()) {
    return `Amanhã às ${formatTime(date)}`;
  }
  return formatDateTime(date);
}

export function getDifficultyLabel(difficulty: number): string {
  const labels: Record<number, string> = {
    1: 'Fácil',
    2: 'Médio',
    3: 'Difícil',
    5: 'Extremo',
  };
  return labels[difficulty] ?? 'Desconhecido';
}

export function getStateLabel(state: string): string {
  const labels: Record<string, string> = {
    idle: 'Inativo',
    ringing: 'A tocar',
    challenge_active: 'Desafio ativo',
    dismissed: 'Desligado',
    snoozed: 'Adiado',
  };
  return labels[state] ?? state;
}

export function getChallengeTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    math_equation: 'Equação Matemática',
    memory_sequence: 'Sequência de Memória',
    shake_device: 'Sacudir Dispositivo',
    type_phrase: 'Digitar Frase',
    pattern_draw: 'Desenhar Padrão',
    scan_qr_code: 'Escanear QR Code',
  };
  return labels[type] ?? type;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function parseTriggerTime(time: string): { hour: number; minute: number } {
  const [hour, minute] = time.split(':').map(Number);
  return { hour, minute };
}

export function formatTriggerTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function isTimeInPast(triggerTime: string): boolean {
  const now = new Date();
  const { hour, minute } = parseTriggerTime(triggerTime);
  const triggerDate = new Date();
  triggerDate.setHours(hour, minute, 0, 0);
  return triggerDate < now;
}

export function getTimeUntilTrigger(triggerTime: string): number {
  const now = new Date();
  const { hour, minute } = parseTriggerTime(triggerTime);
  const triggerDate = new Date();
  triggerDate.setHours(hour, minute, 0, 0);
  if (triggerDate <= now) {
    triggerDate.setDate(triggerDate.getDate() + 1);
  }
  return triggerDate.getTime() - now.getTime();
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: 'A password deve ter pelo menos 8 caracteres.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'A password deve conter pelo menos uma maiúscula.' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'A password deve conter pelo menos uma minúscula.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'A password deve conter pelo menos um número.' };
  }
  return { valid: true, message: '' };
}

export function deepEqual<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
}

export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) result[key] = obj[key];
  });
  return result;
}