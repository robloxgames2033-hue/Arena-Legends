import { MAX_HP } from '../data/gameData';
import { SoundType } from '../audio/soundEngine';
import {
  AiDifficulty,
  CharacterDef,
  GameMode,
  Gender,
  MatchModifiers,
  Outfit,
  WeaponDef,
} from '../types/game';
import {
  AfterImage,
  ArenaHazard,
  BreakableProp,
  FireZone,
  SlashArc,
  drawAnatomicalTorso,
  drawFemaleFaceFeatures,
  drawRealisticWeapon,
  drawStyledFemaleHair,
  drawStyledMaleHair,
} from './renderer';

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  radius: number;
  color: string;
  damage: number;
  owner: Fighter;
  source?: 'ex' | 'super';
}

export type DamageSource = 'melee' | 'throw' | 'ex' | 'super' | 'proj' | 'clash' | 'hazard' | 'fire';

export interface BattleContext {
  canvasWidth: number;
  canvasHeight: number;
  gameMode: GameMode;
  weaponMode: boolean;
  aiDifficulty: AiDifficulty;
  modifiers: MatchModifiers;
  finalRushActive?: boolean;
  gameRunning: boolean;
  isPaused: boolean;
  danceMode: boolean;
  winnerFighter: Fighter | null;
  clashActive: boolean;
  keys: Record<string, boolean>;
  projectiles: Projectile[];
  slashArcs: SlashArc[];
  afterImages: AfterImage[];
  fireZones: FireZone[];
  arenaHazards: ArenaHazard[];
  breakableProps: BreakableProp[];
  playSound: (type: SoundType) => void;
  spawnParticles: (x: number, y: number, color: string, count: number) => void;
  spawnFloatingText: (x: number, y: number, text: string, color: string, size?: number) => void;
  triggerClash: () => void;
  checkWinCondition: () => void;
  recordTrainingHit: (dmg: number, comboCount: number) => void;
  onDamageDealt?: (attacker: Fighter | null, defender: Fighter, dmg: number, source: DamageSource) => void;
  onBlockSuccess?: (blocker: Fighter) => void;
  onCrateBroken?: (attacker: Fighter) => void;
  addScreenShake: (val: number) => void;
  setHitStop: (frames: number) => void;
  setCrowdExcitement: (val: number) => void;
  setCinematicFrames: (frames: number) => void;
}

const GRAVITY = 0.85;

export class Fighter {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  char: CharacterDef;
  outfit: Outfit;
  weapon: WeaponDef | null;
  gender: Gender;
  name: string;
  isPlayer1: boolean;
  isBot: boolean;
  isBoss: boolean;
  width: number;
  height: number;
  bustY: number;
  bustVy: number;
  bustX: number;
  bustVx: number;
  prevVy: number;
  maxHealth: number;
  health: number;
  displayHealth: number;
  shieldHp: number;
  stamina: number;
  guardBrokenTimer: number;
  knockdownTimer: number;
  energy: number;
  grounded: boolean;
  blocking: boolean;
  attackType: string | null;
  attackTimer: number;
  maxAttackTimer: number;
  punchStep: number;
  hurtTimer: number;
  slowTimer: number;
  stunTimer: number;
  dashCooldown: number;
  walkCycle: number;
  idleCycle: number;
  combo: number;
  comboTimer: number;
  botActionTimer: number;
  lastDashPress: number;
  limitBreakTriggered: boolean;
  deathAngle: number;

  // Match performance metrics for Achievements
  damageDealt: number;
  damageTaken: number;
  hitsLanded: number;
  blocksCount: number;
  maxCombo: number;
  superCount: number;
  exCount: number;
  throwsCount: number;
  cratesBroken: number;
  clashesWon: number;
  reachedLimitBreak: boolean;
  gotFirstStrike: boolean;

  constructor(opts: {
    x: number;
    facing: 1 | -1;
    charData: CharacterDef;
    outfitData: Outfit;
    weaponData: WeaponDef | null;
    gender: Gender;
    name: string;
    isPlayer1: boolean;
    isBot: boolean;
    isBoss?: boolean;
    gameMode: GameMode;
    initialHealth?: number;
    initialShield?: number;
  }) {
    this.x = opts.x;
    this.y = 100;
    this.vx = 0;
    this.vy = 0;
    this.facing = opts.facing;
    this.char = opts.charData;
    this.outfit = opts.outfitData;
    this.weapon = opts.weaponData;
    this.gender = opts.gender || 'male';
    this.name = opts.name;
    this.isPlayer1 = opts.isPlayer1;
    this.isBot = opts.isBot;
    this.isBoss = Boolean(opts.isBoss);

    // Proportions from arena_v_10__9781e672.html
    this.width =
      this.gender === 'female'
        ? Math.max(42, Math.round(opts.charData.width * 0.86))
        : Math.max(44, Math.round(opts.charData.width * 0.92));
    this.height = opts.charData.height;

    this.bustY = 0;
    this.bustVy = 0;
    this.bustX = 0;
    this.bustVx = 0;
    this.prevVy = 0;

    const hp = opts.initialHealth ?? MAX_HP;
    this.maxHealth = hp;
    this.health = hp;
    this.displayHealth = hp;
    this.shieldHp = opts.initialShield ?? 0;
    this.stamina = 100;
    this.guardBrokenTimer = 0;
    this.knockdownTimer = 0;
    this.energy = opts.gameMode === 'training' ? 100 : 40;
    this.grounded = false;
    this.blocking = false;
    this.attackType = null;
    this.attackTimer = 0;
    this.maxAttackTimer = 16;
    this.punchStep = 0;
    this.hurtTimer = 0;
    this.slowTimer = 0;
    this.stunTimer = 0;
    this.dashCooldown = 0;
    this.walkCycle = 0;
    this.idleCycle = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.botActionTimer = 0;
    this.lastDashPress = 0;
    this.limitBreakTriggered = false;
    this.deathAngle = 0;

    this.damageDealt = 0;
    this.damageTaken = 0;
    this.hitsLanded = 0;
    this.blocksCount = 0;
    this.maxCombo = 0;
    this.superCount = 0;
    this.exCount = 0;
    this.throwsCount = 0;
    this.cratesBroken = 0;
    this.clashesWon = 0;
    this.reachedLimitBreak = false;
    this.gotFirstStrike = false;
  }

