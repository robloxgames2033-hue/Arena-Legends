import {
  AchievementDef,
  ArenaDef,
  ArenaId,
  CharacterDef,
  ChromaId,
  ChromaPreset,
  Gender,
  MatchModifiers,
  MiniChallengeDef,
  ModeDef,
  Outfit,
  ThemeConfig,
  WeaponDef,
} from '../types/game';

export const MAX_HP = 300;
export const STORAGE_KEY = 'aren_legeng_merged_v10';
export const HEAVY_WEAPON_IDS = ['broadsword', 'hammer', 'axe', 'spear'];
export const DEFAULT_MODIFIERS: MatchModifiers = {
  speedPreset: 'normal',
  gravityPreset: 'normal',
  weaponRule: 'default',
};

export const COLOR_THEMES: ThemeConfig[] = [
  {
    id: 'red_orange_black',
    label: 'أحمر × برتقالي × أسود',
    dots: ['#ef4444', '#f97316', '#09090b'],
    arenaTop: '#070506',
    arenaBot: '#3b0a0a',
    floor: '#140808',
    post: '#291111',
    rope1: '#ef4444',
    rope2: '#f97316',
    rope3: '#dc2626',
    crowdHueA: 0,
    crowdHueB: 22,
  },
  {
    id: 'classic',
    label: 'الوضع العادي الكلاسيكي',
    dots: ['#38bdf8', '#facc15', '#0f172a'],
    arenaTop: '#050814',
    arenaBot: '#172554',
    floor: '#0f172a',
    post: '#1e293b',
    rope1: '#38bdf8',
    rope2: '#facc15',
    rope3: '#2563eb',
    crowdHueA: 205,
    crowdHueB: 45,
  },
  {
    id: 'pink_noir',
    label: 'رمادي × أسود × وردي',
    dots: ['#9ca3af', '#18181b', '#f472b6'],
    arenaTop: '#09090b',
    arenaBot: '#3f1d2e',
    floor: '#18181b',
    post: '#27272a',
    rope1: '#f472b6',
    rope2: '#a1a1aa',
    rope3: '#db2777',
    crowdHueA: 330,
    crowdHueB: 220,
  },
  {
    id: 'violet_teal',
    label: 'بنفسجي × تركوازي × داكن',
    dots: ['#a855f7', '#2dd4bf', '#070b14'],
    arenaTop: '#04060c',
    arenaBot: '#1e1b4b',
    floor: '#09131a',
    post: '#162232',
    rope1: '#a855f7',
    rope2: '#2dd4bf',
    rope3: '#7c3aed',
    crowdHueA: 268,
    crowdHueB: 172,
  },
  {
    id: 'emerald_gold',
    label: 'زمردي × ذهبي × فحمي',
    dots: ['#10b981', '#f59e0b', '#060d0b'],
    arenaTop: '#040807',
    arenaBot: '#064e3b',
    floor: '#091512',
    post: '#132a23',
    rope1: '#10b981',
    rope2: '#f59e0b',
    rope3: '#059669',
    crowdHueA: 158,
    crowdHueB: 40,
  },
  {
    id: 'crimson_cyan',
    label: 'قرمزي × سيان × داكن',
    dots: ['#e11d48', '#06b6d4', '#05070e'],
    arenaTop: '#05070e',
    arenaBot: '#4c0519',
    floor: '#090e1a',
    post: '#171e31',
    rope1: '#e11d48',
    rope2: '#06b6d4',
    rope3: '#be123c',
    crowdHueA: 345,
    crowdHueB: 190,
  },
];

