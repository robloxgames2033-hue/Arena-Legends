import React, { useCallback, useEffect, useRef, useState } from 'react';
import { playSound, SoundType } from '../audio/soundEngine';
import {
  ACHIEVEMENTS_CATALOG,
  CHARACTERS,
  HEAVY_WEAPON_IDS,
  MAX_HP,
  MINI_CHALLENGES,
  WEAPONS,
  getCharOutfits,
} from '../data/gameData';
import { BattleContext, DamageSource, Fighter, Projectile } from '../engine/fighter';
import {
  AfterImage,
  ArenaHazard,
  BreakableProp,
  CrowdPerson,
  FireZone,
  FloatingText,
  Particle,
  RainDrop,
  SlashArc,
  drawArenaScene,
} from '../engine/renderer';
import {
  AiDifficulty,
  ArenaId,
  ChromaId,
  FighterMatchStats,
  GameMode,
  Gender,
  MatchModifiers,
  MiniChallengeId,
  MiniChallengeOutcome,
  PostBattleResult,
  ThemeConfig,
} from '../types/game';

interface BattleViewProps {
  gameMode: GameMode;
  weaponMode: boolean;
  modifiers: MatchModifiers;
  miniChallenge: MiniChallengeId;
  p1CharIdx: number;
  p2CharIdx: number;
  p1Gender: Gender;
  p2Gender: Gender;
  p1OutfitIdx: number;
  p2OutfitIdx: number;
  p1Chroma: ChromaId;
  p2Chroma: ChromaId;
  p1WeaponIdx: number;
  p2WeaponIdx: number;
  p1Name: string;
  p2Name: string;
  currentArena: ArenaId;
  matchDuration: number;
  aiDifficulty: AiDifficulty;
  theme: ThemeConfig;
  isMuted: boolean;
  onToggleMute: () => void;
  onGoToMenu: () => void;
  onGoToCharSelect: () => void;
  onMatchComplete: (result: PostBattleResult) => void;
}

interface HudState {
  p1Name: string;
  p1CharLabel: string;
  p1Hp: number;
  p1DisplayHp: number;
  p1MaxHp: number;
  p1Shield: number;
  p1Energy: number;
  p1Stamina: number;
  p2Name: string;
  p2CharLabel: string;
  p2Hp: number;
  p2DisplayHp: number;
  p2MaxHp: number;
  p2Shield: number;
  p2Energy: number;
  p2Stamina: number;
  timerDisplay: string;
  timerSubLabel: string;
  finalRushActive: boolean;
  isBossMatch: boolean;
  miniStatus: { text: string; ok: boolean } | null;
}

interface VictoryCelebrationBanner {
  code: string;
  title: string;
  sub: string;
  miniOutcome?: MiniChallengeOutcome | null;
}