  getGroundY(canvasHeight: number): number {
    return canvasHeight - 90;
  }

  get isLimitBreak(): boolean {
    return this.health <= this.maxHealth * 0.25;
  }

  get isDead(): boolean {
    return this.health <= 0;
  }

  getJumpVelocity(modifiers: MatchModifiers): number {
    return modifiers.gravityPreset === 'low' ? this.char.jump * 0.92 : this.char.jump;
  }

  takeDamage(rawDmg: number, battle: BattleContext): number {
    if (battle.gameMode === 'training') return rawDmg;
    let remaining = Math.max(0, rawDmg);
    if (this.shieldHp > 0 && remaining > 0) {
      const absorbed = Math.min(this.shieldHp, remaining);
      this.shieldHp -= absorbed;
      remaining -= absorbed;
      battle.playSound('shield');
      battle.spawnParticles(this.x + this.width / 2, this.y + this.height * 0.45, '#38bdf8', 14);
      if (this.shieldHp <= 0) {
        battle.spawnFloatingText(this.x + this.width / 2, this.y - 34, '🛡️ تحطم الدرع!', '#38bdf8', 18);
      }
    }
    if (remaining > 0) {
      this.health = Math.max(0, this.health - remaining);
    }
    return remaining;
  }

  dash(battle: BattleContext): void {
    if (
      this.dashCooldown > 0 ||
      this.hurtTimer > 0 ||
      this.stunTimer > 0 ||
      this.guardBrokenTimer > 0 ||
      battle.clashActive ||
      this.isDead
    ) {
      return;
    }
    if (this.stamina < 18) {
      battle.spawnFloatingText(this.x + this.width / 2, this.y - 24, '⚠️ التحمل منخفض!', '#facc15', 16);
      return;
    }
    this.stamina = Math.max(0, this.stamina - 18);
    const now = Date.now();
    const isDoubleTap = now - this.lastDashPress < 350;
    this.lastDashPress = now;

    const turboMult = battle.modifiers.speedPreset === 'turbo' ? 1.25 : 1;
    const speedMultiplier = (this.isLimitBreak ? 1.3 : 1) * (this.slowTimer > 0 ? 0.5 : 1) * turboMult;
    this.dashCooldown = battle.modifiers.speedPreset === 'turbo' ? 24 : 35;
    battle.playSound('dash');

    if (this.char.passive === 'ninja' && isDoubleTap) {
      const startX = this.x;
      this.x += this.facing * 170;
      const margin = 85;
      this.x = Math.max(margin, Math.min(battle.canvasWidth - margin - this.width, this.x));
      for (let i = 0; i < 6; i++) {
        const frac = i / 5;
        battle.afterImages.push({
          x: startX + (this.x - startX) * frac,
          y: this.y,
          w: this.width,
          h: this.height,
          color: '#c084fc',
          alpha: 0.55 - i * 0.07,
          trailType: 'blink',
          facing: this.facing,
        });
      }
      battle.spawnParticles(this.x + this.width / 2, this.y + this.height / 2, this.outfit.armor, 30);
      battle.spawnFloatingText(this.x + this.width / 2, this.y - 25, '🥷 STEALTH BLINK!', '#fb923c', 20);
      return;
    }

    const dashBoost = isDoubleTap ? 1.22 : 1;
    this.vx = this.facing * 22 * speedMultiplier * dashBoost;
    for (let i = 0; i < 7; i++) {
      battle.afterImages.push({
        x: this.x - this.facing * i * (isDoubleTap ? 16 : 13),
        y: this.y,
        w: this.width,
        h: this.height,
        color: isDoubleTap ? '#facc15' : this.outfit.armor,
        alpha: 0.56 - i * 0.075,
        trailType: 'dash',
        facing: this.facing,
      });
    }
    battle.spawnParticles(this.x + this.width / 2, this.y + this.height - 12, this.outfit.armor, isDoubleTap ? 14 : 8);
    if (isDoubleTap) {
      battle.spawnFloatingText(this.x + this.width / 2, this.y - 22, '💨 اندفاع خاطف!', '#fde047', 16);
    }
  }

  tryTechRoll(battle: BattleContext): void {
    const canAirRecover = !this.grounded && this.hurtTimer > 0;
    if ((this.knockdownTimer > 0 || canAirRecover) && !this.isDead) {
      this.knockdownTimer = 0;
      this.hurtTimer = 0;
      this.stunTimer = 0;
      this.vx = this.facing * 16.5;
      this.vy = -8.5;
      battle.playSound('tech');
      battle.setCrowdExcitement(30);
      for (let i = 0; i < 6; i++) {
        battle.afterImages.push({
          x: this.x - this.facing * i * 14,
          y: this.y + i * 2,
          w: this.width,
          h: this.height,
          color: '#38bdf8',
          alpha: 0.58 - i * 0.085,
          trailType: 'tech',
          facing: this.facing,
        });
      }
      battle.spawnParticles(this.x + this.width / 2, this.y + this.height - 8, '#38bdf8', 18);
      battle.spawnFloatingText(this.x + this.width / 2, this.y - 28, '⚡ TECH ROLL!', '#38bdf8', 20);
    }
  }

  performThrow(opponent: Fighter, battle: BattleContext): void {
    if (
      !opponent ||
      this.attackTimer > 0 ||
      this.hurtTimer > 0 ||
      this.stunTimer > 0 ||
      this.guardBrokenTimer > 0 ||
      battle.clashActive ||
      this.isDead ||
      opponent.isDead
    ) {
      return;
    }
    const dist = Math.abs(this.x + this.width / 2 - (opponent.x + opponent.width / 2));
    if (dist > 95) {
      battle.spawnFloatingText(this.x + this.width / 2, this.y - 22, 'بعيد جداً للإمساك', '#94a3b8', 15);
      return;
    }
    const throwDmg = 10;
    battle.playSound('throw');
    battle.addScreenShake(12);
    opponent.blocking = false;
    opponent.hurtTimer = 22;
    opponent.knockdownTimer = 18;
    opponent.vx = this.facing * 17;
    opponent.vy = -11;

    this.throwsCount++;
    this.hitsLanded++;
    this.damageDealt += throwDmg;
    opponent.damageTaken += throwDmg;
    battle.onDamageDealt?.(this, opponent, throwDmg, 'throw');

    if (battle.gameMode !== 'training') {
      opponent.takeDamage(throwDmg, battle);
      battle.checkWinCondition();
    } else {
      battle.recordTrainingHit(throwDmg, 1);
    }
    battle.spawnParticles(opponent.x + opponent.width / 2, opponent.y + opponent.height / 2, '#f97316', 24);
    battle.spawnFloatingText(opponent.x + opponent.width / 2, opponent.y - 28, `🤼 رمية قوية -${throwDmg}!`, '#fb923c', 22);
  }