// Female outfits: indices 0..2 redesigned, index 3 (4th outfit) preserved untouched
export const FEMALE_OUTFITS_BY_CHAR: Record<string, Outfit[]> = {
  samurai: [
    { name: 'كيمونو الحرير القرمزي المطرز', body: '#881337', armor: '#fde047', belt: '#f43f5e', boots: '#4c0519', headgear: 'band', cape: true, style: 'slit_dress' },
    { name: 'بدلة الشوغون الليلية الذهبية', body: '#1e1b4b', armor: '#f472b6', belt: '#facc15', boots: '#0f172a', headgear: 'none', cape: true, style: 'bodysuit' },
    { name: 'كورسيه زهرة الكرز اللؤلؤي', body: '#be185d', armor: '#fef08a', belt: '#ffffff', boots: '#831843', headgear: 'crown', cape: true, style: 'corset_shorts' },
    { name: 'بكيني الشاطئ الياقوتي الصيفي', body: '#f43f5e', armor: '#fecdd3', belt: '#facc15', boots: '#be123c', headgear: 'band', cape: false, style: 'summer_bikini' },
  ],
  titan: [
    { name: 'فستان الزمرد الإمبراطوري الذهبي', body: '#065f46', armor: '#fde047', belt: '#ffffff', boots: '#022c22', headgear: 'crown', cape: true, style: 'slit_dress' },
    { name: 'كورسيه المحاربة الياقوتي الفاخر', body: '#9f1239', armor: '#fbbf24', belt: '#22d3ee', boots: '#4c0519', headgear: 'band', cape: true, style: 'corset_shorts' },
    { name: 'توب البرونز وتنورة الشجاعة', body: '#7c2d12', armor: '#fef08a', belt: '#f97316', boots: '#431407', headgear: 'none', cape: true, style: 'crop_mini' },
    { name: 'بكيني الشمس الذهبي الصيفي', body: '#d97706', armor: '#fef08a', belt: '#ffffff', boots: '#92400e', headgear: 'crown', cape: false, style: 'summer_bikini' },
  ],
  ninja: [
    { name: 'بدلة القمر الأسود والنيون الوردي', body: '#18181b', armor: '#f472b6', belt: '#22d3ee', boots: '#09090b', headgear: 'none', cape: true, style: 'bodysuit' },
    { name: 'كورسيه الشبح الفيروزي القصير', body: '#0f766e', armor: '#f0abfc', belt: '#fde047', boots: '#042f2e', headgear: 'band', cape: true, style: 'corset_shorts' },
    { name: 'فستان منتصف الليل الياقوتي', body: '#4c1d95', armor: '#38bdf8', belt: '#f43f5e', boots: '#2e1065', headgear: 'visor', cape: true, style: 'slit_dress' },
    { name: 'بكيني الليل البنفسجي الصيفي', body: '#7e22ce', armor: '#f0abfc', belt: '#f472b6', boots: '#4c1d95', headgear: 'band', cape: false, style: 'summer_bikini' },
  ],
  inferno: [
    { name: 'فستان الياقوت الناري والذهب', body: '#991b1b', armor: '#fde047', belt: '#fb923c', boots: '#450a0a', headgear: 'crown', cape: true, style: 'slit_dress' },
    { name: 'كورسيه الشغف القرمزي اللامع', body: '#be123c', armor: '#fef08a', belt: '#ffffff', boots: '#881337', headgear: 'none', cape: true, style: 'corset_shorts' },
    { name: 'بدلة العنقاء السوداء المتوهجة', body: '#1c1917', armor: '#fb923c', belt: '#facc15', boots: '#0c0a09', headgear: 'horns', cape: true, style: 'bodysuit' },
    { name: 'بكيني اللهب المرجاني الصيفي', body: '#ef4444', armor: '#fed7aa', belt: '#fde047', boots: '#b91c1c', headgear: 'band', cape: false, style: 'summer_bikini' },
  ],
  valkyrie: [
    { name: 'فستان الأميرة اللؤلؤي والسماوي', body: '#0369a1', armor: '#fef08a', belt: '#e0f2fe', boots: '#0c4a6e', headgear: 'crown', cape: true, style: 'slit_dress' },
    { name: 'بدلة النجم القطبي الفضية', body: '#312e81', armor: '#7dd3fc', belt: '#f472b6', boots: '#1e1b4b', headgear: 'none', cape: true, style: 'bodysuit' },
    { name: 'توب الفجر البنفسجي وتنورة الجليد', body: '#7e22ce', armor: '#bae6fd', belt: '#fde047', boots: '#581c87', headgear: 'band', cape: true, style: 'crop_mini' },
    { name: 'بكيني الموج السماوي الصيفي', body: '#06b6d4', armor: '#cffafe', belt: '#ffffff', boots: '#0e7490', headgear: 'crown', cape: false, style: 'summer_bikini' },
  ],
  cyber: [
    { name: 'بدلة البلاتينيوم الوردي والسيان', body: '#1e293b', armor: '#f472b6', belt: '#22d3ee', boots: '#0f172a', headgear: 'visor', cape: true, style: 'bodysuit' },
    { name: 'كورسيه الهولوغرام الإمبراطوري', body: '#6d28d9', armor: '#22d3ee', belt: '#fde047', boots: '#3b0764', headgear: 'none', cape: true, style: 'corset_shorts' },
    { name: 'توب النيون القرمزي وتنورة السايبر', body: '#9f1239', armor: '#38bdf8', belt: '#ffffff', boots: '#4c0519', headgear: 'visor', cape: true, style: 'crop_mini' },
    { name: 'بكيني النيون الوردي الصيفي', body: '#ec4899', armor: '#fbcfe8', belt: '#22d3ee', boots: '#be185d', headgear: 'visor', cape: false, style: 'summer_bikini' },
  ],
  pharaoh: [
    { name: 'فستان الملكة الذهبي واللازورد', body: '#1d4ed8', armor: '#fde047', belt: '#2dd4bf', boots: '#1e3a8a', headgear: 'crown', cape: true, style: 'slit_dress' },
    { name: 'كورسيه اللوتس الزمردي والذهب', body: '#0f766e', armor: '#fef08a', belt: '#f472b6', boots: '#134e4a', headgear: 'crown', cape: true, style: 'corset_shorts' },
    { name: 'توب الصحراء القرمزي وتنورة حورس', body: '#9a3412', armor: '#facc15', belt: '#22d3ee', boots: '#7c2d12', headgear: 'band', cape: true, style: 'crop_mini' },
    { name: 'بكيني النيل الفيروزي الصيفي', body: '#14b8a6', armor: '#99f6e4', belt: '#facc15', boots: '#0f766e', headgear: 'crown', cape: false, style: 'summer_bikini' },
  ],
  phantom: [
    { name: 'فستان المخمل الأسود والورد', body: '#18181b', armor: '#f472b6', belt: '#fde047', boots: '#09090b', headgear: 'none', cape: true, style: 'slit_dress' },
    { name: 'بدلة القمر الأرجوانية الساحرة', body: '#581c87', armor: '#f9a8d4', belt: '#38bdf8', boots: '#3b0764', headgear: 'crown', cape: true, style: 'bodysuit' },
    { name: 'كورسيه الألماس الليلكي القصير', body: '#86198f', armor: '#fef08a', belt: '#e879f9', boots: '#4a044e', headgear: 'band', cape: true, style: 'corset_shorts' },
    { name: 'بكيني الشفق الوردي الصيفي', body: '#db2777', armor: '#f9a8d4', belt: '#fde047', boots: '#9d174d', headgear: 'band', cape: false, style: 'summer_bikini' },
  ],
  thunder: [
    { name: 'بدلة الإمبراطورة الذهبية الزرقاء', body: '#1e40af', armor: '#fde047', belt: '#ffffff', boots: '#172554', headgear: 'crown', cape: true, style: 'bodysuit' },
    { name: 'توب الشرارة الحمراء وتنورة البرق', body: '#b91c1c', armor: '#fef08a', belt: '#38bdf8', boots: '#7f1d1d', headgear: 'band', cape: true, style: 'crop_mini' },
    { name: 'فستان الصاعقة الليلي الساحر', body: '#0f172a', armor: '#38bdf8', belt: '#facc15', boots: '#020617', headgear: 'none', cape: true, style: 'slit_dress' },
    { name: 'بكيني الصاعقة الذهبي الصيفي', body: '#f59e0b', armor: '#fde68a', belt: '#38bdf8', boots: '#b45309', headgear: 'crown', cape: false, style: 'summer_bikini' },
  ],
};

