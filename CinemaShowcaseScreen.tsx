import React, { useEffect, useRef, useState } from 'react';
import {
  ARENAS,
  CHARACTERS,
  CHROMA_PRESETS,
  WEAPONS,
  getCharOutfits,
  getThemeArenaHarmony,
} from '../data/gameData';
import { CinemaAmbientParticle, drawCinemaShowcaseCharacter } from '../engine/renderer';
import {
  ArenaId,
  ChromaId,
  CinemaLightingConfig,
  CinemaPose,
  Gender,
  ThemeConfig,
} from '../types/game';

interface CinemaShowcaseScreenProps {
  initialCharIdx: number;
  initialOutfitIdx: number;
  initialGender: Gender;
  initialChroma: ChromaId;
  initialWeaponIdx: number | null;
  theme: ThemeConfig;
  currentArena: ArenaId;
  onBackToChars: () => void;
  onProceedNext: () => void;
  onApplyToPlayer: (
    playerNum: 1 | 2,
    charIdx: number,
    outfitIdx: number,
    gender: Gender,
    weaponIdx: number | null,
    chroma: ChromaId
  ) => void;
}

const STYLE_LABELS: Record<string, string> = {
  coat: 'معطف قتالي فاخر',
  jacket: 'جاكيت قتالي عصري',
  kimono: 'كيمونو قتالي ملكي',
  plate: 'درع صفائح فولاذي',
  vest: 'سترة محارب عضلية',
  crop_mini: 'توب قصير وتنورة قتالية',
  bodysuit: 'بدلة قتالية انسيابية',
  slit_dress: 'فستان إمبراطوري بشق جانبي',
  corset_shorts: 'كورسيه مطرز وشورت قتالي',
  summer_bikini: 'زي شاطئ صيفي خفيف',
};

const POSES_ORDER: { id: CinemaPose; label: string }[] = [
  { id: 'idle', label: '🕺 وقفة الاستعراض' },
  { id: 'strike', label: '⚔️ هجوم استعراضي' },
  { id: 'guard', label: '🛡️ وضعية الدفاع' },
  { id: 'special', label: '⚡ حركة خاصة' },
  { id: 'weapon_inspect', label: '🗡️ استعراض السلاح' },
];

type CompareMode = 'off' | 'outfits' | 'gender';

