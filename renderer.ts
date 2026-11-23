import { CHARACTERS, getCharOutfits } from '../data/gameData';
import {
  ArenaId,
  CharacterDef,
  ChromaId,
  CinemaLightingConfig,
  CinemaPose,
  Gender,
  Outfit,
  ThemeConfig,
  WeaponDef,
} from '../types/game';

export interface CinemaAmbientParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  phase: number;
}

export interface CinemaShowcaseOptions {
  weapon?: WeaponDef | null;
  lighting?: CinemaLightingConfig;
  pointerOffset?: { x: number; y: number };
  transitionFlash?: number;
  ambientParticles?: CinemaAmbientParticle[];
  chroma?: ChromaId;
  arenaBg?: ArenaId | null;
}

export interface CrowdPerson {
  x: number;
  offset: number;
  height: number;
  altTone: boolean;
}

export interface RainDrop {
  x: number;
  y: number;
  len: number;
  speed: number;
}

export interface BreakableProp {
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
}

export interface FireZone {
  x: number;
  w: number;
  timer: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  alpha: number;
  vy: number;
}

export interface AfterImage {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  alpha: number;
  trailType?: 'dash' | 'tech' | 'blink';
  facing?: 1 | -1;
}

export interface SlashArc {
  x: number;
  y: number;
  facing: 1 | -1;
  type: string;
  color: string;
  alpha: number;
}

export interface ArenaHazard {
  type: 'lightning' | 'meteor' | 'falling_laser' | 'storm_strike';
  x: number;
  y?: number;
  vx?: number;
  vy?: number;
  radius?: number;
  rot?: number;
  life?: number;
  startY?: number;
  tipY?: number;
  descendSpeed?: number;
  telegraph?: number;
  activeLife?: number;
  damage: number;
  hitDone?: boolean;
  playedLaser?: boolean;
}

export function drawRealisticWeapon(
  targetCtx: CanvasRenderingContext2D,
  weapon: WeaponDef | null,
  facing: 1 | -1,
  isAttacking: boolean,
  isBlocking: boolean
): void {
  if (!weapon) return;
  targetCtx.save();

  if (isBlocking) {
    targetCtx.rotate(facing * -0.4);
  } else if (isAttacking) {
    targetCtx.rotate(facing * 0.15);
  } else {
    targetCtx.rotate(facing * -0.65);
  }

  const dir = facing;
  targetCtx.fillStyle = weapon.handleColor;
  targetCtx.fillRect(dir === 1 ? -10 : -8, -3, 18, 6);

  targetCtx.fillStyle = weapon.guardColor;
  targetCtx.fillRect(dir === 1 ? 8 : -12, -9, 4, 18);

  targetCtx.fillStyle = weapon.color;
  if (weapon.id === 'katana') {
    targetCtx.beginPath();
    if (dir === 1) {
      targetCtx.moveTo(12, -3);
      targetCtx.lineTo(68, -4);
      targetCtx.lineTo(76, 0);
      targetCtx.lineTo(12, 3);
    } else {
      targetCtx.moveTo(-12, -3);
      targetCtx.lineTo(-68, -4);
      targetCtx.lineTo(-76, 0);
      targetCtx.lineTo(-12, 3);
    }
    targetCtx.closePath();
    targetCtx.fill();
  } else if (weapon.id === 'broadsword') {
    const len = 72;
    targetCtx.fillRect(dir === 1 ? 12 : -12 - len, -5, len, 10);
    targetCtx.beginPath();
    if (dir === 1) {
      targetCtx.moveTo(12 + len, -5);
      targetCtx.lineTo(12 + len + 12, 0);
      targetCtx.lineTo(12 + len, 5);
    } else {
      targetCtx.moveTo(-12 - len, -5);
      targetCtx.lineTo(-12 - len - 12, 0);
      targetCtx.lineTo(-12 - len, 5);
    }
    targetCtx.fill();
  } else if (weapon.id === 'hammer') {
    const shaftLen = 58;
    targetCtx.fillStyle = weapon.handleColor;
    targetCtx.fillRect(dir === 1 ? 12 : -12 - shaftLen, -3, shaftLen, 6);
    targetCtx.fillStyle = weapon.color;
    targetCtx.fillRect(dir === 1 ? 12 + shaftLen - 10 : -12 - shaftLen - 12, -16, 22, 32);
  } else if (weapon.id === 'spear') {
    const shaftLen = 95;
    targetCtx.fillStyle = weapon.handleColor;
    targetCtx.fillRect(dir === 1 ? -18 : -shaftLen + 18, -2.5, shaftLen, 5);
    targetCtx.fillStyle = weapon.color;
    targetCtx.beginPath();
    if (dir === 1) {
      targetCtx.moveTo(shaftLen - 18, -7);
      targetCtx.lineTo(shaftLen + 6, 0);
      targetCtx.lineTo(shaftLen - 18, 7);
    } else {
      targetCtx.moveTo(-shaftLen + 18, -7);
      targetCtx.lineTo(-shaftLen - 6, 0);
      targetCtx.lineTo(-shaftLen + 18, 7);
    }
    targetCtx.fill();
  } else if (weapon.id === 'axe') {
    const shaftLen = 54;
    targetCtx.fillStyle = weapon.handleColor;
    targetCtx.fillRect(dir === 1 ? 12 : -12 - shaftLen, -3, shaftLen, 6);
    targetCtx.fillStyle = weapon.color;
    const headX = dir === 1 ? 12 + shaftLen - 14 : -12 - shaftLen;
    targetCtx.beginPath();
    targetCtx.moveTo(headX, -4);
    targetCtx.lineTo(headX - 4, -20);
    targetCtx.lineTo(headX + 18, -14);
    targetCtx.lineTo(headX + 18, 14);
    targetCtx.lineTo(headX - 4, 20);
    targetCtx.lineTo(headX, 4);
    targetCtx.fill();
  } else if (weapon.id === 'daggers') {
    const len = 36;
    targetCtx.beginPath();
    if (dir === 1) {
      targetCtx.moveTo(12, -4);
      targetCtx.lineTo(12 + len, 0);
      targetCtx.lineTo(12, 4);
    } else {
      targetCtx.moveTo(-12, -4);
      targetCtx.lineTo(-12 - len, 0);
      targetCtx.lineTo(-12, 4);
    }
    targetCtx.fill();
  }

  targetCtx.restore();
}

export function drawStyledMaleHair(
  targetCtx: CanvasRenderingContext2D,
  cx: number,
  topY: number,
  headR: number,
  charData: CharacterDef,
  _outfit: Outfit,
  facing: 1 | -1,
  animPhase = 0,
  scale = 1
): void {
  const hairColor = charData.maleHair || '#1e293b';
  const style = charData.maleHairStyle || 'spiky_warrior';
  const sway = Math.sin(animPhase * 2.0) * 2.0 * scale;

  targetCtx.save();
  targetCtx.fillStyle = hairColor;
  targetCtx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  targetCtx.lineWidth = Math.max(1.2, 1.5 * scale);

  targetCtx.beginPath();
  targetCtx.arc(cx - facing * 1.5 * scale, topY - 1 * scale, headR * 1.06, Math.PI * 0.85, Math.PI * 2.15);
  targetCtx.fill();

  if (style === 'spiky_warrior' || style === 'flame_spikes' || style === 'lightning_spikes') {
    const spikes = [
      { ang: -2.4, len: 1.55 },
      { ang: -1.95, len: 1.72 },
      { ang: -1.5, len: 1.82 },
      { ang: -1.05, len: 1.65 },
      { ang: -0.6, len: 1.45 },
    ];
    targetCtx.beginPath();
    targetCtx.moveTo(cx - headR * 0.95, topY - headR * 0.15);
    spikes.forEach((sp, idx) => {
      const tipX = cx + Math.cos(sp.ang) * headR * sp.len + sway * (idx % 2 === 0 ? 0.6 : -0.4);
      const tipY = topY + Math.sin(sp.ang) * headR * sp.len;
      const midAng = sp.ang + 0.22;
      const valX = cx + Math.cos(midAng) * headR * 1.05;
      const valY = topY + Math.sin(midAng) * headR * 1.05;
      targetCtx.lineTo(tipX, tipY);
      targetCtx.lineTo(valX, valY);
    });
    targetCtx.lineTo(cx + headR * 0.95, topY - headR * 0.1);
    targetCtx.closePath();
    targetCtx.fill();
    targetCtx.stroke();
  } else if (style === 'mane' || style === 'royal_locks' || style === 'ghost_wave') {
    targetCtx.beginPath();
    targetCtx.moveTo(cx + facing * headR * 0.75, topY - headR * 0.45);
    targetCtx.quadraticCurveTo(cx, topY - headR * 1.55, cx - facing * headR * 1.15 + sway, topY - headR * 0.75);
    targetCtx.quadraticCurveTo(cx - facing * headR * 1.55 + sway * 1.2, topY + headR * 0.65, cx - facing * headR * 1.1 + sway, topY + headR * 1.45);
    targetCtx.lineTo(cx - facing * headR * 0.65, topY + headR * 0.35);
    targetCtx.closePath();
    targetCtx.fill();
    targetCtx.stroke();
  } else if (style === 'wind_swept' || style === 'noble_sweep') {
    targetCtx.beginPath();
    targetCtx.moveTo(cx - facing * headR * 0.9, topY - headR * 0.1);
    targetCtx.bezierCurveTo(
      cx - facing * headR * 1.2,
      topY - headR * 1.45,
      cx + facing * headR * 0.35,
      topY - headR * 1.65,
      cx + facing * headR * 1.15 + sway * 0.5,
      topY - headR * 0.55
    );
    targetCtx.quadraticCurveTo(cx + facing * headR * 0.55, topY - headR * 0.65, cx - facing * headR * 0.6, topY - headR * 0.25);
    targetCtx.closePath();
    targetCtx.fill();
    targetCtx.stroke();
  } else {
    targetCtx.beginPath();
    targetCtx.moveTo(cx - facing * headR * 0.85, topY - headR * 0.25);
    targetCtx.lineTo(cx - facing * headR * 0.3, topY - headR * 1.58);
    targetCtx.lineTo(cx + facing * headR * 0.75, topY - headR * 1.25);
    targetCtx.lineTo(cx + facing * headR * 0.85, topY - headR * 0.35);
    targetCtx.closePath();
    targetCtx.fill();
    targetCtx.stroke();
  }

  targetCtx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
  targetCtx.lineWidth = Math.max(1.4, 2 * scale);
  targetCtx.beginPath();
  targetCtx.arc(cx, topY - headR * 0.45, headR * 0.78, Math.PI * 1.18, Math.PI * 1.78);
  targetCtx.stroke();

  targetCtx.restore();
}