// Characters & Sleek Attractive Male Outfits + Diverse Female Hairstyles (Long, Short, Curly & More)
export const CHARACTERS: CharacterDef[] = [
  {
    id: 'samurai',
    maleHair: '#0f172a',
    maleHairStyle: 'spiky_warrior',
    name: 'كازوما الساموراي',
    icon: '⚔️',
    skinColor: '#f1c27d',
    femaleHair: '#1e1b4b',
    hairStyle: 'long_straight',
    width: 49,
    height: 148,
    speed: 7.4,
    jump: -18,
    punchDmg: 11,
    kickDmg: 17,
    specialDmg: 42,
    passive: 'samurai',
    passiveText: 'صدّ تلقائي للضربات بنسبة 20%',
    outfits: [
      { name: 'معطف الساموراي الملكي الفاحم والذهب', body: '#090d16', armor: '#fbbf24', belt: '#ef4444', boots: '#18181b', headgear: 'none', cape: true, style: 'coat' },
      { name: 'جاكيت الرونين الجلدي القرمزي', body: '#7f1d1d', armor: '#e2e8f0', belt: '#facc15', boots: '#27272a', headgear: 'band', cape: false, style: 'jacket' },
      { name: 'كيمونو الشوغون الأبيض والياقوت', body: '#f1f5f9', armor: '#0284c7', belt: '#facc15', boots: '#0f172a', headgear: 'hat', cape: true, style: 'kimono' },
      { name: 'درع القمر الأزرق الأنيق', body: '#0f172a', armor: '#38bdf8', belt: '#ffffff', boots: '#020617', headgear: 'none', cape: true, style: 'plate' },
    ],
  },
  {
    id: 'titan',
    maleHair: '#451a03',
    maleHairStyle: 'mane',
    name: 'هرقل الجبّار',
    icon: '🦍',
    skinColor: '#d99b66',
    femaleHair: '#5c2d16',
    hairStyle: 'curly_voluminous',
    width: 59,
    height: 158,
    speed: 5.5,
    jump: -16,
    punchDmg: 15,
    kickDmg: 22,
    specialDmg: 50,
    passive: 'titan',
    passiveText: 'درع خارق يمنع التراجع من اللكمات',
    outfits: [
      { name: 'جاكيت الفرسان الأسود والذهب الملكي', body: '#18181b', armor: '#facc15', belt: '#f97316', boots: '#09090b', headgear: 'none', cape: true, style: 'jacket' },
      { name: 'معطف الأسد البرونزي الفاخر', body: '#78350f', armor: '#fef08a', belt: '#ffffff', boots: '#451a03', headgear: 'crown', cape: true, style: 'coat' },
      { name: 'سترة البطل الزمردية الرياضية', body: '#064e3b', armor: '#34d399', belt: '#fde047', boots: '#022c22', headgear: 'band', cape: false, style: 'vest' },
      { name: 'درع التيتانيوم الكحلي المصقول', body: '#1e293b', armor: '#38bdf8', belt: '#fbbf24', boots: '#0f172a', headgear: 'none', cape: true, style: 'plate' },
    ],
  },
  {
    id: 'ninja',
    maleHair: '#1e1b4b',
    maleHairStyle: 'wind_swept',
    name: 'ظل الكوبرا',
    icon: '🥷',
    skinColor: '#e0ac69',
    femaleHair: '#2e1065',
    hairStyle: 'twin_tails',
    width: 44,
    height: 140,
    speed: 9.0,
    jump: -19.5,
    punchDmg: 10,
    kickDmg: 15,
    specialDmg: 38,
    passive: 'ninja',
    passiveText: 'انتقال خاطف بضغطتين على الاندفاع',
    outfits: [
      { name: 'معطف قاتل الظلام والياقوت الأزرق', body: '#09090b', armor: '#22d3ee', belt: '#a855f7', boots: '#030712', headgear: 'none', cape: true, style: 'coat' },
      { name: 'جاكيت الليل الفضي والعنّابي', body: '#4c0519', armor: '#cbd5e1', belt: '#f43f5e', boots: '#18181b', headgear: 'visor', cape: false, style: 'jacket' },
      { name: 'كيمونو الشينوبي الفحمي الذهبي', body: '#1c1917', armor: '#facc15', belt: '#22d3ee', boots: '#0c0a09', headgear: 'hood', cape: true, style: 'kimono' },
      { name: 'بدلة القمر البيضاء والنيون', body: '#e2e8f0', armor: '#6366f1', belt: '#0f172a', boots: '#334155', headgear: 'none', cape: true, style: 'jacket' },
    ],
  },
  {
    id: 'inferno',
    maleHair: '#7f1d1d',
    maleHairStyle: 'flame_spikes',
    name: 'إفريت اللهب',
    icon: '🔥',
    skinColor: '#c68642',
    femaleHair: '#9a3412',
    hairStyle: 'curly_flow',
    width: 51,
    height: 148,
    speed: 7.6,
    jump: -18,
    punchDmg: 13,
    kickDmg: 19,
    specialDmg: 46,
    passive: 'inferno',
    passiveText: 'يترك حقول نيران مشتعلة تحت الخصم',
    outfits: [
      { name: 'جاكيت الجمر الجلدي الفاخر', body: '#18181b', armor: '#fb923c', belt: '#ef4444', boots: '#09090b', headgear: 'none', cape: false, style: 'jacket' },
      { name: 'معطف الإمبراطور القرمزي المذهب', body: '#881337', armor: '#fde047', belt: '#ffffff', boots: '#4c0519', headgear: 'crown', cape: true, style: 'coat' },
      { name: 'درع البلازما الكحلي الناري', body: '#0f172a', armor: '#f97316', belt: '#38bdf8', boots: '#020617', headgear: 'none', cape: true, style: 'plate' },
      { name: 'كيمونو العنقاء البيضاء والذهب', body: '#f8fafc', armor: '#dc2626', belt: '#facc15', boots: '#450a0a', headgear: 'band', cape: true, style: 'kimono' },
    ],
  },
  {
    id: 'valkyrie',
    maleHair: '#e0f2fe',
    maleHairStyle: 'noble_sweep',
    name: 'فالكيري الجليد',
    icon: '❄️',
    skinColor: '#ffe4e6',
    femaleHair: '#bae6fd',
    hairStyle: 'long_wave',
    width: 46,
    height: 144,
    speed: 8.0,
    jump: -19,
    punchDmg: 11,
    kickDmg: 16,
    specialDmg: 42,
    passive: 'ice',
    passiveText: 'ضرباتها تبطئ حركة الخصم مؤقتاً',
    outfits: [
      { name: 'معطف أمير الصقيع البلاتيني', body: '#0c4a6e', armor: '#e0f2fe', belt: '#fde047', boots: '#082f49', headgear: 'none', cape: true, style: 'coat' },
      { name: 'جاكيت الشفق الملكي البنفسجي', body: '#1e1b4b', armor: '#38bdf8', belt: '#f472b6', boots: '#0f172a', headgear: 'none', cape: false, style: 'jacket' },
      { name: 'درع الفرسان اللؤلؤي السماوي', body: '#e2e8f0', armor: '#0284c7', belt: '#fbbf24', boots: '#1e293b', headgear: 'crown', cape: true, style: 'plate' },
      { name: 'كيمونو الجليد الفاحم والذهب', body: '#090d16', armor: '#7dd3fc', belt: '#fde047', boots: '#020617', headgear: 'band', cape: true, style: 'kimono' },
    ],
  },
  {
    id: 'cyber',
    maleHair: '#06b6d4',
    maleHairStyle: 'cyber_crest',
    name: 'سايبورغ أوميغا',
    icon: '🤖',
    skinColor: '#e2e8f0',
    femaleHair: '#22d3ee',
    hairStyle: 'short_bob',
    width: 53,
    height: 150,
    speed: 7.0,
    jump: -17.5,
    punchDmg: 12,
    kickDmg: 18,
    specialDmg: 45,
    passive: 'cyber',
    passiveText: 'قذائف طاقة خارقة وسريعة',
    outfits: [
      { name: 'جاكيت السايبر التكتيكي الأسود', body: '#09090b', armor: '#22d3ee', belt: '#facc15', boots: '#030712', headgear: 'visor', cape: false, style: 'jacket' },
      { name: 'درع الكربون الزمردي الفائق', body: '#064e3b', armor: '#6ee7b7', belt: '#fde047', boots: '#022c22', headgear: 'none', cape: true, style: 'plate' },
      { name: 'معطف المستقبل القرمزي الفضي', body: '#4c0519', armor: '#e2e8f0', belt: '#38bdf8', boots: '#1e293b', headgear: 'visor', cape: true, style: 'coat' },
      { name: 'بدلة التيتانيوم الذهبية النقية', body: '#f1f5f9', armor: '#f59e0b', belt: '#0f172a', boots: '#334155', headgear: 'none', cape: true, style: 'jacket' },
    ],
  },
  {
    id: 'pharaoh',
    maleHair: '#1c1917',
    maleHairStyle: 'royal_locks',
    name: 'حورس الذهبي',
    icon: '🦅',
    skinColor: '#c68642',
    femaleHair: '#1c1917',
    hairStyle: 'royal_braid',
    width: 49,
    height: 150,
    speed: 7.3,
    jump: -18.5,
    punchDmg: 12,
    kickDmg: 17,
    specialDmg: 44,
    passive: 'horus',
    passiveText: 'شحن عداد السوبر أسرع بنسبة 35%',
    outfits: [
      { name: 'معطف فرعون النيل الأسود والذهب', body: '#09090b', armor: '#fbbf24', belt: '#2dd4bf', boots: '#18181b', headgear: 'crown', cape: true, style: 'coat' },
      { name: 'سترة الشمس الملكية اللازوردية', body: '#172554', armor: '#fde047', belt: '#ffffff', boots: '#0f172a', headgear: 'none', cape: true, style: 'vest' },
      { name: 'جاكيت المعبد الفيروزي المطرز', body: '#115e59', armor: '#fef08a', belt: '#f59e0b', boots: '#042f2e', headgear: 'band', cape: false, style: 'jacket' },
      { name: 'درع حورس اللؤلؤي الفخم', body: '#f8fafc', armor: '#d97706', belt: '#0ea5e9', boots: '#1e293b', headgear: 'crown', cape: true, style: 'plate' },
    ],
  },
  {
    id: 'phantom',
    maleHair: '#a855f7',
    maleHairStyle: 'ghost_wave',
    name: 'شبح الفراعنة',
    icon: '👻',
    skinColor: '#e2e8f0',
    femaleHair: '#c084fc',
    hairStyle: 'pixie_layered',
    width: 47,
    height: 146,
    speed: 7.8,
    jump: -18.5,
    punchDmg: 11,
    kickDmg: 16,
    specialDmg: 40,
    passive: 'lifesteal',
    passiveText: 'يمتص الصحة مع كل ضربة ناجحة',
    outfits: [
      { name: 'معطف اللورد الأرجواني والمعدن الفضي', body: '#2e1065', armor: '#e2e8f0', belt: '#f472b6', boots: '#09090b', headgear: 'none', cape: true, style: 'coat' },
      { name: 'جاكيت الشبح الجلدي الأسود والذهب', body: '#18181b', armor: '#facc15', belt: '#c084fc', boots: '#030712', headgear: 'none', cape: false, style: 'jacket' },
      { name: 'كيمونو الساحر الزمردي الليلي', body: '#064e3b', armor: '#34d399', belt: '#fde047', boots: '#022c22', headgear: 'hood', cape: true, style: 'kimono' },
      { name: 'درع القمر الياقوتي الفخم', body: '#881337', armor: '#fde047', belt: '#ffffff', boots: '#4c0519', headgear: 'crown', cape: true, style: 'plate' },
    ],
  },
  {
    id: 'thunder',
    maleHair: '#facc15',
    maleHairStyle: 'lightning_spikes',
    name: 'فارس الرعد',
    icon: '⚡',
    skinColor: '#f1c27d',
    femaleHair: '#fde047',
    hairStyle: 'high_ponytail',
    width: 51,
    height: 150,
    speed: 7.7,
    jump: -18,
    punchDmg: 13,
    kickDmg: 18,
    specialDmg: 48,
    passive: 'stun',
    passiveText: 'ضرباته القوية تصعق الخصم لحظياً',
    outfits: [
      { name: 'جاكيت الصاعقة الجلدي الكحلي والذهب', body: '#0f172a', armor: '#fde047', belt: '#38bdf8', boots: '#020617', headgear: 'none', cape: false, style: 'jacket' },
      { name: 'معطف البرق الملكي الفاحم', body: '#09090b', armor: '#38bdf8', belt: '#facc15', boots: '#18181b', headgear: 'crown', cape: true, style: 'coat' },
      { name: 'سترة العاصفة القرمزية المذهبة', body: '#7f1d1d', armor: '#fef08a', belt: '#38bdf8', boots: '#450a0a', headgear: 'band', cape: true, style: 'vest' },
      { name: 'درع الفارس الأبيض الرعدي', body: '#f1f5f9', armor: '#2563eb', belt: '#facc15', boots: '#0f172a', headgear: 'none', cape: true, style: 'plate' },
    ],
  },
];