  triggerExMove(opponent: Fighter, battle: BattleContext): void {
    if (!opponent || this.isDead || battle.clashActive) return;
    if (this.energy < 50 && battle.gameMode !== 'training') {
      battle.spawnFloatingText(this.x + this.width / 2, this.y - 24, 'تحتاج 50% طاقة لـ EX', '#94a3b8', 16);
      return;
    }
    if (battle.gameMode !== 'training') {
      this.energy = Math.max(0, this.energy - 50);
    }
    this.attackType = 'ex';
    this.attackTimer = 22;
    this.maxAttackTimer = 22;
    this.vx = this.facing * 14;
    battle.playSound('ex');
    battle.setCrowdExcitement(55);
    battle.addScreenShake(14);

    const exDmg = Math.max(8, Math.round(this.char.specialDmg * 0.32));
    const dist = Math.abs(this.x + this.width / 2 - (opponent.x + opponent.width / 2));
    if (dist < 165 && !opponent.isDead) {
      opponent.blocking = false;
      opponent.hurtTimer = 20;
      opponent.vx = this.facing * 16;
      opponent.vy = -9;

      this.exCount++;
      this.hitsLanded++;
      this.damageDealt += exDmg;
      opponent.damageTaken += exDmg;
      battle.onDamageDealt?.(this, opponent, exDmg, 'ex');

      if (battle.gameMode !== 'training') {
        opponent.takeDamage(exDmg, battle);
        battle.checkWinCondition();
      } else {
        battle.recordTrainingHit(exDmg, 2);
      }
      battle.spawnParticles(opponent.x + opponent.width / 2, opponent.y + opponent.height / 2, '#38bdf8', 28);
      battle.spawnFloatingText(opponent.x + opponent.width / 2, opponent.y - 28, `💥 EX MOVE -${exDmg}!`, '#38bdf8', 24);
    } else {
      battle.projectiles.push({
        x: this.facing === 1 ? this.x + this.width + 8 : this.x - 32,
        y: this.y + this.height * 0.4,
        vx: this.facing * 22,
        radius: 20,
        color: '#38bdf8',
        damage: exDmg,
        owner: this,
        source: 'ex',
      });
    }
  }

  triggerCinematicSuper(opponent: Fighter, battle: BattleContext): void {
    if (!opponent || this.energy < 100 || this.isDead) return;
    const dist = Math.abs(this.x + this.width / 2 - (opponent.x + opponent.width / 2));

    if (dist > 140) {
      this.energy = 0;
      this.attackType = 'special';
      this.attackTimer = 25;
      this.maxAttackTimer = 25;
      battle.playSound('special');
      const projSpeed = this.char.passive === 'cyber' ? 25 : 19;
      battle.projectiles.push({
        x: this.facing === 1 ? this.x + this.width + 10 : this.x - 40,
        y: this.y + this.height * 0.35,
        vx: this.facing * projSpeed,
        radius: 30,
        color: this.outfit.armor,
        damage: Math.max(14, Math.round(this.char.specialDmg * 0.55)),
        owner: this,
        source: 'super',
      });
      return;
    }

    this.energy = 0;
    battle.setCinematicFrames(55);
    battle.setCrowdExcitement(75);
    battle.addScreenShake(24);
    battle.playSound('cinematic');
    battle.spawnFloatingText(battle.canvasWidth / 2, battle.canvasHeight * 0.35, '🎬 ضربة قاضية خارقة!', '#fb923c', 34);

    window.setTimeout(() => {
      if (!battle.gameRunning || !opponent || opponent.isDead) return;
      const superDmg = Math.max(14, Math.round(this.char.specialDmg * (this.isLimitBreak ? 0.68 : 0.55)));
      this.superCount++;
      this.hitsLanded++;
      this.damageDealt += superDmg;
      opponent.damageTaken += superDmg;
      battle.onDamageDealt?.(this, opponent, superDmg, 'super');

      if (battle.gameMode !== 'training') {
        opponent.takeDamage(superDmg, battle);
      } else {
        battle.recordTrainingHit(superDmg, 3);
      }
      opponent.hurtTimer = 26;
      opponent.vx = this.facing * 18;
      opponent.vy = -10;
      battle.playSound('explosion');
      battle.spawnParticles(opponent.x + opponent.width / 2, opponent.y + opponent.height / 2, this.outfit.armor, 40);
      battle.spawnFloatingText(opponent.x + opponent.width / 2, opponent.y - 25, `-${superDmg}!`, '#ef4444', 30);
      battle.checkWinCondition();
    }, 500);
  }

  attack(type: string, opponent: Fighter, battle: BattleContext): void {
    if (
      this.attackTimer > 0 ||
      this.blocking ||
      this.hurtTimer > 0 ||
      this.stunTimer > 0 ||
      battle.clashActive ||
      this.isDead
    ) {
      return;
    }

    if (type === 'special') {
      this.triggerCinematicSuper(opponent, battle);
      return;
    }

    if (!this.grounded && type === 'kick') {
      this.attackType = 'slam';
      this.vy = 23;
      this.vx = this.facing * 6;
      battle.playSound('swing');
      return;
    }

    battle.playSound('swing');
    const weaponSpeed = this.weapon ? this.weapon.speedMult : 1;
    const turboAttackMult = battle.modifiers.speedPreset === 'turbo' ? 1.25 : 1;
    const speedFactor = weaponSpeed * turboAttackMult;
    const baseDuration = type === 'punch' ? 16 : 22;
    this.attackType = type;
    this.attackTimer = Math.max(8, Math.round(baseDuration / speedFactor));
    this.maxAttackTimer = this.attackTimer;

    if (type === 'punch') {
      this.punchStep = (this.punchStep + 1) % 3;
      this.vx = this.facing * 5.5;
    } else if (type === 'uppercut') {
      this.vy = -11.5;
      this.vx = this.facing * 6;
    } else {
      this.vx = this.facing * 6.5;
    }

    const slashColor = this.weapon ? this.weapon.color : this.outfit.armor;
    battle.slashArcs.push({
      x: this.x + this.width / 2 + this.facing * (35 + (this.weapon ? this.weapon.reach * 0.5 : 0)),
      y: this.y + this.height * 0.45,
      facing: this.facing,
      type,
      color: slashColor,
      alpha: 0.85,
    });
  }