export function drawStyledFemaleHair(
  targetCtx: CanvasRenderingContext2D,
  cx: number,
  topY: number,
  headR: number,
  charData: CharacterDef,
  outfit: Outfit,
  facing: 1 | -1,
  animPhase = 0,
  scale = 1
): void {
  const hairColor = charData.femaleHair || outfit.armor;
  const sway = Math.sin(animPhase * 2.2) * 3.2 * scale;
  const style = charData.hairStyle || 'ponytail';

  targetCtx.save();

  targetCtx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  targetCtx.beginPath();
  targetCtx.arc(cx - facing * 1.5 * scale, topY + 2 * scale, headR * 1.07, Math.PI * 0.88, Math.PI * 2.12);
  targetCtx.fill();

  targetCtx.fillStyle = hairColor;
  targetCtx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  targetCtx.lineWidth = Math.max(1.2, 1.5 * scale);

  targetCtx.beginPath();
  targetCtx.arc(cx, topY - 1.5 * scale, headR * 1.12, Math.PI * 0.9, Math.PI * 2.1);
  targetCtx.quadraticCurveTo(cx + facing * headR * 0.45, topY - headR * 0.12, cx - facing * headR * 0.65, topY - headR * 0.05);
  targetCtx.closePath();
  targetCtx.fill();
  targetCtx.stroke();

  for (let s = -1; s <= 1; s++) {
    targetCtx.beginPath();
    targetCtx.moveTo(cx + s * headR * 0.32, topY - headR * 0.52);
    targetCtx.quadraticCurveTo(
      cx + s * headR * 0.42 + facing * 2 * scale,
      topY + headR * 0.15,
      cx + s * headR * 0.28 + facing * 3 * scale,
      topY + headR * 0.52
    );
    targetCtx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
    targetCtx.lineWidth = Math.max(1.2, 1.6 * scale);
    targetCtx.stroke();
  }

  if (style === 'ponytail' || style === 'high_ponytail') {
    const startY = style === 'high_ponytail' ? topY - headR * 0.55 : topY - headR * 0.35;
    targetCtx.fillStyle = hairColor;
    targetCtx.beginPath();
    targetCtx.moveTo(cx - facing * headR * 0.62, startY);
    targetCtx.bezierCurveTo(
      cx - facing * headR * 2.05 + sway,
      topY + headR * 0.05,
      cx - facing * headR * 1.85 + sway * 1.4,
      topY + headR * 1.85,
      cx - facing * headR * 1.4 + sway * 1.55,
      topY + headR * 2.65
    );
    targetCtx.quadraticCurveTo(cx - facing * headR * 1.0 + sway, topY + headR * 1.55, cx - facing * headR * 0.42, topY + headR * 0.2);
    targetCtx.closePath();
    targetCtx.fill();

    targetCtx.fillStyle = outfit.armor;
    targetCtx.beginPath();
    targetCtx.arc(cx - facing * headR * 0.76, startY + headR * 0.16, Math.max(3, 3.8 * scale), 0, Math.PI * 2);
    targetCtx.fill();
  } else if (style === 'long_straight') {
    // Ultra-sleek long straight hair cascading down past shoulders
    targetCtx.fillStyle = hairColor;
    targetCtx.beginPath();
    targetCtx.moveTo(cx - facing * headR * 0.92, topY - headR * 0.15);
    targetCtx.lineTo(cx - facing * headR * 1.25 + sway * 0.85, topY + headR * 2.9);
    targetCtx.quadraticCurveTo(cx - facing * headR * 0.45 + sway * 0.6, topY + headR * 3.05, cx - facing * headR * 0.12, topY + headR * 2.4);
    targetCtx.lineTo(cx - facing * headR * 0.15, topY + headR * 0.5);
    targetCtx.closePath();
    targetCtx.fill();

    // Front silky lock framing cheek
    targetCtx.beginPath();
    targetCtx.moveTo(cx + facing * headR * 0.68, topY - headR * 0.05);
    targetCtx.lineTo(cx + facing * headR * 0.88 + sway * 0.3, topY + headR * 2.15);
    targetCtx.lineWidth = Math.max(3.2, headR * 0.22);
    targetCtx.strokeStyle = hairColor;
    targetCtx.lineCap = 'round';
    targetCtx.stroke();

    // Glossy straight sheen
    targetCtx.strokeStyle = 'rgba(255,255,255,0.22)';
    targetCtx.lineWidth = Math.max(1.2, 1.5 * scale);
    targetCtx.beginPath();
    targetCtx.moveTo(cx - facing * headR * 0.78, topY + headR * 0.35);
    targetCtx.lineTo(cx - facing * headR * 0.95 + sway * 0.6, topY + headR * 2.35);
    targetCtx.stroke();
  } else if (style === 'curly_voluminous' || style === 'curly_flow') {
    // Rich voluminous curly ringlets
    const isFlow = style === 'curly_flow';
    const curlPts = isFlow
      ? [
          { dx: -0.9, dy: 0.05, r: 0.42 },
          { dx: -1.18, dy: 0.52, r: 0.48 },
          { dx: -1.28, dy: 1.05, r: 0.46 },
          { dx: -1.12, dy: 1.58, r: 0.44 },
          { dx: -0.92, dy: 2.08, r: 0.4 },
          { dx: -0.68, dy: 2.5, r: 0.34 },
          { dx: 0.68, dy: 0.35, r: 0.3 },
          { dx: 0.76, dy: 0.85, r: 0.28 },
        ]
      : [
          { dx: -0.82, dy: -0.25, r: 0.48 },
          { dx: -1.16, dy: 0.24, r: 0.52 },
          { dx: -1.18, dy: 0.78, r: 0.5 },
          { dx: -0.98, dy: 1.28, r: 0.46 },
          { dx: -0.62, dy: 1.62, r: 0.4 },
          { dx: -0.22, dy: 1.15, r: 0.38 },
          { dx: 0.74, dy: 0.2, r: 0.34 },
          { dx: 0.82, dy: 0.68, r: 0.32 },
        ];

    curlPts.forEach((c, idx) => {
      const bounce = Math.sin(animPhase * 2.4 + idx * 0.8) * 1.4 * scale;
      const px = cx + facing * headR * c.dx + sway * (0.25 + idx * 0.08) + bounce * 0.4;
      const py = topY + headR * c.dy + bounce * 0.5;
      const pr = headR * c.r;
      targetCtx.fillStyle = hairColor;
      targetCtx.beginPath();
      targetCtx.arc(px, py, pr, 0, Math.PI * 2);
      targetCtx.fill();

      // Subtle curl highlight ring
      targetCtx.strokeStyle = 'rgba(255,255,255,0.2)';
      targetCtx.lineWidth = Math.max(1, 1.3 * scale);
      targetCtx.beginPath();
      targetCtx.arc(px, py, pr * 0.66, -Math.PI * 0.8, -Math.PI * 0.1);
      targetCtx.stroke();
    });
  } else if (style === 'short_bob' || style === 'bob_sleek') {
    // Chic angled chin-length short bob
    targetCtx.fillStyle = hairColor;
    targetCtx.beginPath();
    targetCtx.moveTo(cx - facing * headR * 0.96, topY - headR * 0.2);
    targetCtx.quadraticCurveTo(
      cx - facing * headR * 1.32,
      topY + headR * 0.62,
      cx - facing * headR * 0.86 + sway * 0.25,
      topY + headR * 1.16
    );
    targetCtx.lineTo(cx + facing * headR * 0.22, topY + headR * 1.05);
    targetCtx.quadraticCurveTo(cx + facing * headR * 0.65, topY + headR * 0.78, cx + facing * headR * 0.86, topY + headR * 0.22);
    targetCtx.closePath();
    targetCtx.fill();

    // Sleek angled side bang highlight
    targetCtx.strokeStyle = outfit.armor;
    targetCtx.lineWidth = Math.max(1.2, 1.6 * scale);
    targetCtx.beginPath();
    targetCtx.moveTo(cx + facing * headR * 0.3, topY - headR * 0.65);
    targetCtx.quadraticCurveTo(cx + facing * headR * 0.85, topY - headR * 0.1, cx + facing * headR * 0.72, topY + headR * 0.55);
    targetCtx.stroke();
  } else if (style === 'pixie_layered') {
    // Modern feathered short pixie cut
    targetCtx.fillStyle = hairColor;
    targetCtx.beginPath();
    targetCtx.moveTo(cx - facing * headR * 0.92, topY - headR * 0.25);
    targetCtx.lineTo(cx - facing * headR * 1.24 + sway * 0.2, topY + headR * 0.12);
    targetCtx.lineTo(cx - facing * headR * 0.98, topY + headR * 0.34);
    targetCtx.lineTo(cx - facing * headR * 1.12 + sway * 0.2, topY + headR * 0.68);
    targetCtx.lineTo(cx - facing * headR * 0.45, topY + headR * 0.78);
    targetCtx.lineTo(cx + facing * headR * 0.65, topY + headR * 0.18);
    targetCtx.closePath();
    targetCtx.fill();

    // Feathered wispy side-bangs
    targetCtx.beginPath();
    targetCtx.moveTo(cx + facing * headR * 0.15, topY - headR * 0.82);
    targetCtx.quadraticCurveTo(cx + facing * headR * 0.95, topY - headR * 0.35, cx + facing * headR * 0.98, topY + headR * 0.15);
    targetCtx.quadraticCurveTo(cx + facing * headR * 0.55, topY - headR * 0.15, cx - facing * headR * 0.25, topY - headR * 0.22);
    targetCtx.closePath();
    targetCtx.fill();
  } else if (style === 'twin_tails') {
    [-1, 1].forEach((side) => {
      targetCtx.beginPath();
      targetCtx.moveTo(cx + side * headR * 0.82, topY - headR * 0.18);
      targetCtx.bezierCurveTo(
        cx + side * headR * 1.55 + sway * 0.75,
        topY + headR * 0.75,
        cx + side * headR * 1.35 + sway * 0.9,
        topY + headR * 1.65,
        cx + side * headR * 1.15 + sway * 1.1,
        topY + headR * 2.35
      );
      targetCtx.lineWidth = Math.max(4.5, headR * 0.36);
      targetCtx.strokeStyle = hairColor;
      targetCtx.lineCap = 'round';
      targetCtx.stroke();
    });
  } else if (style === 'braids') {
    const braidSteps = 5;
    for (let i = 0; i < braidSteps; i++) {
      const t = i / braidSteps;
      const bx = cx - facing * headR * (0.75 + t * 0.55) + sway * t * 0.7;
      const by = topY + headR * (0.12 + t * 2.05);
      const br = Math.max(3.5, headR * (0.28 - t * 0.03));

      targetCtx.fillStyle = hairColor;
      targetCtx.beginPath();
      targetCtx.arc(bx, by, br, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
      targetCtx.lineWidth = Math.max(1.2, 1.5 * scale);
      targetCtx.stroke();
    }

    targetCtx.fillStyle = outfit.belt || '#fbbf24';
    targetCtx.fillRect(cx - facing * headR * 1.05 + sway * 0.4 - 3 * scale, topY + headR * 1.05, 6 * scale, 3 * scale);
    targetCtx.fillRect(cx - facing * headR * 1.2 + sway * 0.6 - 3 * scale, topY + headR * 1.65, 6 * scale, 3 * scale);
  } else if (style === 'flame_flow' || style === 'long_wave') {
    targetCtx.fillStyle = hairColor;
    targetCtx.beginPath();
    targetCtx.moveTo(cx - facing * headR * 0.88, topY - headR * 0.2);
    targetCtx.bezierCurveTo(
      cx - facing * headR * 1.5 + sway,
      topY + headR * 0.85,
      cx - facing * headR * 1.3 - sway * 0.75,
      topY + headR * 1.95,
      cx - facing * headR * 0.72 + sway,
      topY + headR * 2.65
    );
    targetCtx.quadraticCurveTo(cx - facing * headR * 0.45, topY + headR * 1.85, cx - facing * headR * 0.25, topY + headR * 1.05);
    targetCtx.closePath();
    targetCtx.fill();

    targetCtx.beginPath();
    targetCtx.moveTo(cx + facing * headR * 0.75, topY + headR * 0.05);
    targetCtx.quadraticCurveTo(
      cx + facing * headR * 1.02 + sway * 0.4,
      topY + headR * 1.15,
      cx + facing * headR * 0.88 + sway * 0.5,
      topY + headR * 1.95
    );
    targetCtx.lineWidth = Math.max(3.5, headR * 0.22);
    targetCtx.strokeStyle = hairColor;
    targetCtx.lineCap = 'round';
    targetCtx.stroke();
  } else if (style === 'royal_braid') {
    targetCtx.beginPath();
    targetCtx.moveTo(cx - facing * headR * 0.75, topY - headR * 0.25);
    targetCtx.lineTo(cx - facing * headR * 1.08 + sway * 0.55, topY + headR * 2.35);
    targetCtx.lineWidth = Math.max(5.5, headR * 0.4);
    targetCtx.strokeStyle = hairColor;
    targetCtx.lineCap = 'round';
    targetCtx.stroke();

    // Royal gold rings along the braid
    targetCtx.fillStyle = '#fde047';
    [0.65, 1.2, 1.75].forEach((m) => {
      targetCtx.fillRect(cx - facing * headR * (0.78 + m * 0.12) + sway * 0.35 - 3 * scale, topY + headR * m, 6 * scale, 2.5 * scale);
    });
  } else {
    targetCtx.fillStyle = hairColor;
    targetCtx.beginPath();
    targetCtx.arc(cx - facing * headR * 0.15, topY + headR * 0.05, headR * 1.1, Math.PI * 0.52, Math.PI * 1.68);
    targetCtx.fill();
  }

  targetCtx.strokeStyle = 'rgba(255, 255, 255, 0.36)';
  targetCtx.lineWidth = Math.max(1.5, 2.2 * scale);
  targetCtx.beginPath();
  targetCtx.arc(cx - facing * headR * 0.15, topY - headR * 0.35, headR * 0.78, Math.PI * 1.15, Math.PI * 1.68);
  targetCtx.stroke();

  targetCtx.restore();
}

export function drawFemaleFaceFeatures(
  targetCtx: CanvasRenderingContext2D,
  cx: number,
  eyeY: number,
  headR: number,
  facing: 1 | -1,
  isDead: boolean,
  scale = 1
): void {
  targetCtx.save();
  const dashX = facing === 1 ? cx + headR * 0.28 : cx - headR * 0.72;
  const dashW = Math.max(5.5, headR * 0.44);
  const dashH = Math.max(2.6, 3.2 * scale);

  if (isDead) {
    targetCtx.strokeStyle = '#ffffff';
    targetCtx.lineWidth = Math.max(1.8, 2.2 * scale);
    const ex = dashX + dashW / 2;
    targetCtx.beginPath();
    targetCtx.moveTo(ex - 3 * scale, eyeY - 2.5 * scale);
    targetCtx.lineTo(ex + 3 * scale, eyeY + 2.5 * scale);
    targetCtx.moveTo(ex + 3 * scale, eyeY - 2.5 * scale);
    targetCtx.lineTo(ex - 3 * scale, eyeY + 2.5 * scale);
    targetCtx.stroke();
  } else {
    targetCtx.fillStyle = '#ffffff';
    targetCtx.shadowBlur = 4;
    targetCtx.shadowColor = 'rgba(255, 255, 255, 0.7)';
    targetCtx.fillRect(dashX, eyeY - dashH / 2, dashW, dashH);
  }
  targetCtx.restore();
}

// Exact character & outfit torso rendering from arena_v_10__9781e672.html
export function drawAnatomicalTorso(
  targetCtx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  charData: CharacterDef,
  outfit: Outfit,
  gender: Gender,
  facing: 1 | -1,
  bustBounceY = 0,
  bustSwayX = 0
): void {
  const isFemale = gender === 'female';
  const cx = x + w / 2;
  const topY = y;
  const waistY = y + h * 0.54;
  const hipY = y + h;

  const shoulderHalfW = isFemale ? w * 0.39 : w * 0.455;
  const waistHalfW = isFemale ? w * 0.19 : w * 0.275;
  const hipHalfW = isFemale ? w * 0.47 : w * 0.345;

  targetCtx.save();

  if (isFemale) {
    targetCtx.fillStyle = charData.skinColor;
    targetCtx.beginPath();
    targetCtx.moveTo(cx - shoulderHalfW, topY);
    targetCtx.lineTo(cx + shoulderHalfW, topY);
    targetCtx.quadraticCurveTo(cx + shoulderHalfW * 0.82, topY + h * 0.28, cx + waistHalfW, waistY);
    targetCtx.quadraticCurveTo(cx + hipHalfW * 1.08, hipY - h * 0.14, cx + hipHalfW, hipY);
    targetCtx.lineTo(cx - hipHalfW, hipY);
    targetCtx.quadraticCurveTo(cx - hipHalfW * 1.08, hipY - h * 0.14, cx - waistHalfW, waistY);
    targetCtx.quadraticCurveTo(cx - shoulderHalfW * 0.82, topY + h * 0.28, cx - shoulderHalfW, topY);
    targetCtx.closePath();
    targetCtx.fill();

    targetCtx.strokeStyle = 'rgba(0, 0, 0, 0.16)';
    targetCtx.lineWidth = 1.2;
    targetCtx.beginPath();
    targetCtx.moveTo(cx - shoulderHalfW * 0.55, topY + 4);
    targetCtx.quadraticCurveTo(cx, topY + 7, cx + shoulderHalfW * 0.55, topY + 4);
    targetCtx.stroke();

    if (outfit.style === 'summer_bikini') {
      targetCtx.strokeStyle = outfit.body;
      targetCtx.lineWidth = 2.1;
      targetCtx.beginPath();
      targetCtx.moveTo(cx - shoulderHalfW * 0.42, topY + 1);
      targetCtx.lineTo(cx + facing * w * 0.1, topY + h * 0.24 + bustBounceY * 0.65);
      targetCtx.moveTo(cx + shoulderHalfW * 0.32, topY + 1);
      targetCtx.lineTo(cx + facing * w * 0.14, topY + h * 0.24 + bustBounceY * 0.65);
      targetCtx.stroke();

      targetCtx.strokeStyle = outfit.armor;
      targetCtx.lineWidth = 1.4;
      targetCtx.beginPath();
      targetCtx.moveTo(cx - shoulderHalfW * 0.42, topY + 1);
      targetCtx.lineTo(cx + facing * w * 0.08, topY + h * 0.18 + bustBounceY * 0.5);
      targetCtx.stroke();

      targetCtx.strokeStyle = outfit.body;
      targetCtx.lineWidth = 2.4;
      targetCtx.beginPath();
      targetCtx.moveTo(cx - shoulderHalfW * 0.72, topY + h * 0.36);
      targetCtx.quadraticCurveTo(cx, topY + h * 0.39, cx + shoulderHalfW * 0.72, topY + h * 0.36);
      targetCtx.stroke();

      targetCtx.fillStyle = outfit.body;
      targetCtx.beginPath();
      targetCtx.moveTo(cx - hipHalfW * 0.96, waistY + h * 0.16);
      targetCtx.quadraticCurveTo(cx, waistY + h * 0.24, cx + hipHalfW * 0.96, waistY + h * 0.16);
      targetCtx.lineTo(cx + hipHalfW * 0.38, hipY + 1);
      targetCtx.lineTo(cx - hipHalfW * 0.38, hipY + 1);
      targetCtx.closePath();
      targetCtx.fill();

      targetCtx.strokeStyle = outfit.armor;
      targetCtx.lineWidth = 1.6;
      targetCtx.beginPath();
      targetCtx.moveTo(cx - hipHalfW * 0.96, waistY + h * 0.16);
      targetCtx.quadraticCurveTo(cx, waistY + h * 0.24, cx + hipHalfW * 0.96, waistY + h * 0.16);
      targetCtx.moveTo(cx - hipHalfW * 0.96, waistY + h * 0.16);
      targetCtx.lineTo(cx - hipHalfW * 1.15, waistY + h * 0.28);
      targetCtx.moveTo(cx + hipHalfW * 0.96, waistY + h * 0.16);
      targetCtx.lineTo(cx + hipHalfW * 1.15, waistY + h * 0.28);
      targetCtx.stroke();

      // Jewel clasp accent
      targetCtx.fillStyle = outfit.belt;
      targetCtx.beginPath();
      targetCtx.arc(cx, waistY + h * 0.21, Math.max(2.2, w * 0.055), 0, Math.PI * 2);
      targetCtx.fill();
    } else if (outfit.style === 'crop_mini') {
      targetCtx.fillStyle = outfit.body;
      targetCtx.beginPath();
      targetCtx.moveTo(cx - shoulderHalfW * 0.9, topY + 1);
      targetCtx.lineTo(cx - shoulderHalfW * 0.32, topY + 1);
      targetCtx.quadraticCurveTo(cx, topY + h * 0.17, cx + shoulderHalfW * 0.32, topY + 1);
      targetCtx.lineTo(cx + shoulderHalfW * 0.9, topY + 1);
      targetCtx.quadraticCurveTo(cx + shoulderHalfW * 0.78, topY + h * 0.22, cx + waistHalfW * 1.18, topY + h * 0.37);
      targetCtx.quadraticCurveTo(cx, topY + h * 0.41, cx - waistHalfW * 1.18, topY + h * 0.37);
      targetCtx.quadraticCurveTo(cx - shoulderHalfW * 0.78, topY + h * 0.22, cx - shoulderHalfW * 0.9, topY + 1);
      targetCtx.closePath();
      targetCtx.fill();

      targetCtx.strokeStyle = outfit.armor;
      targetCtx.lineWidth = 1.8;
      targetCtx.beginPath();
      targetCtx.moveTo(cx - shoulderHalfW * 0.32, topY + 1);
      targetCtx.quadraticCurveTo(cx, topY + h * 0.17, cx + shoulderHalfW * 0.32, topY + 1);
      targetCtx.moveTo(cx - waistHalfW * 1.18, topY + h * 0.37);
      targetCtx.quadraticCurveTo(cx, topY + h * 0.41, cx + waistHalfW * 1.18, topY + h * 0.37);
      targetCtx.stroke();

      targetCtx.fillStyle = outfit.belt;
      targetCtx.fillRect(cx - waistHalfW * 1.1, waistY - 1.5, waistHalfW * 2.2, 4.5);

      targetCtx.fillStyle = outfit.body;
      targetCtx.beginPath();
      targetCtx.moveTo(cx - waistHalfW * 1.08, waistY + 3);
      targetCtx.lineTo(cx + waistHalfW * 1.08, waistY + 3);
      targetCtx.quadraticCurveTo(cx + hipHalfW * 1.18, hipY - h * 0.12, cx + hipHalfW * 1.24, hipY + 5);
      targetCtx.lineTo(cx - hipHalfW * 1.24, hipY + 5);
      targetCtx.quadraticCurveTo(cx - hipHalfW * 1.18, hipY - h * 0.12, cx - waistHalfW * 1.08, waistY + 3);
      targetCtx.closePath();
      targetCtx.fill();

      targetCtx.strokeStyle = 'rgba(0, 0, 0, 0.24)';
      targetCtx.lineWidth = 1.1;
      [-0.5, -0.17, 0.17, 0.5].forEach((f) => {
        targetCtx.beginPath();
        targetCtx.moveTo(cx + waistHalfW * f, waistY + 4);
        targetCtx.lineTo(cx + hipHalfW * f * 1.16, hipY + 4);
        targetCtx.stroke();
      });

      targetCtx.strokeStyle = outfit.armor;
      targetCtx.lineWidth = 2.2;
      targetCtx.beginPath();
      targetCtx.moveTo(cx - hipHalfW * 1.24, hipY + 5);
      targetCtx.lineTo(cx + hipHalfW * 1.24, hipY + 5);
      targetCtx.stroke();
    } else if (outfit.style === 'corset_shorts') {
      targetCtx.fillStyle = outfit.body;
      targetCtx.beginPath();
      targetCtx.moveTo(cx - shoulderHalfW * 0.86, topY + 2);
      targetCtx.lineTo(cx - shoulderHalfW * 0.35, topY + 2);
      targetCtx.lineTo(cx, topY + h * 0.18);
      targetCtx.lineTo(cx + shoulderHalfW * 0.35, topY + 2);
      targetCtx.lineTo(cx + shoulderHalfW * 0.86, topY + 2);
      targetCtx.quadraticCurveTo(cx + shoulderHalfW * 0.72, topY + h * 0.28, cx + waistHalfW * 1.04, waistY + 2);
      targetCtx.lineTo(cx - waistHalfW * 1.04, waistY + 2);
      targetCtx.quadraticCurveTo(cx - shoulderHalfW * 0.72, topY + h * 0.28, cx - shoulderHalfW * 0.86, topY + 2);
      targetCtx.closePath();
      targetCtx.fill();

      targetCtx.strokeStyle = outfit.armor;
      targetCtx.lineWidth = 1.6;
      targetCtx.beginPath();
      targetCtx.moveTo(cx - shoulderHalfW * 0.35, topY + 2);
      targetCtx.lineTo(cx, topY + h * 0.18);
      targetCtx.lineTo(cx + shoulderHalfW * 0.35, topY + 2);
      targetCtx.moveTo(cx, topY + h * 0.18);
      targetCtx.lineTo(cx, waistY + 2);
      targetCtx.moveTo(cx - waistHalfW * 0.55, topY + h * 0.22);
      targetCtx.lineTo(cx - waistHalfW * 0.45, waistY + 2);
      targetCtx.moveTo(cx + waistHalfW * 0.55, topY + h * 0.22);
      targetCtx.lineTo(cx + waistHalfW * 0.45, waistY + 2);
      // Criss-cross corset lacing
      for (let lace = 0; lace < 3; lace++) {
        const ly1 = topY + h * (0.24 + lace * 0.08);
        const ly2 = topY + h * (0.31 + lace * 0.08);
        targetCtx.moveTo(cx - waistHalfW * 0.38, ly1);
        targetCtx.lineTo(cx + waistHalfW * 0.38, ly2);
        targetCtx.moveTo(cx + waistHalfW * 0.38, ly1);
        targetCtx.lineTo(cx - waistHalfW * 0.38, ly2);
      }
      targetCtx.stroke();

      targetCtx.fillStyle = outfit.body;
      targetCtx.beginPath();
      targetCtx.moveTo(cx - waistHalfW * 1.06, waistY + 4);
      targetCtx.lineTo(cx + waistHalfW * 1.06, waistY + 4);
      targetCtx.quadraticCurveTo(cx + hipHalfW * 1.1, hipY - h * 0.12, cx + hipHalfW * 1.08, hipY + 3);
      targetCtx.lineTo(cx + 2, hipY + 3);
      targetCtx.lineTo(cx, hipY - 5);
      targetCtx.lineTo(cx - 2, hipY + 3);
      targetCtx.lineTo(cx - hipHalfW * 1.08, hipY + 3);
      targetCtx.quadraticCurveTo(cx - hipHalfW * 1.1, hipY - h * 0.12, cx - waistHalfW * 1.06, waistY + 4);
      targetCtx.closePath();
      targetCtx.fill();

      targetCtx.strokeStyle = outfit.armor;
      targetCtx.lineWidth = 1.7;
      targetCtx.beginPath();
      targetCtx.moveTo(cx - hipHalfW * 1.08, hipY + 3);
      targetCtx.lineTo(cx + 2, hipY + 3);
      targetCtx.moveTo(cx + 2, hipY + 3);
      targetCtx.lineTo(cx + hipHalfW * 1.08, hipY + 3);
      targetCtx.stroke();
    } else if (outfit.style === 'slit_dress') {
      targetCtx.fillStyle = outfit.body;
      targetCtx.beginPath();
      targetCtx.moveTo(cx - shoulderHalfW * 0.86, topY + 1);
      targetCtx.lineTo(cx - shoulderHalfW * 0.34, topY + 1);
      targetCtx.lineTo(cx, topY + h * 0.22);
      targetCtx.lineTo(cx + shoulderHalfW * 0.34, topY + 1);
      targetCtx.lineTo(cx + shoulderHalfW * 0.86, topY + 1);
      targetCtx.quadraticCurveTo(cx + shoulderHalfW * 0.74, topY + h * 0.28, cx + waistHalfW, waistY);
      targetCtx.quadraticCurveTo(cx + hipHalfW * 1.12, hipY - h * 0.14, cx + hipHalfW * 1.16, hipY + 12);
      targetCtx.lineTo(cx + facing * 3, waistY + h * 0.16);
      targetCtx.lineTo(cx - hipHalfW * 1.16, hipY + 12);
      targetCtx.quadraticCurveTo(cx - hipHalfW * 1.12, hipY - h * 0.14, cx - waistHalfW, waistY);
      targetCtx.quadraticCurveTo(cx - shoulderHalfW * 0.74, topY + h * 0.28, cx - shoulderHalfW * 0.86, topY + 1);
      targetCtx.closePath();
      targetCtx.fill();

      targetCtx.strokeStyle = outfit.armor;
      targetCtx.lineWidth = 2.0;
      targetCtx.beginPath();
      targetCtx.moveTo(cx - shoulderHalfW * 0.34, topY + 1);
      targetCtx.lineTo(cx, topY + h * 0.22);
      targetCtx.lineTo(cx + shoulderHalfW * 0.34, topY + 1);
      targetCtx.moveTo(cx + facing * 3, waistY + h * 0.16);
      targetCtx.lineTo(cx + hipHalfW * 1.16, hipY + 12);
      targetCtx.moveTo(cx - hipHalfW * 1.16, hipY + 12);
      targetCtx.lineTo(cx + facing * 3, waistY + h * 0.16);
      targetCtx.stroke();

      // Shimmering center brooch
      targetCtx.fillStyle = outfit.belt;
      targetCtx.beginPath();
      targetCtx.arc(cx, topY + h * 0.23, Math.max(2.3, w * 0.055), 0, Math.PI * 2);
      targetCtx.fill();
    } else {
      targetCtx.fillStyle = outfit.body;
      targetCtx.beginPath();
      targetCtx.moveTo(cx - shoulderHalfW * 0.88, topY + 1);
      targetCtx.lineTo(cx - shoulderHalfW * 0.3, topY + 1);
      targetCtx.quadraticCurveTo(cx, topY + h * 0.15, cx + shoulderHalfW * 0.3, topY + 1);
      targetCtx.lineTo(cx + shoulderHalfW * 0.88, topY + 1);
      targetCtx.quadraticCurveTo(cx + shoulderHalfW * 0.76, topY + h * 0.24, cx + waistHalfW * 1.15, topY + h * 0.36);
      targetCtx.lineTo(cx - waistHalfW * 1.15, topY + h * 0.36);
      targetCtx.quadraticCurveTo(cx - shoulderHalfW * 0.76, topY + h * 0.24, cx - shoulderHalfW * 0.88, topY + 1);
      targetCtx.closePath();
      targetCtx.fill();

      targetCtx.strokeStyle = outfit.armor;
      targetCtx.lineWidth = 1.6;
      targetCtx.beginPath();
      targetCtx.moveTo(cx - waistHalfW * 1.15, topY + h * 0.36);
      targetCtx.lineTo(cx + waistHalfW * 1.15, topY + h * 0.36);
      targetCtx.moveTo(cx - shoulderHalfW * 0.35, topY + 4);
      targetCtx.lineTo(cx, topY + h * 0.34);
      targetCtx.lineTo(cx + shoulderHalfW * 0.35, topY + 4);
      targetCtx.stroke();

      targetCtx.beginPath();
      targetCtx.moveTo(cx - waistHalfW * 1.06, waistY + 3);
      targetCtx.lineTo(cx + waistHalfW * 1.06, waistY + 3);
      targetCtx.quadraticCurveTo(cx + hipHalfW * 1.06, hipY - h * 0.12, cx + hipHalfW * 1.04, hipY);
      targetCtx.lineTo(cx, hipY - 5);
      targetCtx.lineTo(cx - hipHalfW * 1.04, hipY);
      targetCtx.quadraticCurveTo(cx - hipHalfW * 1.06, hipY - h * 0.12, cx - waistHalfW * 1.06, waistY + 3);
      targetCtx.closePath();
      targetCtx.fill();
    }

    // Sleek hip trim & choker accent for female silhouette
    targetCtx.strokeStyle = outfit.armor;
    targetCtx.lineWidth = 1.4;
    targetCtx.beginPath();
    targetCtx.quadraticCurveTo(cx + hipHalfW * 1.05, (waistY + hipY) * 0.5, cx + hipHalfW * 0.92, hipY - 2);
    targetCtx.stroke();

    const bustCenterX = cx + facing * (w * 0.22) + bustSwayX;
    const bustY = topY + h * 0.25 + bustBounceY;
    const bustRadius = Math.max(9.0, w * 0.23);

    targetCtx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    targetCtx.beginPath();
    targetCtx.arc(bustCenterX, bustY + 1.8, bustRadius * 0.98, 0, Math.PI * 2);
    targetCtx.fill();

    targetCtx.fillStyle = outfit.body;
    targetCtx.strokeStyle = 'rgba(0, 0, 0, 0.32)';
    targetCtx.lineWidth = 1.2;
    targetCtx.beginPath();
    targetCtx.arc(bustCenterX - facing * 1.8, bustY - 0.9, bustRadius * 0.93, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.stroke();

    targetCtx.fillStyle = outfit.body;
    targetCtx.beginPath();
    targetCtx.arc(bustCenterX, bustY, bustRadius, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.stroke();

    // Satin highlight on bust armor/fabric
    targetCtx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    targetCtx.lineWidth = 1.3;
    targetCtx.beginPath();
    targetCtx.arc(bustCenterX - facing * 1.5, bustY - 2, bustRadius * 0.62, -Math.PI * 0.75, -Math.PI * 0.15);
    targetCtx.stroke();

    targetCtx.strokeStyle = outfit.armor;
    targetCtx.lineWidth = 1.5;
    targetCtx.beginPath();
    targetCtx.arc(bustCenterX, bustY, bustRadius * 0.9, -Math.PI * 0.35, Math.PI * 0.45, facing === -1);
    targetCtx.stroke();

    if (outfit.style !== 'summer_bikini') {
      targetCtx.fillStyle = outfit.belt;
      targetCtx.fillRect(cx - waistHalfW - 0.5, waistY + 2.5, (waistHalfW + 0.5) * 2, Math.max(2.8, h * 0.06));
      targetCtx.fillStyle = outfit.armor;
      targetCtx.fillRect(cx - 3.5, waistY + 1.8, 7, Math.max(4, h * 0.075));
    }
  } else {
    // Sleek athletic V-taper masculine frame + stylish tailored outfits
    const torsoFill = outfit.style === 'vest' ? charData.skinColor : outfit.body;
    targetCtx.fillStyle = torsoFill;
    targetCtx.beginPath();
    targetCtx.moveTo(cx - shoulderHalfW * 1.02, topY);
    targetCtx.lineTo(cx + shoulderHalfW * 1.02, topY);
    targetCtx.quadraticCurveTo(cx + shoulderHalfW * 0.88, topY + h * 0.28, cx + waistHalfW * 0.94, waistY);
    targetCtx.quadraticCurveTo(cx + hipHalfW * 1.02, hipY - h * 0.14, cx + hipHalfW, hipY);
    targetCtx.lineTo(cx - hipHalfW, hipY);
    targetCtx.quadraticCurveTo(cx - hipHalfW * 1.02, hipY - h * 0.14, cx - waistHalfW * 0.94, waistY);
    targetCtx.quadraticCurveTo(cx - shoulderHalfW * 0.88, topY + h * 0.28, cx - shoulderHalfW * 1.02, topY);
    targetCtx.closePath();
    targetCtx.fill();

    // Sculpted fitted shoulder accents (sleek & non-bulky)
    [-1, 1].forEach((side) => {
      targetCtx.fillStyle = outfit.armor;
      targetCtx.strokeStyle = 'rgba(0, 0, 0, 0.42)';
      targetCtx.lineWidth = 1.4;
      targetCtx.beginPath();
      targetCtx.moveTo(cx + side * shoulderHalfW * 0.56, topY - 2);
      targetCtx.lineTo(cx + side * shoulderHalfW * 1.14, topY + 2);
      targetCtx.lineTo(cx + side * shoulderHalfW * 1.04, topY + h * 0.22);
      targetCtx.lineTo(cx + side * shoulderHalfW * 0.52, topY + h * 0.14);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.stroke();

      targetCtx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      targetCtx.lineWidth = 1.2;
      targetCtx.beginPath();
      targetCtx.moveTo(cx + side * shoulderHalfW * 0.6, topY + 0.5);
      targetCtx.lineTo(cx + side * shoulderHalfW * 1.08, topY + 3.5);
      targetCtx.stroke();
    });

    // Defined chest & athletic abs lines
    targetCtx.strokeStyle = 'rgba(0, 0, 0, 0.34)';
    targetCtx.lineWidth = 1.4;
    targetCtx.beginPath();
    targetCtx.moveTo(cx, topY + 6);
    targetCtx.lineTo(cx, waistY - 2);
    targetCtx.moveTo(cx - shoulderHalfW * 0.56, topY + h * 0.3);
    targetCtx.quadraticCurveTo(cx - shoulderHalfW * 0.22, topY + h * 0.37, cx, topY + h * 0.32);
    targetCtx.quadraticCurveTo(cx + shoulderHalfW * 0.22, topY + h * 0.37, cx + shoulderHalfW * 0.56, topY + h * 0.3);
    targetCtx.moveTo(cx - waistHalfW * 0.42, topY + h * 0.43);
    targetCtx.lineTo(cx + waistHalfW * 0.42, topY + h * 0.43);
    targetCtx.stroke();

    if (outfit.style === 'jacket') {
      // Sleek fitted combat/biker jacket with high collar, open V-neck & metallic zipper
      targetCtx.fillStyle = outfit.body;
      targetCtx.beginPath();
      targetCtx.moveTo(cx - shoulderHalfW * 0.96, topY);
      targetCtx.lineTo(cx + shoulderHalfW * 0.96, topY);
      targetCtx.quadraticCurveTo(cx + shoulderHalfW * 0.85, topY + h * 0.28, cx + waistHalfW * 1.02, waistY + 4);
      targetCtx.lineTo(cx + hipHalfW * 1.04, hipY + 3);
      targetCtx.lineTo(cx - hipHalfW * 1.04, hipY + 3);
      targetCtx.lineTo(cx - waistHalfW * 1.02, waistY + 4);
      targetCtx.quadraticCurveTo(cx - shoulderHalfW * 0.85, topY + h * 0.28, cx - shoulderHalfW * 0.96, topY);
      targetCtx.closePath();
      targetCtx.fill();

      // Inner V-neck shirt & chest pendant/core
      targetCtx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      targetCtx.beginPath();
      targetCtx.moveTo(cx - shoulderHalfW * 0.34, topY);
      targetCtx.lineTo(cx + shoulderHalfW * 0.34, topY);
      targetCtx.lineTo(cx, topY + h * 0.36);
      targetCtx.closePath();
      targetCtx.fill();

      // Popped sharp lapels + diagonal zipper
      targetCtx.strokeStyle = outfit.armor;
      targetCtx.lineWidth = 2.0;
      targetCtx.beginPath();
      targetCtx.moveTo(cx - shoulderHalfW * 0.38, topY + 1);
      targetCtx.lineTo(cx - shoulderHalfW * 0.56, topY + h * 0.14);
      targetCtx.lineTo(cx, topY + h * 0.36);
      targetCtx.lineTo(cx + shoulderHalfW * 0.56, topY + h * 0.14);
      targetCtx.lineTo(cx + shoulderHalfW * 0.38, topY + 1);
      // Center metallic zipper
      targetCtx.moveTo(cx, topY + h * 0.36);
      targetCtx.lineTo(cx, hipY + 2);
      targetCtx.stroke();

      // Glowing collar clasp
      targetCtx.fillStyle = outfit.belt;
      targetCtx.beginPath();
      targetCtx.arc(cx, topY + h * 0.22, Math.max(2.4, w * 0.055), 0, Math.PI * 2);
      targetCtx.fill();
    } else if (outfit.style === 'plate') {
      // Sleek contoured cyber/paladin chest armor
      targetCtx.fillStyle = outfit.armor;
      targetCtx.beginPath();
      targetCtx.moveTo(cx - shoulderHalfW * 0.78, topY + 3);
      targetCtx.lineTo(cx + shoulderHalfW * 0.78, topY + 3);
      targetCtx.lineTo(cx + waistHalfW * 0.62, topY + h * 0.42);
      targetCtx.lineTo(cx, topY + h * 0.56);
      targetCtx.lineTo(cx - waistHalfW * 0.62, topY + h * 0.42);
      targetCtx.closePath();
      targetCtx.fill();

      targetCtx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
      targetCtx.lineWidth = 1.4;
      targetCtx.beginPath();
      targetCtx.moveTo(cx - shoulderHalfW * 0.6, topY + 7);
      targetCtx.lineTo(cx, topY + h * 0.24);
      targetCtx.lineTo(cx + shoulderHalfW * 0.6, topY + 7);
      targetCtx.stroke();

      // Glowing chest core gem
      targetCtx.fillStyle = outfit.belt;
      targetCtx.beginPath();
      targetCtx.moveTo(cx, topY + 10);
      targetCtx.lineTo(cx + 5, topY + 18);
      targetCtx.lineTo(cx, topY + 26);
      targetCtx.lineTo(cx - 5, topY + 18);
      targetCtx.closePath();
      targetCtx.fill();
    } else if (outfit.style === 'kimono') {
      targetCtx.fillStyle = outfit.body;
      targetCtx.beginPath();
      targetCtx.moveTo(cx - waistHalfW - 2, waistY - 4);
      targetCtx.lineTo(cx + waistHalfW + 2, waistY - 4);
      targetCtx.lineTo(cx + hipHalfW + 5, hipY + 13);
      targetCtx.lineTo(cx - hipHalfW - 5, hipY + 13);
      targetCtx.closePath();
      targetCtx.fill();

      targetCtx.strokeStyle = outfit.armor;
      targetCtx.lineWidth = Math.max(2.3, w * 0.05);
      targetCtx.beginPath();
      targetCtx.moveTo(cx - shoulderHalfW * 0.52, topY + 2);
      targetCtx.lineTo(cx + shoulderHalfW * 0.34, waistY);
      targetCtx.moveTo(cx + shoulderHalfW * 0.52, topY + 2);
      targetCtx.lineTo(cx - shoulderHalfW * 0.34, waistY);
      targetCtx.stroke();

      targetCtx.strokeStyle = outfit.belt;
      targetCtx.lineWidth = 1.6;
      targetCtx.beginPath();
      targetCtx.moveTo(cx - hipHalfW - 4, hipY + 11);
      targetCtx.lineTo(cx + hipHalfW + 4, hipY + 11);
      targetCtx.stroke();
    } else if (outfit.style === 'vest') {
      targetCtx.fillStyle = outfit.body;
      targetCtx.fillRect(cx - shoulderHalfW * 0.96, topY, shoulderHalfW * 0.44, h);
      targetCtx.fillRect(cx + shoulderHalfW * 0.52, topY, shoulderHalfW * 0.44, h);
      targetCtx.strokeStyle = outfit.armor;
      targetCtx.lineWidth = 1.8;
      targetCtx.strokeRect(cx - shoulderHalfW * 0.96, topY, shoulderHalfW * 0.44, h);
      targetCtx.strokeRect(cx + shoulderHalfW * 0.52, topY, shoulderHalfW * 0.44, h);
    } else if (outfit.style === 'coat') {
      targetCtx.fillStyle = outfit.body;
      targetCtx.beginPath();
      targetCtx.moveTo(cx - shoulderHalfW * 0.94, topY);
      targetCtx.lineTo(cx + shoulderHalfW * 0.94, topY);
      targetCtx.lineTo(cx + hipHalfW * 1.12, hipY + 14);
      targetCtx.lineTo(cx - hipHalfW * 1.12, hipY + 14);
      targetCtx.closePath();
      targetCtx.fill();

      // Tailored metallic front panel & glowing lapels
      targetCtx.fillStyle = outfit.armor;
      targetCtx.fillRect(cx - w * 0.045, topY + 2, w * 0.09, h + 11);
      targetCtx.strokeStyle = outfit.belt;
      targetCtx.lineWidth = 1.7;
      targetCtx.beginPath();
      targetCtx.moveTo(cx - hipHalfW * 1.08, hipY + 12);
      targetCtx.lineTo(cx + hipHalfW * 1.08, hipY + 12);
      targetCtx.stroke();

      // Sharp collar lapels
      targetCtx.strokeStyle = outfit.armor;
      targetCtx.lineWidth = 2.0;
      targetCtx.beginPath();
      targetCtx.moveTo(cx - shoulderHalfW * 0.44, topY + 2);
      targetCtx.lineTo(cx - w * 0.08, topY + h * 0.26);
      targetCtx.moveTo(cx + shoulderHalfW * 0.44, topY + 2);
      targetCtx.lineTo(cx + w * 0.08, topY + h * 0.26);
      targetCtx.stroke();
    }

    // Sleek Tailored Belt & Emblem Buckle
    targetCtx.fillStyle = outfit.belt;
    targetCtx.fillRect(cx - waistHalfW - 1.5, waistY - 3.5, (waistHalfW + 1.5) * 2, Math.max(4.5, h * 0.09));
    targetCtx.fillStyle = outfit.armor;
    targetCtx.fillRect(cx - 5, waistY - 4.5, 10, Math.max(6.5, h * 0.115));
    targetCtx.strokeStyle = 'rgba(0,0,0,0.45)';
    targetCtx.lineWidth = 1.0;
    targetCtx.strokeRect(cx - 5, waistY - 4.5, 10, Math.max(6.5, h * 0.115));
  }

  targetCtx.restore();
}

export function drawHeadgear(
  targetCtx: CanvasRenderingContext2D,
  outfit: Outfit,
  cx: number,
  bodyY: number,
  facing: 1 | -1,
  scale = 1
): void {
  targetCtx.save();
  targetCtx.fillStyle = outfit.armor;
  if (outfit.headgear === 'hat') {
    targetCtx.beginPath();
    targetCtx.moveTo(cx - 32 * scale, bodyY + 12 * scale);
    targetCtx.lineTo(cx + 32 * scale, bodyY + 12 * scale);
    targetCtx.lineTo(cx, bodyY - 6 * scale);
    targetCtx.closePath();
    targetCtx.fill();
  } else if (outfit.headgear === 'horns') {
    targetCtx.beginPath();
    targetCtx.moveTo(cx - 14 * scale, bodyY + 8 * scale);
    targetCtx.lineTo(cx - 22 * scale, bodyY - 12 * scale);
    targetCtx.lineTo(cx - 6 * scale, bodyY + 4 * scale);
    targetCtx.moveTo(cx + 14 * scale, bodyY + 8 * scale);
    targetCtx.lineTo(cx + 22 * scale, bodyY - 12 * scale);
    targetCtx.lineTo(cx + 6 * scale, bodyY + 4 * scale);
    targetCtx.fill();
  } else if (outfit.headgear === 'crown') {
    targetCtx.fillStyle = '#facc15';
    targetCtx.fillRect(cx - 18 * scale, bodyY + 2 * scale, 36 * scale, 11 * scale);
  } else if (outfit.headgear === 'visor') {
    targetCtx.fillStyle = '#10b981';
    targetCtx.fillRect(facing === 1 ? cx : cx - 17 * scale, bodyY + 14 * scale, 17 * scale, 6 * scale);
  } else if (outfit.headgear === 'hood') {
    targetCtx.fillStyle = outfit.body;
    targetCtx.beginPath();
    targetCtx.arc(cx, bodyY + 20 * scale, 20 * scale, Math.PI * 0.9, Math.PI * 0.1);
    targetCtx.fill();
  } else if (outfit.headgear === 'helm') {
    targetCtx.fillStyle = '#94a3b8';
    targetCtx.beginPath();
    targetCtx.arc(cx, bodyY + 18 * scale, 19 * scale, Math.PI, 0);
    targetCtx.fill();
  } else if (outfit.headgear === 'band') {
    targetCtx.fillRect(cx - 18 * scale, bodyY + 10 * scale, 36 * scale, 6 * scale);
  } else if (outfit.headgear === 'mohawk') {
    targetCtx.fillRect(cx - 5 * scale, bodyY - 10 * scale, 10 * scale, 14 * scale);
  }
  targetCtx.restore();
}

export interface PreviewCharacterOptions {
  theme?: ThemeConfig;
  animTime?: number;
  chroma?: ChromaId;
}

// Preview character drawing with Theme Energy Sparks & subtle Breathing animation
export function drawPreviewCharacter(
  pCanvas: HTMLCanvasElement | null,
  charIdx: number,
  outfitIdx: number,
  gender: Gender,
  facing: 1 | -1,
  options: PreviewCharacterOptions = {}
): void {
  if (!pCanvas) return;
  const pCtx = pCanvas.getContext('2d');
  if (!pCtx) return;
  pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);

  const animTime = options.animTime ?? 0;
  const theme = options.theme;
  const chroma = options.chroma ?? 'default';

  const char = CHARACTERS[charIdx] || CHARACTERS[0];
  const outfitList = getCharOutfits(charIdx, gender, chroma);
  const outfit = outfitList[outfitIdx] || outfitList[0];
  const isFemale = gender === 'female';
  const cx = pCanvas.width / 2;

  // Gentle breathing oscillation (chest & shoulders expand/rise subtly)
  const breathWave = Math.sin(animTime * 2.2);
  const breathY = breathWave * 1.45;
  const breathExpand = (breathWave + 1) * 0.65;
  const topY = 30 + breathY;

  // Theme-reactive Energy Sparks behind & around the character
  const sparkColors = theme
    ? [theme.dots[0], theme.dots[1], theme.rope1, theme.rope2]
    : [outfit.armor, outfit.belt, '#facc15', '#38bdf8'];

  pCtx.save();
  const auraGrad = pCtx.createRadialGradient(cx, 88, 8, cx, 88, 62);
  auraGrad.addColorStop(0, sparkColors[0]);
  auraGrad.addColorStop(0.55, sparkColors[2]);
  auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
  pCtx.globalAlpha = 0.2 + (breathWave + 1) * 0.04;
  pCtx.fillStyle = auraGrad;
  pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);

  for (let i = 0; i < 14; i++) {
    const seed = i * 1.37;
    const cycle = (animTime * (0.55 + (i % 4) * 0.12) + seed) % 1;
    const angle = seed * 3.1 + animTime * 0.45 * (i % 2 === 0 ? 1 : -1);
    const orbitR = 26 + (i % 5) * 8 + Math.sin(animTime * 1.7 + i) * 4;
    const sx = cx + Math.cos(angle) * orbitR;
    const sy = 128 - cycle * 110 + Math.sin(animTime * 2 + i) * 4;
    const sAlpha = Math.sin(cycle * Math.PI) * 0.85;
    const sColor = sparkColors[i % sparkColors.length];
    pCtx.globalAlpha = Math.max(0, sAlpha);
    pCtx.fillStyle = sColor;
    pCtx.shadowBlur = 9;
    pCtx.shadowColor = sColor;
    pCtx.beginPath();
    pCtx.arc(sx, sy, 1.4 + (i % 3) * 0.75, 0, Math.PI * 2);
    pCtx.fill();

    // Subtle rising spark tail
    pCtx.strokeStyle = sColor;
    pCtx.lineWidth = 1;
    pCtx.beginPath();
    pCtx.moveTo(sx, sy);
    pCtx.lineTo(sx, sy + 5.5);
    pCtx.stroke();
  }
  pCtx.restore();

  if (outfit.cape) {
    pCtx.fillStyle = outfit.armor;
    pCtx.beginPath();
    pCtx.moveTo(cx - facing * 8, topY + 35);
    pCtx.lineTo(cx - facing * 34 + Math.sin(animTime * 2.4) * 2.5, topY + 106);
    pCtx.lineTo(cx - facing * 10, topY + 108);
    pCtx.closePath();
    pCtx.fill();
  }

  const legW = isFemale ? 6.8 : 7.9;
  const legGap = isFemale ? 1.5 : 1.7;
  const legStartY = 30 + 71;
  const legLen = 39;
  pCtx.fillStyle = isFemale ? char.skinColor : '#0f172a';
  pCtx.fillRect(cx - legGap - legW, legStartY, legW, legLen);
  pCtx.fillRect(cx + legGap, legStartY, legW, legLen);
  pCtx.fillStyle = outfit.boots;
  pCtx.fillRect(cx - legGap - legW - 1, 30 + 97, legW + 2, 13);
  pCtx.fillRect(cx + legGap, 30 + 97, legW + 2, 13);
  pCtx.fillStyle = outfit.armor;
  pCtx.fillRect(cx - legGap - legW - 1, 30 + 97, legW + 2, 2.5);
  pCtx.fillRect(cx + legGap, 30 + 97, legW + 2, 2.5);

  const torsoW = (isFemale ? 35 : 35.5) + breathExpand;
  drawAnatomicalTorso(
    pCtx,
    cx - torsoW / 2,
    topY + 32,
    torsoW,
    44 - breathY * 0.4,
    char,
    outfit,
    gender,
    facing,
    breathY * 0.35,
    0
  );

  const headRadius = isFemale ? 12.5 : 13.6;
  const hairPhase = 0.4 + animTime * 0.85;
  if (isFemale) {
    drawStyledFemaleHair(pCtx, cx, topY + 16, headRadius, char, outfit, facing, hairPhase, 0.85);
  } else {
    drawStyledMaleHair(pCtx, cx, topY + 16, headRadius, char, outfit, facing, hairPhase, 0.85);
  }

  pCtx.fillStyle = char.skinColor;
  pCtx.beginPath();
  pCtx.arc(cx, topY + 16, headRadius, 0, Math.PI * 2);
  pCtx.fill();

  if (isFemale) {
    drawStyledFemaleHair(pCtx, cx, topY + 16, headRadius, char, outfit, facing, hairPhase, 0.85);
  } else {
    drawStyledMaleHair(pCtx, cx, topY + 16, headRadius, char, outfit, facing, hairPhase, 0.85);
  }

  pCtx.fillStyle = outfit.armor;
  if (outfit.headgear === 'hat') {
    pCtx.beginPath();
    pCtx.moveTo(cx - 25, topY + 8);
    pCtx.lineTo(cx + 25, topY + 8);
    pCtx.lineTo(cx, topY - 8);
    pCtx.closePath();
    pCtx.fill();
  } else if (outfit.headgear === 'horns') {
    pCtx.beginPath();
    pCtx.moveTo(cx - 11, topY + 5);
    pCtx.lineTo(cx - 18, topY - 11);
    pCtx.lineTo(cx - 4, topY + 2);
    pCtx.moveTo(cx + 11, topY + 5);
    pCtx.lineTo(cx + 18, topY - 11);
    pCtx.lineTo(cx + 4, topY + 2);
    pCtx.fill();
  } else if (outfit.headgear === 'crown') {
    pCtx.fillStyle = '#facc15';
    pCtx.fillRect(cx - 13, topY - 1, 26, 7);
  } else if (outfit.headgear === 'visor') {
    pCtx.fillStyle = '#10b981';
    pCtx.fillRect(facing === 1 ? cx : cx - 13, topY + 12, 13, 5);
  } else if (outfit.headgear === 'hood') {
    pCtx.fillStyle = outfit.body;
    pCtx.beginPath();
    pCtx.arc(cx, topY + 16, 16, Math.PI * 0.9, Math.PI * 0.1);
    pCtx.fill();
  } else if (outfit.headgear === 'helm') {
    pCtx.fillStyle = '#94a3b8';
    pCtx.beginPath();
    pCtx.arc(cx, topY + 13, 15, Math.PI, 0);
    pCtx.fill();
  } else if (outfit.headgear === 'band') {
    pCtx.fillRect(cx - 14, topY + 8, 28, 4.5);
  } else if (outfit.headgear === 'mohawk') {
    pCtx.fillRect(cx - 4, topY - 10, 8, 12);
  }

  if (isFemale) {
    drawFemaleFaceFeatures(pCtx, cx, topY + 16, headRadius, facing, false, 0.85);
  } else {
    pCtx.fillStyle = '#fff';
    pCtx.fillRect(facing === 1 ? cx + 5 : cx - 9, topY + 14, 5, 3);
  }

  pCtx.save();
  pCtx.strokeStyle = char.skinColor;
  pCtx.lineWidth = isFemale ? 7.5 : 7.7;
  pCtx.lineCap = 'round';
  pCtx.lineJoin = 'round';
  pCtx.beginPath();
  pCtx.moveTo(cx - facing * 4, topY + 35);
  pCtx.lineTo(cx - facing * 2, topY + 53);
  pCtx.lineTo(cx + facing * 10, topY + 59 + breathY * 0.45);
  pCtx.stroke();
  pCtx.fillStyle = outfit.armor;
  pCtx.beginPath();
  pCtx.arc(cx + facing * 10, topY + 59 + breathY * 0.45, isFemale ? 6 : 6.1, 0, Math.PI * 2);
  pCtx.fill();
  pCtx.restore();
}

// Cinema Showcase Stage — Upgraded with Multi-Layer Parallax, Dynamic Outfit/Weapon Lighting,
// Ambient Particles, 5 Poses, Weapon-in-Hand Preview, and Smooth Transition Flash
export function drawCinemaShowcaseCharacter(
  cCanvas: HTMLCanvasElement | null,
  charIdx: number,
  outfitIdx: number,
  gender: Gender,
  facing: 1 | -1,
  pose: CinemaPose,
  theme: ThemeConfig,
  animTime: number,
  options: CinemaShowcaseOptions = {}
): void {
  if (!cCanvas) return;
  const sCtx = cCanvas.getContext('2d');
  if (!sCtx) return;

  const w = cCanvas.width;
  const h = cCanvas.height;
  const floorY = h - 44;

  const charObj = CHARACTERS[charIdx] || CHARACTERS[0];
  const outfitsList = getCharOutfits(charIdx, gender, options.chroma ?? 'default');
  const outfit = outfitsList[outfitIdx] || outfitsList[0];
  const weapon = options.weapon ?? null;
  const lighting: CinemaLightingConfig = options.lighting ?? { angle: 'center', intensity: 'vibrant' };
  const ptr = options.pointerOffset ?? { x: 0, y: 0 };
  const flash = Math.max(0, Math.min(1, options.transitionFlash ?? 0));
  const arenaBg = options.arenaBg ?? null;

  const arenaAccentMap: Record<ArenaId, string> = {
    cyber: '#38bdf8',
    volcano: '#f97316',
    hazards: '#facc15',
    meteor: '#ef4444',
    laser: '#f43f5e',
    storm: '#22d3ee',
  };
  const accentColor = weapon ? weapon.color : arenaBg ? arenaAccentMap[arenaBg] : outfit.armor;
  const secondaryGlow = arenaBg ? arenaAccentMap[arenaBg] : outfit.armor;

  const poseShiftX =
    pose === 'strike' ? facing * 14 : pose === 'guard' ? -facing * 8 : pose === 'special' ? 0 : pose === 'weapon_inspect' ? facing * 6 : 0;

  sCtx.clearRect(0, 0, w, h);

  // Layer 1: Deep atmospheric sky/stage gradient (reacts to live arena backdrop if selected)
  const bgGrad = sCtx.createLinearGradient(0, 0, 0, floorY);
  if (arenaBg === 'volcano') {
    bgGrad.addColorStop(0, '#140404');
    bgGrad.addColorStop(0.58, '#5c1209');
    bgGrad.addColorStop(1, '#290806');
  } else if (arenaBg === 'laser') {
    bgGrad.addColorStop(0, '#070b14');
    bgGrad.addColorStop(0.6, '#3b0918');
    bgGrad.addColorStop(1, '#120710');
  } else if (arenaBg === 'storm') {
    bgGrad.addColorStop(0, '#060c1a');
    bgGrad.addColorStop(0.6, '#1e293b');
    bgGrad.addColorStop(1, '#0f172a');
  } else if (arenaBg === 'meteor') {
    bgGrad.addColorStop(0, '#090306');
    bgGrad.addColorStop(0.6, '#450a0a');
    bgGrad.addColorStop(1, '#1c0909');
  } else if (arenaBg === 'hazards') {
    bgGrad.addColorStop(0, '#070a14');
    bgGrad.addColorStop(0.6, '#271e09');
    bgGrad.addColorStop(1, '#14110a');
  } else if (arenaBg === 'cyber') {
    bgGrad.addColorStop(0, '#040817');
    bgGrad.addColorStop(0.6, '#172554');
    bgGrad.addColorStop(1, '#0b132b');
  } else {
    bgGrad.addColorStop(0, theme.arenaTop);
    bgGrad.addColorStop(0.62, theme.arenaBot);
    bgGrad.addColorStop(1, theme.floor);
  }
  sCtx.fillStyle = bgGrad;
  sCtx.fillRect(0, 0, w, floorY);

  // Layer 2: Far parallax architectural pillars & live arena scenery
  const p1X = -ptr.x * 10 - poseShiftX * 0.25;
  const p1Y = -ptr.y * 5;
  sCtx.save();
  if (arenaBg === 'cyber' || !arenaBg) {
    sCtx.globalAlpha = arenaBg === 'cyber' ? 0.36 : 0.24;
    sCtx.fillStyle = arenaBg === 'cyber' ? '#0f172a' : theme.post;
    for (let i = -1; i <= 5; i++) {
      const px = i * 115 + p1X;
      const ph = 135 + ((i * 37) % 70);
      sCtx.fillRect(px, floorY - ph + p1Y, 44, ph - p1Y);
      sCtx.fillStyle = secondaryGlow;
      sCtx.globalAlpha = arenaBg === 'cyber' ? 0.26 : 0.08;
      sCtx.fillRect(px + 8, floorY - ph + 16 + p1Y, 28, 6);
      if (arenaBg === 'cyber') {
        sCtx.fillRect(px + 8, floorY - ph + 32 + p1Y, 28, 4);
      }
      sCtx.globalAlpha = arenaBg === 'cyber' ? 0.36 : 0.24;
      sCtx.fillStyle = arenaBg === 'cyber' ? '#0f172a' : theme.post;
    }
  } else if (arenaBg === 'volcano' || arenaBg === 'meteor') {
    // Distant volcanic ridges & magma horizon glow
    sCtx.fillStyle = 'rgba(249, 115, 22, 0.2)';
    sCtx.beginPath();
    sCtx.moveTo(0, floorY);
    sCtx.lineTo(w * 0.18 + p1X * 0.5, floorY - 125 + p1Y);
    sCtx.lineTo(w * 0.42 + p1X * 0.5, floorY - 55);
    sCtx.lineTo(w * 0.72 + p1X * 0.5, floorY - 140 + p1Y);
    sCtx.lineTo(w, floorY - 60);
    sCtx.lineTo(w, floorY);
    sCtx.closePath();
    sCtx.fill();
    // Rising magma flare line
    sCtx.strokeStyle = arenaBg === 'meteor' ? '#ef4444' : '#fb923c';
    sCtx.lineWidth = 2;
    sCtx.globalAlpha = 0.45;
    sCtx.beginPath();
    sCtx.moveTo(0, floorY - 18);
    sCtx.lineTo(w, floorY - 18);
    sCtx.stroke();
  } else if (arenaBg === 'hazards' || arenaBg === 'laser') {
    // Overhead energy coils / laser emitters
    for (let gx = 90; gx < w - 60; gx += 180) {
      sCtx.fillStyle = '#1e293b';
      sCtx.fillRect(gx - 18 + p1X * 0.4, 0, 36, 18);
      sCtx.fillStyle = arenaBg === 'laser' ? '#f43f5e' : '#facc15';
      sCtx.shadowBlur = 14;
      sCtx.shadowColor = arenaBg === 'laser' ? '#f43f5e' : '#facc15';
      sCtx.beginPath();
      sCtx.arc(gx + p1X * 0.4, 20, 5.5, 0, Math.PI * 2);
      sCtx.fill();
      if (Math.sin(animTime * 2.8 + gx) > 0.72) {
        sCtx.strokeStyle = arenaBg === 'laser' ? 'rgba(244,63,94,0.35)' : 'rgba(250,204,21,0.38)';
        sCtx.lineWidth = 2;
        sCtx.beginPath();
        sCtx.moveTo(gx + p1X * 0.4, 22);
        sCtx.lineTo(gx + p1X * 0.4 + (arenaBg === 'hazards' ? Math.sin(animTime * 15) * 14 : 0), floorY);
        sCtx.stroke();
      }
    }
  } else if (arenaBg === 'storm') {
    // Diagonal animated storm rain streaks
    sCtx.strokeStyle = 'rgba(186, 230, 253, 0.32)';
    sCtx.lineWidth = 1.4;
    for (let r = 0; r < 26; r++) {
      const rx = ((r * 47 + animTime * 90) % (w + 40)) - 20;
      const ry = ((r * 61 + animTime * 240) % floorY);
      sCtx.beginPath();
      sCtx.moveTo(rx, ry);
      sCtx.lineTo(rx - 7, ry + 18);
      sCtx.stroke();
    }
  }
  sCtx.restore();

  // Layer 3: Midground radial halo reacting to outfit + weapon color
  const haloX = w / 2 - ptr.x * 16 - poseShiftX * 0.35;
  const haloY = floorY * 0.56 - ptr.y * 8;
  const intensityAlpha =
    lighting.intensity === 'dramatic' ? 0.42 : lighting.intensity === 'vibrant' ? 0.28 : 0.16;

  sCtx.save();
  const haloGrad = sCtx.createRadialGradient(haloX, haloY, 15, haloX, haloY, 210);
  haloGrad.addColorStop(0, accentColor);
  haloGrad.addColorStop(0.45, outfit.body);
  haloGrad.addColorStop(1, 'rgba(0,0,0,0)');
  sCtx.globalAlpha = intensityAlpha + (pose === 'special' ? 0.18 : 0);
  sCtx.fillStyle = haloGrad;
  sCtx.fillRect(0, 0, w, floorY);

  // Subtle rotating energy halo ring behind character
  sCtx.globalAlpha = lighting.intensity === 'soft' ? 0.18 : 0.34;
  sCtx.strokeStyle = secondaryGlow;
  sCtx.lineWidth = pose === 'special' ? 3.5 : 2;
  sCtx.setLineDash([16, 12]);
  sCtx.lineDashOffset = -animTime * 18;
  sCtx.beginPath();
  sCtx.arc(haloX, haloY, 108 + Math.sin(animTime * 2) * 4, 0, Math.PI * 2);
  sCtx.stroke();
  sCtx.setLineDash([]);
  sCtx.restore();

  // Dynamic angled Spotlight cone
  const sourceX =
    lighting.angle === 'left' ? w * 0.22 : lighting.angle === 'right' ? w * 0.78 : w * 0.5;
  const beamAlphaTop =
    lighting.intensity === 'dramatic' ? 0.32 : lighting.intensity === 'vibrant' ? 0.22 : 0.12;
  sCtx.save();
  const beamGrad = sCtx.createLinearGradient(sourceX, 0, w / 2, floorY);
  beamGrad.addColorStop(0, `rgba(255, 255, 255, ${beamAlphaTop})`);
  beamGrad.addColorStop(0.55, accentColor);
  beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
  sCtx.globalAlpha = lighting.intensity === 'dramatic' ? 0.45 : 0.3;
  sCtx.fillStyle = beamGrad;
  sCtx.beginPath();
  sCtx.moveTo(sourceX - 38, 0);
  sCtx.lineTo(sourceX + 38, 0);
  sCtx.lineTo(w / 2 + 155, floorY);
  sCtx.lineTo(w / 2 - 155, floorY);
  sCtx.closePath();
  sCtx.fill();
  sCtx.restore();

  // Ambient floating embers/light particles (behind foreground pedestal)
  if (options.ambientParticles && options.ambientParticles.length > 0) {
    sCtx.save();
    options.ambientParticles.forEach((pt) => {
      pt.y += pt.vy;
      pt.x += pt.vx + Math.sin(animTime * 1.4 + pt.phase) * 0.22;
      if (pt.y < -10) {
        pt.y = floorY + 8;
        pt.x = Math.random() * w;
      }
      if (pt.x < -10) pt.x = w + 10;
      if (pt.x > w + 10) pt.x = -10;
      sCtx.globalAlpha = pt.alpha * (0.55 + Math.sin(animTime * 2.5 + pt.phase) * 0.35);
      sCtx.fillStyle = pt.phase % 2 > 1 ? accentColor : '#ffffff';
      sCtx.shadowBlur = 8;
      sCtx.shadowColor = accentColor;
      sCtx.beginPath();
      sCtx.arc(pt.x + ptr.x * 12, pt.y, pt.size, 0, Math.PI * 2);
      sCtx.fill();
    });
    sCtx.restore();
  }

  // Stage Floor & Foreground Rim
  sCtx.fillStyle =
    arenaBg === 'volcano'
      ? '#210a06'
      : arenaBg === 'storm'
      ? '#0f172a'
      : arenaBg === 'cyber'
      ? '#091224'
      : theme.floor;
  sCtx.fillRect(0, floorY, w, h - floorY);
  sCtx.save();
  sCtx.strokeStyle = accentColor;
  sCtx.shadowBlur = 14;
  sCtx.shadowColor = accentColor;
  sCtx.lineWidth = 3;
  sCtx.beginPath();
  sCtx.moveTo(0, floorY);
  sCtx.lineTo(w, floorY);
  sCtx.stroke();
  sCtx.restore();

  const scale = 1.65;
  const isFemale = gender === 'female';
  const bobAmp = pose === 'special' ? 7 : pose === 'strike' ? 5 : 4;
  const bob = Math.sin(animTime * (pose === 'special' ? 3.2 : 2.2)) * bobAmp;
  const baseW = isFemale
    ? Math.max(42, Math.round(charObj.width * 0.86))
    : Math.max(41, Math.round(charObj.width * 0.84));
  const baseH = charObj.height;
  const drawW = baseW * scale;
  const drawH = baseH * scale;
  const cx = w / 2 + ptr.x * 10 + poseShiftX;
  const bodyY = floorY - drawH + 4 + bob - (pose === 'special' ? 10 : 0);
  const leftX = cx - drawW / 2;

  // Dynamic ground shadow scaling with height/pose
  const shadowScale = Math.max(0.75, 1 - (bob < 0 ? -bob * 0.018 : 0) - (pose === 'special' ? 0.12 : 0));
  sCtx.fillStyle = 'rgba(0, 0, 0, 0.58)';
  sCtx.beginPath();
  sCtx.ellipse(cx, floorY + 8, 96 * shadowScale, 14 * shadowScale, 0, 0, Math.PI * 2);
  sCtx.fill();

  sCtx.save();
  // Subtle tilt reacting to pointer & pose
  const leanTilt =
    ptr.x * 0.055 + (pose === 'strike' ? facing * 0.08 : pose === 'guard' ? -facing * 0.06 : 0);
  sCtx.translate(cx, floorY);
  sCtx.rotate(leanTilt);
  sCtx.translate(-cx, -floorY);

  // Special pose power aura
  if (pose === 'special') {
    sCtx.save();
    sCtx.shadowBlur = 28 + Math.sin(animTime * 6) * 8;
    sCtx.shadowColor = accentColor;
    sCtx.strokeStyle = accentColor;
    sCtx.lineWidth = 3.5;
    sCtx.beginPath();
    sCtx.ellipse(cx, bodyY + drawH * 0.52, drawW * 0.92, drawH * 0.55, 0, 0, Math.PI * 2);
    sCtx.stroke();
    sCtx.restore();
  }

  if (outfit.cape) {
    sCtx.fillStyle = outfit.armor;
    sCtx.beginPath();
    sCtx.moveTo(cx - facing * 14, bodyY + drawH * 0.28);
    const capeWave = Math.sin(animTime * 3.1) * (pose === 'special' ? 18 : 12);
    sCtx.lineTo(cx - facing * 66 + capeWave, bodyY + drawH * 0.86);
    sCtx.lineTo(cx - facing * 18, bodyY + drawH * 0.88);
    sCtx.closePath();
    sCtx.fill();
  }

  const stride = pose === 'strike' ? Math.sin(animTime * 3.2) * 8 : Math.sin(animTime * 2.4) * 5;
  const legW = (isFemale ? 8.0 : 8.8) * scale;
  const legGap = (isFemale ? 1.4 : 1.6) * scale;
  const hipY = bodyY + drawH * 0.63;
  const legLen = drawH * 0.36;
  const bootH = (isFemale ? 18 : 13) * scale;

  sCtx.save();
  sCtx.translate(cx - legGap - legW / 2, hipY);
  sCtx.rotate(-stride * 0.035);
  sCtx.fillStyle = isFemale ? charObj.skinColor : '#0f172a';
  sCtx.fillRect(-legW / 2, 0, legW, legLen);
  sCtx.fillStyle = outfit.boots;
  sCtx.fillRect(-legW / 2 - 2, legLen - bootH, legW + 4, bootH);
  sCtx.fillStyle = outfit.armor;
  sCtx.fillRect(-legW / 2 - 2, legLen - bootH, legW + 4, 4);
  sCtx.restore();

  sCtx.save();
  sCtx.translate(cx + legGap + legW / 2, hipY);
  sCtx.rotate(stride * 0.035);
  sCtx.fillStyle = isFemale ? charObj.skinColor : '#1e293b';
  sCtx.fillRect(-legW / 2, 0, legW, legLen);
  sCtx.fillStyle = outfit.boots;
  sCtx.fillRect(-legW / 2 - 2, legLen - bootH, legW + 4, bootH);
  sCtx.fillStyle = outfit.armor;
  sCtx.fillRect(-legW / 2 - 2, legLen - bootH, legW + 4, 4);
  sCtx.restore();

  const torsoY = bodyY + drawH * 0.26;
  const torsoH = drawH * 0.38;
  const bustBounce = isFemale ? Math.sin(animTime * 2.2) * 1.4 : 0;
  const bustSway = isFemale ? Math.cos(animTime * 1.8) * 1.2 : 0;
  drawAnatomicalTorso(sCtx, leftX + 4, torsoY, drawW - 8, torsoH, charObj, outfit, gender, facing, bustBounce, bustSway);

  const headR = (isFemale ? 14.5 : 16.8) * scale;
  const headCenterY = bodyY + drawH * 0.14 + ptr.y * 2;
  if (isFemale) {
    drawStyledFemaleHair(sCtx, cx, headCenterY, headR, charObj, outfit, facing, animTime, scale);
  } else {
    drawStyledMaleHair(sCtx, cx, headCenterY, headR, charObj, outfit, facing, animTime, scale);
  }

  sCtx.fillStyle = charObj.skinColor;
  sCtx.beginPath();
  sCtx.arc(cx, headCenterY, headR, 0, Math.PI * 2);
  sCtx.fill();

  if (isFemale) {
    drawStyledFemaleHair(sCtx, cx, headCenterY, headR, charObj, outfit, facing, animTime, scale);
  } else {
    drawStyledMaleHair(sCtx, cx, headCenterY, headR, charObj, outfit, facing, animTime, scale);
  }

  sCtx.fillStyle = outfit.armor;
  if (outfit.headgear === 'hat') {
    sCtx.beginPath();
    sCtx.moveTo(cx - 32 * scale, headCenterY - 8);
    sCtx.lineTo(cx + 32 * scale, headCenterY - 8);
    sCtx.lineTo(cx, headCenterY - 26);
    sCtx.closePath();
    sCtx.fill();
  } else if (outfit.headgear === 'horns') {
    sCtx.beginPath();
    sCtx.moveTo(cx - 14 * scale, headCenterY - 10);
    sCtx.lineTo(cx - 22 * scale, headCenterY - 28);
    sCtx.lineTo(cx - 6 * scale, headCenterY - 14);
    sCtx.moveTo(cx + 14 * scale, headCenterY - 10);
    sCtx.lineTo(cx + 22 * scale, headCenterY - 28);
    sCtx.lineTo(cx + 6 * scale, headCenterY - 14);
    sCtx.fill();
  } else if (outfit.headgear === 'crown') {
    sCtx.fillStyle = '#facc15';
    sCtx.fillRect(cx - 18 * scale, headCenterY - 18 * scale, 36 * scale, 11 * scale);
  } else if (outfit.headgear === 'visor') {
    sCtx.fillStyle = '#10b981';
    sCtx.fillRect(facing === 1 ? cx : cx - 17 * scale, headCenterY - 5, 17 * scale, 6 * scale);
  } else if (outfit.headgear === 'hood') {
    sCtx.fillStyle = outfit.body;
    sCtx.beginPath();
    sCtx.arc(cx, headCenterY, 20 * scale, Math.PI * 0.9, Math.PI * 0.1);
    sCtx.fill();
  } else if (outfit.headgear === 'helm') {
    sCtx.fillStyle = '#94a3b8';
    sCtx.beginPath();
    sCtx.arc(cx, headCenterY - 2, 19 * scale, Math.PI, 0);
    sCtx.fill();
  } else if (outfit.headgear === 'band') {
    sCtx.fillRect(cx - 18 * scale, headCenterY - 10 * scale, 36 * scale, 6 * scale);
  } else if (outfit.headgear === 'mohawk') {
    sCtx.fillRect(cx - 5 * scale, headCenterY - 28 * scale, 10 * scale, 14 * scale);
  }

  if (isFemale) {
    drawFemaleFaceFeatures(sCtx, cx + ptr.x * 2.5, headCenterY, headR, facing, false, scale);
  } else {
    sCtx.fillStyle = '#fff';
    sCtx.fillRect((facing === 1 ? cx + 7 * scale : cx - 12 * scale) + ptr.x * 2.5, headCenterY - 3, 6 * scale, 4 * scale);
  }

  const armThick = (isFemale ? 8.8 : 10.2) * scale;
  const shoulderX = cx - facing * 5 * scale;
  const shoulderY = torsoY + 6;
  let handX = cx + facing * 15 * scale;
  let handY = torsoY + 34 * scale + Math.cos(animTime * 2.2) * 3;
  let elbowX = cx - facing * 2 * scale;
  let elbowY = torsoY + 22 * scale;

  if (pose === 'strike') {
    const ext = 0.68 + Math.sin(animTime * 3.5) * 0.32;
    elbowX = shoulderX + facing * 28 * scale * ext;
    elbowY = shoulderY - 4;
    handX = shoulderX + facing * 54 * scale * ext;
    handY = shoulderY - 8;
  } else if (pose === 'guard') {
    elbowX = shoulderX + facing * 14 * scale;
    elbowY = shoulderY + 12 * scale;
    handX = shoulderX + facing * 26 * scale;
    handY = shoulderY + 16 * scale;
  } else if (pose === 'special') {
    const pulse = Math.sin(animTime * 4) * 5;
    elbowX = shoulderX + facing * 18 * scale;
    elbowY = shoulderY - 12 * scale;
    handX = shoulderX + facing * 30 * scale;
    handY = shoulderY - 30 * scale + pulse;
  } else if (pose === 'weapon_inspect') {
    elbowX = shoulderX + facing * 20 * scale;
    elbowY = shoulderY + 4 * scale;
    handX = shoulderX + facing * 38 * scale;
    handY = shoulderY - 12 * scale + Math.sin(animTime * 2) * 3;
  }

  sCtx.strokeStyle = charObj.skinColor;
  sCtx.lineWidth = armThick;
  sCtx.lineCap = 'round';
  sCtx.lineJoin = 'round';
  sCtx.beginPath();
  sCtx.moveTo(shoulderX, shoulderY);
  sCtx.lineTo(elbowX, elbowY);
  sCtx.lineTo(handX, handY);
  sCtx.stroke();

  sCtx.fillStyle = outfit.armor;
  sCtx.beginPath();
  sCtx.arc(handX, handY, (isFemale ? 8.0 : 8.5) * scale, 0, Math.PI * 2);
  sCtx.fill();

  // Energy orb in hand during special pose (if unarmed)
  if (pose === 'special' && !weapon) {
    sCtx.save();
    sCtx.fillStyle = '#ffffff';
    sCtx.shadowBlur = 22;
    sCtx.shadowColor = accentColor;
    sCtx.beginPath();
    sCtx.arc(handX, handY - 4, 14 + Math.sin(animTime * 6) * 3, 0, Math.PI * 2);
    sCtx.fill();
    sCtx.restore();
  }

  // Realistic weapon preview in hand
  if (weapon) {
    sCtx.save();
    sCtx.translate(handX, handY);
    sCtx.scale(1.38, 1.38);
    if (pose === 'weapon_inspect') {
      sCtx.rotate(facing * 0.22);
    }
    sCtx.shadowBlur = lighting.intensity === 'dramatic' ? 20 : 12;
    sCtx.shadowColor = weapon.color;
    drawRealisticWeapon(sCtx, weapon, facing, pose === 'strike' || pose === 'special', pose === 'guard');
    sCtx.restore();
  }

  // Guard barrier arc preview
  if (pose === 'guard') {
    sCtx.save();
    sCtx.strokeStyle = weapon ? '#fb923c' : outfit.armor;
    sCtx.lineWidth = 5;
    sCtx.shadowBlur = 14;
    sCtx.shadowColor = accentColor;
    if (facing === -1) {
      sCtx.translate(cx * 2, 0);
      sCtx.scale(-1, 1);
    }
    sCtx.beginPath();
    sCtx.arc(cx, bodyY + drawH * 0.5, drawH * 0.42, -Math.PI / 3, Math.PI / 3);
    sCtx.stroke();
    sCtx.restore();
  }

  sCtx.restore();

  // Smooth transition luminous flash overlay
  if (flash > 0.01) {
    sCtx.save();
    sCtx.globalAlpha = flash * 0.55;
    const flashGrad = sCtx.createRadialGradient(cx, floorY - drawH * 0.5, 10, cx, floorY - drawH * 0.5, 175);
    flashGrad.addColorStop(0, '#ffffff');
    flashGrad.addColorStop(0.5, accentColor);
    flashGrad.addColorStop(1, 'rgba(0,0,0,0)');
    sCtx.fillStyle = flashGrad;
    sCtx.fillRect(0, 0, w, h);
    sCtx.restore();
  }
}

// File 1 Coaches: Chloe (كلوي) & Elena (إيلينا)
export function drawCoaches(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  floorY: number,
  gameRunning: boolean,
  p1Dead: boolean,
  p2Dead: boolean,
  winnerIsP1: boolean | null
): void {
  const time = Date.now() * 0.009;
  const p1Lost = p1Dead || (!gameRunning && winnerIsP1 === false);
  const p2Lost = p2Dead || (!gameRunning && winnerIsP1 === true);

  const c1X = 36;
  const c1Jump = p1Lost ? 0 : Math.abs(Math.sin(time)) * (gameRunning ? 8 : 2);
  const c1Y = floorY - 120 - c1Jump;

  ctx.save();
  ctx.fillStyle = '#090608';
  ctx.fillRect(c1X - 10, c1Y + 70, 8, 50 + c1Jump);
  ctx.fillRect(c1X + 2, c1Y + 70, 8, 50 + c1Jump);
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.roundRect(c1X - 13, c1Y + 30, 26, 44, 8);
  ctx.fill();

  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(c1X, c1Y + 15, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.arc(c1X - 4, c1Y + 12, 15, Math.PI * 0.7, Math.PI * 1.9);
  ctx.fill();

  if (p1Lost) {
    ctx.strokeStyle = '#fed7aa';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(c1X + 8, c1Y + 38);
    ctx.lineTo(c1X + 6, c1Y + 20);
    ctx.stroke();
    const tearDrop = (Date.now() * 0.03) % 16;
    ctx.fillStyle = '#fb923c';
    ctx.beginPath();
    ctx.arc(c1X + 6, c1Y + 18 + tearDrop, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '900 12px Cairo, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('كلوي 😢', c1X, c1Y - 10);
  } else {
    const wave1 = Math.sin(time * 1.8) * 14;
    ctx.strokeStyle = '#fed7aa';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(c1X + 10, c1Y + 38);
    ctx.lineTo(c1X + 26, c1Y + 18 + wave1);
    ctx.stroke();
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(c1X + 28, c1Y + 16 + wave1, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '900 12px Cairo, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('كلوي', c1X, c1Y - 10);
  }
  ctx.restore();

  const c2X = canvasWidth - 36;
  const c2Jump = p2Lost ? 0 : Math.abs(Math.cos(time)) * (gameRunning ? 8 : 2);
  const c2Y = floorY - 120 - c2Jump;

  ctx.save();
  ctx.fillStyle = '#090608';
  ctx.fillRect(c2X - 10, c2Y + 70, 8, 50 + c2Jump);
  ctx.fillRect(c2X + 2, c2Y + 70, 8, 50 + c2Jump);
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.roundRect(c2X - 13, c2Y + 30, 26, 44, 8);
  ctx.fill();

  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(c2X, c2Y + 15, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(c2X + 4, c2Y + 12, 15, Math.PI * 1.1, Math.PI * 0.3);
  ctx.fill();

  if (p2Lost) {
    ctx.strokeStyle = '#fed7aa';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(c2X - 8, c2Y + 38);
    ctx.lineTo(c2X - 6, c2Y + 20);
    ctx.stroke();
    const tearDrop = (Date.now() * 0.03) % 16;
    ctx.fillStyle = '#fb923c';
    ctx.beginPath();
    ctx.arc(c2X - 6, c2Y + 18 + tearDrop, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '900 12px Cairo, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('إيلينا 😢', c2X, c2Y - 10);
  } else {
    const wave2 = Math.cos(time * 1.8) * 14;
    ctx.strokeStyle = '#fed7aa';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(c2X - 10, c2Y + 38);
    ctx.lineTo(c2X - 26, c2Y + 18 + wave2);
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(c2X - 28, c2Y + 16 + wave2, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '900 12px Cairo, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('إيلينا', c2X, c2Y - 10);
  }
  ctx.restore();
}

export function drawArenaScene(params: {
  ctx: CanvasRenderingContext2D;
  canvasWidth: number;
  canvasHeight: number;
  currentArena: ArenaId;
  theme: ThemeConfig;
  cinematicFrames: number;
  crowd: CrowdPerson[];
  crowdExcitement: number;
  combatIntensity?: number;
  actionX?: number;
  fireZones: FireZone[];
  breakableProps: BreakableProp[];
  rainDrops: RainDrop[];
  gameRunning: boolean;
  isPaused: boolean;
  p1Dead: boolean;
  p2Dead: boolean;
  winnerIsP1: boolean | null;
  finalRushActive?: boolean;
  winnerSpotlight?: { x: number; y: number; color: string } | null;
}): void {
  const {
    ctx,
    canvasWidth,
    canvasHeight,
    currentArena,
    theme,
    cinematicFrames,
    crowd,
    crowdExcitement,
    combatIntensity = 0,
    actionX = canvasWidth / 2,
    fireZones,
    breakableProps,
    rainDrops,
    gameRunning,
    isPaused,
    p1Dead,
    p2Dead,
    winnerIsP1,
    finalRushActive = false,
    winnerSpotlight = null,
  } = params;

  const floorY = canvasHeight - 90;
  const bgGrad = ctx.createLinearGradient(0, 0, 0, floorY);

  if (cinematicFrames > 0) {
    bgGrad.addColorStop(0, '#270707');
    bgGrad.addColorStop(1, '#000000');
  } else if (finalRushActive) {
    bgGrad.addColorStop(0, '#1a0406');
    bgGrad.addColorStop(0.58, '#450a0a');
    bgGrad.addColorStop(1, '#7c2d12');
  } else if (currentArena === 'laser') {
    bgGrad.addColorStop(0, '#070b14');
    bgGrad.addColorStop(1, '#2b0912');
  } else if (currentArena === 'storm') {
    bgGrad.addColorStop(0, '#070c18');
    bgGrad.addColorStop(1, '#1e293b');
  } else {
    bgGrad.addColorStop(0, theme.arenaTop);
    bgGrad.addColorStop(1, theme.arenaBot);
  }

  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  if (cinematicFrames > 0) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  // Final Rush pulsing high-contrast danger vignette
  if (finalRushActive && cinematicFrames === 0) {
    const pulse = 0.22 + Math.sin(Date.now() * 0.014) * 0.1;
    const rushGrad = ctx.createRadialGradient(
      canvasWidth / 2,
      canvasHeight / 2,
      canvasWidth * 0.22,
      canvasWidth / 2,
      canvasHeight / 2,
      canvasWidth * 0.68
    );
    rushGrad.addColorStop(0, 'rgba(0,0,0,0)');
    rushGrad.addColorStop(1, `rgba(239, 68, 68, ${pulse})`);
    ctx.fillStyle = rushGrad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  if (currentArena === 'cyber' && cinematicFrames === 0) {
    ctx.fillStyle = theme.floor;
    for (let i = 0; i < canvasWidth; i += 110) {
      const h = 150 + ((i * 37) % 140);
      ctx.fillRect(i, floorY - h, 85, h);
      ctx.fillStyle = finalRushActive ? '#f97316' : i % 220 === 0 ? theme.rope2 : theme.rope1;
      ctx.globalAlpha = finalRushActive ? 0.32 : 0.22 + combatIntensity * 0.15;
      ctx.fillRect(i + 15, floorY - h + 20, 55, 8);
      ctx.globalAlpha = 1;
      ctx.fillStyle = theme.floor;
    }
  }

  if (currentArena === 'hazards') {
    for (let gx = 200; gx < canvasWidth - 180; gx += 260) {
      ctx.fillStyle = '#291111';
      ctx.fillRect(gx - 20, 0, 40, 22);
      ctx.fillStyle = '#f97316';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ef4444';
      ctx.beginPath();
      ctx.arc(gx, 24, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  } else if (currentArena === 'laser') {
    for (let lx = 180; lx < canvasWidth - 160; lx += 240) {
      ctx.save();
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(lx - 24, 0, 48, 24, [0, 0, 8, 8]);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fb7185';
      ctx.shadowBlur = 14;
      ctx.shadowColor = '#ef4444';
      ctx.beginPath();
      ctx.arc(lx, 25, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else if (currentArena === 'storm') {
    ctx.save();
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.25)';
    ctx.lineWidth = 1.5;
    rainDrops.forEach((drop) => {
      if (gameRunning && !isPaused) {
        drop.x -= 3.5;
        drop.y += drop.speed;
        if (drop.y > floorY) {
          drop.y = -15;
          drop.x = Math.random() * canvasWidth;
        }
        if (drop.x < 0) drop.x = canvasWidth;
      }
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x - 4, drop.y + drop.len);
      ctx.stroke();
    });
    ctx.restore();
  }

  for (let idx = fireZones.length - 1; idx >= 0; idx--) {
    const fz = fireZones[idx];
    if (!isPaused) fz.timer--;
    ctx.save();
    ctx.fillStyle = 'rgba(239, 68, 68, 0.65)';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#f97316';
    ctx.fillRect(fz.x, floorY - 14, fz.w, 14);
    ctx.restore();
    if (fz.timer <= 0) fireZones.splice(idx, 1);
  }

  // Reactive Arena Crowd cheering & waving with close combat, low HP, or specials
  const hype = Math.min(1.5, crowdExcitement / 35 + combatIntensity * 0.85 + (finalRushActive ? 0.55 : 0));
  const time = Date.now() * (finalRushActive ? 0.014 : 0.008 + hype * 0.004);
  crowd.forEach((person, pIdx) => {
    if (person.x > canvasWidth) return;
    const proximity = Math.max(0, 1 - Math.abs(person.x - actionX) / 340);
    const jump =
      Math.abs(Math.sin(time + person.offset)) *
      (4 + crowdExcitement * 0.4 + combatIntensity * 9 + proximity * hype * 7 + (finalRushActive ? 8 : 0));
    const hue = finalRushActive ? (person.altTone ? 0 : 25) : person.altTone ? theme.crowdHueA : theme.crowdHueB;
    const lum = Math.min(28, 14 + Math.round(hype * 8 + proximity * 5));
    ctx.fillStyle = `hsl(${hue}, ${finalRushActive ? 68 : 48}%, ${lum}%)`;
    ctx.beginPath();
    ctx.arc(person.x, floorY - person.height - jump, 11, 0, Math.PI * 2);
    ctx.fillRect(person.x - 12, floorY - person.height + 8 - jump, 24, person.height);
    ctx.fill();

    // Raised cheering arms when hype is elevated
    if (hype > 0.35) {
      const armWave = Math.sin(time * 1.9 + person.offset) * 6;
      ctx.strokeStyle = `hsl(${hue}, 65%, ${lum + 10}%)`;
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(person.x - 10, floorY - person.height + 14 - jump);
      ctx.lineTo(person.x - 16, floorY - person.height - 6 - jump + armWave);
      ctx.moveTo(person.x + 10, floorY - person.height + 14 - jump);
      ctx.lineTo(person.x + 16, floorY - person.height - 6 - jump - armWave);
      ctx.stroke();

      // Occasional crowd glowstick / flash spark
      if ((pIdx + Math.floor(time * 2)) % 7 === 0) {
        ctx.fillStyle = person.altTone ? theme.rope1 : theme.rope2;
        ctx.beginPath();
        ctx.arc(person.x + 16, floorY - person.height - 8 - jump - armWave, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });

  const ropeColors = finalRushActive
    ? ['#ef4444', '#f97316', '#fde047']
    : [theme.rope1, theme.rope2, theme.rope3];
  for (let i = 0; i < 3; i++) {
    const ropeY = floorY - 35 - i * 42;
    ctx.strokeStyle = ropeColors[i];
    ctx.lineWidth = finalRushActive ? 6 : 5 + hype * 0.9;
    ctx.shadowBlur = finalRushActive ? 18 : 10 + hype * 10;
    ctx.shadowColor = ropeColors[i];
    ctx.beginPath();
    ctx.moveTo(75, ropeY);
    ctx.lineTo(canvasWidth - 75, ropeY);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  ctx.fillStyle = finalRushActive ? '#3b0a0a' : theme.post;
  ctx.fillRect(65, floorY - 140, 20, 150);
  ctx.fillRect(canvasWidth - 85, floorY - 140, 20, 150);
  ctx.fillStyle = theme.floor;
  ctx.fillRect(10, floorY, canvasWidth - 20, 90);
  ctx.fillStyle = finalRushActive ? '#f97316' : theme.rope2;
  ctx.fillRect(10, floorY, canvasWidth - 20, 6);

  // Subtle floor energy pulse under close clashes / high excitement
  if (hype > 0.3 && gameRunning) {
    ctx.save();
    const floorPulse = ctx.createRadialGradient(actionX, floorY + 2, 10, actionX, floorY + 2, 190);
    floorPulse.addColorStop(0, finalRushActive ? 'rgba(249,115,22,0.35)' : theme.rope1);
    floorPulse.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = Math.min(0.45, hype * 0.28);
    ctx.fillStyle = floorPulse;
    ctx.fillRect(actionX - 200, floorY - 4, 400, 16);
    ctx.restore();
  }

  // Victory Dance Golden Spotlight
  if (winnerSpotlight) {
    ctx.save();
    const spotGrad = ctx.createLinearGradient(winnerSpotlight.x, 0, winnerSpotlight.x, floorY + 12);
    spotGrad.addColorStop(0, 'rgba(250, 204, 21, 0.34)');
    spotGrad.addColorStop(0.6, 'rgba(250, 204, 21, 0.14)');
    spotGrad.addColorStop(1, 'rgba(250, 204, 21, 0.02)');
    ctx.fillStyle = spotGrad;
    ctx.beginPath();
    ctx.moveTo(winnerSpotlight.x - 36, 0);
    ctx.lineTo(winnerSpotlight.x + 36, 0);
    ctx.lineTo(winnerSpotlight.x + 120, floorY + 8);
    ctx.lineTo(winnerSpotlight.x - 120, floorY + 8);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = winnerSpotlight.color;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(winnerSpotlight.x, floorY + 4, 88, 12, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  breakableProps.forEach((prop) => {
    if (prop.hp <= 0) return;
    ctx.save();
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(prop.x, prop.y, prop.w, prop.h, 5);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#d97706';
    ctx.beginPath();
    ctx.moveTo(prop.x + 6, prop.y + 6);
    ctx.lineTo(prop.x + prop.w - 6, prop.y + prop.h - 6);
    ctx.stroke();

    const ratio = Math.max(0, prop.hp / prop.maxHp);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(prop.x, prop.y - 8, prop.w, 4);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(prop.x, prop.y - 8, prop.w * ratio, 4);
    ctx.restore();
  });

  drawCoaches(ctx, canvasWidth, floorY, gameRunning, p1Dead, p2Dead, winnerIsP1);
}
