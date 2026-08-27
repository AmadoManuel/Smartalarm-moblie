/**
 * Exportações centralizadas dos componentes de desafio.
 */

export { MathEquation } from './MathEquation';
export { MemorySequence } from './MemorySequence';
export { ShakeDevice } from './ShakeDevice';
export { TypePhrase } from './TypePhrase';
export { PatternDraw } from './PatternDraw';
export { ScanQrCode } from './ScanQrCode';

import { MathEquation } from './MathEquation';
import { MemorySequence } from './MemorySequence';
import { ShakeDevice } from './ShakeDevice';
import { TypePhrase } from './TypePhrase';
import { PatternDraw } from './PatternDraw';
import { ScanQrCode } from './ScanQrCode';
import type { ChallengeType } from '../../domain/types';

export function getChallengeComponent(type: ChallengeType) {
  switch (type) {
    case 'math_equation':
      return MathEquation;
    case 'memory_sequence':
      return MemorySequence;
    case 'shake_device':
      return ShakeDevice;
    case 'type_phrase':
      return TypePhrase;
    case 'pattern_draw':
      return PatternDraw;
    case 'scan_qr_code':
      return ScanQrCode;
    default:
      return MathEquation;
  }
}