  checkBreakableHit(battle: BattleContext): void {
    const reach = 82 + (this.weapon ? this.weapon.reach : 0);
    const boxX = this.facing === 1 ? this.x + this.width - 10 : this.x - reach + 10;
    battle.breakableProps.forEach((prop) => {
      if (prop.hp <= 0) return;
      if (boxX < prop.x + prop.w && boxX + reach > prop.x && this.y + this.height > prop.y) {
        prop.hp -= 18;
        battle.spawnParticles(prop.x + prop.w / 2, prop.y + prop.h / 2, '#f59e0b', 10);
        if (prop.hp <= 0) {
          this.cratesBroken++;
          battle.onCrateBroken?.(this);
          battle.playSound('explosion');
          battle.spawnFloatingText(prop.x + prop.w / 2, prop.y - 12, '💥 تحطم!', '#fbbf24', 18);
        }
      }
    });
  }

  checkMeleeHit(opponent: Fighter, isSlam: boolean, battle: BattleContext): void {
    if (!opponent || opponent.isDead) return;
    const weaponReach = this.weapon ? this.weapon.reach : 0;
    const reach = (isSlam ? 105 : this.attackType === 'punch' ? 74 : 92) + weaponReach;
    const hitBoxX = isSlam ? this.x - 30 : this.facing === 1 ? this.x + this.width - 15 : this.x - reach + 15;
    const hitBoxY = this.y + 10;

    if (
      hitBoxX < opponent.x + opponent.width &&
      hitBoxX + reach > opponent.x &&
      hitBoxY < opponent.y + opponent.height &&
      hitBoxY + this.height > opponent.y
    ) {
      if (opponent.attackTimer > 6 && !isSlam) {
        battle.triggerClash();
        return;
      }

      const dmgMult = this.weapon ? this.weapon.dmgMult : 1;
      let baseDmg = Math.round(this.char.punchDmg * dmgMult);
      if (this.attackType === 'kick' || isSlam) {
        baseDmg = Math.round(this.char.kickDmg * (this.attackType === 'kick' ? 1 : dmgMult));
      }
      if (this.attackType === 'uppercut') {
        baseDmg = Math.round((this.char.kickDmg + 4) * dmgMult);
      }
      if (this.attackType === 'punch' && this.punchStep === 0) baseDmg += 5;

      if (this.isLimitBreak) baseDmg = Math.round(baseDmg * 1.3);
      baseDmg = Math.max(3, Math.round(baseDmg * 0.48));

      const hitX = opponent.x + opponent.width / 2;
      const hitY = opponent.y + opponent.height * 0.4;

      const isAutoBlocked = opponent.char.passive === 'samurai' && opponent.blocking && Math.random() < 0.2;
      const isSuperArmored = opponent.char.passive === 'titan' && this.attackType === 'punch' && this.punchStep !== 0;

      if ((opponent.blocking || isAutoBlocked) && !isSlam) {
        baseDmg = Math.max(1, Math.floor(baseDmg * (opponent.weapon ? 0.12 : 0.18)));
        opponent.stamina = Math.max(0, opponent.stamina - 16);
        opponent.blocksCount++;
        battle.onBlockSuccess?.(opponent);

        this.damageDealt += baseDmg;
        opponent.damageTaken += baseDmg;
        battle.onDamageDealt?.(this, opponent, baseDmg, 'melee');

        battle.playSound(isAutoBlocked ? 'parry' : 'block');
        battle.spawnParticles(hitX, hitY, isAutoBlocked ? '#fde047' : '#f97316', 14);
        battle.spawnFloatingText(
          hitX,
          opponent.y - 15,
          isAutoBlocked ? '⚔️ صدّ تلقائي!' : opponent.weapon ? '🛡️ صدّ بالسلاح والواقية!' : '🛡️ صدّ محكم!',
          isAutoBlocked ? '#fde047' : '#fb923c',
          17
        );
      } else {
        battle.playSound(this.attackType === 'punch' ? 'punch' : 'kick');
        this.combo++;
        this.comboTimer = 110;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;
        this.hitsLanded++;

        if (this.combo > 1) {
          baseDmg += Math.min(12, this.combo * 2);
          battle.spawnFloatingText(this.x + this.width / 2, this.y - 48, `🔥 ${this.combo} HITS!`, '#fb923c', 22);
        }

        if (this.char.passive === 'inferno') battle.fireZones.push({ x: opponent.x - 20, w: 70, timer: 180 });
        if (this.char.passive === 'ice') {
          opponent.slowTimer = 110;
          battle.spawnFloatingText(hitX, opponent.y - 42, '❄️ تبطيء!', '#fdba74', 18);
        }
        if (this.char.passive === 'lifesteal') {
          this.health = Math.min(this.maxHealth, this.health + 5);
        }
        if (this.char.passive === 'stun' && (this.attackType === 'kick' || this.punchStep === 0)) {
          opponent.stunTimer = 25;
          battle.spawnFloatingText(hitX, opponent.y - 42, '⚡ صعقة!', '#fb923c', 18);
        }

        if (!isSuperArmored) {
          opponent.hurtTimer = 13;
          if (this.attackType === 'uppercut') {
            opponent.vy = -16.5;
            opponent.vx = this.facing * 7;
            battle.spawnFloatingText(hitX, opponent.y - 30, '⬆️ ضربة صاعدة!', '#fb923c', 20);
          } else if (isSlam) {
            opponent.vy = -10;
            opponent.vx = this.facing * 16;
          } else {
            opponent.vx = this.facing * (this.attackType === 'kick' || this.punchStep === 0 ? 14 : 8);
            if (this.attackType === 'kick') opponent.vy = -4.5;
          }
        } else {
          battle.spawnFloatingText(hitX, opponent.y - 30, '🦍 درع خارق!', '#f97316', 18);
        }

        this.damageDealt += baseDmg;
        opponent.damageTaken += baseDmg;
        battle.onDamageDealt?.(this, opponent, baseDmg, 'melee');

        battle.addScreenShake(9);
        battle.setHitStop(3);
        battle.setCrowdExcitement(45);

        battle.spawnParticles(hitX, hitY, this.weapon ? this.weapon.color : this.outfit.armor, 18);
        battle.spawnFloatingText(hitX, opponent.y - 10, `-${baseDmg}`, '#ef4444', 22);
        if (battle.gameMode === 'training') {
          battle.recordTrainingHit(baseDmg, this.combo);
        }
      }

      if (battle.gameMode !== 'training') {
        opponent.takeDamage(baseDmg, battle);
      }
      const energyGain = this.char.passive === 'horus' ? 25 : 18;
      this.energy = Math.min(100, this.energy + energyGain);
      opponent.energy = Math.min(100, opponent.energy + 10);
      battle.checkWinCondition();
    }
  }