export const WEAPONS: WeaponDef[] = [
  { id: 'katana', name: 'سيف الكاتانا الياباني', icon: '⚔️', reach: 45, dmgMult: 1.25, speedMult: 1.05, color: '#e2e8f0', guardColor: '#f97316', handleColor: '#7f1d1d', desc: 'نصل فولاذي حاد مع واقية يد برتقالية ومقبض ملفوف' },
  { id: 'broadsword', name: 'السيف العريض الثقيل', icon: '🗡️', reach: 50, dmgMult: 1.4, speedMult: 0.9, color: '#cbd5e1', guardColor: '#94a3b8', handleColor: '#451a03', desc: 'سيف معدني عريض بواقية متقاطعة وقوة قطع عالية' },
  { id: 'hammer', name: 'مطرقة الحرب الحديدية', icon: '🔨', reach: 42, dmgMult: 1.55, speedMult: 0.8, color: '#64748b', guardColor: '#334155', handleColor: '#78350f', desc: 'رأس فولاذي ثقيل بمقبض خشبي مقوى لتحطيم الدفاع' },
  { id: 'spear', name: 'رمح الفرسان الطويل', icon: '🔱', reach: 75, dmgMult: 1.2, speedMult: 0.95, color: '#f8fafc', guardColor: '#ef4444', handleColor: '#92400e', desc: 'رمح طويل بمسكة مزدوجة ومدى هجوم بعيد جداً' },
  { id: 'axe', name: 'فأس المعركة المزدوج', icon: '🪓', reach: 40, dmgMult: 1.45, speedMult: 0.88, color: '#94a3b8', guardColor: '#d97706', handleColor: '#451a03', desc: 'فأس فولاذي مزدوج النصل بواقية قبضة معدنية' },
  { id: 'daggers', name: 'خنجر القتال السريع', icon: '🔪', reach: 25, dmgMult: 1.1, speedMult: 1.3, color: '#f1f5f9', guardColor: '#f97316', handleColor: '#1e293b', desc: 'خنجر خفيف وسريع جداً مع واقية قبضة حديدية' },
];

