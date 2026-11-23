export type Gender = 'male' | 'female';
export type AiDifficulty = 'easy' | 'medium' | 'legendary';
export type ArenaId = 'cyber' | 'volcano' | 'hazards' | 'meteor' | 'laser' | 'storm';
export type ChromaId = 'default' | 'shadow' | 'royal_gold' | 'neon';
export type MiniChallengeId = 'none' | 'blitz_20' | 'no_block' | 'combo_5';

export type GameMode =
  | 'pvp'
  | 'pve'
  | 'weapons_pvp'
  | 'weapons_pve'
  | 'survival'
  | 'challenge'
  | 'ladder'
  | 'boss'
  | 'training';

export type ScreenId =
  | 'menuScreen'
  | 'guideScreen'
  | 'charScreen'
  | 'cinemaScreen'
  | 'weaponScreen'
  | 'arenaScreen'
  | 'battle'
  | 'achievementsScreen';

export type CinemaPose = 'idle' | 'strike' | 'guard' | 'special' | 'weapon_inspect';

export type SpeedModifier = 'normal' | 'turbo';
export type GravityModifier = 'normal' | 'low';
export type WeaponRuleModifier = 'default' | 'none' | 'heavy';

export interface MatchModifiers {
  speedPreset: SpeedModifier;
  gravityPreset: GravityModifier;
  weaponRule: WeaponRuleModifier;
}

export interface CinemaLightingConfig {
  angle: 'left' | 'center' | 'right';
  intensity: 'soft' | 'vibrant' | 'dramatic';
}

export interface ChromaPreset {
  id: ChromaId;
  label: string;
  swatch: string;
  accent: string;
}

export interface MiniChallengeDef {
  id: MiniChallengeId;
  title: string;
  desc: string;
  icon: string;
  badge: string;
}

export interface MiniChallengeOutcome {
  id: MiniChallengeId;
  title: string;
  icon: string;
  completed: boolean;
  detailText: string;
}

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface AchievementDef {
  id: string;
  title: string;
  desc: string;
  icon: string;
  rarity: AchievementRarity;
  xp: number;
}

export interface FighterMatchStats {
  name: string;
  charName: string;
  charIcon: string;
  outfitName: string;
  gender: Gender;
  isPlayer1: boolean;
  isBot: boolean;
  hpRemaining: number;
  maxHp: number;
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
}

export interface EarnedAchievement {
  def: AchievementDef;
  holderName: string;
  holderIsP1: boolean;
  detailText: string;
  isNewCareerUnlock: boolean;
}

export interface PostBattleResult {
  bannerCode: string;
  winnerText: string;
  winnerBadge: string;
  winnerIsP1: boolean | null;
  gameMode: GameMode;
  durationSeconds: number;
  firstStrikeSeconds: number | null;
  p1Stats: FighterMatchStats;
  p2Stats: FighterMatchStats;
  earnedAchievements: Omit<EarnedAchievement, 'isNewCareerUnlock'>[];
  survivalStreak: number;
  ladderCleared: boolean;
  miniChallengeOutcome?: MiniChallengeOutcome | null;
}

export interface ThemeConfig {
  id: string;
  label: string;
  dots: [string, string, string];
  arenaTop: string;
  arenaBot: string;
  floor: string;
  post: string;
  rope1: string;
  rope2: string;
  rope3: string;
  crowdHueA: number;
  crowdHueB: number;
}

export interface Outfit {
  name: string;
  body: string;
  armor: string;
  belt: string;
  boots: string;
  headgear: 'hat' | 'band' | 'none' | 'crown' | 'mohawk' | 'helm' | 'horns' | 'hood' | 'visor';
  cape: boolean;
  style: string;
}

export interface CharacterDef {
  id: string;
  maleHair: string;
  maleHairStyle: string;
  name: string;
  icon: string;
  skinColor: string;
  femaleHair: string;
  hairStyle: string;
  width: number;
  height: number;
  speed: number;
  jump: number;
  punchDmg: number;
  kickDmg: number;
  specialDmg: number;
  passive: string;
  passiveText: string;
  outfits: Outfit[];
}

export interface WeaponDef {
  id: string;
  name: string;
  icon: string;
  reach: number;
  dmgMult: number;
  speedMult: number;
  color: string;
  guardColor: string;
  handleColor: string;
  desc: string;
}

export interface ArenaDef {
  id: ArenaId;
  tag: string;
  icon: string;
  name: string;
  desc: string;
  titleColorVar: string;
}

export interface ModeDef {
  num: string;
  numStyle: string;
  mode: GameMode;
  weaponMode: boolean;
  title: string;
  sub: string;
  badge: string;
}

export interface SavedPrefs {
  themeIdx?: number;
  p1Char?: number;
  p2Char?: number;
  p1Gender?: Gender;
  p2Gender?: Gender;
  p1Outfit?: number;
  p2Outfit?: number;
  p1Chroma?: ChromaId;
  p2Chroma?: ChromaId;
  p1Weapon?: number;
  p2Weapon?: number;
  p1Name?: string;
  p2Name?: string;
  arena?: ArenaId;
  duration?: number;
  aiDifficulty?: AiDifficulty;
  isMuted?: boolean;
  unlockedAchievements?: string[];
  modifiers?: MatchModifiers;
  miniChallenge?: MiniChallengeId;
}