  update(opponent: Fighter, battle: BattleContext): void {
    if (!opponent) return;
    this.idleCycle += 0.12;

    if (this.gender === 'female') {
      const ay =
        (this.vy - this.prevVy) * 0.3 + (this.hurtTimer > 0 ? 1.15 : 0) + (this.attackTimer > 0 ? 0.72 : 0);
      const ax = -this.vx * 0.12 + (this.attackTimer > 0 ? -this.facing * 0.9 : 0);
      this.bustVy += -0.34 * this.bustY - 0.25 * this.bustVy + ay;
      this.bustY = Math.max(-3.6, Math.min(4.2, this.bustY + this.bustVy));
      this.bustVx += -0.34 * this.bustX - 0.25 * this.bustVx + ax;
      this.bustX = Math.max(-2.8, Math.min(2.8, this.bustX + this.bustVx));
    }
    this.prevVy = this.vy;

    if (battle.gameMode === 'training') {
      this.energy = 100;
      if (this.isPlayer1) this.health = this.maxHealth;
    }

    if (this.displayHealth > this.health) {
      const diff = this.displayHealth - this.health;
      const step = Math.max(0.22, Math.min(0.55, diff * 0.04));
      this.displayHealth = Math.max(this.health, this.displayHealth - step);
    } else if (this.displayHealth < this.health) {
      this.displayHealth = Math.min(this.health, this.displayHealth + 0.6);
    }

    const effectiveGravity = GRAVITY * (battle.modifiers.gravityPreset === 'low' ? 0.52 : 1);
    const groundY = this.getGroundY(battle.canvasHeight);

    if (this.isDead) {
      if (this.deathAngle < Math.PI / 2) {
        this.deathAngle = Math.min(Math.PI / 2, this.deathAngle + 0.14);
      }
      this.vy += effectiveGravity;
      this.y += this.vy;
      if (this.y + this.height >= groundY) {
        this.y = groundY - this.height;
        this.vy = 0;
        this.grounded = true;
      }
      return;
    }

    if (battle.danceMode && battle.winnerFighter === this) {
      this.vx = 0;
      this.vy = 0;
      this.y = groundY - this.height;
      this.grounded = true;
      this.idleCycle += 0.18;
      return;
    }

    if (battle.clashActive || !battle.gameRunning || battle.isPaused) return;

    const staminaRegenBonus = battle.modifiers.speedPreset === 'turbo' ? 1.3 : 1;
    if (this.guardBrokenTimer > 0) {
      this.guardBrokenTimer--;
      this.blocking = false;
      this.stamina = Math.min(100, this.stamina + 0.55 * staminaRegenBonus);
    } else if (this.blocking) {
      this.stamina = Math.max(0, this.stamina - 0.52);
      if (this.stamina <= 0) {
        this.blocking = false;
        this.guardBrokenTimer = 75;
        this.hurtTimer = 30;
        battle.playSound('guard_break');
        battle.addScreenShake(12);
        battle.spawnFloatingText(this.x + this.width / 2, this.y - 34, '💔 كسر الدفاع!', '#ef4444', 22);
      }
    } else {
      this.stamina = Math.min(100, this.stamina + 0.45 * staminaRegenBonus);
    }

    if (this.knockdownTimer > 0) this.knockdownTimer--;
    if (this.dashCooldown > 0) this.dashCooldown--;
    if (this.hurtTimer > 0) this.hurtTimer--;
    if (this.slowTimer > 0) this.slowTimer--;
    if (this.stunTimer > 0) {
      this.stunTimer--;
      return;
    }

    if (this.comboTimer > 0) {
      this.comboTimer--;
      if (this.comboTimer === 0) {
        this.combo = 0;
        this.punchStep = 0;
      }
    }

    if (this.isLimitBreak && !this.limitBreakTriggered) {
      this.limitBreakTriggered = true;
      this.reachedLimitBreak = true;
      battle.addScreenShake(14);
      battle.spawnFloatingText(this.x + this.width / 2, this.y - 60, `⚡ LIMIT BREAK: ${this.name}!`, '#ef4444', 24);
    }

    battle.fireZones.forEach((fz) => {
      if (this.x + this.width > fz.x && this.x < fz.x + fz.w && this.y + this.height >= groundY) {
        if (Math.random() < 0.22 && battle.gameMode !== 'training') {
          this.damageTaken += 1;
          opponent.damageDealt += 1;
          this.takeDamage(1, battle);
          battle.checkWinCondition();
        }
      }
    });

    if (this.isBoss && battle.gameRunning) {
      // Boss active sustained energy & aura pressure
      this.energy = Math.min(100, this.energy + 0.14);
      if (this.hurtTimer > 0 && Math.random() < 0.08) {
        this.hurtTimer = 0;
        battle.spawnParticles(this.x + this.width / 2, this.y + this.height * 0.4, '#facc15', 10);
      }
    }

    if (this.isBot) {
      this.botActionTimer++;
      const effDiff = this.isBoss ? 'legendary' : battle.aiDifficulty;
      const diffCfg =
        effDiff === 'easy'
          ? { interval: 32, speedMult: 0.68, blockChance: 0.2, superChance: 0.15, dodgeHazard: false }
          : effDiff === 'legendary'
          ? { interval: this.isBoss ? 10 : 11, speedMult: this.isBoss ? 1.15 : 1.12, blockChance: 0.72, superChance: this.isBoss ? 0.65 : 0.55, dodgeHazard: true }
          : { interval: 18, speedMult: 0.92, blockChance: 0.45, superChance: 0.35, dodgeHazard: true };

      if (diffCfg.dodgeHazard && this.grounded) {
        const nearDanger = battle.arenaHazards.some((hz) => Math.abs((hz.x || 0) - (this.x + this.width / 2)) < 75);
        if (nearDanger && Math.random() < 0.35) {
          this.vy = this.getJumpVelocity(battle.modifiers);
        }
      }

      const dist = opponent.x - this.x;
      const absDist = Math.abs(dist);
      const weaponReachBonus = this.weapon ? this.weapon.reach : 0;
      const tempoMult =
        (battle.modifiers.speedPreset === 'turbo' ? 1.36 : 1) * (battle.finalRushActive ? 1.12 : 1);
      const currentSpeed =
        this.char.speed *
        diffCfg.speedMult *
        (this.isLimitBreak ? 1.25 : 1) *
        (this.slowTimer > 0 ? 0.5 : 1) *
        tempoMult;

      if (this.botActionTimer > diffCfg.interval) {
        this.botActionTimer = 0;
        if (absDist > 110 + weaponReachBonus) {
          this.vx = dist > 0 ? currentSpeed : -currentSpeed;
          this.blocking = false;
        } else {
          this.vx = 0;
          if (opponent.attackTimer > 0 && this.stamina > 15 && Math.random() < diffCfg.blockChance) {
            this.blocking = true;
          } else {
            this.blocking = false;
            if (this.energy >= 100 && Math.random() < diffCfg.superChance) {
              this.triggerCinematicSuper(opponent, battle);
            } else if (this.energy >= 50 && Math.random() < diffCfg.superChance * 0.6) {
              this.triggerExMove(opponent, battle);
            } else if (Math.random() < 0.25 && this.grounded) {
              this.vy = this.getJumpVelocity(battle.modifiers);
            } else {
              this.attack(Math.random() < 0.6 ? 'punch' : 'kick', opponent, battle);
            }
          }
        }
      }
    }

    if (this.attackTimer === 0 && this.hurtTimer === 0) {
      this.facing = opponent.x > this.x ? 1 : -1;
    }

    const prevX = this.x;
    this.x += this.vx;

    battle.breakableProps.forEach((prop) => {
      if (prop.hp <= 0) return;
      const overlapsX = this.x + this.width > prop.x && this.x < prop.x + prop.w;
      const overlapsY = this.y + this.height > prop.y;
      if (overlapsX && overlapsY) {
        if (Math.abs(this.vx) > 12) {
          prop.hp -= 25;
          battle.spawnParticles(prop.x + prop.w / 2, prop.y + prop.h / 2, '#d97706', 14);
          if (prop.hp <= 0) {
            this.cratesBroken++;
            battle.onCrateBroken?.(this);
            battle.playSound('explosion');
            battle.spawnFloatingText(prop.x + prop.w / 2, prop.y - 12, '💥 تحطم!', '#fbbf24', 18);
          }
        } else {
          this.x = prevX;
        }
      }
    });

    if (
      this.grounded &&
      !this.isBot &&
      !battle.keys[this.isPlayer1 ? 'KeyA' : 'ArrowLeft'] &&
      !battle.keys[this.isPlayer1 ? 'KeyD' : 'ArrowRight']
    ) {
      this.vx *= 0.72;
    }

    if (Math.abs(this.vx) > 0.8 && this.grounded) this.walkCycle += Math.abs(this.vx) * 0.045;
    else this.walkCycle = 0;

    const margin = 85;
    if (this.x < margin) this.x = margin;
    if (this.x + this.width > battle.canvasWidth - margin) this.x = battle.canvasWidth - margin - this.width;

    this.vy += effectiveGravity;
    this.y += this.vy;

    if (this.y + this.height >= groundY) {
      if (this.attackType === 'slam') {
        battle.addScreenShake(15);
        battle.playSound('kick');
        battle.spawnParticles(this.x + this.width / 2, groundY, this.outfit.armor, 25);
        this.checkMeleeHit(opponent, true, battle);
        this.attackType = null;
        this.attackTimer = 0;
      } else if (!this.grounded && this.vy > 11 && this.hurtTimer > 0) {
        // Hard landing ground bounce & auto tech-spark rebound
        battle.spawnParticles(this.x + this.width / 2, groundY - 4, '#38bdf8', 14);
        battle.afterImages.push({
          x: this.x,
          y: groundY - this.height,
          w: this.width,
          h: this.height,
          color: '#38bdf8',
          alpha: 0.45,
          trailType: 'tech',
          facing: this.facing,
        });
      }
      this.y = groundY - this.height;
      this.vy = 0;
      this.grounded = true;
    } else {
      this.grounded = false;
    }

    if (this.attackTimer > 0) {
      this.attackTimer--;
      const hitFrame = Math.max(1, Math.floor(this.maxAttackTimer * 0.55));
      if (this.attackTimer === hitFrame && ['punch', 'kick', 'uppercut'].includes(this.attackType || '')) {
        this.checkMeleeHit(opponent, false, battle);
        this.checkBreakableHit(battle);
      }
      if (this.attackTimer === 0 && this.attackType !== 'slam') this.attackType = null;
    }
  }