export const ARENAS: ArenaDef[] = [
  { id: 'cyber', tag: 'حلبة كلاسيكية', icon: '🌃', name: 'مدينة السايبربانك', desc: 'حلبة قتالية متوازنة مع أبراج وإضاءة نيون', titleColorVar: 'var(--accent)' },
  { id: 'volcano', tag: 'حلبة كلاسيكية', icon: '🌋', name: 'فوهة البركان', desc: 'أجواء نارية مشتعلة وحبال حلبة متوهجة', titleColorVar: 'var(--secondary)' },
  { id: 'hazards', tag: 'حلبة تحدٍ • برق', icon: '⚡', name: 'حلبة فخاخ البرق', desc: 'مولدات طاقة علوية تطلق صواعق برق حقيقية', titleColorVar: 'var(--accent)' },
  { id: 'meteor', tag: 'حلبة تحدٍ • نيازك', icon: '☄️', name: 'حلبة النيازك الملتهبة', desc: 'صخور بركانية متساقطة تتشظى عند الاصطدام', titleColorVar: 'var(--primary)' },
  { id: 'laser', tag: 'حلبة تحدٍ • ليزر', icon: '🔴', name: 'حلبة الليزر الساقط', desc: 'باعثات ليزر علوية تهبط بأشعة حارقة نحو أرض الحلبة', titleColorVar: 'var(--primary)' },
  { id: 'storm', tag: 'حلبة العاصفة', icon: '⛈️', name: 'حلبة العاصفة', desc: 'مناطق سقوط واضحة على الأرض مع عواصف وصواعق مباشرة', titleColorVar: 'var(--accent)' },
];

