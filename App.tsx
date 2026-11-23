import React, { useEffect, useRef, useState } from 'react';
import { AchievementsScreen } from './components/AchievementsScreen';
import { BattleView } from './components/BattleView';
import { CinemaShowcaseScreen } from './components/CinemaShowcaseScreen';
import { GuideScreen } from './components/GuideScreen';
import {
  ACHIEVEMENTS_CATALOG,
  ARENAS,
  CHARACTERS,
  CHROMA_PRESETS,
  COLOR_THEMES,
  DEFAULT_MODIFIERS,
  MINI_CHALLENGES,
  MODES,
  STORAGE_KEY,
  WEAPONS,
  getCharOutfits,
  getThemeArenaHarmony,
} from './data/gameData';
import { drawPreviewCharacter } from './engine/renderer';
import {
  AiDifficulty,
  ArenaId,
  ChromaId,
  GameMode,
  Gender,
  MatchModifiers,
  MiniChallengeId,
  PostBattleResult,
  SavedPrefs,
  ScreenId,
} from './types/game';

function loadSavedPrefs(): SavedPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as SavedPrefs;
  } catch {
    return {};
  }
}

export default function App() {
  const initialPrefs = useRef<SavedPrefs>(loadSavedPrefs()).current;

  const [screen, setScreen] = useState<ScreenId>('menuScreen');
  const [themeIdx, setThemeIdx] = useState<number>(() => {
    const idx = initialPrefs.themeIdx ?? 0;
    return idx >= 0 && idx < COLOR_THEMES.length ? idx : 0;
  });

  const [gameMode, setGameMode] = useState<GameMode>('pve');
  const [weaponMode, setWeaponMode] = useState<boolean>(false);

  const [p1CharIdx, setP1CharIdx] = useState<number>(() => {
    const idx = initialPrefs.p1Char ?? 0;
    return idx >= 0 && idx < CHARACTERS.length ? idx : 0;
  });
  const [p2CharIdx, setP2CharIdx] = useState<number>(() => {
    const idx = initialPrefs.p2Char ?? 2;
    return idx >= 0 && idx < CHARACTERS.length ? idx : 2;
  });

  const [p1Gender, setP1Gender] = useState<Gender>(
    initialPrefs.p1Gender === 'female' ? 'female' : 'male'
  );
  const [p2Gender, setP2Gender] = useState<Gender>(
    initialPrefs.p2Gender === 'female' ? 'female' : 'male'
  );

  const [p1OutfitIdx, setP1OutfitIdx] = useState<number>(() => {
    const idx = initialPrefs.p1Outfit ?? 0;
    return idx >= 0 && idx < 4 ? idx : 0;
  });
  const [p2OutfitIdx, setP2OutfitIdx] = useState<number>(() => {
    const idx = initialPrefs.p2Outfit ?? 0;
    return idx >= 0 && idx < 4 ? idx : 0;
  });

  const [p1Chroma, setP1Chroma] = useState<ChromaId>(() => {
    const valid = CHROMA_PRESETS.some((c) => c.id === initialPrefs.p1Chroma);
    return valid && initialPrefs.p1Chroma ? initialPrefs.p1Chroma : 'default';
  });
  const [p2Chroma, setP2Chroma] = useState<ChromaId>(() => {
    const valid = CHROMA_PRESETS.some((c) => c.id === initialPrefs.p2Chroma);
    return valid && initialPrefs.p2Chroma ? initialPrefs.p2Chroma : 'default';
  });

  const [p1WeaponIdx, setP1WeaponIdx] = useState<number>(() => {
    const idx = initialPrefs.p1Weapon ?? 0;
    return idx >= 0 && idx < WEAPONS.length ? idx : 0;
  });
  const [p2WeaponIdx, setP2WeaponIdx] = useState<number>(() => {
    const idx = initialPrefs.p2Weapon ?? 1;
    return idx >= 0 && idx < WEAPONS.length ? idx : 1;
  });

  const [p1Name, setP1Name] = useState<string>(initialPrefs.p1Name ?? 'كازوما');
  const [p2Name, setP2Name] = useState<string>(initialPrefs.p2Name ?? 'الخصم');

  const [currentArena, setCurrentArena] = useState<ArenaId>(() => {
    const valid = ARENAS.some((a) => a.id === initialPrefs.arena);
    return valid && initialPrefs.arena ? initialPrefs.arena : 'cyber';
  });

  const [matchDuration, setMatchDuration] = useState<number>(
    initialPrefs.duration ?? 99
  );
  const [aiDifficulty, setAiDifficulty] = useState<AiDifficulty>(
    initialPrefs.aiDifficulty ?? 'medium'
  );
  const [isMuted, setIsMuted] = useState<boolean>(Boolean(initialPrefs.isMuted));
  const [modifiers, setModifiers] = useState<MatchModifiers>(() => ({
    speedPreset: initialPrefs.modifiers?.speedPreset === 'turbo' ? 'turbo' : DEFAULT_MODIFIERS.speedPreset,
    gravityPreset: initialPrefs.modifiers?.gravityPreset === 'low' ? 'low' : DEFAULT_MODIFIERS.gravityPreset,
    weaponRule:
      initialPrefs.modifiers?.weaponRule === 'none' || initialPrefs.modifiers?.weaponRule === 'heavy'
        ? initialPrefs.modifiers.weaponRule
        : DEFAULT_MODIFIERS.weaponRule,
  }));
  const [miniChallenge, setMiniChallenge] = useState<MiniChallengeId>(() => {
    const valid = MINI_CHALLENGES.some((c) => c.id === initialPrefs.miniChallenge);
    return valid && initialPrefs.miniChallenge ? initialPrefs.miniChallenge : 'none';
  });
  const [harmonyNotice, setHarmonyNotice] = useState<{ player: 1 | 2; text: string } | null>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(() => {
    const validIds = new Set(ACHIEVEMENTS_CATALOG.map((a) => a.id));
    return Array.isArray(initialPrefs.unlockedAchievements)
      ? initialPrefs.unlockedAchievements.filter((id) => validIds.has(id))
      : [];
  });
  const [postBattleResult, setPostBattleResult] = useState<PostBattleResult | null>(null);
  const [newlyUnlockedIds, setNewlyUnlockedIds] = useState<string[]>([]);

  const p1PreviewRef = useRef<HTMLCanvasElement | null>(null);
  const p2PreviewRef = useRef<HTMLCanvasElement | null>(null);

  const activeTheme = COLOR_THEMES[themeIdx] || COLOR_THEMES[0];

  // Sync theme to body[data-theme]
  useEffect(() => {
    if (activeTheme.id === 'red_orange_black') {
      document.body.removeAttribute('data-theme');
    } else {
      document.body.setAttribute('data-theme', activeTheme.id);
    }
  }, [activeTheme.id]);

  // Persist user preferences
  useEffect(() => {
    const payload: SavedPrefs = {
      themeIdx,
      p1Char: p1CharIdx,
      p2Char: p2CharIdx,
      p1Gender,
      p2Gender,
      p1Outfit: p1OutfitIdx,
      p2Outfit: p2OutfitIdx,
      p1Chroma,
      p2Chroma,
      p1Weapon: p1WeaponIdx,
      p2Weapon: p2WeaponIdx,
      p1Name,
      p2Name,
      arena: currentArena,
      duration: matchDuration,
      aiDifficulty,
      isMuted,
      modifiers,
      miniChallenge,
      unlockedAchievements,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  }, [
    themeIdx,
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
    isMuted,
    modifiers,
    miniChallenge,
    unlockedAchievements,
  ]);

  // Animate character preview canvases with theme energy sparks & subtle breathing
  useEffect(() => {
    if (screen !== 'charScreen') return;
    let rafId = 0;
    const renderPreviewFrame = (now: number) => {
      const animTime = now * 0.001;
      drawPreviewCharacter(p1PreviewRef.current, p1CharIdx, p1OutfitIdx, p1Gender, 1, {
        theme: activeTheme,
        animTime,
        chroma: p1Chroma,
      });
      drawPreviewCharacter(p2PreviewRef.current, p2CharIdx, p2OutfitIdx, p2Gender, -1, {
        theme: activeTheme,
        animTime: animTime + 1.4,
        chroma: p2Chroma,
      });
      rafId = requestAnimationFrame(renderPreviewFrame);
    };
    rafId = requestAnimationFrame(renderPreviewFrame);
    return () => cancelAnimationFrame(rafId);
  }, [
    screen,
    p1CharIdx,
    p1OutfitIdx,
    p1Gender,
    p1Chroma,
    p2CharIdx,
    p2OutfitIdx,
    p2Gender,
    p2Chroma,
    activeTheme,
  ]);

  const cycleColorTheme = () => {
    setThemeIdx((prev) => (prev + 1) % COLOR_THEMES.length);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const applyAutoHarmony = (playerNum: 1 | 2) => {
    const charIdx = playerNum === 1 ? p1CharIdx : p2CharIdx;
    const gender = playerNum === 1 ? p1Gender : p2Gender;
    const harmony = getThemeArenaHarmony(charIdx, gender, activeTheme, currentArena);
    if (playerNum === 1) {
      setP1OutfitIdx(harmony.outfitIdx);
      setP1WeaponIdx(harmony.weaponIdx);
    } else {
      setP2OutfitIdx(harmony.outfitIdx);
      setP2WeaponIdx(harmony.weaponIdx);
    }
    const weaponName = WEAPONS[harmony.weaponIdx]?.name || '';
    setHarmonyNotice({
      player: playerNum,
      text: `${harmony.label} • السلاح: ${weaponName}`,
    });
  };

  const handleMatchComplete = (result: PostBattleResult) => {
    const newIds: string[] = [];
    const existing = new Set(unlockedAchievements);

    result.earnedAchievements.forEach((ach) => {
      const earnedByBot = !ach.holderIsP1 && result.p2Stats.isBot;
      if (!earnedByBot && !existing.has(ach.def.id) && !newIds.includes(ach.def.id)) {
        newIds.push(ach.def.id);
      }
    });

    if (newIds.length > 0) {
      setUnlockedAchievements((prev) => [...prev, ...newIds]);
    }
    setNewlyUnlockedIds(newIds);
    setPostBattleResult(result);
    setScreen('achievementsScreen');
  };

  const startModeSelection = (mode: GameMode, isWeaponMode: boolean) => {
    setGameMode(mode);
    setWeaponMode(isWeaponMode);
    if (mode === 'pve' || mode === 'weapons_pve') {
      setP2Name((prev) => (prev === 'اللاعب 2' || !prev.trim() ? 'الكمبيوتر AI' : prev));
    } else if (mode === 'survival') {
      setP2Name('الناجي 1');
    } else if (mode === 'challenge') {
      setP2Name('روبوت التدريع');
    } else if (mode === 'ladder') {
      setP2Name('منافس البطولة');
    } else if (mode === 'boss') {
      setP2Name('الزعيم الأسطوري');
    } else if (mode === 'training') {
      setP2Name('هدف التدريب');
    } else {
      setP2Name((prev) => (prev === 'الكمبيوتر AI' || !prev.trim() ? 'اللاعب 2' : prev));
    }
    setScreen('charScreen');
  };

  const p1Char = CHARACTERS[p1CharIdx] || CHARACTERS[0];
  const p2Char = CHARACTERS[p2CharIdx] || CHARACTERS[0];
  const p1Outfits = getCharOutfits(p1CharIdx, p1Gender, p1Chroma);
  const p2Outfits = getCharOutfits(p2CharIdx, p2Gender, p2Chroma);
  const p1CurrentOutfit = p1Outfits[p1OutfitIdx] || p1Outfits[0];
  const p2CurrentOutfit = p2Outfits[p2OutfitIdx] || p2Outfits[0];

  const isTwoPlayerMode = gameMode === 'pvp' || gameMode === 'weapons_pvp';
  const showAiDifficulty =
    gameMode === 'pve' ||
    gameMode === 'weapons_pve' ||
    gameMode === 'survival' ||
    gameMode === 'ladder';

  return (
    <div id="app" dir="rtl">
      {/* Floating Theme Switcher Button (Visible on Menu Screen) */}
      {screen === 'menuScreen' && (
        <button
          id="themeSwitcherBtn"
          type="button"
          onClick={cycleColorTheme}
          title="تبديل نظام الألوان"
          className="fixed top-4 left-4 z-50 flex items-center gap-2.5 px-3.5 py-2 rounded-full text-xs font-black cursor-pointer transition-transform hover:scale-105"
          style={{
            background: 'var(--surface-2)',
            border: '1.5px solid var(--border-main)',
            color: 'var(--text-main)',
            boxShadow: '0 6px 24px rgba(0,0,0,0.75), 0 0 16px var(--glow-primary)',
          }}
        >
          <span className="flex items-center gap-1">
            {activeTheme.dots.map((dot, i) => (
              <span
                key={i}
                className="w-3 h-3 rounded-full inline-block border border-white/40"
                style={{ backgroundColor: dot }}
              />
            ))}
          </span>
          <span>🎨 {activeTheme.label}</span>
        </button>
      )}

      {/* 1. MAIN MENU SCREEN */}
      {screen === 'menuScreen' && (
        <div className="screen pt-8 pb-5">
          <div className="w-full max-w-[1060px] flex flex-col items-center text-center gap-2">
            <div
              className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-black tracking-wider"
              style={{
                background: 'var(--glow-primary)',
                border: '1px solid var(--border-main)',
                color: 'var(--accent)',
              }}
            >
              <span>⚔️</span>
              <span>AREN-LEGENG ساحة الأساطير</span>
              <span>🔥</span>
            </div>

            <h1 className="title-gradient text-3xl sm:text-[42px] m-0">
              AREN-LEGENG — ساحة الأساطير
            </h1>
            <p className="text-xs sm:text-sm max-w-[680px] m-0" style={{ color: 'var(--text-muted)' }}>
              لعبة قتال ثنائية الأبعاد بتصميم قتالي متكامل، 9 أبطال بقدرات خاصة وأزياء متعددة للذكر والأنثى، 6 أسلحة واقعية، و6 حلبات ديناميكية.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
              {[
                '🎨 6 أوضاع ألوان',
                '🏟️ 6 حلبات قتال وتحدٍ',
                '👘 36 زياً مختلفاً',
                '🧬 9 × 2 ذكر وأنثى',
                `🏆 ${unlockedAchievements.length} / ${ACHIEVEMENTS_CATALOG.length} إنجازات`,
              ].map((stat, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg text-[11px] font-bold"
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--accent-soft)',
                  }}
                >
                  {stat}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-[1060px] my-3">
            {MODES.map((m) => (
              <button
                key={m.mode}
                type="button"
                onClick={() => startModeSelection(m.mode, m.weaponMode)}
                className="text-right rounded-[14px] p-3.5 cursor-pointer transition-all hover:-translate-y-1 flex flex-col justify-between gap-2"
                style={{
                  background: 'linear-gradient(145deg, var(--surface-2), var(--surface-3))',
                  border: '1.5px solid var(--border-subtle)',
                  boxShadow: '0 8px 22px rgba(0,0,0,0.65)',
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className="text-xs font-black px-2 py-0.5 rounded-md tabular-nums"
                    style={{
                      background:
                        m.numStyle === 'alt-1'
                          ? 'var(--glow-secondary)'
                          : m.numStyle === 'alt-2'
                            ? 'rgba(250, 204, 21, 0.16)'
                            : m.numStyle === 'alt-3'
                              ? 'rgba(56, 189, 248, 0.16)'
                              : 'var(--glow-primary)',
                      color: 'var(--accent)',
                      border: '1px solid var(--border-main)',
                    }}
                  >
                    {m.num}
                  </span>
                  <span
                    className="text-[11px] font-black px-2 py-0.5 rounded-md"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      color: 'var(--accent-soft)',
                    }}
                  >
                    {m.badge}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-black mb-1" style={{ color: 'var(--text-main)' }}>
                    {m.title}
                  </div>
                  <div className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {m.sub}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-[1060px]">
            <button
              type="button"
              onClick={() => setScreen('guideScreen')}
              className="px-5 py-2.5 rounded-xl text-sm font-black cursor-pointer transition-transform hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(90deg, var(--surface-2), var(--surface-3))',
                border: '1.5px solid var(--border-main)',
                color: 'var(--accent-soft)',
              }}
            >
              📖 دليل الحركات والقدرات ؟
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className="px-5 py-2.5 rounded-xl text-sm font-black cursor-pointer transition-transform hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(90deg, var(--surface-2), var(--surface-3))',
                border: '1.5px solid var(--border-subtle)',
                color: isMuted ? '#fda4af' : '#86efac',
              }}
            >
              {isMuted ? '🔇 الصوت مكتوم' : '🔊 الصوت مفعل'}
            </button>
          </div>
        </div>
      )}

      {/* 2. GUIDE SCREEN */}
      {screen === 'guideScreen' && (
        <GuideScreen
          onBack={() => setScreen('menuScreen')}
          onNextToChars={() => startModeSelection('pve', false)}
        />
      )}

      {/* 3. CHARACTER SELECTION SCREEN */}
      {screen === 'charScreen' && (
        <div className="screen pt-5 pb-4">
          <div className="w-full max-w-[1160px] flex items-center justify-between gap-3 flex-wrap">
            <span
              className="px-3 py-1 rounded-full text-xs font-black"
              style={{
                background: 'var(--glow-primary)',
                color: 'var(--accent)',
                border: '1px solid var(--border-main)',
              }}
            >
              {MODES.find((m) => m.mode === gameMode)?.title || 'اختيار المقاتلين'}
            </span>
            <h1 className="title-gradient text-2xl sm:text-[26px] m-0 text-center">
              ⚔️ اختر المقاتل والنوع والزي
            </h1>
            <button
              type="button"
              onClick={toggleMute}
              className="px-3.5 py-1.5 rounded-lg text-xs font-black cursor-pointer"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border-subtle)',
                color: isMuted ? '#fda4af' : '#86efac',
              }}
            >
              {isMuted ? '🔇 مكتوم' : '🔊 الصوت'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full max-w-[1160px] my-2 flex-1">
            {/* PLAYER 1 PANEL */}
            <div
              className="player-panel-glow rounded-[16px] p-3.5 flex flex-col justify-between gap-2.5"
              style={{
                background: 'linear-gradient(155deg, var(--surface-2), var(--surface-3))',
                border: '2px solid var(--primary)',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-black" style={{ color: 'var(--primary)' }}>
                  🔵 اللاعب الأول (P1)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setP1Gender('male')}
                    className="px-2.5 py-1 rounded-lg text-xs font-black cursor-pointer"
                    style={{
                      background: p1Gender === 'male' ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                      color: p1Gender === 'male' ? 'var(--btn-text-dark)' : 'var(--text-main)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    ♂ ذكر
                  </button>
                  <button
                    type="button"
                    onClick={() => setP1Gender('female')}
                    className="px-2.5 py-1 rounded-lg text-xs font-black cursor-pointer"
                    style={{
                      background: p1Gender === 'female' ? '#ec4899' : 'rgba(255,255,255,0.06)',
                      color: p1Gender === 'female' ? '#fff' : 'var(--text-main)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    ♀ أنثى
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                <div
                  className="rounded-xl p-1.5 flex items-center justify-center shrink-0"
                  style={{
                    background: 'radial-gradient(circle, var(--glow-primary) 0%, rgba(0,0,0,0.65) 75%)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <canvas ref={p1PreviewRef} width={126} height={154} />
                </div>

                <div className="flex-1 min-w-[190px] flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{p1Char.icon}</span>
                    <span className="text-base font-black" style={{ color: 'var(--text-main)' }}>
                      {p1Char.name}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={p1Name}
                    maxLength={14}
                    onChange={(e) => setP1Name(e.target.value)}
                    placeholder="اسم اللاعب 1"
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs font-bold outline-none"
                    style={{
                      background: 'rgba(0,0,0,0.45)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-main)',
                    }}
                  />
                  <div
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--accent)',
                    }}
                  >
                    ⚡ {p1Char.passiveText}
                  </div>
                  <button
                    type="button"
                    onClick={() => setP1OutfitIdx((prev) => (prev + 1) % 4)}
                    className="w-full py-1.5 px-2.5 rounded-lg text-xs font-black cursor-pointer text-right flex items-center justify-between"
                    style={{
                      background: 'linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
                      border: '1px solid var(--border-main)',
                      color: 'var(--accent-soft)',
                    }}
                  >
                    <span className="truncate">👘 {p1CurrentOutfit.name}</span>
                    <span className="tabular-nums opacity-90 shrink-0 mr-1">{p1OutfitIdx + 1}/4</span>
                  </button>
                  <div className="grid grid-cols-4 gap-1">
                    {CHROMA_PRESETS.map((cp) => {
                      const active = p1Chroma === cp.id;
                      return (
                        <button
                          key={cp.id}
                          type="button"
                          onClick={() => setP1Chroma(cp.id)}
                          className="px-1.5 py-1 rounded-md text-[10px] font-black cursor-pointer flex items-center justify-center gap-1 truncate"
                          style={{
                            background: active ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.32)',
                            border: active ? `1.5px solid ${cp.accent}` : '1px solid var(--border-subtle)',
                            color: active ? cp.accent : 'var(--text-muted)',
                          }}
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: cp.accent, border: '1px solid rgba(255,255,255,0.4)' }}
                          />
                          <span className="truncate">{cp.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => applyAutoHarmony(1)}
                    className="w-full py-1.5 px-2.5 rounded-lg text-[11px] font-black cursor-pointer text-right flex items-center justify-between transition-transform hover:scale-[1.01]"
                    style={{
                      background: 'linear-gradient(90deg, var(--glow-primary), rgba(255,255,255,0.04))',
                      border: '1px solid var(--accent)',
                      color: 'var(--accent)',
                    }}
                  >
                    <span>✨ تناسق تلقائي مع الثيم والحلبة</span>
                    <span className="text-[10px] opacity-85">{WEAPONS[p1WeaponIdx]?.icon}</span>
                  </button>
                  {harmonyNotice?.player === 1 && (
                    <div className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/40" style={{ color: '#86efac' }}>
                      ✓ {harmonyNotice.text}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {CHARACTERS.map((ch, idx) => {
                  const selected = idx === p1CharIdx;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => {
                        setP1CharIdx(idx);
                        setP1Name(ch.name.split(' ')[0]);
                      }}
                      className="rounded-xl p-2 text-center cursor-pointer transition-all flex flex-col items-center gap-0.5"
                      style={{
                        background: selected
                          ? 'linear-gradient(135deg, var(--primary), var(--secondary))'
                          : 'rgba(255,255,255,0.04)',
                        border: selected
                          ? '1.5px solid var(--accent)'
                          : '1px solid var(--border-subtle)',
                        color: selected ? 'var(--btn-text-dark)' : 'var(--text-main)',
                      }}
                    >
                      <span className="text-lg leading-none">{ch.icon}</span>
                      <span className="text-[11px] font-black truncate w-full">{ch.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PLAYER 2 / OPPONENT PANEL */}
            <div
              className="player-panel-glow rounded-[16px] p-3.5 flex flex-col justify-between gap-2.5"
              style={{
                background: 'linear-gradient(155deg, var(--surface-2), var(--surface-3))',
                border: '2px solid var(--secondary)',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-black" style={{ color: 'var(--secondary)' }}>
                  🔴 {isTwoPlayerMode ? 'اللاعب الثاني (P2)' : 'الخصم / المقاتل الثاني'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setP2Gender('male')}
                    className="px-2.5 py-1 rounded-lg text-xs font-black cursor-pointer"
                    style={{
                      background: p2Gender === 'male' ? 'var(--secondary)' : 'rgba(255,255,255,0.06)',
                      color: p2Gender === 'male' ? 'var(--btn-text-dark)' : 'var(--text-main)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    ♂ ذكر
                  </button>
                  <button
                    type="button"
                    onClick={() => setP2Gender('female')}
                    className="px-2.5 py-1 rounded-lg text-xs font-black cursor-pointer"
                    style={{
                      background: p2Gender === 'female' ? '#ec4899' : 'rgba(255,255,255,0.06)',
                      color: p2Gender === 'female' ? '#fff' : 'var(--text-main)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    ♀ أنثى
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                <div
                  className="rounded-xl p-1.5 flex items-center justify-center shrink-0"
                  style={{
                    background: 'radial-gradient(circle, var(--glow-secondary) 0%, rgba(0,0,0,0.65) 75%)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <canvas ref={p2PreviewRef} width={126} height={154} />
                </div>

                <div className="flex-1 min-w-[190px] flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{p2Char.icon}</span>
                    <span className="text-base font-black" style={{ color: 'var(--text-main)' }}>
                      {p2Char.name}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={p2Name}
                    maxLength={14}
                    onChange={(e) => setP2Name(e.target.value)}
                    placeholder="اسم الخصم"
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs font-bold outline-none"
                    style={{
                      background: 'rgba(0,0,0,0.45)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-main)',
                    }}
                  />
                  <div
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--accent)',
                    }}
                  >
                    ⚡ {p2Char.passiveText}
                  </div>
                  <button
                    type="button"
                    onClick={() => setP2OutfitIdx((prev) => (prev + 1) % 4)}
                    className="w-full py-1.5 px-2.5 rounded-lg text-xs font-black cursor-pointer text-right flex items-center justify-between"
                    style={{
                      background: 'linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
                      border: '1px solid var(--border-main)',
                      color: 'var(--accent-soft)',
                    }}
                  >
                    <span className="truncate">👘 {p2CurrentOutfit.name}</span>
                    <span className="tabular-nums opacity-90 shrink-0 mr-1">{p2OutfitIdx + 1}/4</span>
                  </button>
                  <div className="grid grid-cols-4 gap-1">
                    {CHROMA_PRESETS.map((cp) => {
                      const active = p2Chroma === cp.id;
                      return (
                        <button
                          key={cp.id}
                          type="button"
                          onClick={() => setP2Chroma(cp.id)}
                          className="px-1.5 py-1 rounded-md text-[10px] font-black cursor-pointer flex items-center justify-center gap-1 truncate"
                          style={{
                            background: active ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.32)',
                            border: active ? `1.5px solid ${cp.accent}` : '1px solid var(--border-subtle)',
                            color: active ? cp.accent : 'var(--text-muted)',
                          }}
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: cp.accent, border: '1px solid rgba(255,255,255,0.4)' }}
                          />
                          <span className="truncate">{cp.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => applyAutoHarmony(2)}
                    className="w-full py-1.5 px-2.5 rounded-lg text-[11px] font-black cursor-pointer text-right flex items-center justify-between transition-transform hover:scale-[1.01]"
                    style={{
                      background: 'linear-gradient(90deg, var(--glow-secondary), rgba(255,255,255,0.04))',
                      border: '1px solid var(--accent)',
                      color: 'var(--accent)',
                    }}
                  >
                    <span>✨ تناسق تلقائي مع الثيم والحلبة</span>
                    <span className="text-[10px] opacity-85">{WEAPONS[p2WeaponIdx]?.icon}</span>
                  </button>
                  {harmonyNotice?.player === 2 && (
                    <div className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/40" style={{ color: '#86efac' }}>
                      ✓ {harmonyNotice.text}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {CHARACTERS.map((ch, idx) => {
                  const selected = idx === p2CharIdx;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => {
                        setP2CharIdx(idx);
                        if (isTwoPlayerMode) {
                          setP2Name(ch.name.split(' ')[0]);
                        }
                      }}
                      className="rounded-xl p-2 text-center cursor-pointer transition-all flex flex-col items-center gap-0.5"
                      style={{
                        background: selected
                          ? 'linear-gradient(135deg, var(--secondary), var(--primary))'
                          : 'rgba(255,255,255,0.04)',
                        border: selected
                          ? '1.5px solid var(--accent)'
                          : '1px solid var(--border-subtle)',
                        color: selected ? 'var(--btn-text-dark)' : 'var(--text-main)',
                      }}
                    >
                      <span className="text-lg leading-none">{ch.icon}</span>
                      <span className="text-[11px] font-black truncate w-full">{ch.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Unified Hero Profile Card Summary (بطاقة ملف البطل) */}
          <div
            className="w-full max-w-[1160px] rounded-2xl px-4 py-2.5 grid grid-cols-1 lg:grid-cols-2 gap-3 mb-1.5"
            style={{
              background: 'linear-gradient(145deg, var(--surface-2), var(--surface-3))',
              border: '1px solid var(--border-main)',
            }}
          >
            {[
              {
                label: '🪪 بطاقة ملف البطل (P1)',
                color: 'var(--primary)',
                char: p1Char,
                gender: p1Gender,
                outfitName: p1CurrentOutfit.name,
                chromaLabel: CHROMA_PRESETS.find((c) => c.id === p1Chroma)?.label || 'الأصلي',
                weapon: WEAPONS[p1WeaponIdx] || WEAPONS[0],
              },
              {
                label: gameMode === 'boss' ? '👑 بطاقة الزعيم (P2 BOSS)' : '🪪 بطاقة ملف الخصم (P2)',
                color: 'var(--secondary)',
                char: p2Char,
                gender: p2Gender,
                outfitName: p2CurrentOutfit.name,
                chromaLabel: CHROMA_PRESETS.find((c) => c.id === p2Chroma)?.label || 'الأصلي',
                weapon: WEAPONS[p2WeaponIdx] || WEAPONS[0],
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className="flex flex-wrap items-center justify-between gap-2 text-[11px] px-2.5 py-1.5 rounded-xl"
                style={{ background: 'rgba(0,0,0,0.34)', border: '1px solid var(--border-subtle)' }}
              >
                <div className="flex items-center gap-1.5 font-black" style={{ color: card.color }}>
                  <span>{card.char.icon}</span>
                  <span>{card.label}:</span>
                  <span style={{ color: 'var(--text-main)' }}>
                    {card.char.name} ({card.gender === 'female' ? 'أنثى' : 'ذكر'})
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 font-bold">
                  <span className="px-2 py-0.5 rounded bg-white/5" style={{ color: 'var(--accent-soft)' }}>
                    👘 {card.outfitName}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/5" style={{ color: '#fde047' }}>
                    🎨 {card.chromaLabel}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/5" style={{ color: '#7dd3fc' }}>
                    {weaponMode ? `${card.weapon.icon} ${card.weapon.name}` : '🥊 قتال يدوي'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-[1160px]">
            <button
              type="button"
              onClick={() => setScreen('menuScreen')}
              className="px-6 py-2.5 rounded-xl text-sm font-black cursor-pointer"
              style={{
                background: 'linear-gradient(90deg, var(--surface-2), var(--surface-3))',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
              }}
            >
              ➔ رجوع للقائمة الرئيسية
            </button>
            <button
              type="button"
              onClick={() => setScreen('cinemaScreen')}
              className="px-6 py-2.5 rounded-xl text-sm font-black cursor-pointer"
              style={{
                background: 'linear-gradient(90deg, #4c1d95, #be185d)',
                border: '1.5px solid var(--accent)',
                color: '#ffffff',
                boxShadow: '0 6px 20px var(--glow-primary)',
              }}
            >
              🎬 عرض الشخصيات السينمائية
            </button>
            <button
              type="button"
              onClick={() => setScreen(weaponMode ? 'weaponScreen' : 'arenaScreen')}
              className="px-8 py-2.5 rounded-xl text-sm font-black cursor-pointer"
              style={{
                background: 'linear-gradient(90deg, var(--primary), var(--secondary), var(--accent))',
                color: 'var(--btn-text-dark)',
              }}
            >
              التالي ⬅️
            </button>
          </div>
        </div>
      )}

      {/* 4. CINEMA SHOWCASE SCREEN (Feature from File 2, Graphics from File 1) */}
      {screen === 'cinemaScreen' && (
        <CinemaShowcaseScreen
          initialCharIdx={p1CharIdx}
          initialOutfitIdx={p1OutfitIdx}
          initialGender={p1Gender}
          initialChroma={p1Chroma}
          initialWeaponIdx={weaponMode ? p1WeaponIdx : null}
          theme={activeTheme}
          currentArena={currentArena}
          onBackToChars={() => setScreen('charScreen')}
          onProceedNext={() => setScreen(weaponMode ? 'weaponScreen' : 'arenaScreen')}
          onApplyToPlayer={(playerNum, charIdx, outfitIdx, gender, weaponIdx, chroma) => {
            if (playerNum === 1) {
              setP1CharIdx(charIdx);
              setP1OutfitIdx(outfitIdx);
              setP1Gender(gender);
              setP1Chroma(chroma);
              setP1Name(CHARACTERS[charIdx]?.name.split(' ')[0] || 'كازوما');
              if (weaponIdx !== null) {
                setP1WeaponIdx(weaponIdx);
              }
            } else {
              setP2CharIdx(charIdx);
              setP2OutfitIdx(outfitIdx);
              setP2Gender(gender);
              setP2Chroma(chroma);
              if (isTwoPlayerMode) {
                setP2Name(CHARACTERS[charIdx]?.name.split(' ')[0] || 'الخصم');
              }
              if (weaponIdx !== null) {
                setP2WeaponIdx(weaponIdx);
              }
            }
            setScreen('charScreen');
          }}
        />
      )}

      {/* 5. WEAPON SELECTION SCREEN */}
      {screen === 'weaponScreen' && (
        <div className="screen pt-6 pb-5">
          <div className="w-full max-w-[1140px] flex items-center justify-between gap-3 flex-wrap">
            <span
              className="px-3 py-1 rounded-full text-xs font-black"
              style={{
                background: 'var(--glow-primary)',
                color: 'var(--accent)',
                border: '1px solid var(--border-main)',
              }}
            >
              WEAPONS ARSENAL
            </span>
            <h1 className="title-gradient text-2xl sm:text-[28px] m-0 text-center">
              🗡️ ترسانة الأسلحة الواقعية
            </h1>
            <button
              type="button"
              onClick={() => setScreen('charScreen')}
              className="px-4 py-2 rounded-xl text-xs font-black cursor-pointer"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
              }}
            >
              ➔ رجوع للشخصيات
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full max-w-[1140px] my-3 flex-1">
            {[
              {
                title: `🔵 سلاح ${p1Name || 'اللاعب 1'}`,
                selectedIdx: p1WeaponIdx,
                onSelect: setP1WeaponIdx,
                borderColor: 'var(--primary)',
              },
              {
                title: `🔴 سلاح ${p2Name || 'الخصم'}`,
                selectedIdx: p2WeaponIdx,
                onSelect: setP2WeaponIdx,
                borderColor: 'var(--secondary)',
              },
            ].map((panel, pIdx) => (
              <div
                key={pIdx}
                className="rounded-[16px] p-4 flex flex-col gap-3"
                style={{
                  background: 'linear-gradient(155deg, var(--surface-2), var(--surface-3))',
                  border: `2px solid ${panel.borderColor}`,
                }}
              >
                <div className="text-base font-black" style={{ color: panel.borderColor }}>
                  {panel.title}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1">
                  {WEAPONS.map((w, wIdx) => {
                    const selected = wIdx === panel.selectedIdx;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => panel.onSelect(wIdx)}
                        className="text-right rounded-xl p-3 cursor-pointer transition-all flex flex-col justify-between gap-1.5"
                        style={{
                          background: selected
                            ? 'linear-gradient(135deg, var(--glow-primary), var(--surface-2))'
                            : 'rgba(255,255,255,0.03)',
                          border: selected
                            ? '1.5px solid var(--accent)'
                            : '1px solid var(--border-subtle)',
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-black" style={{ color: 'var(--text-main)' }}>
                            {w.icon} {w.name}
                          </span>
                        </div>
                        <p className="text-[11px] m-0 leading-snug" style={{ color: 'var(--text-muted)' }}>
                          {w.desc}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-black mt-1">
                          <span style={{ color: 'var(--accent)' }}>الضرر ×{w.dmgMult}</span>
                          <span style={{ color: '#38bdf8' }}>المدى +{w.reach}</span>
                          <span style={{ color: '#4ade80' }}>السرعة ×{w.speedMult}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setScreen('charScreen')}
              className="px-6 py-2.5 rounded-xl text-sm font-black cursor-pointer"
              style={{
                background: 'linear-gradient(90deg, var(--surface-2), var(--surface-3))',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
              }}
            >
              ➔ رجوع للشخصيات
            </button>
            <button
              type="button"
              onClick={() => setScreen('arenaScreen')}
              className="px-8 py-2.5 rounded-xl text-sm font-black cursor-pointer"
              style={{
                background: 'linear-gradient(90deg, var(--primary), var(--secondary), var(--accent))',
                color: 'var(--btn-text-dark)',
              }}
            >
              اختيار الحلبة ⬅️
            </button>
          </div>
        </div>
      )}

      {/* 6. ARENA & SETTINGS SCREEN */}
      {screen === 'arenaScreen' && (
        <div className="screen pt-6 pb-5">
          <div className="w-full max-w-[1120px] flex items-center justify-between gap-3 flex-wrap">
            <span
              className="px-3 py-1 rounded-full text-xs font-black"
              style={{
                background: 'var(--glow-primary)',
                color: 'var(--accent)',
                border: '1px solid var(--border-main)',
              }}
            >
              ARENA & RULES
            </span>
            <h1 className="title-gradient text-2xl sm:text-[28px] m-0 text-center">
              🏟️ اختر حلبة القتال وإعدادات المواجهة
            </h1>
            <button
              type="button"
              onClick={() => setScreen(weaponMode ? 'weaponScreen' : 'charScreen')}
              className="px-4 py-2 rounded-xl text-xs font-black cursor-pointer"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
              }}
            >
              ➔ رجوع
            </button>
          </div>

          <div className="w-full max-w-[1120px] flex flex-col gap-3 my-2">
            {/* Duration & AI Difficulty Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                className="rounded-xl p-3 flex items-center justify-between gap-2 flex-wrap"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <span className="text-xs font-black" style={{ color: 'var(--accent-soft)' }}>
                  ⏱️ مدة الجولة:
                </span>
                <div className="flex items-center gap-2">
                  {[
                    { val: 99, label: '99 ثانية' },
                    { val: 150, label: '150 ثانية' },
                    { val: 999, label: 'وقت مفتوح ∞' },
                  ].map((d) => (
                    <button
                      key={d.val}
                      type="button"
                      onClick={() => setMatchDuration(d.val)}
                      className="px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer"
                      style={{
                        background:
                          matchDuration === d.val
                            ? 'linear-gradient(90deg, var(--primary), var(--secondary))'
                            : 'rgba(255,255,255,0.06)',
                        color: matchDuration === d.val ? 'var(--btn-text-dark)' : 'var(--text-main)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {showAiDifficulty && (
                <div
                  className="rounded-xl p-3 flex items-center justify-between gap-2 flex-wrap"
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <span className="text-xs font-black" style={{ color: 'var(--accent-soft)' }}>
                    🤖 مستوى الذكاء الاصطناعي:
                  </span>
                  <div className="flex items-center gap-2">
                    {[
                      { val: 'easy' as AiDifficulty, label: 'سهل' },
                      { val: 'medium' as AiDifficulty, label: 'متوسط' },
                      { val: 'legendary' as AiDifficulty, label: 'أسطوري' },
                    ].map((lvl) => (
                      <button
                        key={lvl.val}
                        type="button"
                        onClick={() => setAiDifficulty(lvl.val)}
                        className="px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer"
                        style={{
                          background:
                            aiDifficulty === lvl.val
                              ? 'linear-gradient(90deg, var(--secondary), var(--accent))'
                              : 'rgba(255,255,255,0.06)',
                          color:
                            aiDifficulty === lvl.val ? 'var(--btn-text-dark)' : 'var(--text-main)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Match Modifiers (Speed, Gravity, Weapon Rules) */}
            <div
              className="rounded-xl p-3 grid grid-cols-1 lg:grid-cols-3 gap-3"
              style={{
                background: 'linear-gradient(145deg, var(--surface-2), var(--surface-3))',
                border: '1px solid var(--border-main)',
              }}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-black" style={{ color: 'var(--accent-soft)' }}>
                  ⚡ سرعة اللعب:
                </span>
                <div className="flex items-center gap-1.5">
                  {[
                    { val: 'normal' as const, label: 'عادي' },
                    { val: 'turbo' as const, label: '🔥 تيربو' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setModifiers((prev) => ({ ...prev, speedPreset: opt.val }))}
                      className="px-2.5 py-1 rounded-lg text-xs font-black cursor-pointer"
                      style={{
                        background:
                          modifiers.speedPreset === opt.val
                            ? 'linear-gradient(90deg, var(--primary), var(--secondary))'
                            : 'rgba(255,255,255,0.06)',
                        color: modifiers.speedPreset === opt.val ? 'var(--btn-text-dark)' : 'var(--text-main)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-black" style={{ color: 'var(--accent-soft)' }}>
                  🪐 الجاذبية:
                </span>
                <div className="flex items-center gap-1.5">
                  {[
                    { val: 'normal' as const, label: 'عادية' },
                    { val: 'low' as const, label: 'منخفضة' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setModifiers((prev) => ({ ...prev, gravityPreset: opt.val }))}
                      className="px-2.5 py-1 rounded-lg text-xs font-black cursor-pointer"
                      style={{
                        background:
                          modifiers.gravityPreset === opt.val
                            ? 'linear-gradient(90deg, #0ea5e9, #6366f1)'
                            : 'rgba(255,255,255,0.06)',
                        color: modifiers.gravityPreset === opt.val ? '#ffffff' : 'var(--text-main)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-black" style={{ color: 'var(--accent-soft)' }}>
                  ⚔️ قانون الأسلحة:
                </span>
                <div className="flex items-center gap-1.5">
                  {[
                    { val: 'default' as const, label: 'افتراضي' },
                    { val: 'none' as const, label: 'بدون سلاح' },
                    { val: 'heavy' as const, label: 'ثقيلة فقط' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setModifiers((prev) => ({ ...prev, weaponRule: opt.val }))}
                      className="px-2.5 py-1 rounded-lg text-xs font-black cursor-pointer"
                      style={{
                        background:
                          modifiers.weaponRule === opt.val
                            ? 'linear-gradient(90deg, var(--secondary), var(--accent))'
                            : 'rgba(255,255,255,0.06)',
                        color: modifiers.weaponRule === opt.val ? 'var(--btn-text-dark)' : 'var(--text-main)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mini Challenges Selector */}
            <div
              className="rounded-xl p-3 flex flex-col gap-2"
              style={{
                background: 'linear-gradient(145deg, var(--surface-2), var(--surface-3))',
                border: '1px solid var(--border-main)',
              }}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-black" style={{ color: 'var(--accent)' }}>
                  🎯 أطوار التحدي القصيرة (Mini Challenges):
                </span>
                <span className="text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>
                  أكمل الشرط خلال المواجهة لنيل شارة التحدي في تقرير المعركة
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {MINI_CHALLENGES.map((mc) => {
                  const selected = miniChallenge === mc.id;
                  return (
                    <button
                      key={mc.id}
                      type="button"
                      onClick={() => setMiniChallenge(mc.id)}
                      className="text-right rounded-xl p-2.5 cursor-pointer transition-all flex flex-col justify-between gap-1"
                      style={{
                        background: selected
                          ? 'linear-gradient(135deg, var(--glow-primary), rgba(255,255,255,0.06))'
                          : 'rgba(0,0,0,0.3)',
                        border: selected ? '1.5px solid var(--accent)' : '1px solid var(--border-subtle)',
                      }}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-xs font-black" style={{ color: 'var(--text-main)' }}>
                          {mc.icon} {mc.title}
                        </span>
                        <span
                          className="text-[10px] font-black px-1.5 py-0.5 rounded"
                          style={{
                            background: selected ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                            color: selected ? 'var(--btn-text-dark)' : 'var(--accent-soft)',
                          }}
                        >
                          {mc.badge}
                        </span>
                      </div>
                      <span className="text-[10px] leading-snug" style={{ color: 'var(--text-muted)' }}>
                        {mc.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6 Arenas Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ARENAS.map((arena) => {
                const selected = arena.id === currentArena;
                return (
                  <button
                    key={arena.id}
                    type="button"
                    onClick={() => setCurrentArena(arena.id)}
                    className="text-right rounded-[15px] p-4 cursor-pointer transition-all hover:-translate-y-1 flex flex-col justify-between gap-2"
                    style={{
                      background: selected
                        ? 'linear-gradient(145deg, var(--glow-primary), var(--surface-2))'
                        : 'linear-gradient(145deg, var(--surface-2), var(--surface-3))',
                      border: selected
                        ? '2px solid var(--accent)'
                        : '1.5px solid var(--border-subtle)',
                      boxShadow: selected ? '0 8px 26px var(--glow-primary)' : '0 6px 18px rgba(0,0,0,0.6)',
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-2xl">{arena.icon}</span>
                      <span
                        className="text-[11px] font-black px-2.5 py-0.5 rounded-full"
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          color: arena.titleColorVar,
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        {arena.tag}
                      </span>
                    </div>
                    <div>
                      <div className="text-base font-black mb-1" style={{ color: arena.titleColorVar }}>
                        {arena.name}
                      </div>
                      <div className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        {arena.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-[1120px]">
            <button
              type="button"
              onClick={() => setScreen(weaponMode ? 'weaponScreen' : 'charScreen')}
              className="px-6 py-2.5 rounded-xl text-sm font-black cursor-pointer"
              style={{
                background: 'linear-gradient(90deg, var(--surface-2), var(--surface-3))',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
              }}
            >
              ➔ رجوع
            </button>
            <button
              type="button"
              onClick={() => setScreen('battle')}
              className="px-10 py-3 rounded-xl text-base font-black cursor-pointer transition-transform hover:scale-105"
              style={{
                background: 'linear-gradient(90deg, var(--primary), var(--secondary), var(--accent))',
                color: 'var(--btn-text-dark)',
                boxShadow: '0 8px 28px var(--glow-secondary)',
              }}
            >
              ⚔️ ابدأ المعركة الآن! ⚔️
            </button>
          </div>
        </div>
      )}

      {/* 7. BATTLE SCREEN */}
      {screen === 'battle' && (
        <BattleView
          gameMode={gameMode}
          weaponMode={weaponMode}
          modifiers={modifiers}
          miniChallenge={miniChallenge}
          p1CharIdx={p1CharIdx}
          p2CharIdx={p2CharIdx}
          p1Gender={p1Gender}
          p2Gender={p2Gender}
          p1OutfitIdx={p1OutfitIdx}
          p2OutfitIdx={p2OutfitIdx}
          p1Chroma={p1Chroma}
          p2Chroma={p2Chroma}
          p1WeaponIdx={p1WeaponIdx}
          p2WeaponIdx={p2WeaponIdx}
          p1Name={p1Name}
          p2Name={p2Name}
          currentArena={currentArena}
          matchDuration={matchDuration}
          aiDifficulty={aiDifficulty}
          theme={activeTheme}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onGoToMenu={() => setScreen('menuScreen')}
          onGoToCharSelect={() => setScreen('charScreen')}
          onMatchComplete={handleMatchComplete}
        />
      )}

      {/* 8. POST-BATTLE ACHIEVEMENTS SCREEN */}
      {screen === 'achievementsScreen' && postBattleResult && (
        <AchievementsScreen
          result={postBattleResult}
          newlyUnlockedIds={newlyUnlockedIds}
          unlockedIds={unlockedAchievements}
          onRematch={() => setScreen('battle')}
          onGoToCharSelect={() => setScreen('charScreen')}
          onGoToMenu={() => setScreen('menuScreen')}
        />
      )}
    </div>
  );
}