export const CinemaShowcaseScreen: React.FC<CinemaShowcaseScreenProps> = ({
  initialCharIdx,
  initialOutfitIdx,
  initialGender,
  initialChroma,
  initialWeaponIdx,
  theme,
  currentArena,
  onBackToChars,
  onProceedNext,
  onApplyToPlayer,
}) => {
  const [charIdx, setCharIdx] = useState(initialCharIdx);
  const [outfitIdx, setOutfitIdx] = useState(initialOutfitIdx);
  const [gender, setGender] = useState<Gender>(initialGender);
  const [chroma, setChroma] = useState<ChromaId>(initialChroma);
  const [weaponIdx, setWeaponIdx] = useState<number | null>(initialWeaponIdx);
  const [pose, setPose] = useState<CinemaPose>('idle');
  const [facing, setFacing] = useState<1 | -1>(1);
  const [stageArena, setStageArena] = useState<ArenaId | 'theme'>(currentArena);
  const [compareMode, setCompareMode] = useState<CompareMode>('off');
  const [compareOutfitIdx, setCompareOutfitIdx] = useState<number>((initialOutfitIdx + 1) % 4);
  const [compareChroma, setCompareChroma] = useState<ChromaId>('royal_gold');
  const [lighting, setLighting] = useState<CinemaLightingConfig>({
    angle: 'center',
    intensity: 'vibrant',
  });
  const [harmonyNote, setHarmonyNote] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const compareCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pointerSmoothRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const transitionFlashRef = useRef<number>(0);

  const ambientParticlesRef = useRef<CinemaAmbientParticle[]>(
    Array.from({ length: 24 }, () => ({
      x: Math.random() * 560,
      y: Math.random() * 300,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(0.28 + Math.random() * 0.55),
      size: 1.4 + Math.random() * 2.2,
      alpha: 0.35 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    }))
  );

  const charObj = CHARACTERS[charIdx] || CHARACTERS[0];
  const outfitsList = getCharOutfits(charIdx, gender, chroma);
  const currentOutfit = outfitsList[outfitIdx] || outfitsList[0];
  const compareOutfitsList = getCharOutfits(
    charIdx,
    compareMode === 'gender' ? (gender === 'male' ? 'female' : 'male') : gender,
    compareMode === 'gender' ? chroma : compareChroma
  );
  const compareOutfitObj =
    compareOutfitsList[compareMode === 'gender' ? outfitIdx : compareOutfitIdx] ||
    compareOutfitsList[0];

  const selectedWeapon = weaponIdx !== null ? WEAPONS[weaponIdx] || null : null;
  const activeArenaId: ArenaId = stageArena === 'theme' ? currentArena : stageArena;
  const arenaObj = ARENAS.find((a) => a.id === activeArenaId) || ARENAS[0];
  const chromaInfo = CHROMA_PRESETS.find((c) => c.id === chroma) || CHROMA_PRESETS[0];

  const triggerTransitionFlash = () => {
    transitionFlashRef.current = 1;
  };

  // Keyboard shortcuts for quick navigation & P1/P2 instant apply
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setOutfitIdx((prev) => (prev + 1) % 4);
        setHarmonyNote(null);
        triggerTransitionFlash();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setOutfitIdx((prev) => (prev + 3) % 4);
        setHarmonyNote(null);
        triggerTransitionFlash();
      } else if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
        e.preventDefault();
        const delta = e.code === 'ArrowUp' ? -1 : 1;
        setPose((prev) => {
          const idx = POSES_ORDER.findIndex((p) => p.id === prev);
          const nextIdx = (idx + delta + POSES_ORDER.length) % POSES_ORDER.length;
          return POSES_ORDER[nextIdx].id;
        });
        triggerTransitionFlash();
      } else if (e.code === 'KeyR') {
        setFacing((f) => (f === 1 ? -1 : 1));
        triggerTransitionFlash();
      } else if (e.code === 'KeyG') {
        setGender((g) => (g === 'male' ? 'female' : 'male'));
        setHarmonyNote(null);
        triggerTransitionFlash();
      } else if (e.code === 'KeyC') {
        setChroma((prev) => {
          const idx = CHROMA_PRESETS.findIndex((c) => c.id === prev);
          return CHROMA_PRESETS[(idx + 1) % CHROMA_PRESETS.length].id;
        });
        triggerTransitionFlash();
      } else if (e.code === 'Digit1' || e.code === 'Numpad1') {
        onApplyToPlayer(1, charIdx, outfitIdx, gender, weaponIdx, chroma);
      } else if (e.code === 'Digit2' || e.code === 'Numpad2') {
        onApplyToPlayer(2, charIdx, outfitIdx, gender, weaponIdx, chroma);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [charIdx, chroma, gender, onApplyToPlayer, outfitIdx, weaponIdx]);

  useEffect(() => {
    let animId = 0;
    let t = 0;
    const renderLoop = () => {
      t += 0.04;
      pointerSmoothRef.current.x += (pointerTargetRef.current.x - pointerSmoothRef.current.x) * 0.1;
      pointerSmoothRef.current.y += (pointerTargetRef.current.y - pointerSmoothRef.current.y) * 0.1;
      if (transitionFlashRef.current > 0) {
        transitionFlashRef.current = Math.max(0, transitionFlashRef.current - 0.065);
      }

      const arenaBgVal = stageArena === 'theme' ? null : stageArena;

      drawCinemaShowcaseCharacter(
        canvasRef.current,
        charIdx,
        outfitIdx,
        gender,
        facing,
        pose,
        theme,
        t,
        {
          weapon: selectedWeapon,
          lighting,
          pointerOffset: pointerSmoothRef.current,
          transitionFlash: transitionFlashRef.current,
          ambientParticles: ambientParticlesRef.current,
          chroma,
          arenaBg: arenaBgVal,
        }
      );

      if (compareMode !== 'off' && compareCanvasRef.current) {
        const cmpGender: Gender =
          compareMode === 'gender' ? (gender === 'male' ? 'female' : 'male') : gender;
        const cmpOutfit = compareMode === 'gender' ? outfitIdx : compareOutfitIdx;
        const cmpChroma: ChromaId = compareMode === 'gender' ? chroma : compareChroma;
        drawCinemaShowcaseCharacter(
          compareCanvasRef.current,
          charIdx,
          cmpOutfit,
          cmpGender,
          facing,
          pose,
          theme,
          t,
          {
            weapon: selectedWeapon,
            lighting,
            pointerOffset: pointerSmoothRef.current,
            transitionFlash: transitionFlashRef.current * 0.7,
            chroma: cmpChroma,
            arenaBg: arenaBgVal,
          }
        );
      }

      animId = requestAnimationFrame(renderLoop);
    };
    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [
    charIdx,
    outfitIdx,
    gender,
    chroma,
    facing,
    pose,
    theme,
    selectedWeapon,
    lighting,
    stageArena,
    compareMode,
    compareOutfitIdx,
    compareChroma,
  ]);

  const handleAutoHarmony = () => {
    const h = getThemeArenaHarmony(charIdx, gender, theme, activeArenaId);
    setOutfitIdx(h.outfitIdx);
    setWeaponIdx(h.weaponIdx);
    setChroma('default');
    setHarmonyNote(h.label);
    triggerTransitionFlash();
  };

  const effectiveSpeed = Math.min(
    10,
    Number((charObj.speed * (selectedWeapon ? selectedWeapon.speedMult : 1)).toFixed(1))
  );
  const effectiveStrike = Math.round(
    charObj.kickDmg * (selectedWeapon ? selectedWeapon.dmgMult : 1)
  );
  const speedPct = Math.min(100, Math.round((effectiveSpeed / 10) * 100));
  const strikePct = Math.min(100, Math.round((effectiveStrike / 34) * 100));
  const specialPct = Math.min(100, Math.round((charObj.specialDmg / 55) * 100));

  return (
    <div className="screen pt-4 pb-3">
      <div className="w-full max-w-[1180px] flex items-center justify-between gap-3 flex-wrap">
        <span
          className="px-3 py-1 rounded-full text-xs font-black tracking-wider"
          style={{
            background: 'var(--glow-primary)',
            color: 'var(--accent)',
            border: '1px solid var(--border-main)',
          }}
        >
          CINEMA SHOWCASE
        </span>
        <h1 className="title-gradient text-2xl sm:text-[24px] m-0 text-center">
          🎬 المنصة السينمائية التفاعلية
        </h1>
        <button
          type="button"
          onClick={onBackToChars}
          className="px-5 py-1.5 text-sm font-black rounded-[10px] cursor-pointer"
          style={{
            background: 'linear-gradient(90deg, var(--surface-2), var(--surface-3))',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-main)',
          }}
        >
          ➔ رجوع لاختيار الشخصيات
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.26fr_1fr] gap-3.5 w-full max-w-[1180px] flex-1 my-1.5 items-stretch">
        {/* LEFT STAGE & INTERACTIVE CONTROLS */}
        <div
          className="rounded-[18px] p-3 flex flex-col items-center justify-between gap-2"
          style={{
            background: 'linear-gradient(160deg, var(--surface-2), var(--surface-3))',
            border: '2px solid var(--border-main)',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.75)',
          }}
        >
          {/* Stage Top Bar: Gender, Harmony & Comparison Mode */}
          <div className="w-full flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={handleAutoHarmony}
                className="px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer transition-transform hover:scale-105"
                style={{
                  background: 'linear-gradient(90deg, var(--secondary), var(--accent))',
                  color: 'var(--btn-text-dark)',
                  border: '1px solid var(--border-main)',
                }}
              >
                ✨ تناسق تلقائي ({arenaObj.icon})
              </button>
              <div
                className="inline-flex rounded-lg p-0.5 gap-0.5"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setGender('male');
                    setHarmonyNote(null);
                    triggerTransitionFlash();
                  }}
                  className="px-2.5 py-1 rounded-md text-[11px] font-black cursor-pointer border-0"
                  style={{
                    background:
                      gender === 'male'
                        ? 'linear-gradient(90deg, var(--primary), var(--secondary))'
                        : 'transparent',
                    color: gender === 'male' ? 'var(--btn-text-dark)' : 'var(--text-muted)',
                  }}
                >
                  ♂ ذكر
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGender('female');
                    setHarmonyNote(null);
                    triggerTransitionFlash();
                  }}
                  className="px-2.5 py-1 rounded-md text-[11px] font-black cursor-pointer border-0"
                  style={{
                    background:
                      gender === 'female'
                        ? 'linear-gradient(90deg, var(--primary), var(--secondary))'
                        : 'transparent',
                    color: gender === 'female' ? 'var(--btn-text-dark)' : 'var(--text-muted)',
                  }}
                >
                  ♀ أنثى
                </button>
              </div>
            </div>

            {/* Side-by-Side Comparison Switcher */}
            <div
              className="inline-flex rounded-lg p-0.5 gap-0.5"
              style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}
            >
              {(
                [
                  { id: 'off', label: 'منفرد' },
                  { id: 'outfits', label: '⚖️ مقارنة زيّين' },
                  { id: 'gender', label: '⚧ ذكر/أنثى' },
                ] as { id: CompareMode; label: string }[]
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setCompareMode(m.id);
                    triggerTransitionFlash();
                  }}
                  className="px-2 py-1 rounded-md text-[10.5px] font-black cursor-pointer border-0"
                  style={{
                    background:
                      compareMode === m.id
                        ? 'linear-gradient(90deg, var(--secondary), var(--accent))'
                        : 'transparent',
                    color: compareMode === m.id ? 'var(--btn-text-dark)' : 'var(--text-muted)',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stage Canvas Area (Single or Split Dual Comparison) */}
          {compareMode === 'off' ? (
            <canvas
              ref={canvasRef}
              width={560}
              height={305}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
                pointerTargetRef.current = {
                  x: Math.max(-1, Math.min(1, nx)),
                  y: Math.max(-1, Math.min(1, ny)),
                };
              }}
              onMouseLeave={() => {
                pointerTargetRef.current = { x: 0, y: 0 };
              }}
              className="w-full max-w-[560px] h-[305px] rounded-[14px] cursor-crosshair"
              style={{
                border: '1.5px solid var(--border-subtle)',
                background: 'radial-gradient(circle at 50% 35%, var(--radial-top) 0%, var(--surface-1) 85%)',
              }}
            />
          ) : (
            <div className="w-full grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[10.5px] font-black px-1">
                  <span style={{ color: 'var(--accent)' }}>
                    {compareMode === 'gender' ? (gender === 'male' ? '♂ نسخة الذكر' : '♀ نسخة الأنثى') : `الزي الأساسي (${outfitIdx + 1}/4)`}
                  </span>
                  <span className="truncate max-w-[140px]" style={{ color: 'var(--text-muted)' }}>
                    {currentOutfit.name}
                  </span>
                </div>
                <canvas
                  ref={canvasRef}
                  width={320}
                  height={275}
                  className="w-full h-[275px] rounded-[12px]"
                  style={{ border: '1.5px solid var(--primary)' }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[10.5px] font-black px-1">
                  <span style={{ color: 'var(--secondary)' }}>
                    {compareMode === 'gender'
                      ? gender === 'male'
                        ? '♀ نسخة الأنثى'
                        : '♂ نسخة الذكر'
                      : `زي المقارنة (${compareOutfitIdx + 1}/4)`}
                  </span>
                  <span className="truncate max-w-[130px]" style={{ color: 'var(--text-muted)' }}>
                    {compareOutfitObj.name}
                  </span>
                </div>
                <canvas
                  ref={compareCanvasRef}
                  width={320}
                  height={275}
                  className="w-full h-[275px] rounded-[12px]"
                  style={{ border: '1.5px solid var(--secondary)' }}
                />
                {compareMode === 'outfits' ? (
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCompareOutfitIdx(idx)}
                          className="px-2 py-0.5 rounded text-[10px] font-black cursor-pointer"
                          style={{
                            background: compareOutfitIdx === idx ? 'var(--secondary)' : 'var(--surface-1)',
                            color: compareOutfitIdx === idx ? 'var(--btn-text-dark)' : 'var(--text-main)',
                          }}
                        >
                          {idx + 1}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const i = CHROMA_PRESETS.findIndex((c) => c.id === compareChroma);
                          setCompareChroma(CHROMA_PRESETS[(i + 1) % CHROMA_PRESETS.length].id);
                        }}
                        className="px-2 py-0.5 rounded text-[10px] font-black cursor-pointer"
                        style={{ background: 'var(--surface-1)', color: 'var(--accent)' }}
                      >
                        🎨 {CHROMA_PRESETS.find((c) => c.id === compareChroma)?.label}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOutfitIdx(compareOutfitIdx);
                        setChroma(compareChroma);
                        triggerTransitionFlash();
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-black cursor-pointer"
                      style={{ background: 'var(--accent)', color: 'var(--btn-text-dark)' }}
                    >
                      اعتماد هذا ✓
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setGender((g) => (g === 'male' ? 'female' : 'male'));
                        triggerTransitionFlash();
                      }}
                      className="px-2.5 py-0.5 rounded text-[10px] font-black cursor-pointer"
                      style={{ background: 'var(--accent)', color: 'var(--btn-text-dark)' }}
                    >
                      تبديل الأساسي إلى {gender === 'male' ? '♀ أنثى' : '♂ ذكر'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Live Arena Stage Backdrop Switcher */}
          <div className="w-full flex flex-wrap items-center justify-center gap-1">
            <button
              type="button"
              onClick={() => {
                setStageArena('theme');
                triggerTransitionFlash();
              }}
              className="px-2 py-1 rounded-lg text-[10.5px] font-black cursor-pointer"
              style={{
                background: stageArena === 'theme' ? 'var(--glow-primary)' : 'var(--surface-1)',
                border: `1px solid ${stageArena === 'theme' ? 'var(--accent)' : 'var(--border-subtle)'}`,
                color: 'var(--text-main)',
              }}
            >
              🎨 ثيم الواجهة
            </button>
            {ARENAS.map((ar) => (
              <button
                key={ar.id}
                type="button"
                onClick={() => {
                  setStageArena(ar.id);
                  triggerTransitionFlash();
                }}
                className="px-2 py-1 rounded-lg text-[10.5px] font-black cursor-pointer"
                style={{
                  background: stageArena === ar.id ? 'var(--glow-secondary)' : 'var(--surface-1)',
                  border: `1px solid ${stageArena === ar.id ? 'var(--secondary)' : 'var(--border-subtle)'}`,
                  color: 'var(--text-main)',
                }}
              >
                {ar.icon} {ar.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* 5 Showcase Poses + Direction */}
          <div className="w-full flex flex-wrap items-center justify-center gap-1.5">
            {POSES_ORDER.map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => {
                  setPose(btn.id);
                  triggerTransitionFlash();
                }}
                className="px-2.5 py-1 rounded-[9px] text-[11px] font-extrabold cursor-pointer transition-all"
                style={{
                  background:
                    pose === btn.id
                      ? 'linear-gradient(90deg, var(--primary), var(--secondary))'
                      : 'var(--surface-1)',
                  color: pose === btn.id ? 'var(--btn-text-dark)' : 'var(--text-main)',
                  border: `1.5px solid ${pose === btn.id ? 'var(--accent)' : 'var(--border-subtle)'}`,
                }}
              >
                {btn.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => {
                setFacing((f) => (f === 1 ? -1 : 1));
                triggerTransitionFlash();
              }}
              className="px-2.5 py-1 rounded-[9px] text-[11px] font-extrabold cursor-pointer"
              style={{
                background: 'var(--surface-1)',
                color: 'var(--text-main)',
                border: '1.5px solid var(--border-subtle)',
              }}
            >
              🔄 عكس (R)
            </button>
          </div>

          {/* Dynamic Spotlight Angle & Intensity + Shortcuts Hint */}
          <div
            className="w-full rounded-xl px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[10.5px]"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center gap-1">
              <span className="font-black" style={{ color: 'var(--accent-soft)' }}>
                💡 الإضاءة:
              </span>
              {(
                [
                  { id: 'left', label: 'يسار' },
                  { id: 'center', label: 'وسط' },
                  { id: 'right', label: 'يمين' },
                ] as { id: CinemaLightingConfig['angle']; label: string }[]
              ).map((ang) => (
                <button
                  key={ang.id}
                  type="button"
                  onClick={() => setLighting((l) => ({ ...l, angle: ang.id }))}
                  className="px-1.5 py-0.5 rounded font-black cursor-pointer"
                  style={{
                    background:
                      lighting.angle === ang.id ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                    color: lighting.angle === ang.id ? 'var(--btn-text-dark)' : 'var(--text-main)',
                  }}
                >
                  {ang.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <span className="font-black" style={{ color: 'var(--accent-soft)' }}>
                ✨ الشدة:
              </span>
              {(
                [
                  { id: 'soft', label: 'هادئة' },
                  { id: 'vibrant', label: 'نابضة' },
                  { id: 'dramatic', label: 'درامية' },
                ] as { id: CinemaLightingConfig['intensity']; label: string }[]
              ).map((inten) => (
                <button
                  key={inten.id}
                  type="button"
                  onClick={() => setLighting((l) => ({ ...l, intensity: inten.id }))}
                  className="px-1.5 py-0.5 rounded font-black cursor-pointer"
                  style={{
                    background:
                      lighting.intensity === inten.id ? 'var(--secondary)' : 'rgba(255,255,255,0.06)',
                    color:
                      lighting.intensity === inten.id ? 'var(--btn-text-dark)' : 'var(--text-main)',
                  }}
                >
                  {inten.label}
                </button>
              ))}
            </div>
            <span className="font-bold opacity-85" style={{ color: 'var(--text-muted)' }}>
              ⌨️ ◄/► الزي • ▲/▼ الوضعية • R عكس • C كروما • 1/2 اعتماد
            </span>
          </div>
        </div>

        {/* RIGHT INSPECTOR, CHROMAS, WEAPONS, HERO PROFILE CARD & APPLY */}
        <div
          className="rounded-[18px] p-3 flex flex-col justify-between gap-2"
          style={{
            background: 'linear-gradient(150deg, var(--surface-2), var(--surface-3))',
            border: '2px solid var(--border-subtle)',
          }}
        >
          {/* Heroes Grid */}
          <div>
            <div className="text-[12px] font-black mb-1" style={{ color: 'var(--accent)' }}>
              اختر البطل للمعاينة (9 أبطال)
            </div>
            <div className="grid grid-cols-3 gap-1">
              {CHARACTERS.map((c, idx) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCharIdx(idx);
                    setOutfitIdx(0);
                    setHarmonyNote(null);
                    triggerTransitionFlash();
                  }}
                  className="rounded-lg py-1 px-1 text-center cursor-pointer transition-all"
                  style={{
                    background: charIdx === idx ? 'var(--glow-secondary)' : 'var(--surface-1)',
                    border: `2px solid ${charIdx === idx ? 'var(--secondary)' : 'var(--border-subtle)'}`,
                    color: 'var(--text-main)',
                  }}
                >
                  <div className="text-sm leading-tight">{c.icon}</div>
                  <div className="text-[10px] font-black truncate" style={{ color: c.outfits[0].armor }}>
                    {c.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Outfits Grid + Chromas */}
          <div>
            <div className="flex items-center justify-between text-[12px] font-black mb-1">
              <span style={{ color: 'var(--accent)' }}>أزياء البطل (4 ملابس)</span>
              {harmonyNote && (
                <span className="text-[10px]" style={{ color: '#4ade80' }}>
                  ✨ {harmonyNote}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {outfitsList.map((o, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setOutfitIdx(idx);
                    setHarmonyNote(null);
                    triggerTransitionFlash();
                  }}
                  className="rounded-[9px] py-1 px-2 text-right cursor-pointer transition-all"
                  style={{
                    background: outfitIdx === idx ? 'var(--glow-primary)' : 'var(--surface-1)',
                    border: `1.5px solid ${outfitIdx === idx ? 'var(--accent)' : 'var(--border-subtle)'}`,
                  }}
                >
                  <div className="text-[9.5px] font-extrabold" style={{ color: 'var(--accent)' }}>
                    الزي {idx + 1}/4 • {STYLE_LABELS[o.style] || o.style}
                  </div>
                  <div className="text-[11px] font-black truncate" style={{ color: 'var(--text-main)' }}>
                    {o.name}
                  </div>
                </button>
              ))}
            </div>

            {/* Chromas Color Variant Bar */}
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              <span className="text-[10.5px] font-black" style={{ color: 'var(--accent-soft)' }}>
                🎨 كروما:
              </span>
              {CHROMA_PRESETS.map((cp) => (
                <button
                  key={cp.id}
                  type="button"
                  onClick={() => {
                    setChroma(cp.id);
                    triggerTransitionFlash();
                  }}
                  className="px-2 py-0.5 rounded-md text-[10px] font-black cursor-pointer flex items-center gap-1"
                  style={{
                    background: chroma === cp.id ? 'var(--glow-primary)' : 'var(--surface-1)',
                    border: `1px solid ${chroma === cp.id ? cp.accent : 'var(--border-subtle)'}`,
                    color: 'var(--text-main)',
                  }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block border border-white/40"
                    style={{ backgroundColor: cp.accent }}
                  />
                  <span>{cp.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Weapon Preview Selector */}
          <div>
            <div className="text-[12px] font-black mb-1" style={{ color: 'var(--accent)' }}>
              🗡️ معاينة السلاح في اليد
            </div>
            <div className="grid grid-cols-4 gap-1">
              <button
                type="button"
                onClick={() => {
                  setWeaponIdx(null);
                  triggerTransitionFlash();
                }}
                className="rounded-lg py-1 px-1 text-[10px] font-black cursor-pointer"
                style={{
                  background: weaponIdx === null ? 'var(--glow-primary)' : 'var(--surface-1)',
                  border: `1.5px solid ${weaponIdx === null ? 'var(--accent)' : 'var(--border-subtle)'}`,
                  color: 'var(--text-main)',
                }}
              >
                ✊ يدوي
              </button>
              {WEAPONS.map((w, wIdx) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => {
                    setWeaponIdx(wIdx);
                    if (pose === 'idle') setPose('weapon_inspect');
                    triggerTransitionFlash();
                  }}
                  className="rounded-lg py-1 px-1 text-[10px] font-black cursor-pointer truncate"
                  title={w.name}
                  style={{
                    background: weaponIdx === wIdx ? 'var(--glow-secondary)' : 'var(--surface-1)',
                    border: `1.5px solid ${weaponIdx === wIdx ? 'var(--secondary)' : 'var(--border-subtle)'}`,
                    color: 'var(--text-main)',
                  }}
                >
                  {w.icon} {w.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Unified Hero Profile Card */}
          <div
            className="rounded-xl p-2.5 flex flex-col gap-1.5"
            style={{
              background: 'var(--surface-1)',
              border: '1.5px solid var(--border-main)',
            }}
          >
            <div className="flex items-center justify-between gap-2 text-[11px] font-black">
              <span style={{ color: 'var(--accent)' }}>
                🪪 ملف البطل: {charObj.icon} {charObj.name}
              </span>
              <span
                className="px-2 py-0.5 rounded text-[10px]"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--accent-soft)' }}
              >
                {gender === 'female' ? '♀ أنثى' : '♂ ذكر'} • {chromaInfo.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] font-bold">
              <div className="truncate" style={{ color: 'var(--text-main)' }}>
                👘 الزي: {currentOutfit.name}
              </div>
              <div className="truncate" style={{ color: '#fde047' }}>
                🗡️ السلاح: {selectedWeapon ? `${selectedWeapon.icon} ${selectedWeapon.name}` : '✊ قتال يدوي'}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[10px] font-bold">
              <div>
                <div className="flex justify-between mb-0.5">
                  <span style={{ color: 'var(--text-muted)' }}>السرعة</span>
                  <span className="tabular-nums" style={{ color: '#38bdf8' }}>
                    {effectiveSpeed}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden bg-black/60">
                  <div className="h-full rounded-full" style={{ width: `${speedPct}%`, background: '#38bdf8' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-0.5">
                  <span style={{ color: 'var(--text-muted)' }}>قوة الضربة</span>
                  <span className="tabular-nums" style={{ color: '#f97316' }}>
                    {effectiveStrike}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden bg-black/60">
                  <div className="h-full rounded-full" style={{ width: `${strikePct}%`, background: '#f97316' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-0.5">
                  <span style={{ color: 'var(--text-muted)' }}>السوبر</span>
                  <span className="tabular-nums" style={{ color: '#facc15' }}>
                    {charObj.specialDmg}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden bg-black/60">
                  <div className="h-full rounded-full" style={{ width: `${specialPct}%`, background: '#facc15' }} />
                </div>
              </div>
            </div>

            <div className="text-[10.5px] font-bold" style={{ color: 'var(--accent-soft)' }}>
              ⚡ القدرة الخاصة: {charObj.passiveText}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onApplyToPlayer(1, charIdx, outfitIdx, gender, weaponIdx, chroma)}
              className="flex-1 py-2 px-3 text-xs font-black rounded-[10px] cursor-pointer border-0"
              style={{
                background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                color: 'var(--text-main)',
                boxShadow: '0 0 18px var(--glow-primary)',
              }}
            >
              ✅ اعتماد لـ P1 [1]
            </button>
            <button
              type="button"
              onClick={() => onApplyToPlayer(2, charIdx, outfitIdx, gender, weaponIdx, chroma)}
              className="flex-1 py-2 px-3 text-xs font-black rounded-[10px] cursor-pointer border-0"
              style={{
                background: 'linear-gradient(90deg, var(--secondary), var(--primary))',
                color: 'var(--text-main)',
                boxShadow: '0 0 16px var(--glow-primary)',
              }}
            >
              ✅ اعتماد لـ P2 [2]
            </button>
          </div>
        </div>
      </div>

      <div
        className="w-full max-w-[1180px] flex justify-between items-center pt-1.5 gap-2.5 flex-wrap"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <button
          type="button"
          onClick={onBackToChars}
          className="px-5 py-1.5 text-sm font-black rounded-[10px] cursor-pointer"
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
          onClick={onProceedNext}
          className="px-6 py-1.5 text-sm font-black rounded-[10px] cursor-pointer border-0"
          style={{
            background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
            color: 'var(--text-main)',
            boxShadow: '0 0 18px var(--glow-primary)',
          }}
        >
          متابعة الخطوة التالية ⬅️
        </button>
      </div>
    </div>
  );
};