export const MODES: ModeDef[] = [
  { num: '01', numStyle: 'default', mode: 'pvp', weaponMode: false, title: 'قتال يدوي — لاعب ضد لاعب', sub: 'مواجهة مباشرة على نفس الجهاز بدون أسلحة', badge: 'لاعبان' },
  { num: '02', numStyle: 'alt-1', mode: 'pve', weaponMode: false, title: 'قتال يدوي — لاعب ضد الكمبيوتر', sub: 'اختبر مهاراتك القتالية أمام خصم ذكي', badge: 'ضد الذكاء الاصطناعي' },
  { num: '03', numStyle: 'alt-2', mode: 'weapons_pvp', weaponMode: true, title: 'مود الأسلحة الفعلية (2P)', sub: 'أسلحة حقيقية بقبضة يد وواقية دون قدرات سحرية', badge: '2P أسلحة' },
  { num: '04', numStyle: 'alt-3', mode: 'weapons_pve', weaponMode: true, title: 'مود الأسلحة الفعلية (ضد AI)', sub: 'مبارزة بالأسلحة الواقعية ضد الذكاء الاصطناعي', badge: 'ضد AI' },
  { num: '05', numStyle: 'alt-1', mode: 'survival', weaponMode: false, title: 'وضع البقاء (Survival Arcade)', sub: 'اهزم موجات متتالية من المقاتلين والروبوتات', badge: 'Survival Arcade' },
  { num: '06', numStyle: 'alt-2', mode: 'challenge', weaponMode: false, title: 'تحدي تدمير الروبوت (30 ثانية)', sub: 'حطّم الروبوت المدرع قبل انتهاء المهلة الزمنية', badge: '30 ثانية' },
  { num: '07', numStyle: 'alt-1', mode: 'ladder', weaponMode: false, title: 'طور البطولة (Arcade Ladder)', sub: 'واجه 4 أبطال متدرجين في القوة حتى التتويج', badge: '4 مراحل' },
  { num: '08', numStyle: 'alt-2', mode: 'boss', weaponMode: false, title: 'البطل ضد الزعيم (Boss Gauntlet)', sub: 'واجه الزعيم الأسطوري بصحة مضاعفة وهالة طاقة مستمرة', badge: '👑 BOSS' },
  { num: '09', numStyle: 'alt-3', mode: 'training', weaponMode: false, title: 'وضع التدريب الحر (Training)', sub: 'طاقة وسوبر لا نهائية مع عدّاد ضرر وكمبو مباشر', badge: 'تدريب حر' },
];