  // Exact draw() visuals & clothing from arena_v_10__9781e672.html
  draw(
    ctx: CanvasRenderingContext2D,
    canvasHeight: number,
    danceMode: boolean,
    winnerFighter: Fighter | null,
    weaponMode = false
  ): void {
    const groundY = this.getGroundY(canvasHeight);
    ctx.save();
    const isFemale = this.gender === 'female';
    const cx = this.x + this.width / 2;
    const stanceBob = this.isDead ? 0 : Math.sin(this.idleCycle * 1.4) * 3.5;
    const walkBounce = this.isDead ? 0 : Math.abs(Math.sin(this.walkCycle)) * 6;
    const isWinnerDancing = !this.isDead && danceMode && winnerFighter === this;
    const danceHop = isWinnerDancing ? Math.abs(Math.sin(this.idleCycle * 4.2)) * 11 : 0;
    const bodyY = this.y - walkBounce + stanceBob - danceHop;

    if (this.isDead) {
      ctx.translate(cx, groundY - 12);
      ctx.rotate(-this.facing * this.deathAngle);
      ctx.translate(-cx, -(groundY - 12));
    } else if (isWinnerDancing) {
      const danceSway = Math.sin(this.idleCycle * 3.8) * 0.17;
      ctx.translate(cx, groundY);
      ctx.rotate(danceSway);
      ctx.translate(-cx, -groundY);
    } else {
      let tilt = 0;
      if (Math.abs(this.vx) > 6) tilt = this.facing * 0.13;
      if (this.hurtTimer > 0) tilt = -this.facing * 0.18;
      ctx.translate(cx, this.y + this.height);
      ctx.rotate(tilt);
      ctx.translate(-cx, -(this.y + this.height));
    }

    if (this.outfit.cape) {
      ctx.fillStyle = this.outfit.armor;
      ctx.beginPath();
      ctx.moveTo(cx - this.facing * 10, bodyY + 42);
      const wave = this.isDead ? 0 : Math.sin(this.idleCycle * 2) * (isWinnerDancing ? 14 : 8);
      ctx.lineTo(cx - this.facing * 42 + wave, bodyY + this.height - 25);
      ctx.lineTo(cx - this.facing * 12, bodyY + this.height - 20);
      ctx.closePath();
      ctx.fill();
    }

    if (isWinnerDancing) {
      ctx.save();
      ctx.shadowBlur = 28 + Math.sin(this.idleCycle * 6) * 8;
      ctx.shadowColor = '#facc15';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.ellipse(cx, bodyY + this.height / 2, this.width * 0.94, this.height * 0.62, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (!this.isDead && (this.isBoss || this.isLimitBreak || this.energy >= 100)) {
      ctx.save();
      const glowColor = this.isBoss ? '#facc15' : this.isLimitBreak ? '#ef4444' : this.outfit.armor;
      ctx.shadowBlur = (this.isBoss ? 26 : 22) + Math.sin(this.idleCycle * 4) * 8;
      ctx.shadowColor = glowColor;
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = this.isBoss ? 3.5 : 3;
      ctx.beginPath();
      ctx.ellipse(cx, bodyY + this.height / 2, this.width * 0.85, this.height * 0.6, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (!this.isDead && this.shieldHp > 0) {
      ctx.save();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
      ctx.strokeStyle = '#38bdf8';
      ctx.shadowBlur = 16;
      ctx.shadowColor = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(cx, bodyY + this.height / 2, this.width * 0.88, this.height * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    if (!this.isDead) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.ellipse(cx, groundY + 4, this.width * 0.72, 11, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (this.hurtTimer > 0 && this.hurtTimer % 2 === 0) ctx.filter = 'brightness(3)';
    if (this.slowTimer > 0) ctx.filter = 'hue-rotate(180deg)';

    const rawStride = this.isDead
      ? 0
      : isWinnerDancing
      ? Math.sin(this.idleCycle * 4.5) * 7
      : Math.sin(this.walkCycle) * 6.5;
    const legW = isFemale ? 8.0 : 8.8;
    const legOffset = isFemale ? 1.4 : 1.6;
    const bootH = isFemale ? 18 : 13;
    const hipAttachY = bodyY + this.height - 54;
    const legBottomY = this.y + this.height;
    const legFullH = Math.max(46, legBottomY - hipAttachY);

    ctx.save();
    ctx.translate(cx - legOffset - legW / 2, hipAttachY);
    ctx.rotate(-rawStride * 0.042);
    ctx.fillStyle = isFemale ? this.char.skinColor : '#0f172a';
    ctx.fillRect(-legW / 2, 0, legW, legFullH);
    ctx.fillStyle = this.outfit.boots;
    ctx.fillRect(-legW / 2 - 1.5, legFullH - bootH, legW + 3, bootH);
    ctx.fillStyle = this.outfit.armor;
    ctx.fillRect(-legW / 2 - 1.5, legFullH - bootH, legW + 3, 2.5);
    ctx.restore();

    if (!this.isDead && this.attackType === 'kick' && this.attackTimer > 4) {
      ctx.save();
      ctx.fillStyle = isFemale ? this.char.skinColor : this.outfit.body;
      const kickX = this.facing === 1 ? cx : cx - 88;
      ctx.fillRect(kickX, bodyY + this.height - 64, 88, isFemale ? 11 : 15);
      ctx.fillStyle = this.outfit.armor;
      ctx.shadowBlur = 15;
      ctx.shadowColor = this.outfit.armor;
      ctx.beginPath();
      ctx.arc(this.facing === 1 ? kickX + 88 : kickX, bodyY + this.height - 56, isFemale ? 11.5 : 13.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.save();
      ctx.translate(cx + legOffset + legW / 2, hipAttachY);
      ctx.rotate(rawStride * 0.042);
      ctx.fillStyle = isFemale ? this.char.skinColor : '#1e293b';
      ctx.fillRect(-legW / 2, 0, legW, legFullH);
      ctx.fillStyle = this.outfit.boots;
      ctx.fillRect(-legW / 2 - 1, legFullH - bootH, legW + 3, bootH);
      ctx.fillStyle = this.outfit.armor;
      ctx.fillRect(-legW / 2 - 1, legFullH - bootH, legW + 3, 2.5);
      ctx.restore();
    }

    const activeBustY = isFemale ? this.bustY + Math.sin(this.idleCycle * 1.4) * 0.65 : 0;
    const activeBustX = isFemale ? this.bustX : 0;
    const torsoW = isFemale ? this.width - 6 : Math.round((this.width - 6) * 0.9);
    drawAnatomicalTorso(
      ctx,
      this.x + (this.width - torsoW) / 2,
      bodyY + 38,
      torsoW,
      this.height - 88,
      this.char,
      this.outfit,
      this.gender,
      this.facing,
      activeBustY,
      activeBustX
    );

    const headR = isFemale ? 14.5 : 16.8;
    if (isFemale) {
      drawStyledFemaleHair(ctx, cx, bodyY + 20, headR, this.char, this.outfit, this.facing, this.idleCycle, 1.05);
    } else {
      drawStyledMaleHair(ctx, cx, bodyY + 20, headR, this.char, this.outfit, this.facing, this.idleCycle, 1.05);
    }

    ctx.fillStyle = this.char.skinColor;
    ctx.beginPath();
    ctx.arc(cx, bodyY + 20, headR, 0, Math.PI * 2);
    ctx.fill();

    if (isFemale) {
      drawStyledFemaleHair(ctx, cx, bodyY + 20, headR, this.char, this.outfit, this.facing, this.idleCycle, 1.05);
    } else {
      drawStyledMaleHair(ctx, cx, bodyY + 20, headR, this.char, this.outfit, this.facing, this.idleCycle, 1.05);
    }

    ctx.fillStyle = this.outfit.armor;
    if (this.outfit.headgear === 'hat') {
      ctx.beginPath();
      ctx.moveTo(cx - 32, bodyY + 12);
      ctx.lineTo(cx + 32, bodyY + 12);
      ctx.lineTo(cx, bodyY - 12);
      ctx.closePath();
      ctx.fill();
    } else if (this.outfit.headgear === 'horns') {
      ctx.beginPath();
      ctx.moveTo(cx - 14, bodyY + 8);
      ctx.lineTo(cx - 22, bodyY - 14);
      ctx.lineTo(cx - 6, bodyY + 4);
      ctx.moveTo(cx + 14, bodyY + 8);
      ctx.lineTo(cx + 22, bodyY - 14);
      ctx.lineTo(cx + 6, bodyY + 4);
      ctx.fill();
    } else if (this.outfit.headgear === 'crown') {
      ctx.fillStyle = '#facc15';
      ctx.fillRect(cx - 18, bodyY - 2, 36, 10);
    } else if (this.outfit.headgear === 'visor') {
      ctx.fillStyle = '#10b981';
      ctx.fillRect(this.facing === 1 ? cx : cx - 17, bodyY + 15, 17, 6);
    } else if (this.outfit.headgear === 'hood') {
      ctx.fillStyle = this.outfit.body;
      ctx.beginPath();
      ctx.arc(cx, bodyY + 20, 20, Math.PI * 0.9, Math.PI * 0.1);
      ctx.fill();
    } else if (this.outfit.headgear === 'helm') {
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(cx, bodyY + 18, 19, Math.PI, 0);
      ctx.fill();
    } else if (this.outfit.headgear === 'band') {
      ctx.fillRect(cx - 18, bodyY + 10, 36, 6);
    } else if (this.outfit.headgear === 'mohawk') {
      ctx.fillRect(cx - 5, bodyY - 14, 10, 14);
    }

    if (isFemale) {
      drawFemaleFaceFeatures(ctx, cx, bodyY + 20, headR, this.facing, this.isDead, 1.05);
    } else {
      ctx.fillStyle = '#fff';
      if (this.isDead) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        const ex = this.facing === 1 ? cx + 10 : cx - 10;
        ctx.beginPath();
        ctx.moveTo(ex - 4, bodyY + 15);
        ctx.lineTo(ex + 4, bodyY + 23);
        ctx.moveTo(ex + 4, bodyY + 15);
        ctx.lineTo(ex - 4, bodyY + 23);
        ctx.stroke();
      } else {
        ctx.fillRect(this.facing === 1 ? cx + 7 : cx - 12, bodyY + 17, 6, 4);
      }
    }

    const isPunching = !this.isDead && (this.attackType === 'punch' || this.attackType === 'uppercut') && this.attackTimer > 3;
    const punchExtension = isPunching ? 1.0 : 0.0;
    const armThick = isFemale ? 8.8 : 10.2;
    const shoulderX = cx - this.facing * 5;
    const shoulderY = bodyY + 43;
    const handRadius = isFemale ? 8.0 : 8.5;

    let elbowX = cx - this.facing * 2;
    let elbowY = bodyY + 61;
    let handX = cx + this.facing * 15;
    let handY = bodyY + 75 + (this.isDead ? 0 : Math.cos(this.idleCycle * 1.4) * 3);

    if (danceMode && winnerFighter === this) {
      const waveY = Math.sin(this.idleCycle * 6) * 16;
      elbowX = shoulderX + this.facing * 14;
      elbowY = shoulderY - 12;
      handX = shoulderX + this.facing * 24;
      handY = shoulderY - 26 + waveY;
    } else if (this.blocking) {
      elbowX = shoulderX + this.facing * 14;
      elbowY = shoulderY + 10;
      handX = shoulderX + this.facing * 26;
      handY = shoulderY + 14;
    } else if (isPunching) {
      const ext = this.punchStep === 0 ? 1.15 : punchExtension;
      elbowX = shoulderX + this.facing * 28 * ext;
      elbowY = shoulderY - 2;
      handX = shoulderX + this.facing * 54 * ext;
      handY = shoulderY - 6;
    }

    ctx.save();
    ctx.strokeStyle = this.char.skinColor;
    ctx.lineWidth = armThick;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.lineTo(elbowX, elbowY);
    ctx.lineTo(handX, handY);
    ctx.stroke();

    ctx.fillStyle = this.outfit.armor;
    ctx.beginPath();
    ctx.arc(handX, handY, handRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (!this.isDead && weaponMode && this.weapon) {
      ctx.save();
      ctx.translate(handX, handY);
      drawRealisticWeapon(ctx, this.weapon, this.facing, isPunching || this.attackType === 'kick', this.blocking);
      ctx.restore();
    }

    if (!this.isDead && this.blocking) {
      ctx.save();
      ctx.strokeStyle = weaponMode ? '#fb923c' : this.outfit.armor;
      ctx.lineWidth = 4.5;
      if (this.facing === -1) {
        ctx.translate(cx * 2, 0);
        ctx.scale(-1, 1);
      }
      ctx.beginPath();
      ctx.arc(cx, bodyY + this.height / 2, this.height * 0.45, -Math.PI / 3, Math.PI / 3);
      ctx.stroke();
      ctx.restore();
    }

    if (!this.isDead && this.guardBrokenTimer > 0) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 13px Cairo, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💔 BREAK', cx, bodyY - 26);
    }

    ctx.restore();

    if (!this.isDead) {
      ctx.save();
      ctx.fillStyle = this.isPlayer1 ? '#fde047' : '#fb7185';
      ctx.shadowBlur = 6;
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.font = '900 14px Cairo, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${this.name} (${isFemale ? '♀' : '♂'})`, cx, bodyY - 20);
      ctx.restore();
    }
  }
}