export const BattleView: React.FC<BattleViewProps> = ({
  gameMode,
  weaponMode,
  modifiers,
  miniChallenge,
  p1CharIdx,
  p2CharIdx,
  p1Gender,
  p2Gender,
  p1OutfitIdx,
  p2OutfitIdx,
  p1Chroma,
  p2Chroma,
  p1WeaponIdx,
  p2WeaponIdx,
  p1Name,
  p2Name,
  currentArena,
  matchDuration,
  aiDifficulty,
  theme,
  isMuted,
  onToggleMute,
  onGoToMenu,
  onGoToCharSelect,
  onMatchComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [trainingStats, setTrainingStats] = useState({ lastDmg: 0, maxCombo: 0, totalDmg: 0 });
  const [victoryBanner, setVictoryBanner] = useState<VictoryCelebrationBanner | null>(null);
  const [replayHud, setReplayHud] = useState<{ active: boolean; label: string }>({
    active: false,
    label: '',
  });
  const pendingFinalizeRef = useRef<(() => void) | null>(null);
  const pendingCelebrationRef = useRef<(() => void) | null>(null);
  const replayRingRef = useRef<HTMLCanvasElement[]>([]);
  const bestHighlightRef = useRef<HTMLCanvasElement[] | null>(null);
  const replayPlaybackRef = useRef<{
    active: boolean;
    frames: HTMLCanvasElement[];
    cursor: number;
    tick: number;
    label: string;
    onDone?: () => void;
  }>({
    active: false,
    frames: [],
    cursor: 0,
    tick: 0,
    label: '',
  });

  const effectiveWeaponMode =
    modifiers.weaponRule === 'none'
      ? false
      : modifiers.weaponRule === 'heavy'
      ? true
      : weaponMode;

  const [hud, setHud] = useState<HudState>({
    p1Name: p1Name || 'اللاعب 1',
    p1CharLabel: '',
    p1Hp: MAX_HP,
    p1DisplayHp: MAX_HP,
    p1MaxHp: MAX_HP,
    p1Shield: 0,
    p1Energy: gameMode === 'training' ? 100 : 40,
    p1Stamina: 100,
    p2Name: p2Name || 'اللاعب 2',
    p2CharLabel: '',
    p2Hp: MAX_HP,
    p2DisplayHp: MAX_HP,
    p2MaxHp: MAX_HP,
    p2Shield: 0,
    p2Energy: gameMode === 'training' ? 100 : 40,
    p2Stamina: 100,
    timerDisplay: matchDuration >= 999 ? '∞' : String(matchDuration),
    timerSubLabel: 'ثانية',
    finalRushActive: false,
    isBossMatch: gameMode === 'boss',
    miniStatus: null,
  });

  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;
  const themeRef = useRef(theme);
  themeRef.current = theme;

  const onMatchCompleteRef = useRef(onMatchComplete);
  onMatchCompleteRef.current = onMatchComplete;

  const stateRef = useRef<{
    p1: Fighter | null;
    p2: Fighter | null;
    gameRunning: boolean;
    danceMode: boolean;
    winnerFighter: Fighter | null;
    finalRushActive: boolean;
    finalRushTriggered: boolean;
    timer: number;
    survivalStreak: number;
    ladderStage: number;
    matchStartTimeMs: number;
    firstStrikeSeconds: number | null;
    firstStrikeTaken: boolean;
    trainingTotalDmg: number;
    trainingMaxCombo: number;
    screenShake: number;
    hitStopFrames: number;
    crowdExcitement: number;
    cinematicFrames: number;
    hazardSpawnTimer: number;
    clashActive: boolean;
    clashTimer: number;
    p1ClashScore: number;
    p2ClashScore: number;
    keys: Record<string, boolean>;
    projectiles: Projectile[];
    particles: Particle[];
    slashArcs: SlashArc[];
    floatingTexts: FloatingText[];
    afterImages: AfterImage[];
    fireZones: FireZone[];
    arenaHazards: ArenaHazard[];
    breakableProps: BreakableProp[];
    rainDrops: RainDrop[];
    crowd: CrowdPerson[];
    endTimeoutId: number | null;
    roundTimeoutId: number | null;
  }>({
    p1: null,
    p2: null,
    gameRunning: false,
    danceMode: false,
    winnerFighter: null,
    finalRushActive: false,
    finalRushTriggered: false,
    timer: matchDuration,
    survivalStreak: 0,
    ladderStage: 0,
    matchStartTimeMs: Date.now(),
    firstStrikeSeconds: null,
    firstStrikeTaken: false,
    trainingTotalDmg: 0,
    trainingMaxCombo: 0,
    screenShake: 0,
    hitStopFrames: 0,
    crowdExcitement: 0,
    cinematicFrames: 0,
    hazardSpawnTimer: 0,
    clashActive: false,
    clashTimer: 0,
    p1ClashScore: 0,
    p2ClashScore: 0,
    keys: {},
    projectiles: [],
    particles: [],
    slashArcs: [],
    floatingTexts: [],
    afterImages: [],
    fireZones: [],
    arenaHazards: [],
    breakableProps: [],
    rainDrops: Array.from({ length: 65 }, () => ({
      x: Math.random() * 1800,
      y: Math.random() * 900,
      len: 12 + Math.random() * 14,
      speed: 11 + Math.random() * 7,
    })),
    crowd: Array.from({ length: 48 }, (_, i) => ({
      x: (i / 48) * 1800,
      offset: Math.random() * Math.PI * 2,
      height: 35 + Math.random() * 22,
      altTone: i % 2 === 0,
    })),
    endTimeoutId: null,
    roundTimeoutId: null,
  });

  const playSfx = useCallback((t: SoundType) => {
    playSound(t, isMutedRef.current);
  }, []);

  const captureReplayFrame = useCallback((sourceCanvas: HTMLCanvasElement, tagPeak?: string) => {
    const offW = 480;
    const offH = 270;
    const snap = document.createElement('canvas');
    snap.width = offW;
    snap.height = offH;
    const sCtx = snap.getContext('2d');
    if (!sCtx) return;
    sCtx.drawImage(sourceCanvas, 0, 0, offW, offH);

    const ring = replayRingRef.current;
    ring.push(snap);
    if (ring.length > 42) {
      ring.shift();
    }
    if (tagPeak) {
      // Snapshot copy of the peak moment buffer
      bestHighlightRef.current = ring.map((c) => {
        const clone = document.createElement('canvas');
        clone.width = c.width;
        clone.height = c.height;
        clone.getContext('2d')?.drawImage(c, 0, 0);
        return clone;
      });
    }
  }, []);

  const startInstantReplay = useCallback((label: string, onDone?: () => void) => {
    const sourceFrames =
      replayRingRef.current.length >= 12
        ? replayRingRef.current
        : bestHighlightRef.current && bestHighlightRef.current.length > 0
        ? bestHighlightRef.current
        : [];
    if (sourceFrames.length < 6) {
      onDone?.();
      return;
    }
    const framesCopy = sourceFrames.slice(-36);
    replayPlaybackRef.current = {
      active: true,
      frames: framesCopy,
      cursor: 0,
      tick: 0,
      label,
      onDone,
    };
    setReplayHud({ active: true, label });
  }, []);

  const skipReplay = useCallback(() => {
    const rp = replayPlaybackRef.current;
    if (!rp.active) return;
    rp.active = false;
    setReplayHud({ active: false, label: '' });
    const done = rp.onDone;
    rp.onDone = undefined;
    done?.();
  }, []);

  const spawnParticles = useCallback((x: number, y: number, color: string, count: number) => {
    const st = stateRef.current;
    for (let i = 0; i < count; i++) {
      st.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.5) * 16,
        size: Math.random() * 6 + 2,
        color,
        alpha: 1,
      });
    }
  }, []);

  const spawnFloatingText = useCallback((x: number, y: number, text: string, color: string, size = 22) => {
    stateRef.current.floatingTexts.push({ x, y, text, color, size, alpha: 1, vy: -2.2 });
  }, []);

  const startRound = useCallback(
    (carryOpts?: { p1Health?: number; p1Energy?: number; p1Shield?: number }) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const st = stateRef.current;
      if (st.endTimeoutId) {
        window.clearTimeout(st.endTimeoutId);
        st.endTimeoutId = null;
      }
      if (st.roundTimeoutId) {
        window.clearTimeout(st.roundTimeoutId);
        st.roundTimeoutId = null;
      }

      pendingFinalizeRef.current = null;
      pendingCelebrationRef.current = null;
      replayRingRef.current = [];
      bestHighlightRef.current = null;
      replayPlaybackRef.current = { active: false, frames: [], cursor: 0, tick: 0, label: '' };
      setReplayHud({ active: false, label: '' });
      setVictoryBanner(null);
      setIsPaused(false);
      isPausedRef.current = false;

      const resolveWeapon = (idx: number) => {
        if (!effectiveWeaponMode) return null;
        const w = WEAPONS[idx] || WEAPONS[0];
        if (modifiers.weaponRule === 'heavy' && !HEAVY_WEAPON_IDS.includes(w.id)) {
          return WEAPONS.find((item) => HEAVY_WEAPON_IDS.includes(item.id)) || WEAPONS[1];
        }
        return w;
      };

      const cleanP1Name = p1Name.trim() || 'أسد الحلبة';
      let cleanP2Name = p2Name.trim() || 'شبح الليل';
      let resolvedP2CharIdx = p2CharIdx;
      let resolvedP2OutfitIdx = p2OutfitIdx;
      let resolvedP2Gender = p2Gender;
      let p2Hp = MAX_HP;
      let p2Shield = 0;
      let isBossOpp = false;

      if (gameMode === 'survival') {
        resolvedP2CharIdx = Math.floor(Math.random() * CHARACTERS.length);
        resolvedP2OutfitIdx = Math.floor(Math.random() * 4);
        resolvedP2Gender = Math.random() < 0.5 ? 'male' : 'female';
        cleanP2Name = `موجة البقاء #${st.survivalStreak + 1}`;
        p2Hp = MAX_HP + st.survivalStreak * 20;
      } else if (gameMode === 'ladder') {
        resolvedP2CharIdx = (p1CharIdx + 1 + st.ladderStage) % CHARACTERS.length;
        resolvedP2OutfitIdx = st.ladderStage % 4;
        resolvedP2Gender = st.ladderStage % 2 === 1 ? 'female' : 'male';
        cleanP2Name = `مرحلة ${st.ladderStage + 1}/4 • ${CHARACTERS[resolvedP2CharIdx].name}`;
        p2Hp = MAX_HP + st.ladderStage * 30;
      } else if (gameMode === 'boss') {
        resolvedP2CharIdx = p2CharIdx;
        resolvedP2OutfitIdx = p2OutfitIdx;
        resolvedP2Gender = p2Gender;
        isBossOpp = true;
        cleanP2Name = `👑 الزعيم: ${CHARACTERS[resolvedP2CharIdx]?.name || 'الأسطوري'}`;
        p2Hp = 520;
        p2Shield = 45;
      } else if (gameMode === 'training') {
        cleanP2Name = 'دمية التدريب';
        st.trainingTotalDmg = 0;
        st.trainingMaxCombo = 0;
        setTrainingStats({ lastDmg: 0, maxCombo: 0, totalDmg: 0 });
      } else if (gameMode === 'challenge') {
        cleanP2Name = 'الروبوت المدرع';
        p2Hp = 240;
      }

      const isBotOpponent =
        gameMode.includes('pve') ||
        gameMode === 'survival' ||
        gameMode === 'challenge' ||
        gameMode === 'ladder' ||
        gameMode === 'boss';

      const p1CharData = CHARACTERS[p1CharIdx] || CHARACTERS[0];
      const p1Outfits = getCharOutfits(p1CharIdx, p1Gender, p1Chroma);
      const p1OutfitData = p1Outfits[p1OutfitIdx] || p1Outfits[0];

      const p2CharData = CHARACTERS[resolvedP2CharIdx] || CHARACTERS[1];
      const p2Outfits = getCharOutfits(resolvedP2CharIdx, resolvedP2Gender, isBossOpp ? 'royal_gold' : p2Chroma);
      const p2OutfitData = p2Outfits[resolvedP2OutfitIdx] || p2Outfits[0];

      const p1Weapon = resolveWeapon(p1WeaponIdx);
      const p2Weapon = resolveWeapon(p2WeaponIdx);

      const p1 = new Fighter({
        x: canvas.width * 0.22,
        facing: 1,
        charData: p1CharData,
        outfitData: p1OutfitData,
        weaponData: p1Weapon,
        gender: p1Gender,
        name: cleanP1Name,
        isPlayer1: true,
        isBot: false,
        gameMode,
        initialHealth: MAX_HP,
        initialShield: carryOpts?.p1Shield ?? 0,
      });

      if (typeof carryOpts?.p1Health === 'number') {
        p1.health = Math.min(MAX_HP, carryOpts.p1Health);
        p1.displayHealth = p1.health;
      }
      if (typeof carryOpts?.p1Energy === 'number') {
        p1.energy = Math.min(100, carryOpts.p1Energy);
      }
      if ((carryOpts?.p1Shield ?? 0) > 0) {
        playSfx('shield');
        spawnFloatingText(p1.x + p1.width / 2, p1.y - 36, `🛡️ درع مؤقت +${carryOpts?.p1Shield}!`, '#38bdf8', 22);
      }

      const p2 = new Fighter({
        x: canvas.width * 0.72,
        facing: -1,
        charData: p2CharData,
        outfitData: p2OutfitData,
        weaponData: p2Weapon,
        gender: resolvedP2Gender,
        name: cleanP2Name,
        isPlayer1: false,
        isBot: isBotOpponent,
        isBoss: isBossOpp,
        gameMode,
        initialHealth: p2Hp,
        initialShield: p2Shield,
      });

      if (gameMode === 'training') {
        p2.isBot = false;
        p1.energy = 100;
        p2.energy = 100;
      }

      st.p1 = p1;
      st.p2 = p2;
      st.projectiles = [];
      st.particles = [];
      st.slashArcs = [];
      st.floatingTexts = [];
      st.afterImages = [];
      st.fireZones = [];
      st.arenaHazards = [];
      st.breakableProps = [];
      st.finalRushActive = false;
      st.finalRushTriggered = false;

      const floorY = canvas.height - 90;
      if (gameMode !== 'training' && gameMode !== 'challenge') {
        st.breakableProps.push(
          { x: canvas.width * 0.38, y: floorY - 42, w: 38, h: 42, hp: 50, maxHp: 50 },
          { x: canvas.width * 0.58, y: floorY - 42, w: 38, h: 42, hp: 50, maxHp: 50 }
        );
      }

      const effectiveDuration = gameMode === 'challenge' ? 30 : gameMode === 'training' ? 999 : matchDuration;
      st.timer = effectiveDuration;
      st.matchStartTimeMs = Date.now();
      st.firstStrikeSeconds = null;
      st.firstStrikeTaken = false;
      st.gameRunning = true;
      st.danceMode = false;
      st.winnerFighter = null;
      st.hazardSpawnTimer = 0;
      st.clashActive = false;

      let timerDisplay = String(effectiveDuration);
      let timerSubLabel = 'ثانية';
      if (gameMode === 'survival') {
        timerDisplay = `موجة ${st.survivalStreak + 1}`;
        timerSubLabel = 'البقاء';
      } else if (gameMode === 'ladder') {
        timerDisplay = `${st.ladderStage + 1}/4`;
        timerSubLabel = 'البطولة';
      } else if (gameMode === 'boss') {
        timerSubLabel = '👑 الزعيم';
      } else if (gameMode === 'training' || effectiveDuration >= 999) {
        timerDisplay = '∞';
        timerSubLabel = gameMode === 'training' ? 'تدريب' : 'مفتوح';
      } else if (gameMode === 'challenge') {
        timerSubLabel = 'تحدي';
      }

      setHud({
        p1Name: p1.name,
        p1CharLabel: `${p1.char.icon} ${p1.char.name} (${p1.gender === 'female' ? 'أنثى' : 'ذكر'})${p1.weapon ? ' • ' + p1.weapon.name : ''}`,
        p1Hp: p1.health,
        p1DisplayHp: p1.displayHealth,
        p1MaxHp: p1.maxHealth,
        p1Shield: p1.shieldHp,
        p1Energy: p1.energy,
        p1Stamina: p1.stamina,
        p2Name: p2.name,
        p2CharLabel: `${p2.char.name} (${p2.gender === 'female' ? 'أنثى' : 'ذكر'}) ${p2.char.icon}${p2.weapon ? ' • ' + p2.weapon.name : ''}`,
        p2Hp: p2.health,
        p2DisplayHp: p2.displayHealth,
        p2MaxHp: p2.maxHealth,
        p2Shield: p2.shieldHp,
        p2Energy: p2.energy,
        p2Stamina: p2.stamina,
        timerDisplay,
        timerSubLabel,
        finalRushActive: false,
        isBossMatch: isBossOpp,
        miniStatus: null,
      });

      spawnFloatingText(
        canvas.width / 2,
        canvas.height / 2,
        gameMode === 'challenge'
          ? 'DESTROY IN 30s!'
          : gameMode === 'boss'
          ? '👑 BOSS GAUNTLET!'
          : 'FIGHT!',
        '#f97316',
        56
      );
    },
    [
      effectiveWeaponMode,
      gameMode,
      matchDuration,
      modifiers.weaponRule,
      p1CharIdx,
      p1Chroma,
      p1Gender,
      p1Name,
      p1OutfitIdx,
      p1WeaponIdx,
      p2CharIdx,
      p2Chroma,
      p2Gender,
      p2Name,
      p2OutfitIdx,
      p2WeaponIdx,
      playSfx,
      spawnFloatingText,
    ]
  );

  const handleDamageDealt = useCallback(
    (attacker: Fighter | null, _defender: Fighter, _dmg: number, source: DamageSource) => {
      const st = stateRef.current;
      if (
        attacker &&
        !st.firstStrikeTaken &&
        ['melee', 'throw', 'ex', 'super', 'proj', 'clash'].includes(source) &&
        attacker.hitsLanded > 0
      ) {
        st.firstStrikeTaken = true;
        st.firstStrikeSeconds = Math.max(0.2, (Date.now() - st.matchStartTimeMs) / 1000);
        attacker.gotFirstStrike = true;
      }
      const canvas = canvasRef.current;
      if (canvas && attacker && (source === 'super' || source === 'ex' || attacker.combo >= 4)) {
        captureReplayFrame(canvas, source === 'super' ? 'ضربة سوبر خارقة!' : 'كومبو قوي!');
      }
    },
    [captureReplayFrame]
  );

  const finalizeMatchAndShowAchievements = useCallback(
    (
      bannerCode: string,
      winnerText: string,
      winnerBadge: string,
      winnerIsP1: boolean | null,
      ladderCleared: boolean,
      survivalCountSnapshot: number
    ) => {
      const st = stateRef.current;
      const p1 = st.p1;
      const p2 = st.p2;
      if (!p1 || !p2) return;

      const durationSeconds = Math.max(0.5, (Date.now() - st.matchStartTimeMs) / 1000);

      const toStats = (f: Fighter): FighterMatchStats => ({
        name: f.name,
        charName: f.char.name,
        charIcon: f.char.icon,
        outfitName: f.outfit.name,
        gender: f.gender,
        isPlayer1: f.isPlayer1,
        isBot: f.isBot,
        hpRemaining: Math.max(0, Math.ceil(f.health)),
        maxHp: f.maxHealth,
        damageDealt: Math.round(f.damageDealt),
        damageTaken: Math.round(f.damageTaken),
        hitsLanded: f.hitsLanded,
        blocksCount: f.blocksCount,
        maxCombo: f.maxCombo,
        superCount: f.superCount,
        exCount: f.exCount,
        throwsCount: f.throwsCount,
        cratesBroken: f.cratesBroken,
        clashesWon: f.clashesWon,
        reachedLimitBreak: f.reachedLimitBreak,
        gotFirstStrike: f.gotFirstStrike,
      });

      const p1Stats = toStats(p1);
      const p2Stats = toStats(p2);
      const winnerStats = winnerIsP1 === true ? p1Stats : winnerIsP1 === false ? p2Stats : null;
      const findDef = (id: string) => ACHIEVEMENTS_CATALOG.find((a) => a.id === id)!;

      const earned: PostBattleResult['earnedAchievements'] = [];

      const pickHolder = (pred: (s: FighterMatchStats) => boolean): FighterMatchStats | null => {
        if (winnerStats && !winnerStats.isBot && pred(winnerStats)) return winnerStats;
        if (pred(p1Stats)) return p1Stats;
        if (!p2Stats.isBot && pred(p2Stats)) return p2Stats;
        if (pred(p2Stats)) return p2Stats;
        return null;
      };

      const firstStriker = pickHolder((s) => s.gotFirstStrike);
      if (firstStriker) {
        earned.push({
          def: findDef('first_strike'),
          holderName: firstStriker.name,
          holderIsP1: firstStriker.isPlayer1,
          detailText:
            st.firstStrikeSeconds !== null
              ? `بعد ${st.firstStrikeSeconds.toFixed(1)} ثانية`
              : 'أول ضربة ناجحة',
        });
      }

      if (winnerStats && gameMode !== 'training' && winnerStats.damageTaken === 0 && winnerStats.hpRemaining >= winnerStats.maxHp) {
        earned.push({
          def: findDef('invincible'),
          holderName: winnerStats.name,
          holderIsP1: winnerStats.isPlayer1,
          detailText: `صحة كاملة ${winnerStats.hpRemaining}/${winnerStats.maxHp}`,
        });
      }

      if (winnerStats && winnerStats.reachedLimitBreak) {
        earned.push({
          def: findDef('comeback_king'),
          holderName: winnerStats.name,
          holderIsP1: winnerStats.isPlayer1,
          detailText: `حسم بمتبقي ${Math.round((winnerStats.hpRemaining / Math.max(1, winnerStats.maxHp)) * 100)}% صحة`,
        });
      }

      const comboHolder = pickHolder((s) => s.maxCombo >= 4);
      if (comboHolder) {
        earned.push({
          def: findDef('combo_master'),
          holderName: comboHolder.name,
          holderIsP1: comboHolder.isPlayer1,
          detailText: `أقصى كومبو ${comboHolder.maxCombo} ضربات`,
        });
      }

      const blocker = pickHolder((s) => s.blocksCount >= 5);
      if (blocker) {
        earned.push({
          def: findDef('iron_guard'),
          holderName: blocker.name,
          holderIsP1: blocker.isPlayer1,
          detailText: `${blocker.blocksCount} صدّات محكمة`,
        });
      }

      const superUser = pickHolder((s) => s.superCount >= 1);
      if (superUser) {
        earned.push({
          def: findDef('super_finisher'),
          holderName: superUser.name,
          holderIsP1: superUser.isPlayer1,
          detailText: `${superUser.superCount} ضربة سوبر`,
        });
      }

      const exUser = pickHolder((s) => s.exCount >= 1);
      if (exUser) {
        earned.push({
          def: findDef('ex_tactician'),
          holderName: exUser.name,
          holderIsP1: exUser.isPlayer1,
          detailText: `${exUser.exCount} حركة EX`,
        });
      }

      const clashChamp = pickHolder((s) => s.clashesWon >= 1);
      if (clashChamp) {
        earned.push({
          def: findDef('clash_champion'),
          holderName: clashChamp.name,
          holderIsP1: clashChamp.isPlayer1,
          detailText: `${clashChamp.clashesWon} انتصار اشتباك`,
        });
      }

      if (winnerStats && gameMode !== 'training' && durationSeconds <= 20) {
        earned.push({
          def: findDef('blitz_victory'),
          holderName: winnerStats.name,
          holderIsP1: winnerStats.isPlayer1,
          detailText: `حُسمت خلال ${durationSeconds.toFixed(1)} ثانية`,
        });
      }

      const crateBreaker = pickHolder((s) => s.cratesBroken >= 1);
      if (crateBreaker) {
        earned.push({
          def: findDef('arena_breaker'),
          holderName: crateBreaker.name,
          holderIsP1: crateBreaker.isPlayer1,
          detailText: `${crateBreaker.cratesBroken} صندوق مدمر`,
        });
      }

      if (ladderCleared || survivalCountSnapshot >= 3) {
        earned.push({
          def: findDef('legend_conqueror'),
          holderName: p1Stats.name,
          holderIsP1: true,
          detailText: ladderCleared ? 'بطل المراحل الـ 4' : `صمود ${survivalCountSnapshot} موجات`,
        });
      }

      if (gameMode === 'boss' && winnerIsP1 === true) {
        earned.push({
          def: findDef('boss_slayer'),
          holderName: p1Stats.name,
          holderIsP1: true,
          detailText: `هزم الزعيم في ${durationSeconds.toFixed(1)} ثانية`,
        });
      }

      let miniOutcome: MiniChallengeOutcome | null = null;
      if (miniChallenge !== 'none' && gameMode !== 'training') {
        const def = MINI_CHALLENGES.find((m) => m.id === miniChallenge);
        if (def) {
          let completed = false;
          let detailText = '';
          if (miniChallenge === 'blitz_20') {
            completed = winnerIsP1 === true && durationSeconds <= 20;
            detailText = completed
              ? `اكتمل في ${durationSeconds.toFixed(1)} ثانية`
              : `الزمن: ${durationSeconds.toFixed(1)} ث (المطلوب ≤ 20ث)`;
          } else if (miniChallenge === 'no_block') {
            completed = winnerIsP1 === true && p1Stats.blocksCount === 0;
            detailText = completed ? 'فوز بـ 0 صدّ!' : `مرات الصدّ: ${p1Stats.blocksCount}`;
          } else if (miniChallenge === 'combo_5') {
            completed = p1Stats.maxCombo >= 5;
            detailText = `أقصى كومبو: ${p1Stats.maxCombo}/5`;
          }
          miniOutcome = {
            id: def.id,
            title: def.title,
            icon: def.icon,
            completed,
            detailText,
          };
        }
      }

      onMatchCompleteRef.current({
        bannerCode,
        winnerText,
        winnerBadge,
        winnerIsP1,
        gameMode,
        durationSeconds,
        firstStrikeSeconds: st.firstStrikeSeconds,
        p1Stats,
        p2Stats,
        earnedAchievements: earned,
        survivalStreak: survivalCountSnapshot,
        ladderCleared,
        miniChallengeOutcome: miniOutcome,
      });
    },
    [gameMode, miniChallenge]
  );

  const triggerVictoryCelebration = useCallback(
    (
      bannerCode: string,
      winnerText: string,
      winnerBadge: string,
      winnerIsP1: boolean | null,
      ladderCleared: boolean,
      survivalCountSnapshot: number,
      delayMs = 2500
    ) => {
      const st = stateRef.current;
      const p1 = st.p1;
      const durationSeconds = Math.max(0.5, (Date.now() - st.matchStartTimeMs) / 1000);
      let miniPreview: MiniChallengeOutcome | null = null;
      if (miniChallenge !== 'none' && gameMode !== 'training' && p1) {
        const def = MINI_CHALLENGES.find((m) => m.id === miniChallenge);
        if (def) {
          const completed =
            miniChallenge === 'blitz_20'
              ? winnerIsP1 === true && durationSeconds <= 20
              : miniChallenge === 'no_block'
              ? winnerIsP1 === true && p1.blocksCount === 0
              : p1.maxCombo >= 5;
          miniPreview = {
            id: def.id,
            title: def.title,
            icon: def.icon,
            completed,
            detailText: completed ? 'شارة التحدي مكتملة!' : 'لم يكتمل الشرط',
          };
        }
      }

      const beginBannerAndTimer = () => {
        playSfx('victory');
        setVictoryBanner({
          code: bannerCode,
          title: winnerText,
          sub: winnerBadge,
          miniOutcome: miniPreview,
        });

        const runFinalize = () => {
          if (st.endTimeoutId) {
            window.clearTimeout(st.endTimeoutId);
            st.endTimeoutId = null;
          }
          pendingFinalizeRef.current = null;
          finalizeMatchAndShowAchievements(
            bannerCode,
            winnerText,
            winnerBadge,
            winnerIsP1,
            ladderCleared,
            survivalCountSnapshot
          );
        };

        pendingFinalizeRef.current = runFinalize;
        st.endTimeoutId = window.setTimeout(runFinalize, delayMs);
      };

      pendingCelebrationRef.current = beginBannerAndTimer;
      // Instant Slow-Motion Highlight Replay right after KO before victory celebration
      startInstantReplay('إعادة لحظة الحسم وأقوى ضربة', beginBannerAndTimer);
    },
    [finalizeMatchAndShowAchievements, gameMode, miniChallenge, playSfx, startInstantReplay]
  );

  const checkWinCondition = useCallback(() => {
    const st = stateRef.current;
    const canvas = canvasRef.current;
    if (!canvas || gameMode === 'training' || !st.p1 || !st.p2 || !st.gameRunning) return;
    const { p1, p2 } = st;
    if (p1.health > 0 && p2.health > 0) return;

    captureReplayFrame(canvas, 'الضربة القاضية K.O!');
    st.gameRunning = false;
    st.screenShake = 24;
    playSfx('ko');
    st.danceMode = true;
    st.winnerFighter = p1.health > 0 ? p1 : p2;

    if (gameMode === 'survival') {
      if (p1.health > 0) {
        st.survivalStreak++;
        const nextHp = Math.min(MAX_HP, p1.health + 38);
        const nextEnergy = Math.min(100, p1.energy + 45);
        const nextShield = 45;
        playSfx('victory');
        spawnFloatingText(
          canvas.width / 2,
          canvas.height / 2 - 20,
          `✨ موجة ناجحة #${st.survivalStreak}! +38 صحة • +45 طاقة • +45 درع`,
          '#22c55e',
          26
        );
        st.roundTimeoutId = window.setTimeout(() => {
          startRound({ p1Health: nextHp, p1Energy: nextEnergy, p1Shield: nextShield });
        }, 1800);
        return;
      }
      const finalStreak = st.survivalStreak;
      triggerVictoryCelebration(
        'K.O!',
        `نهاية وضع البقاء — الانتصارات: ${finalStreak}`,
        `${p1.char.icon} ${p1.char.name} (${p1.gender === 'female' ? 'أنثى' : 'ذكر'})`,
        false,
        false,
        finalStreak,
        2200
      );
      return;
    }

    if (gameMode === 'ladder') {
      if (p1.health > 0) {
        st.ladderStage++;
        if (st.ladderStage < 4) {
          playSfx('victory');
          spawnFloatingText(
            canvas.width / 2,
            canvas.height / 2,
            `🏆 فوز في المرحلة ${st.ladderStage}/4!`,
            '#facc15',
            34
          );
          st.roundTimeoutId = window.setTimeout(() => {
            startRound({ p1Health: MAX_HP });
          }, 1700);
          return;
        }
        st.ladderStage = 0;
        triggerVictoryCelebration(
          'CHAMPION!',
          'تُوّجت بطلاً لساحة الأساطير!',
          `${p1.char.icon} ${p1.char.name} (${p1.gender === 'female' ? 'أنثى' : 'ذكر'})`,
          true,
          true,
          st.survivalStreak,
          2600
        );
        return;
      }
      st.ladderStage = 0;
      triggerVictoryCelebration(
        'K.O!',
        'خرجت من البطولة — حاول مجدداً',
        `${p1.char.icon} ${p1.char.name} (${p1.gender === 'female' ? 'أنثى' : 'ذكر'})`,
        false,
        false,
        st.survivalStreak,
        2200
      );
      return;
    }

    if (gameMode === 'challenge') {
      const cleared = p2.health <= 0;
      triggerVictoryCelebration(
        cleared ? 'CLEAR!' : 'K.O!',
        cleared ? `تم تدمير الروبوت في ${30 - st.timer} ثانية` : 'فشل التحدي!',
        `${p1.char.icon} ${p1.char.name} (${p1.gender === 'female' ? 'أنثى' : 'ذكر'})`,
        cleared,
        false,
        st.survivalStreak,
        2400
      );
      return;
    }

    const winner = st.winnerFighter;
    const winnerLabel =
      gameMode === 'boss'
        ? winner.isPlayer1
          ? `انتصرت على الزعيم (${winner.name})!`
          : `انتصر الزعيم (${winner.name})`
        : winner.isPlayer1
        ? `فاز اللاعب 1 (${winner.name})`
        : `فاز اللاعب 2 (${winner.name})`;
    triggerVictoryCelebration(
      gameMode === 'boss' && winner.isPlayer1 ? 'BOSS SLAIN!' : '!K.O',
      winnerLabel,
      `${winner.char.icon} ${winner.char.name} (${winner.gender === 'female' ? 'أنثى' : 'ذكر'})`,
      winner.isPlayer1,
      false,
      st.survivalStreak,
      2500
    );
  }, [captureReplayFrame, gameMode, playSfx, spawnFloatingText, startRound, triggerVictoryCelebration]);

  const recordTrainingHit = useCallback((dmg: number, comboCount: number) => {
    const st = stateRef.current;
    st.trainingTotalDmg += dmg;
    if (comboCount > st.trainingMaxCombo) st.trainingMaxCombo = comboCount;
    setTrainingStats({
      lastDmg: dmg,
      maxCombo: st.trainingMaxCombo,
      totalDmg: st.trainingTotalDmg,
    });
  }, []);

  const triggerClash = useCallback(() => {
    const st = stateRef.current;
    if (!st.p1 || !st.p2 || st.clashActive) return;
    st.clashActive = true;
    st.clashTimer = 110;
    st.p1ClashScore = 0;
    st.p2ClashScore = 0;
    playSfx('clash');
    st.screenShake = 16;
    spawnParticles((st.p1.x + st.p2.x) / 2 + 30, st.p1.y + 60, '#f97316', 45);
  }, [playSfx, spawnParticles]);

  const buildBattleContext = useCallback((): BattleContext => {
    const canvas = canvasRef.current!;
    const st = stateRef.current;
    return {
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      gameMode,
      weaponMode: effectiveWeaponMode,
      aiDifficulty,
      modifiers,
      finalRushActive: st.finalRushActive,
      gameRunning: st.gameRunning,
      isPaused: isPausedRef.current,
      danceMode: st.danceMode,
      winnerFighter: st.winnerFighter,
      clashActive: st.clashActive,
      keys: st.keys,
      projectiles: st.projectiles,
      slashArcs: st.slashArcs,
      afterImages: st.afterImages,
      fireZones: st.fireZones,
      arenaHazards: st.arenaHazards,
      breakableProps: st.breakableProps,
      playSound: playSfx,
      spawnParticles,
      spawnFloatingText,
      triggerClash,
      checkWinCondition,
      recordTrainingHit,
      onDamageDealt: handleDamageDealt,
      addScreenShake: (v) => {
        st.screenShake = Math.max(st.screenShake, v);
      },
      setHitStop: (f) => {
        st.hitStopFrames = f;
      },
      setCrowdExcitement: (v) => {
        st.crowdExcitement = v;
      },
      setCinematicFrames: (f) => {
        st.cinematicFrames = f;
      },
    };
  }, [
    aiDifficulty,
    checkWinCondition,
    effectiveWeaponMode,
    gameMode,
    handleDamageDealt,
    modifiers,
    playSfx,
    recordTrainingHit,
    spawnFloatingText,
    spawnParticles,
    triggerClash,
  ]);

  // Resize, initial round start, timer, keyboard & gameLoop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = Math.max(300, parent.clientWidth);
      canvas.height = Math.max(200, parent.clientHeight);
    };
    resize();
    window.addEventListener('resize', resize);

    stateRef.current.survivalStreak = 0;
    stateRef.current.ladderStage = 0;
    startRound();

    const timerInterval = window.setInterval(() => {
      const st = stateRef.current;
      if (!st.gameRunning || isPausedRef.current || st.clashActive) return;
      if (gameMode === 'survival' || gameMode === 'ladder' || gameMode === 'training') return;
      if (matchDuration >= 999) return;
      st.timer--;
      setHud((prev) => ({ ...prev, timerDisplay: String(Math.max(0, st.timer)) }));
      if (st.timer <= 0 && st.p1 && st.p2) {
        st.gameRunning = false;
        st.danceMode = true;
        st.winnerFighter = st.p1.health >= st.p2.health ? st.p1 : st.p2;
        const loser = st.winnerFighter === st.p1 ? st.p2 : st.p1;
        loser.health = 0;

        if (gameMode === 'challenge') {
          triggerVictoryCelebration(
            'TIME UP',
            'انتهى الوقت! فشل التحدي',
            `${st.p1!.char.icon} ${st.p1!.char.name} (${st.p1!.gender === 'female' ? 'أنثى' : 'ذكر'})`,
            false,
            false,
            st.survivalStreak,
            2200
          );
          return;
        }
        const winner = st.winnerFighter;
        const winnerLabel = winner.isPlayer1 ? `فاز اللاعب 1 (${winner.name})` : `فاز اللاعب 2 (${winner.name})`;
        triggerVictoryCelebration(
          'TIME OVER',
          winnerLabel,
          `${winner.char.icon} ${winner.char.name} (${winner.gender === 'female' ? 'أنثى' : 'ذكر'})`,
          winner.isPlayer1,
          false,
          st.survivalStreak,
          2400
        );
      }
    }, 1000);

    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      const st = stateRef.current;
      st.keys[e.code] = true;

      if (e.code === 'Escape' && (st.gameRunning || isPausedRef.current)) {
        setIsPaused((prev) => {
          const next = !prev;
          isPausedRef.current = next;
          return next;
        });
        return;
      }

      if (!st.gameRunning || isPausedRef.current || !st.p1 || !st.p2) return;
      const battle = buildBattleContext();

      if (st.clashActive) {
        if (e.code === 'KeyF') st.p1ClashScore++;
        if (e.code === 'KeyK') st.p2ClashScore++;
        return;
      }

      if (e.code === 'KeyE') st.p1.performThrow(st.p2, battle);
      if (e.code === 'KeyR') st.p1.triggerExMove(st.p2, battle);
      if (e.code === 'KeyF') {
        if (st.keys['KeyW']) st.p1.attack('uppercut', st.p2, battle);
        else st.p1.attack('punch', st.p2, battle);
      }
      if (e.code === 'KeyG') st.p1.attack('kick', st.p2, battle);
      if (e.code === 'KeyH') st.p1.attack('special', st.p2, battle);
      if (e.code === 'KeyQ') {
        if (st.p1.knockdownTimer > 0) st.p1.tryTechRoll(battle);
        else st.p1.dash(battle);
      }
      if (e.code === 'KeyW') {
        if (st.p1.knockdownTimer > 0) st.p1.tryTechRoll(battle);
        else if (st.p1.grounded) st.p1.vy = st.p1.getJumpVelocity(modifiers);
      }

      if (!st.p2.isBot) {
        if (e.code === 'KeyP') st.p2.performThrow(st.p1, battle);
        if (e.code === 'KeyU') st.p2.triggerExMove(st.p1, battle);
        if (e.code === 'KeyK' || e.code === 'Numpad1') {
          if (st.keys['ArrowUp']) st.p2.attack('uppercut', st.p1, battle);
          else st.p2.attack('punch', st.p1, battle);
        }
        if (e.code === 'KeyL' || e.code === 'Numpad2') st.p2.attack('kick', st.p1, battle);
        if (e.code === 'KeyM' || e.code === 'Numpad3') st.p2.attack('special', st.p1, battle);
        if (e.code === 'KeyO' || e.code === 'Numpad0') {
          if (st.p2.knockdownTimer > 0) st.p2.tryTechRoll(battle);
          else st.p2.dash(battle);
        }
        if (e.code === 'ArrowUp') {
          if (st.p2.knockdownTimer > 0) st.p2.tryTechRoll(battle);
          else if (st.p2.grounded) st.p2.vy = st.p2.getJumpVelocity(modifiers);
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys[e.code] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    let animId = 0;
    let frameParity = 0;
    const loop = () => {
      const st = stateRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (isPausedRef.current) {
        animId = requestAnimationFrame(loop);
        return;
      }

      // Instant Slow-Motion Highlight Replay Playback
      const rp = replayPlaybackRef.current;
      if (rp.active) {
        rp.tick++;
        const frameSnap = rp.frames[rp.cursor];
        if (frameSnap) {
          ctx.save();
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(frameSnap, 0, 0, canvas.width, canvas.height);

          // Dramatic Replay dark edge vignette & cinema letterbox bars
          const rVig = ctx.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            canvas.width * 0.24,
            canvas.width / 2,
            canvas.height / 2,
            canvas.width * 0.65
          );
          rVig.addColorStop(0, 'rgba(0,0,0,0)');
          rVig.addColorStop(1, 'rgba(0,0,0,0.62)');
          ctx.fillStyle = rVig;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.fillStyle = 'rgba(0,0,0,0.75)';
          ctx.fillRect(0, 0, canvas.width, 32);
          ctx.fillRect(0, canvas.height - 32, canvas.width, 32);
          ctx.restore();
        }
        if (rp.tick % 3 === 0) {
          rp.cursor++;
          if (rp.cursor >= rp.frames.length) {
            rp.active = false;
            setReplayHud({ active: false, label: '' });
            const done = rp.onDone;
            rp.onDone = undefined;
            done?.();
          }
        }
        animId = requestAnimationFrame(loop);
        return;
      }

      if (st.hitStopFrames > 0) {
        st.hitStopFrames--;
        animId = requestAnimationFrame(loop);
        return;
      }

      // Check Final Rush status (< 15s remaining or either fighter <= 20% HP)
      if (st.gameRunning && gameMode !== 'training' && st.p1 && st.p2) {
        const lowTime = matchDuration < 999 && st.timer <= 15 && st.timer > 0;
        const lowHp =
          st.p1.health <= st.p1.maxHealth * 0.2 || st.p2.health <= st.p2.maxHealth * 0.2;
        st.finalRushActive = lowTime || lowHp;
        if (st.finalRushActive && !st.finalRushTriggered) {
          st.finalRushTriggered = true;
          st.screenShake = Math.max(st.screenShake, 14);
          playSfx('final_rush');
          spawnFloatingText(
            canvas.width / 2,
            canvas.height * 0.28,
            '🔥 FINAL RUSH! اللحظات الحاسمة!',
            '#f97316',
            30
          );
        }
      }

      // Celebrate winner dance with golden confetti sparkles
      if (st.danceMode && st.winnerFighter && Math.random() < 0.36) {
        const wf = st.winnerFighter;
        const confettiColors = ['#fde047', '#f97316', '#38bdf8', '#f472b6', '#ffffff'];
        st.particles.push({
          x: wf.x + wf.width / 2 + (Math.random() - 0.5) * 90,
          y: wf.y - 20 + Math.random() * 40,
          vx: (Math.random() - 0.5) * 4,
          vy: -(2 + Math.random() * 4),
          size: 3 + Math.random() * 4,
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          alpha: 1,
        });
      }

      ctx.save();
      if (st.screenShake > 0 || (st.finalRushActive && st.gameRunning && Math.random() < 0.25)) {
        const rushJitter = st.finalRushActive && st.gameRunning ? 1.8 : 0;
        const amp = Math.max(st.screenShake, rushJitter);
        const sx = (Math.random() - 0.5) * amp;
        const sy = (Math.random() - 0.5) * amp;
        ctx.translate(sx, sy);
        st.screenShake *= 0.85;
        if (st.screenShake < 0.5) st.screenShake = 0;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const winnerIsP1 = st.winnerFighter ? st.winnerFighter.isPlayer1 : null;
      const winnerSpotlight =
        st.danceMode && st.winnerFighter
          ? {
              x: st.winnerFighter.x + st.winnerFighter.width / 2,
              y: st.winnerFighter.y,
              color: st.winnerFighter.outfit.armor,
            }
          : null;

      let combatIntensity = 0;
      let actionX = canvas.width / 2;
      if (st.p1 && st.p2) {
        const mid = (st.p1.x + st.p1.width / 2 + st.p2.x + st.p2.width / 2) / 2;
        actionX = mid;
        const dist = Math.abs(st.p1.x - st.p2.x);
        const closeFactor = dist < 165 ? (165 - dist) / 165 : 0;
        const lowHpFactor =
          st.p1.health < st.p1.maxHealth * 0.35 || st.p2.health < st.p2.maxHealth * 0.35 ? 0.55 : 0;
        const specialFactor =
          st.p1.attackTimer > 0 || st.p2.attackTimer > 0 || st.projectiles.length > 0 ? 0.45 : 0;
        combatIntensity = Math.min(1.4, closeFactor * 0.7 + lowHpFactor + specialFactor);
      }

      drawArenaScene({
        ctx,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        currentArena,
        theme: themeRef.current,
        cinematicFrames: st.cinematicFrames,
        crowd: st.crowd,
        crowdExcitement: st.crowdExcitement,
        combatIntensity,
        actionX,
        fireZones: st.fireZones,
        breakableProps: st.breakableProps,
        rainDrops: st.rainDrops,
        gameRunning: st.gameRunning,
        isPaused: isPausedRef.current,
        p1Dead: st.p1?.isDead ?? false,
        p2Dead: st.p2?.isDead ?? false,
        winnerIsP1,
        finalRushActive: st.finalRushActive && st.gameRunning,
        winnerSpotlight,
      });

      if (st.cinematicFrames > 0) st.cinematicFrames--;
      if (st.crowdExcitement > 0) st.crowdExcitement--;

      // File 1 Realistic Hazards
      const floorY = canvas.height - 90;
      if (st.gameRunning && st.cinematicFrames === 0 && !st.clashActive) {
        st.hazardSpawnTimer++;
        const spawnInterval = currentArena === 'laser' || currentArena === 'storm' ? 105 : 115;
        if (st.hazardSpawnTimer > spawnInterval) {
          st.hazardSpawnTimer = 0;
          if (currentArena === 'hazards') {
            const gx =
              200 +
              Math.floor(Math.random() * Math.max(1, Math.floor((canvas.width - 360) / 260))) * 260;
            st.arenaHazards.push({ x: gx, y: 24, type: 'lightning', life: 25, damage: 14, hitDone: false });
            playSfx('thunder');
            st.screenShake = 8;
          } else if (currentArena === 'meteor') {
            st.arenaHazards.push({
              x: Math.random() * Math.max(100, canvas.width - 240) + 120,
              y: -30,
              vx: (Math.random() - 0.5) * 4,
              vy: 8 + Math.random() * 4,
              radius: 24,
              rot: 0,
              type: 'meteor',
              damage: 16,
            });
          } else if (currentArena === 'laser') {
            const lx =
              180 +
              Math.floor(Math.random() * Math.max(1, Math.floor((canvas.width - 340) / 240))) * 240;
            st.arenaHazards.push({
              type: 'falling_laser',
              x: lx,
              startY: 26,
              tipY: 42,
              descendSpeed: 28,
              telegraph: 24,
              activeLife: 18,
              damage: 15,
              hitDone: false,
              playedLaser: false,
            });
          } else if (currentArena === 'storm') {
            const sx = 140 + Math.random() * Math.max(100, canvas.width - 280);
            st.arenaHazards.push({
              type: 'storm_strike',
              x: sx,
              y: floorY,
              radius: 54,
              telegraph: 52,
              activeLife: 24,
              damage: 16,
              hitDone: false,
            });
          }
        }
      }

      for (let idx = st.arenaHazards.length - 1; idx >= 0; idx--) {
        const hz = st.arenaHazards[idx];
        if (hz.type === 'lightning') {
          hz.life = (hz.life ?? 0) - 1;
          ctx.save();
          ctx.strokeStyle = '#ffedd5';
          ctx.shadowBlur = 25;
          ctx.shadowColor = '#ef4444';
          ctx.lineWidth = (hz.life ?? 0) > 12 ? 6 : 2;
          ctx.beginPath();
          ctx.moveTo(hz.x, hz.y ?? 24);
          let currY = hz.y ?? 24;
          while (currY < floorY) {
            currY += 35;
            ctx.lineTo(hz.x + (Math.random() - 0.5) * 32, Math.min(floorY, currY));
          }
          ctx.stroke();
          ctx.restore();

          if (!hz.hitDone) {
            const hzBattle = buildBattleContext();
            [st.p1, st.p2].forEach((f) => {
              if (f && !f.isDead && Math.abs(f.x + f.width / 2 - hz.x) < 42) {
                if (gameMode !== 'training') {
                  f.takeDamage(hz.damage, hzBattle);
                  f.damageTaken += hz.damage;
                }
                f.hurtTimer = 16;
                spawnParticles(hz.x, f.y + 40, '#f97316', 30);
                spawnFloatingText(hz.x, f.y - 20, `⚡ LIGHTNING -${hz.damage}!`, '#fb923c', 22);
                checkWinCondition();
              }
            });
            hz.hitDone = true;
          }
          if ((hz.life ?? 0) <= 0) st.arenaHazards.splice(idx, 1);
        } else if (hz.type === 'meteor') {
          hz.x += hz.vx ?? 0;
          hz.y = (hz.y ?? 0) + (hz.vy ?? 8);
          hz.rot = (hz.rot ?? 0) + 0.08;
          const r = hz.radius ?? 24;
          spawnParticles(hz.x, (hz.y ?? 0) - 10, '#f97316', 2);
          ctx.save();
          ctx.translate(hz.x, hz.y ?? 0);
          ctx.rotate(hz.rot);
          ctx.shadowBlur = 30;
          ctx.shadowColor = '#ef4444';
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.arc(0, 0, r + 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1c0909';
          ctx.beginPath();
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
            const rad = r * (0.8 + Math.sin(a * 3) * 0.2);
            if (a === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
            else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
          }
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#fb923c';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();

          let exploded = false;
          const hzBattle = buildBattleContext();
          [st.p1, st.p2].forEach((f) => {
            if (f && !f.isDead && Math.hypot(f.x + f.width / 2 - hz.x, f.y + f.height / 2 - (hz.y ?? 0)) < r + 35) {
              if (gameMode !== 'training') {
                f.takeDamage(hz.damage, hzBattle);
                f.damageTaken += hz.damage;
              }
              f.hurtTimer = 18;
              f.vy = -10;
              spawnFloatingText(hz.x, f.y - 20, `☄️ METEOR -${hz.damage}!`, '#f97316', 24);
              exploded = true;
              checkWinCondition();
            }
          });
          if ((hz.y ?? 0) >= floorY - r || exploded) {
            playSfx('explosion');
            st.screenShake = 16;
            spawnParticles(hz.x, Math.min(floorY, hz.y ?? floorY), '#f97316', 35);
            st.arenaHazards.splice(idx, 1);
          }
        } else if (hz.type === 'falling_laser') {
          ctx.save();
          if ((hz.telegraph ?? 0) > 0) {
            hz.telegraph = (hz.telegraph ?? 0) - 1;
            ctx.strokeStyle = 'rgba(244, 63, 94, 0.45)';
            ctx.setLineDash([8, 8]);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(hz.x, hz.startY ?? 26);
            ctx.lineTo(hz.x, floorY);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = 'rgba(244, 63, 94, 0.25)';
            ctx.beginPath();
            ctx.ellipse(hz.x, floorY + 2, 26, 6, 0, 0, Math.PI * 2);
            ctx.fill();
          } else {
            if (!hz.playedLaser) {
              hz.playedLaser = true;
              playSfx('laser');
            }
            if ((hz.tipY ?? 42) < floorY) {
              hz.tipY = Math.min(floorY, (hz.tipY ?? 42) + (hz.descendSpeed ?? 28));
            } else {
              hz.activeLife = (hz.activeLife ?? 0) - 1;
            }

            ctx.shadowBlur = 24;
            ctx.shadowColor = '#ef4444';
            ctx.strokeStyle = '#ffedd5';
            ctx.lineWidth = 9;
            ctx.beginPath();
            ctx.moveTo(hz.x, hz.startY ?? 26);
            ctx.lineTo(hz.x, hz.tipY ?? floorY);
            ctx.stroke();

            ctx.strokeStyle = '#f43f5e';
            ctx.lineWidth = 4;
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(hz.x, hz.tipY ?? floorY, 8, 0, Math.PI * 2);
            ctx.fill();

            if ((hz.tipY ?? 0) >= floorY && Math.random() < 0.65) {
              spawnParticles(hz.x, floorY - 2, '#fb7185', 4);
            }

            if (!hz.hitDone) {
              const hzBattle = buildBattleContext();
              [st.p1, st.p2].forEach((f) => {
                if (
                  f &&
                  !f.isDead &&
                  !f.blocking &&
                  Math.abs(f.x + f.width / 2 - hz.x) < 28 &&
                  f.y + f.height >= (hz.tipY ?? 0) - 12 &&
                  f.y <= (hz.tipY ?? 0) + 12
                ) {
                  if (gameMode !== 'training') {
                    f.takeDamage(hz.damage, hzBattle);
                    f.damageTaken += hz.damage;
                  }
                  f.hurtTimer = 16;
                  st.screenShake = 11;
                  spawnParticles(hz.x, hz.tipY ?? floorY, '#f43f5e', 26);
                  spawnFloatingText(f.x + f.width / 2, f.y - 22, `🔴 LASER -${hz.damage}!`, '#fb7185', 22);
                  checkWinCondition();
                  hz.hitDone = true;
                }
              });
            }
            if ((hz.activeLife ?? 0) <= 0) st.arenaHazards.splice(idx, 1);
          }
          ctx.restore();
        } else if (hz.type === 'storm_strike') {
          ctx.save();
          const rad = hz.radius ?? 54;
          if ((hz.telegraph ?? 0) > 0) {
            hz.telegraph = (hz.telegraph ?? 0) - 1;
            const progress = 1 - (hz.telegraph ?? 0) / 52;
            const pulse = 1 + Math.sin(Date.now() * 0.02) * 0.08;

            ctx.fillStyle = `rgba(56, 189, 248, ${0.14 + progress * 0.24})`;
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.ellipse(hz.x, floorY + 3, rad * pulse, 12 * pulse, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            const innerR = Math.max(6, rad * (1 - progress * 0.78));
            ctx.strokeStyle = '#fde047';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.ellipse(hz.x, floorY + 3, innerR, Math.max(3, innerR * 0.22), 0, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(125, 211, 252, 0.25)';
            ctx.setLineDash([6, 6]);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(hz.x, 0);
            ctx.lineTo(hz.x, floorY + 3);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#fef08a';
            ctx.font = '900 12px Cairo, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('⚠️ منطقة العاصفة', hz.x, floorY - 14);
          } else {
            if (!hz.hitDone) {
              playSfx('thunder');
              st.screenShake = 16;
              spawnParticles(hz.x, floorY - 4, '#38bdf8', 32);
              const hzBattle = buildBattleContext();
              [st.p1, st.p2].forEach((f) => {
                if (f && !f.isDead && Math.abs(f.x + f.width / 2 - hz.x) < rad + 14 && f.y + f.height >= floorY - 20) {
                  if (gameMode !== 'training') {
                    f.takeDamage(hz.damage, hzBattle);
                    f.damageTaken += hz.damage;
                  }
                  f.hurtTimer = 16;
                  f.vy = -12;
                  spawnFloatingText(hz.x, f.y - 24, `⛈️ STORM -${hz.damage}!`, '#7dd3fc', 23);
                  checkWinCondition();
                }
              });
              hz.hitDone = true;
            }
            hz.activeLife = (hz.activeLife ?? 0) - 1;

            ctx.strokeStyle = '#e0f2fe';
            ctx.shadowBlur = 26;
            ctx.shadowColor = '#38bdf8';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(hz.x, 0);
            let curY = 0;
            while (curY < floorY) {
              curY += 32;
              ctx.lineTo(hz.x + (Math.random() - 0.5) * 28, Math.min(floorY, curY));
            }
            ctx.stroke();

            ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
            ctx.beginPath();
            ctx.ellipse(hz.x, floorY + 3, rad * 1.1, 14, 0, 0, Math.PI * 2);
            ctx.fill();

            if ((hz.activeLife ?? 0) <= 0) st.arenaHazards.splice(idx, 1);
          }
          ctx.restore();
        }
      }

      if ((st.gameRunning || st.danceMode) && st.p1 && st.p2) {
        const battle = buildBattleContext();

        if (!st.clashActive) {
          const tempoMult =
            (modifiers.speedPreset === 'turbo' ? 1.36 : 1) * (st.finalRushActive ? 1.12 : 1);

          // Continuous movement
          if (st.gameRunning) {
            const p1Speed =
              st.p1.char.speed *
              (st.p1.isLimitBreak ? 1.25 : 1) *
              (st.p1.slowTimer > 0 ? 0.5 : 1) *
              tempoMult;
            st.p1.blocking = !!st.keys['KeyS'] && st.p1.guardBrokenTimer === 0;
            if (
              !st.p1.blocking &&
              st.p1.hurtTimer === 0 &&
              st.p1.stunTimer === 0 &&
              st.p1.guardBrokenTimer === 0 &&
              Math.abs(st.p1.vx) <= p1Speed
            ) {
              if (st.keys['KeyA']) {
                if (st.p1.knockdownTimer > 0) st.p1.tryTechRoll(battle);
                st.p1.vx = -p1Speed;
              } else if (st.keys['KeyD']) {
                if (st.p1.knockdownTimer > 0) st.p1.tryTechRoll(battle);
                st.p1.vx = p1Speed;
              }
            } else if (st.p1.blocking) {
              st.p1.vx = 0;
            }

            if (!st.p2.isBot) {
              const p2Speed =
                st.p2.char.speed *
                (st.p2.isLimitBreak ? 1.25 : 1) *
                (st.p2.slowTimer > 0 ? 0.5 : 1) *
                tempoMult;
              st.p2.blocking = !!st.keys['ArrowDown'] && st.p2.guardBrokenTimer === 0;
              if (
                !st.p2.blocking &&
                st.p2.hurtTimer === 0 &&
                st.p2.stunTimer === 0 &&
                st.p2.guardBrokenTimer === 0 &&
                Math.abs(st.p2.vx) <= p2Speed
              ) {
                if (st.keys['ArrowLeft']) {
                  if (st.p2.knockdownTimer > 0) st.p2.tryTechRoll(battle);
                  st.p2.vx = -p2Speed;
                } else if (st.keys['ArrowRight']) {
                  if (st.p2.knockdownTimer > 0) st.p2.tryTechRoll(battle);
                  st.p2.vx = p2Speed;
                }
              } else if (st.p2.blocking) {
                st.p2.vx = 0;
              }
            }
          }

          st.p1.update(st.p2, battle);
          st.p2.update(st.p1, battle);
        } else {
          st.clashTimer--;
          ctx.save();
          ctx.fillStyle = '#fb923c';
          ctx.font = '900 30px Cairo, sans-serif';
          ctx.textAlign = 'center';
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#ef4444';
          ctx.fillText('⚔️ CLASH! اضغط F أو K بسرعة! ⚔️', canvas.width / 2, canvas.height * 0.35);
          ctx.font = '900 24px Cairo, sans-serif';
          ctx.fillText(`P1: ${st.p1ClashScore}   VS   P2: ${st.p2ClashScore}`, canvas.width / 2, canvas.height * 0.43);
          ctx.restore();
          if (st.clashTimer <= 0) {
            st.clashActive = false;
            const midX = (st.p1.x + st.p2.x) / 2;
            if (st.p2.isBot) st.p2ClashScore = Math.floor(Math.random() * 8) + 4;
            if (st.p1ClashScore >= st.p2ClashScore) {
              st.p1.clashesWon++;
              st.p1.hitsLanded++;
              st.p1.damageDealt += 18;
              st.p2.damageTaken += 18;
              handleDamageDealt(st.p1, st.p2, 18, 'clash');
              if (gameMode !== 'training') st.p2.takeDamage(18, battle);
              else recordTrainingHit(18, 2);
              st.p2.vx = 20;
              st.p2.vy = -12;
              st.p2.hurtTimer = 20;
              spawnFloatingText(midX, st.p1.y - 40, `⚡ CLASH WON BY ${st.p1.name}!`, '#fb923c', 26);
            } else {
              st.p2.clashesWon++;
              st.p2.hitsLanded++;
              st.p2.damageDealt += 18;
              st.p1.damageTaken += 18;
              handleDamageDealt(st.p2, st.p1, 18, 'clash');
              if (gameMode !== 'training') st.p1.takeDamage(18, battle);
              st.p1.vx = -20;
              st.p1.vy = -12;
              st.p1.hurtTimer = 20;
              spawnFloatingText(midX, st.p1.y - 40, `⚡ CLASH WON BY ${st.p2.name}!`, '#ef4444', 26);
            }
            playSfx('kick');
            checkWinCondition();
          }
        }

        // Gradient Afterimages & Tech Roll / Dash Motion Trails
        for (let idx = st.afterImages.length - 1; idx >= 0; idx--) {
          const img = st.afterImages[idx];
          ctx.save();
          ctx.globalAlpha = img.alpha;
          const dir = img.facing ?? 1;
          const grad = ctx.createLinearGradient(
            dir === 1 ? img.x : img.x + img.w,
            img.y,
            dir === 1 ? img.x + img.w : img.x,
            img.y + img.h
          );
          grad.addColorStop(0, 'rgba(255,255,255,0.05)');
          grad.addColorStop(0.55, img.color);
          grad.addColorStop(1, '#ffffff');
          ctx.fillStyle = grad;
          ctx.shadowBlur = img.trailType === 'tech' ? 14 : 8;
          ctx.shadowColor = img.color;
          ctx.beginPath();
          ctx.roundRect(img.x, img.y + 8, img.w, img.h - 8, 14);
          ctx.fill();

          // Speed lines behind dash / tech roll
          ctx.strokeStyle = img.color;
          ctx.lineWidth = img.trailType === 'tech' ? 2.5 : 1.8;
          for (let l = 0; l < 3; l++) {
            const ly = img.y + img.h * (0.25 + l * 0.25);
            ctx.beginPath();
            ctx.moveTo(img.x + img.w * 0.5, ly);
            ctx.lineTo(img.x + img.w * 0.5 - dir * 32, ly);
            ctx.stroke();
          }
          ctx.restore();
          img.alpha -= img.trailType === 'tech' ? 0.045 : 0.05;
          if (img.alpha <= 0) st.afterImages.splice(idx, 1);
        }

        if (st.p1.isDead) {
          st.p1.draw(ctx, canvas.height, st.danceMode, st.winnerFighter, effectiveWeaponMode);
          st.p2.draw(ctx, canvas.height, st.danceMode, st.winnerFighter, effectiveWeaponMode);
        } else {
          st.p2.draw(ctx, canvas.height, st.danceMode, st.winnerFighter, effectiveWeaponMode);
          st.p1.draw(ctx, canvas.height, st.danceMode, st.winnerFighter, effectiveWeaponMode);
        }

        // Slash arcs
        for (let idx = st.slashArcs.length - 1; idx >= 0; idx--) {
          const arc = st.slashArcs[idx];
          ctx.save();
          ctx.globalAlpha = arc.alpha;
          ctx.strokeStyle = arc.color;
          ctx.lineWidth = 7;
          ctx.beginPath();
          const startAngle = arc.facing === 1 ? -Math.PI * 0.4 : Math.PI * 0.6;
          const endAngle = arc.facing === 1 ? Math.PI * 0.4 : Math.PI * 1.4;
          ctx.arc(arc.x, arc.y, arc.type === 'kick' ? 52 : 40, startAngle, endAngle);
          ctx.stroke();
          ctx.restore();
          arc.alpha -= 0.1;
          if (arc.alpha <= 0) st.slashArcs.splice(idx, 1);
        }

        // Projectiles
        for (let idx = st.projectiles.length - 1; idx >= 0; idx--) {
          const proj = st.projectiles[idx];
          proj.x += proj.vx;
          ctx.save();
          ctx.fillStyle = '#fff';
          ctx.shadowBlur = 30;
          ctx.shadowColor = proj.color;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = proj.color;
          ctx.lineWidth = 6;
          ctx.stroke();
          ctx.restore();
          spawnParticles(proj.x, proj.y, proj.color, 2);

          const target = proj.owner === st.p1 ? st.p2 : st.p1;
          if (
            target &&
            !target.isDead &&
            proj.x + proj.radius > target.x &&
            proj.x - proj.radius < target.x + target.width &&
            proj.y + proj.radius > target.y &&
            proj.y - proj.radius < target.y + target.height
          ) {
            const dmg = target.blocking ? Math.floor(proj.damage * 0.35) : proj.damage;
            if (target.blocking) {
              target.blocksCount++;
              playSfx('block');
            } else {
              proj.owner.hitsLanded++;
              if (proj.source === 'ex') proj.owner.exCount++;
              if (proj.source === 'super') proj.owner.superCount++;
              playSfx('punch');
            }
            proj.owner.damageDealt += dmg;
            target.damageTaken += dmg;
            handleDamageDealt(proj.owner, target, dmg, proj.source ?? 'proj');

            if (gameMode !== 'training') {
              target.takeDamage(dmg, battle);
            } else {
              recordTrainingHit(dmg, 1);
            }
            target.hurtTimer = 18;
            target.vx = (proj.vx > 0 ? 1 : -1) * 18;
            spawnParticles(proj.x, proj.y, proj.color, 26);
            spawnFloatingText(target.x + target.width / 2, target.y - 20, `-${dmg}`, proj.color, 24);
            checkWinCondition();
            st.projectiles.splice(idx, 1);
            continue;
          }
          if (proj.x < -80 || proj.x > canvas.width + 80) {
            st.projectiles.splice(idx, 1);
          }
        }

        // Particles
        for (let idx = st.particles.length - 1; idx >= 0; idx--) {
          const pt = st.particles[idx];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.alpha -= 0.04;
          if (pt.alpha <= 0) st.particles.splice(idx, 1);
          else {
            ctx.save();
            ctx.globalAlpha = pt.alpha;
            ctx.fillStyle = pt.color;
            ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
            ctx.restore();
          }
        }

        // Floating texts
        for (let idx = st.floatingTexts.length - 1; idx >= 0; idx--) {
          const ft = st.floatingTexts[idx];
          ft.y += ft.vy;
          ft.alpha -= 0.02;
          if (ft.alpha <= 0) st.floatingTexts.splice(idx, 1);
          else {
            ctx.save();
            ctx.globalAlpha = ft.alpha;
            ctx.font = `900 ${ft.size}px Cairo, sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillStyle = ft.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#000';
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.restore();
          }
        }

        // Compute live Mini Challenge status for HUD
        let miniStatus: { text: string; ok: boolean } | null = null;
        if (miniChallenge !== 'none' && gameMode !== 'training' && st.p1) {
          if (miniChallenge === 'blitz_20') {
            const elapsed = (Date.now() - st.matchStartTimeMs) / 1000;
            miniStatus = {
              text: `⏱️ ${elapsed.toFixed(1)} / 20.0 ث`,
              ok: elapsed <= 20,
            };
          } else if (miniChallenge === 'no_block') {
            miniStatus = {
              text: st.p1.blocksCount === 0 ? '🚫 🛡️ بدون صدّ (صالح ✓)' : `❌ تم الصد (${st.p1.blocksCount})`,
              ok: st.p1.blocksCount === 0,
            };
          } else if (miniChallenge === 'combo_5') {
            miniStatus = {
              text: `💥 كومبو ${st.p1.maxCombo}/5`,
              ok: st.p1.maxCombo >= 5,
            };
          }
        }

        // Sync React HUD smoothly
        setHud((prev) => ({
          ...prev,
          p1Hp: st.p1!.health,
          p1DisplayHp: st.p1!.displayHealth,
          p1Shield: st.p1!.shieldHp,
          p1Energy: st.p1!.energy,
          p1Stamina: st.p1!.stamina,
          p2Hp: st.p2!.health,
          p2DisplayHp: st.p2!.displayHealth,
          p2Shield: st.p2!.shieldHp,
          p2Energy: st.p2!.energy,
          p2Stamina: st.p2!.stamina,
          finalRushActive: st.finalRushActive && st.gameRunning,
          miniStatus,
        }));
      }

      ctx.restore();

      // Capture every 2nd active battle frame into Instant Replay circular buffer
      frameParity = (frameParity + 1) % 2;
      if (st.gameRunning && frameParity === 0) {
        captureReplayFrame(canvas);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.clearInterval(timerInterval);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (stateRef.current.endTimeoutId) window.clearTimeout(stateRef.current.endTimeoutId);
      if (stateRef.current.roundTimeoutId) window.clearTimeout(stateRef.current.roundTimeoutId);
      replayRingRef.current = [];
      bestHighlightRef.current = null;
    };
  }, [
    buildBattleContext,
    captureReplayFrame,
    checkWinCondition,
    currentArena,
    effectiveWeaponMode,
    gameMode,
    handleDamageDealt,
    matchDuration,
    miniChallenge,
    modifiers,
    playSfx,
    recordTrainingHit,
    spawnFloatingText,
    spawnParticles,
    startRound,
    triggerVictoryCelebration,
  ]);

  const p1RealPct = Math.max(0, Math.min(100, (hud.p1Hp / hud.p1MaxHp) * 100));
  const p1TrailPct = Math.max(0, Math.min(100, (hud.p1DisplayHp / hud.p1MaxHp) * 100));
  const p2RealPct = Math.max(0, Math.min(100, (hud.p2Hp / hud.p2MaxHp) * 100));
  const p2TrailPct = Math.max(0, Math.min(100, (hud.p2DisplayHp / hud.p2MaxHp) * 100));

  return (
    <div className="relative w-full h-full">
      {/* HUD */}
      <div className="absolute top-3.5 left-6 right-6 max-w-[1380px] mx-auto flex flex-col md:flex-row justify-between items-stretch md:items-center gap-2 md:gap-[18px] z-10 pointer-events-none">
        {/* P1 HUD */}
        <div
          className="flex-1 rounded-[14px] py-2 px-3.5"
          style={{
            background: 'linear-gradient(135deg, var(--surface-2), var(--surface-3))',
            backdropFilter: 'blur(8px)',
            border: '1.5px solid var(--border-main)',
            boxShadow: '0 10px 28px rgba(0, 0, 0, 0.72)',
          }}
        >
          <div className="flex justify-between items-center text-sm font-black mb-1.5">
            <div className="flex items-center gap-2">
              <span style={{ color: 'var(--accent)' }}>{hud.p1Name}</span>
              <span
                className="text-[11px] font-extrabold px-2 py-0.5 rounded-md"
                style={{ background: 'var(--glow-primary)', color: 'var(--accent-soft)' }}
              >
                اللاعب 1
              </span>
            </div>
            <span className="text-xs truncate max-w-[200px]" style={{ color: 'var(--accent-soft)' }}>
              {hud.p1CharLabel}
            </span>
          </div>

          <div
            className="w-full h-7 rounded-[9px] overflow-hidden relative"
            style={{
              background: 'var(--surface-1)',
              border: '2px solid var(--accent-soft)',
              boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.75)',
            }}
          >
            <div
              className="absolute top-0 right-0 h-full"
              style={{
                width: `${p1TrailPct}%`,
                background: 'linear-gradient(90deg, var(--secondary), var(--accent))',
                transition: 'width 0.16s ease-out',
              }}
            />
            <div
              className="absolute top-0 right-0 h-full"
              style={{
                width: `${p1RealPct}%`,
                background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
              }}
            />
            <div
              className="absolute inset-0 flex items-center justify-center text-xs font-black text-white tabular-nums z-10"
              style={{ textShadow: '0 1px 4px #000', direction: 'ltr' }}
            >
              {Math.ceil(hud.p1Hp)} / {hud.p1MaxHp}
              {hud.p1Shield > 0 && (
                <span className="ml-2 px-1.5 py-0.2 rounded bg-sky-500/80 text-[10px]">
                  🛡️ +{Math.ceil(hud.p1Shield)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1.5">
            <div
              className="flex-1 h-[11px] rounded-[5px] overflow-hidden"
              style={{ background: 'var(--surface-1)', border: '1.5px solid var(--border-subtle)' }}
            >
              <div
                className="h-full float-right"
                style={{
                  width: `${Math.max(0, Math.min(100, hud.p1Energy))}%`,
                  background: 'linear-gradient(90deg, var(--primary), var(--secondary), var(--accent))',
                  transition: 'width 0.12s linear',
                }}
              />
            </div>
            {hud.p1Energy >= 50 && hud.p1Energy < 100 && (
              <span
                className="text-[11px] font-black px-2 py-0.5 rounded-md text-white"
                style={{ background: 'linear-gradient(90deg, #38bdf8, #2563eb)' }}
              >
                EX 50%
              </span>
            )}
            {hud.p1Energy >= 100 && (
              <span
                className="text-[11px] font-black px-2 py-0.5 rounded-md"
                style={{
                  color: 'var(--btn-text-dark)',
                  background: 'linear-gradient(90deg, var(--secondary), var(--accent))',
                  boxShadow: '0 0 12px var(--glow-secondary)',
                }}
              >
                ⚡ SUPER جاهز
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10.5px] font-extrabold whitespace-nowrap" style={{ color: 'var(--accent-soft)' }}>
              التحمل
            </span>
            <div
              className="flex-1 h-[7px] rounded overflow-hidden"
              style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border-subtle)' }}
            >
              <div
                className="h-full float-right"
                style={{
                  width: `${Math.max(0, Math.min(100, hud.p1Stamina))}%`,
                  background: 'linear-gradient(90deg, #22c55e, #eab308, #ef4444)',
                  transition: 'width 0.1s linear',
                }}
              />
            </div>
          </div>
        </div>

        {/* Center Timer & Controls */}
        <div className="flex flex-col items-center gap-1.5 pointer-events-auto self-center">
          <div
            className="flex flex-col items-center justify-center rounded-[14px] py-1 px-4 min-w-[92px]"
            style={{
              background: hud.finalRushActive
                ? 'linear-gradient(180deg, #7f1d1d, #1c0505)'
                : 'linear-gradient(180deg, var(--surface-2), var(--surface-1))',
              border: `2.5px solid ${hud.finalRushActive ? '#ef4444' : 'var(--secondary)'}`,
              boxShadow: hud.finalRushActive
                ? '0 0 26px rgba(239, 68, 68, 0.85)'
                : '0 0 22px var(--glow-primary)',
            }}
          >
            <div
              className="text-[24px] font-black leading-tight tabular-nums"
              style={{ color: hud.finalRushActive ? '#fef08a' : 'var(--accent)' }}
            >
              {hud.timerDisplay}
            </div>
            <div className="text-[10.5px] font-extrabold" style={{ color: 'var(--accent-soft)' }}>
              {hud.finalRushActive ? '🔥 FINAL RUSH' : hud.timerSubLabel}
            </div>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => {
                setIsPaused((prev) => {
                  const next = !prev;
                  isPausedRef.current = next;
                  return next;
                });
              }}
              className="px-2.5 py-0.5 rounded-[7px] text-[11px] font-black cursor-pointer"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border-main)',
                color: 'var(--text-main)',
              }}
            >
              ⏸️ إيقاف
            </button>
            <button
              type="button"
              onClick={onToggleMute}
              className="px-2.5 py-0.5 rounded-[7px] text-[11px] font-black cursor-pointer"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border-main)',
                color: 'var(--text-main)',
              }}
            >
              {isMuted ? '🔇 مكتوم' : '🔊 صوت'}
            </button>
          </div>
          {(modifiers.speedPreset === 'turbo' ||
            modifiers.gravityPreset === 'low' ||
            modifiers.weaponRule !== 'default') && (
            <div className="flex items-center gap-1 text-[10px] font-black">
              {modifiers.speedPreset === 'turbo' && (
                <span className="px-1.5 py-0.5 rounded bg-orange-600/80 text-white">⚡ تيربو</span>
              )}
              {modifiers.gravityPreset === 'low' && (
                <span className="px-1.5 py-0.5 rounded bg-sky-600/80 text-white">🪐 جاذبية خفيفة</span>
              )}
              {modifiers.weaponRule === 'none' && (
                <span className="px-1.5 py-0.5 rounded bg-zinc-700/90 text-white">✊ بدون أسلحة</span>
              )}
              {modifiers.weaponRule === 'heavy' && (
                <span className="px-1.5 py-0.5 rounded bg-amber-600/85 text-white">🔨 أسلحة ثقيلة</span>
              )}
            </div>
          )}
          {hud.miniStatus && (
            <div
              className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black tabular-nums"
              style={{
                background: hud.miniStatus.ok ? 'rgba(34, 197, 94, 0.22)' : 'rgba(239, 68, 68, 0.28)',
                border: `1px solid ${hud.miniStatus.ok ? '#4ade80' : '#f87171'}`,
                color: hud.miniStatus.ok ? '#86efac' : '#fca5a5',
              }}
            >
              🎯 {hud.miniStatus.text}
            </div>
          )}
        </div>

        {/* P2 HUD */}
        <div
          className="flex-1 rounded-[14px] py-2 px-3.5"
          style={{
            background: 'linear-gradient(135deg, var(--surface-2), var(--surface-3))',
            backdropFilter: 'blur(8px)',
            border: `1.5px solid ${hud.isBossMatch ? '#facc15' : 'var(--border-main)'}`,
            boxShadow: '0 10px 28px rgba(0, 0, 0, 0.72)',
          }}
        >
          <div className="flex justify-between items-center text-sm font-black mb-1.5">
            <span className="text-xs truncate max-w-[200px]" style={{ color: 'var(--accent-soft)' }}>
              {hud.p2CharLabel}
            </span>
            <div className="flex items-center gap-2">
              <span
                className="text-[11px] font-extrabold px-2 py-0.5 rounded-md"
                style={{
                  background: hud.isBossMatch ? 'rgba(250, 204, 21, 0.22)' : 'var(--glow-primary)',
                  color: hud.isBossMatch ? '#fde047' : 'var(--accent-soft)',
                }}
              >
                {hud.isBossMatch ? '👑 الزعيم' : 'اللاعب 2'}
              </span>
              <span style={{ color: hud.isBossMatch ? '#fde047' : 'var(--primary)' }}>{hud.p2Name}</span>
            </div>
          </div>

          <div
            className="w-full h-7 rounded-[9px] overflow-hidden relative"
            style={{
              background: 'var(--surface-1)',
              border: '2px solid var(--accent-soft)',
              boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.75)',
            }}
          >
            <div
              className="absolute top-0 left-0 h-full"
              style={{
                width: `${p2TrailPct}%`,
                background: 'linear-gradient(270deg, var(--secondary), var(--accent))',
                transition: 'width 0.16s ease-out',
              }}
            />
            <div
              className="absolute top-0 left-0 h-full"
              style={{
                width: `${p2RealPct}%`,
                background: 'linear-gradient(270deg, var(--secondary), var(--primary))',
              }}
            />
            <div
              className="absolute inset-0 flex items-center justify-center text-xs font-black text-white tabular-nums z-10"
              style={{ textShadow: '0 1px 4px #000', direction: 'ltr' }}
            >
              {Math.ceil(hud.p2Hp)} / {hud.p2MaxHp}
              {hud.p2Shield > 0 && (
                <span className="ml-2 px-1.5 py-0.2 rounded bg-sky-500/80 text-[10px]">
                  🛡️ +{Math.ceil(hud.p2Shield)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-1.5">
            {hud.p2Energy >= 100 && (
              <span
                className="text-[11px] font-black px-2 py-0.5 rounded-md"
                style={{
                  color: 'var(--btn-text-dark)',
                  background: 'linear-gradient(90deg, var(--secondary), var(--accent))',
                  boxShadow: '0 0 12px var(--glow-secondary)',
                }}
              >
                ⚡ SUPER جاهز
              </span>
            )}
            {hud.p2Energy >= 50 && hud.p2Energy < 100 && (
              <span
                className="text-[11px] font-black px-2 py-0.5 rounded-md text-white"
                style={{ background: 'linear-gradient(90deg, #38bdf8, #2563eb)' }}
              >
                EX 50%
              </span>
            )}
            <div
              className="flex-1 h-[11px] rounded-[5px] overflow-hidden"
              style={{ background: 'var(--surface-1)', border: '1.5px solid var(--border-subtle)' }}
            >
              <div
                className="h-full float-left"
                style={{
                  width: `${Math.max(0, Math.min(100, hud.p2Energy))}%`,
                  background: 'linear-gradient(90deg, var(--primary), var(--secondary), var(--accent))',
                  transition: 'width 0.12s linear',
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <div
              className="flex-1 h-[7px] rounded overflow-hidden"
              style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border-subtle)' }}
            >
              <div
                className="h-full float-left"
                style={{
                  width: `${Math.max(0, Math.min(100, hud.p2Stamina))}%`,
                  background: 'linear-gradient(90deg, #22c55e, #eab308, #ef4444)',
                  transition: 'width 0.1s linear',
                }}
              />
            </div>
            <span className="text-[10.5px] font-extrabold whitespace-nowrap" style={{ color: 'var(--accent-soft)' }}>
              التحمل
            </span>
          </div>
        </div>
      </div>

      {/* Instant Highlight Replay Overlay */}
      {replayHud.active && (
        <div className="absolute inset-x-0 top-[118px] z-30 flex flex-col items-center pointer-events-auto">
          <div
            className="rounded-xl px-5 py-2 flex items-center gap-3"
            style={{
              background: 'rgba(9, 9, 11, 0.88)',
              border: '1.5px solid #facc15',
              boxShadow: '0 8px 28px rgba(0,0,0,0.8), 0 0 18px rgba(250,204,21,0.45)',
            }}
          >
            <span className="text-xs sm:text-sm font-black animate-pulse" style={{ color: '#fde047' }}>
              🎬 INSTANT REPLAY • {replayHud.label} (حركة بطيئة)
            </span>
            <button
              type="button"
              onClick={skipReplay}
              className="px-3 py-1 rounded-lg text-xs font-black cursor-pointer border-0"
              style={{
                background: 'linear-gradient(90deg, #facc15, #f97316)',
                color: '#09090b',
              }}
            >
              ⏭️ تخطي الإعادة
            </button>
          </div>
        </div>
      )}

      {/* Victory Dance Celebration Banner */}
      {victoryBanner && !replayHud.active && (
        <div className="absolute top-[135px] left-1/2 -translate-x-1/2 z-25 flex flex-col items-center gap-2 pointer-events-auto">
          <div
            className="rounded-2xl px-6 py-3 text-center"
            style={{
              background: 'linear-gradient(145deg, rgba(15,23,42,0.92), rgba(69,10,10,0.92))',
              border: '2px solid #facc15',
              boxShadow: '0 12px 35px rgba(0,0,0,0.85), 0 0 28px rgba(250,204,21,0.45)',
            }}
          >
            <div className="text-2xl sm:text-3xl font-black tracking-wider" style={{ color: '#fde047' }}>
              🏆 {victoryBanner.code}
            </div>
            <div className="text-base sm:text-lg font-black text-white mt-0.5">{victoryBanner.title}</div>
            <div className="text-xs font-bold mt-0.5" style={{ color: '#fed7aa' }}>
              {victoryBanner.sub}
            </div>
            {victoryBanner.miniOutcome && (
              <div
                className="mt-1.5 inline-block px-3 py-0.5 rounded-full text-[11px] font-black"
                style={{
                  background: victoryBanner.miniOutcome.completed
                    ? 'rgba(34,197,94,0.22)'
                    : 'rgba(239,68,68,0.22)',
                  border: `1px solid ${victoryBanner.miniOutcome.completed ? '#4ade80' : '#f87171'}`,
                  color: victoryBanner.miniOutcome.completed ? '#86efac' : '#fca5a5',
                }}
              >
                {victoryBanner.miniOutcome.icon} {victoryBanner.miniOutcome.title}:{' '}
                {victoryBanner.miniOutcome.completed ? '✅ تم الإنجاز!' : '❌ لم يكتمل'}
              </div>
            )}
            <div className="mt-2.5 flex items-center justify-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  if (stateRef.current.endTimeoutId) {
                    window.clearTimeout(stateRef.current.endTimeoutId);
                    stateRef.current.endTimeoutId = null;
                  }
                  setVictoryBanner(null);
                  startInstantReplay('إعادة لحظة الحسم', () => {
                    pendingCelebrationRef.current?.();
                  });
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-black cursor-pointer border-0"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  color: '#fde047',
                  border: '1px solid #facc15',
                }}
              >
                🎬 إعادة أقوى ضربة
              </button>
              <button
                type="button"
                onClick={() => pendingFinalizeRef.current?.()}
                className="px-4 py-1.5 rounded-lg text-xs font-black cursor-pointer border-0"
                style={{
                  background: 'linear-gradient(90deg, #facc15, #f97316)',
                  color: '#09090b',
                }}
              >
                ⏭️ عرض الإنجازات الآن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Training Telemetry */}
      {gameMode === 'training' && (
        <div
          className="absolute top-[118px] left-1/2 -translate-x-1/2 rounded-xl py-1.5 px-4 text-xs font-black flex gap-3.5 z-10 pointer-events-none tabular-nums"
          style={{
            background: 'var(--surface-2)',
            border: '1.5px solid var(--border-main)',
            color: 'var(--accent)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.65)',
          }}
        >
          <span>آخر ضرر: {trainingStats.lastDmg}</span>
          <span>أقصى كمبو: {trainingStats.maxCombo}</span>
          <span>مجموع الضرر: {trainingStats.totalDmg}</span>
        </div>
      )}

      {/* Pause Modal */}
      {isPaused && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center z-35 p-5"
          style={{ background: 'rgba(3, 4, 6, 0.82)', backdropFilter: 'blur(5px)' }}
        >
          <div
            className="rounded-[18px] py-5 px-7 max-w-[540px] w-full text-center"
            style={{
              background: 'linear-gradient(155deg, var(--surface-2), var(--surface-3))',
              border: '2px solid var(--border-main)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)',
            }}
          >
            <h2 className="title-gradient text-[28px] m-0">⏸️ تم إيقاف المعركة مؤقتاً</h2>
            <div className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>
              يمكنك متابعة القتال أو ضبط الصوت أو العودة للقائمة
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3.5 text-right text-xs" style={{ color: 'var(--accent-soft)' }}>
              <div
                className="rounded-[9px] py-2 px-2.5"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}
              >
                <b>P1:</b> A/D حركة • W قفز • S صد • Q اندفاع • E رمي • F لكمة • G ركلة • R EX • H سوبر
              </div>
              <div
                className="rounded-[9px] py-2 px-2.5"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}
              >
                <b>P2:</b> ◄/► حركة • ▲ قفز • ▼ صد • O اندفاع • P رمي • K لكمة • L ركلة • U EX • M سوبر
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-3">
              <button
                type="button"
                onClick={() => {
                  setIsPaused(false);
                  isPausedRef.current = false;
                }}
                className="py-2.5 px-5 text-[14.5px] font-black rounded-xl cursor-pointer border-0"
                style={{
                  background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                  color: 'var(--text-main)',
                  boxShadow: '0 0 16px var(--glow-primary)',
                }}
              >
                ▶️ استئناف القتال
              </button>
              <button
                type="button"
                onClick={onToggleMute}
                className="py-2.5 px-5 text-[14.5px] font-black rounded-xl cursor-pointer border-0"
                style={{
                  background: 'linear-gradient(90deg, var(--secondary), var(--primary))',
                  color: 'var(--text-main)',
                }}
              >
                {isMuted ? '🔇 تشغيل الصوت' : '🔊 كتم الصوت'}
              </button>
              {gameMode === 'training' && (
                <button
                  type="button"
                  onClick={() => {
                    const p1 = stateRef.current.p1;
                    setIsPaused(false);
                    isPausedRef.current = false;
                    finalizeMatchAndShowAchievements(
                      'TRAINING',
                      `نهاية التدريب الحر — مجموع الضرر: ${trainingStats.totalDmg}`,
                      p1 ? `${p1.char.icon} ${p1.char.name} (${p1.gender === 'female' ? 'أنثى' : 'ذكر'})` : 'وضع التدريب',
                      true,
                      false,
                      0
                    );
                  }}
                  className="py-2.5 px-5 text-[14.5px] font-black rounded-xl cursor-pointer"
                  style={{
                    background: 'linear-gradient(90deg, var(--accent), var(--secondary))',
                    border: '1px solid var(--border-main)',
                    color: 'var(--btn-text-dark)',
                  }}
                >
                  🏅 عرض الإنجازات والتقرير
                </button>
              )}
              <button
                type="button"
                onClick={onGoToCharSelect}
                className="py-2.5 px-5 text-[14.5px] font-black rounded-xl cursor-pointer"
                style={{
                  background: 'linear-gradient(90deg, var(--surface-2), var(--primary))',
                  border: '1px solid var(--border-main)',
                  color: 'var(--text-main)',
                }}
              >
                👕 الشخصيات
              </button>
              <button
                type="button"
                onClick={onGoToMenu}
                className="py-2.5 px-5 text-[14.5px] font-black rounded-xl cursor-pointer"
                style={{
                  background: 'linear-gradient(90deg, var(--surface-2), var(--secondary))',
                  border: '1px solid var(--border-main)',
                  color: 'var(--text-main)',
                }}
              >
                🏠 القائمة الرئيسية
              </button>
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} id="arenaCanvas" className="w-full h-full block" />
    </div>
  );
};