export const CHROMA_PRESETS: ChromaPreset[] = [
  { id: 'default', label: 'الأصلي', swatch: '#94a3b8', accent: '#f8fafc' },
  { id: 'shadow', label: 'ظلامي', swatch: '#09090b', accent: '#f43f5e' },
  { id: 'royal_gold', label: 'ذهبي ملكي', swatch: '#78350f', accent: '#facc15' },
  { id: 'neon', label: 'نيون سايبر', swatch: '#064e3b', accent: '#22d3ee' },
];

export const MINI_CHALLENGES: MiniChallengeDef[] = [
  {
    id: 'none',
    title: 'بدون تحدٍ فرعي',
    desc: 'مباراة قياسية دون شروط إضافية',
    icon: '⚔️',
    badge: 'عادي',
  },
  {
    id: 'blitz_20',
    title: 'إنهاء الخصم في 20 ثانية',
    desc: 'اهزم خصمك خلال أقل من 20 ثانية لنيل الشارة',
    icon: '⏱️',
    badge: '≤ 20 ث',
  },
  {
    id: 'no_block',
    title: 'الفوز دون استخدام الصد',
    desc: 'انتصر في النزال مع 0 مرات صدّ اعتماداً على المراوغة والهجوم',
    icon: '🚫',
    badge: '0 صدّ',
  },
  {
    id: 'combo_5',
    title: 'تحقيق كومبو 5 ضربات',
    desc: 'نفّذ سلسلة كومبو من 5 ضربات متتالية على الأقل في القتال',
    icon: '💥',
    badge: '5x كومبو',
  },
];

export const PASSIVE_GUIDE_ITEMS = [
  { name: '⚔️ كازوما الساموراي', desc: 'فرصة 20% لصدّ الضربات تلقائياً (Parry).' },
  { name: '🦍 هرقل الجبّار', desc: 'درع خارق (Super Armor) يمنع التراجع من اللكمات الخفيفة.' },
  { name: '🥷 ظل الكوبرا', desc: 'انتقال خاطف خلف الخصم بضغطتين على زر الاندفاع.' },
  { name: '🔥 إفريت اللهب', desc: 'يترك نيراناً مشتعلة على الأرض تحرق الخصم.' },
  { name: '❄️ فالكيري الجليد', desc: 'ضرباتها تبطئ حركة الخصم مؤقتاً.' },
  { name: '🤖 سايبورغ أوميغا', desc: 'طلقات طاقة بعيدة المدى أسرع وأقوى.' },
  { name: '🦅 حورس الذهبي', desc: 'شحن طاقة السوبر أسرع بنسبة 35%.' },
  { name: '👻 شبح الفراعنة', desc: 'يمتص جزءاً من الصحة مع كل ضربة ناجحة.' },
  { name: '⚡ فارس الرعد', desc: 'ضرباته القوية تسبب صعقة كهربائية تشل الخصم لحظياً.' },
];

export const ACHIEVEMENTS_CATALOG: AchievementDef[] = [
  {
    id: 'first_strike',
    title: 'أسرع ضربة',
    desc: 'توجيه أول ضربة ناجحة في المواجهة قبل الخصم',
    icon: '⚡',
    rarity: 'common',
    xp: 50,
  },
  {
    id: 'invincible',
    title: 'مقاتل لا يقهر',
    desc: 'تحقيق الفوز في المعركة دون فقدان أي نقطة صحة (100% HP)',
    icon: '🛡️',
    rarity: 'legendary',
    xp: 250,
  },
  {
    id: 'comeback_king',
    title: 'العودة المستحيلة',
    desc: 'الانتصار بعد الهبوط إلى منطقة الخطر (25% صحة أو أقل)',
    icon: '🔥',
    rarity: 'epic',
    xp: 180,
  },
  {
    id: 'combo_master',
    title: 'ملك الكومبو',
    desc: 'تنفيذ سلسلة ضربات متتالية (Combo) من 4 ضربات فأكثر',
    icon: '💥',
    rarity: 'rare',
    xp: 120,
  },
  {
    id: 'iron_guard',
    title: 'الجدار الفولاذي',
    desc: 'صدّ 5 هجمات للخصم بنجاح خلال المعركة',
    icon: '🧱',
    rarity: 'rare',
    xp: 100,
  },
  {
    id: 'super_finisher',
    title: 'الضربة القاضية السينمائية',
    desc: 'توجيه ضربة سوبر خارقة (100% طاقة) بنجاح أثناء القتال',
    icon: '🎬',
    rarity: 'epic',
    xp: 140,
  },
  {
    id: 'ex_tactician',
    title: 'خبير حركات EX',
    desc: 'استخدام مهارة EX التكتيكية بنجاح في المواجهة',
    icon: '💠',
    rarity: 'common',
    xp: 75,
  },
  {
    id: 'clash_champion',
    title: 'بطل الاشتباك',
    desc: 'الانتصار في صراع القوة المباشر (Clash) ضد الخصم',
    icon: '⚔️',
    rarity: 'rare',
    xp: 110,
  },
  {
    id: 'blitz_victory',
    title: 'حسم البرق',
    desc: 'الفوز في المواجهة خلال أقل من 20 ثانية',
    icon: '⏱️',
    rarity: 'epic',
    xp: 160,
  },
  {
    id: 'arena_breaker',
    title: 'محطم الحلبة',
    desc: 'تدمير صناديق الحلبة التفاعلية أثناء المعركة',
    icon: '📦',
    rarity: 'common',
    xp: 60,
  },
  {
    id: 'legend_conqueror',
    title: 'أسطورة الساحة',
    desc: 'الفوز ببطولة المراحل الأربعة أو الصمود لـ 3 موجات في البقاء',
    icon: '🏆',
    rarity: 'legendary',
    xp: 300,
  },
  {
    id: 'boss_slayer',
    title: 'قاهر الزعماء',
    desc: 'الانتصار على الزعيم الأسطوري في وضع Boss Gauntlet',
    icon: '👑',
    rarity: 'legendary',
    xp: 320,
  },
];

export function applyOutfitChroma(outfit: Outfit, chroma: ChromaId = 'default'): Outfit {
  if (!chroma || chroma === 'default') return outfit;
  if (chroma === 'shadow') {
    return {
      ...outfit,
      name: `${outfit.name} (نسخة ظلامية)`,
      body: '#09090b',
      armor: '#f43f5e',
      belt: '#e2e8f0',
      boots: '#030712',
    };
  }
  if (chroma === 'royal_gold') {
    return {
      ...outfit,
      name: `${outfit.name} (نسخة ذهبية ملكية)`,
      body: '#1e1b4b',
      armor: '#facc15',
      belt: '#fef08a',
      boots: '#451a03',
    };
  }
  return {
    ...outfit,
    name: `${outfit.name} (نسخة نيون)`,
    body: '#042f2e',
    armor: '#22d3ee',
    belt: '#f472b6',
    boots: '#090d16',
  };
}

export function getCharOutfits(charIdx: number, gender: Gender, chroma: ChromaId = 'default'): Outfit[] {
  const char = CHARACTERS[charIdx] || CHARACTERS[0];
  const base =
    gender === 'female' && FEMALE_OUTFITS_BY_CHAR[char.id]
      ? FEMALE_OUTFITS_BY_CHAR[char.id]
      : char.outfits;
  return chroma === 'default' ? base : base.map((o) => applyOutfitChroma(o, chroma));
}

function hexToRgbTuple(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return [240, 120, 60];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function colorDist(hexA: string, hexB: string): number {
  const [r1, g1, b1] = hexToRgbTuple(hexA);
  const [r2, g2, b2] = hexToRgbTuple(hexB);
  return Math.hypot(r1 - r2, g1 - g2, b1 - b2);
}

const ARENA_ACCENT_HEX: Record<ArenaId, string> = {
  cyber: '#38bdf8',
  volcano: '#f97316',
  hazards: '#facc15',
  meteor: '#ef4444',
  laser: '#f43f5e',
  storm: '#22d3ee',
};

export function getThemeArenaHarmony(
  charIdx: number,
  gender: Gender,
  theme: ThemeConfig,
  arenaId: ArenaId
): { outfitIdx: number; weaponIdx: number; label: string } {
  const outfits = getCharOutfits(charIdx, gender);
  const targets = [theme.dots[0], theme.dots[1], theme.rope1, ARENA_ACCENT_HEX[arenaId] || theme.rope2];

  let bestOutfitIdx = 0;
  let bestOutfitScore = Infinity;
  outfits.forEach((o, idx) => {
    const d1 = Math.min(...targets.map((t) => colorDist(o.body, t)));
    const d2 = Math.min(...targets.map((t) => colorDist(o.armor, t)));
    const score = d1 * 0.55 + d2 * 0.45;
    if (score < bestOutfitScore) {
      bestOutfitScore = score;
      bestOutfitIdx = idx;
    }
  });

  const bestOutfit = outfits[bestOutfitIdx] || outfits[0];
  let bestWeaponIdx = 0;
  let bestWeaponScore = Infinity;
  WEAPONS.forEach((w, idx) => {
    const dGuard = Math.min(colorDist(w.guardColor, bestOutfit.armor), colorDist(w.guardColor, targets[0]));
    const dHandle = Math.min(colorDist(w.handleColor, bestOutfit.body), colorDist(w.color, bestOutfit.belt));
    const score = dGuard * 0.65 + dHandle * 0.35;
    if (score < bestWeaponScore) {
      bestWeaponScore = score;
      bestWeaponIdx = idx;
    }
  });

  const arenaName = ARENAS.find((a) => a.id === arenaId)?.name || 'الحلبة';
  return {
    outfitIdx: bestOutfitIdx,
    weaponIdx: bestWeaponIdx,
    label: `تناسق ${theme.label} × ${arenaName}`,
  };
}
