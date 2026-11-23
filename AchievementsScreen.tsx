import React from 'react';
import { ACHIEVEMENTS_CATALOG } from '../data/gameData';
import { AchievementRarity, EarnedAchievement, FighterMatchStats, PostBattleResult } from '../types/game';

interface AchievementsScreenProps {
  result: PostBattleResult;
  newlyUnlockedIds: string[];
  unlockedIds: string[];
  onRematch: () => void;
  onGoToCharSelect: () => void;
  onGoToMenu: () => void;
}

const RARITY_STYLES: Record<
  AchievementRarity,
  { label: string; color: string; bg: string; border: string }
> = {
  common: {
    label: 'عادي',
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.14)',
    border: 'rgba(148, 163, 184, 0.35)',
  },
  rare: {
    label: 'نادر',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.15)',
    border: 'rgba(56, 189, 248, 0.45)',
  },
  epic: {
    label: 'ملحمي',
    color: '#c084fc',
    bg: 'rgba(192, 132, 252, 0.16)',
    border: 'rgba(192, 132, 252, 0.5)',
  },
  legendary: {
    label: 'أسطوري',
    color: '#facc15',
    bg: 'rgba(250, 204, 21, 0.18)',
    border: 'rgba(250, 204, 21, 0.55)',
  },
};

function FighterStatsCard({
  stats,
  isWinner,
}: {
  stats: FighterMatchStats;
  isWinner: boolean;
}) {
  const hpPct = Math.max(0, Math.min(100, (stats.hpRemaining / Math.max(1, stats.maxHp)) * 100));
  const accentColor = stats.isPlayer1 ? 'var(--primary)' : 'var(--secondary)';

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{
        background: 'linear-gradient(155deg, var(--surface-2), var(--surface-3))',
        border: isWinner ? '2px solid var(--accent)' : '1.5px solid var(--border-subtle)',
        boxShadow: isWinner ? '0 0 24px var(--glow-primary)' : '0 8px 20px rgba(0,0,0,0.45)',
      }}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-2xl leading-none">{stats.charIcon}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black" style={{ color: accentColor }}>
                {stats.name}
              </span>
              <span
                className="text-[10px] font-black px-2 py-0.5 rounded-md"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: 'var(--accent-soft)',
                }}
              >
                {stats.isPlayer1 ? 'P1' : stats.isBot ? 'AI' : 'P2'}
              </span>
              {isWinner && (
                <span
                  className="text-[10px] font-black px-2 py-0.5 rounded-md"
                  style={{
                    background: 'rgba(250, 204, 21, 0.2)',
                    border: '1px solid rgba(250, 204, 21, 0.5)',
                    color: '#fde047',
                  }}
                >
                  👑 المنتصر
                </span>
              )}
            </div>
            <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {stats.charName} ({stats.gender === 'female' ? 'أنثى' : 'ذكر'}) • {stats.outfitName}
            </div>
          </div>
        </div>

        <div className="text-left">
          <div className="text-xs font-black tabular-nums" style={{ color: 'var(--accent)' }}>
            {Math.ceil(stats.hpRemaining)} / {stats.maxHp} HP
          </div>
          <div
            className="w-28 h-2 rounded-full overflow-hidden mt-1"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}
          >
            <div
              className="h-full"
              style={{
                width: `${hpPct}%`,
                background: 'linear-gradient(90deg, var(--primary), var(--secondary), var(--accent))',
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
        {[
          { label: 'الضرر الموجه', val: stats.damageDealt, color: '#fb923c' },
          { label: 'الضرر المستقبَل', val: stats.damageTaken, color: '#f87171' },
          { label: 'ضربات ناجحة', val: stats.hitsLanded, color: '#38bdf8' },
          { label: 'أقصى كومبو', val: `${stats.maxCombo}x`, color: '#facc15' },
          { label: 'مرات الصدّ', val: stats.blocksCount, color: '#4ade80' },
          { label: 'EX / سوبر', val: stats.exCount + stats.superCount, color: '#c084fc' },
        ].map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl py-2 px-1.5"
            style={{
              background: 'rgba(0, 0, 0, 0.32)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="text-sm font-black tabular-nums" style={{ color: item.color }}>
              {item.val}
            </div>
            <div className="text-[10px] font-bold mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {(stats.gotFirstStrike || stats.reachedLimitBreak || stats.throwsCount > 0 || stats.clashesWon > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {stats.gotFirstStrike && (
            <span
              className="text-[11px] font-black px-2.5 py-0.5 rounded-full"
              style={{
                background: 'rgba(250, 204, 21, 0.14)',
                border: '1px solid rgba(250, 204, 21, 0.4)',
                color: '#fde047',
              }}
            >
              ⚡ صاحب الضربة الأولى
            </span>
          )}
          {stats.reachedLimitBreak && (
            <span
              className="text-[11px] font-black px-2.5 py-0.5 rounded-full"
              style={{
                background: 'rgba(239, 68, 68, 0.14)',
                border: '1px solid rgba(239, 68, 68, 0.45)',
                color: '#fca5a5',
              }}
            >
              🔥 تفعيل Limit Break
            </span>
          )}
          {stats.throwsCount > 0 && (
            <span
              className="text-[11px] font-black px-2.5 py-0.5 rounded-full"
              style={{
                background: 'rgba(249, 115, 22, 0.14)',
                border: '1px solid rgba(249, 115, 22, 0.4)',
                color: '#fdba74',
              }}
            >
              🤼 رميات: {stats.throwsCount}
            </span>
          )}
          {stats.clashesWon > 0 && (
            <span
              className="text-[11px] font-black px-2.5 py-0.5 rounded-full"
              style={{
                background: 'rgba(56, 189, 248, 0.14)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                color: '#7dd3fc',
              }}
            >
              ⚔️ انتصار اشتباك: {stats.clashesWon}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({
  result,
  newlyUnlockedIds,
  unlockedIds,
  onRematch,
  onGoToCharSelect,
  onGoToMenu,
}) => {
  const newUnlockSet = new Set(newlyUnlockedIds);
  const unlockedSet = new Set(unlockedIds);

  const earnedList: EarnedAchievement[] = result.earnedAchievements.map((item) => ({
    ...item,
    isNewCareerUnlock: newUnlockSet.has(item.def.id),
  }));

  const matchXpTotal = earnedList.reduce((acc, a) => acc + a.def.xp, 0);
  const careerCompletionPct = Math.round(
    (unlockedSet.size / Math.max(1, ACHIEVEMENTS_CATALOG.length)) * 100
  );

  return (
    <div className="screen pt-5 pb-6 overflow-y-auto justify-start gap-4">
      {/* Match Result Hero Header */}
      <div
        className="w-full max-w-[1140px] rounded-[20px] py-5 px-6 flex flex-col items-center text-center gap-2"
        style={{
          background: 'linear-gradient(155deg, var(--surface-2), var(--surface-3))',
          border: '2px solid var(--border-main)',
          boxShadow: '0 16px 45px rgba(0, 0, 0, 0.8), 0 0 30px var(--glow-primary)',
        }}
      >
        <div
          className="text-xs font-black tracking-wider px-4 py-1 rounded-full"
          style={{
            background: 'var(--glow-primary)',
            color: 'var(--accent-soft)',
            border: '1px solid var(--border-main)',
          }}
        >
          🏅 تقرير المعركة والإنجازات — AREN-LEGENG
        </div>

        <div className="title-gradient text-[36px] sm:text-[48px] leading-none mt-1">
          {result.bannerCode}
        </div>
        <div className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text-main)' }}>
          {result.winnerText}
        </div>
        <div
          className="text-xs sm:text-sm font-extrabold px-4 py-1 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border-main)',
            color: 'var(--accent)',
          }}
        >
          {result.winnerBadge}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-2 text-xs font-black tabular-nums">
          <span
            className="px-3 py-1 rounded-lg"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)', color: 'var(--accent-soft)' }}
          >
            ⏱️ زمن المعركة: {result.durationSeconds.toFixed(1)} ثانية
          </span>
          {result.firstStrikeSeconds !== null && (
            <span
              className="px-3 py-1 rounded-lg"
              style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)', color: '#fde047' }}
            >
              ⚡ أسرع ضربة: {result.firstStrikeSeconds.toFixed(1)} ثانية
            </span>
          )}
          <span
            className="px-3 py-1 rounded-lg"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)', color: '#4ade80' }}
          >
            ✨ خبرة الجولة: +{matchXpTotal} XP
          </span>
          <span
            className="px-3 py-1 rounded-lg"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)', color: '#38bdf8' }}
          >
            🎖️ إنجازات المعركة: {earnedList.length}
          </span>
        </div>

        {result.miniChallengeOutcome && (
          <div
            className="mt-2 px-4 py-2 rounded-xl flex items-center justify-center gap-2.5 flex-wrap text-xs font-black"
            style={{
              background: result.miniChallengeOutcome.completed
                ? 'linear-gradient(90deg, rgba(22, 163, 74, 0.25), rgba(234, 179, 8, 0.2))'
                : 'rgba(127, 29, 29, 0.28)',
              border: result.miniChallengeOutcome.completed
                ? '1.5px solid #4ade80'
                : '1.5px solid rgba(248, 113, 113, 0.5)',
              color: result.miniChallengeOutcome.completed ? '#fef08a' : '#fca5a5',
              boxShadow: result.miniChallengeOutcome.completed
                ? '0 0 18px rgba(74, 222, 128, 0.28)'
                : 'none',
            }}
          >
            <span className="text-base">{result.miniChallengeOutcome.icon}</span>
            <span>
              التحدي الفرعي ({result.miniChallengeOutcome.title}):{' '}
              {result.miniChallengeOutcome.completed ? '✅ تم الإنجاز بنجاح!' : '❌ لم يكتمل'}
            </span>
            <span
              className="px-2 py-0.5 rounded-md text-[11px] tabular-nums"
              style={{
                background: 'rgba(0,0,0,0.4)',
                color: result.miniChallengeOutcome.completed ? '#86efac' : '#fecaca',
              }}
            >
              {result.miniChallengeOutcome.detailText}
            </span>
          </div>
        )}
      </div>

      {/* Match Earned Achievements Section */}
      <div className="w-full max-w-[1140px] flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap px-1">
          <h2 className="text-lg font-black m-0" style={{ color: 'var(--accent)' }}>
            🏆 الإنجازات المحققة في هذه المواجهة
          </h2>
          <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
            يتم منح الإنجازات تلقائياً بناءً على الأداء القتالي الفعلي
          </span>
        </div>

        {earnedList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {earnedList.map((ach, idx) => {
              const rStyle = RARITY_STYLES[ach.def.rarity];
              return (
                <div
                  key={`${ach.def.id}-${idx}`}
                  className="rounded-2xl p-4 flex flex-col justify-between gap-2.5 transition-transform hover:-translate-y-0.5"
                  style={{
                    background: 'linear-gradient(145deg, var(--surface-2), var(--surface-3))',
                    border: `1.5px solid ${rStyle.border}`,
                    boxShadow: ach.isNewCareerUnlock
                      ? `0 8px 26px ${rStyle.bg}, 0 0 18px var(--glow-primary)`
                      : '0 8px 22px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
                        style={{ background: rStyle.bg, border: `1px solid ${rStyle.border}` }}
                      >
                        {ach.def.icon}
                      </div>
                      <div>
                        <div className="text-sm font-black" style={{ color: 'var(--text-main)' }}>
                          {ach.def.title}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span
                            className="text-[10px] font-black px-2 py-0.5 rounded-md"
                            style={{ background: rStyle.bg, color: rStyle.color }}
                          >
                            {rStyle.label}
                          </span>
                          {ach.isNewCareerUnlock && (
                            <span
                              className="text-[10px] font-black px-2 py-0.5 rounded-md"
                              style={{
                                background: 'rgba(34, 197, 94, 0.2)',
                                color: '#86efac',
                                border: '1px solid rgba(34, 197, 94, 0.45)',
                              }}
                            >
                              ✨ إنجاز جديد!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span
                      className="text-xs font-black px-2 py-1 rounded-lg tabular-nums shrink-0"
                      style={{ background: 'rgba(0,0,0,0.4)', color: '#4ade80' }}
                    >
                      +{ach.def.xp} XP
                    </span>
                  </div>

                  <p className="text-xs m-0 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {ach.def.desc}
                  </p>

                  <div
                    className="flex items-center justify-between text-[11px] font-bold pt-2 border-t"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <span style={{ color: ach.holderIsP1 ? 'var(--primary)' : 'var(--secondary)' }}>
                      🏅 {ach.holderName}
                    </span>
                    <span className="tabular-nums" style={{ color: 'var(--accent-soft)' }}>
                      {ach.detailText}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className="rounded-2xl p-5 text-center"
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
            }}
          >
            لم يتم تحقيق إنجاز خاص في هذه الجولة — حاول تنفيذ كومبو من 4 ضربات أو توجيه أول ضربة أو حسم النزال بسوبر!
          </div>
        )}
      </div>

      {/* Match Performance Stats Comparison */}
      <div className="w-full max-w-[1140px] flex flex-col gap-2.5">
        <h2 className="text-lg font-black m-0 px-1" style={{ color: 'var(--accent)' }}>
          📊 إحصائيات الأداء القتالي
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <FighterStatsCard stats={result.p1Stats} isWinner={result.winnerIsP1 === true} />
          <FighterStatsCard stats={result.p2Stats} isWinner={result.winnerIsP1 === false} />
        </div>
      </div>

      {/* Full Career Achievement Trophy Case */}
      <div
        className="w-full max-w-[1140px] rounded-2xl p-4 flex flex-col gap-3"
        style={{
          background: 'linear-gradient(155deg, var(--surface-2), var(--surface-3))',
          border: '1.5px solid var(--border-subtle)',
        }}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-base font-black" style={{ color: 'var(--text-main)' }}>
              🗂️ سجل جميع الإنجازات ({unlockedSet.size} / {ACHIEVEMENTS_CATALOG.length})
            </span>
          </div>
          <div className="flex items-center gap-2.5 min-w-[200px]">
            <div
              className="flex-1 h-2.5 rounded-full overflow-hidden"
              style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}
            >
              <div
                className="h-full"
                style={{
                  width: `${careerCompletionPct}%`,
                  background: 'linear-gradient(90deg, var(--primary), var(--secondary), var(--accent))',
                }}
              />
            </div>
            <span className="text-xs font-black tabular-nums" style={{ color: 'var(--accent)' }}>
              {careerCompletionPct}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {ACHIEVEMENTS_CATALOG.map((def) => {
            const unlocked = unlockedSet.has(def.id);
            const rStyle = RARITY_STYLES[def.rarity];
            return (
              <div
                key={def.id}
                className="rounded-xl p-2.5 flex items-center gap-2.5"
                style={{
                  background: unlocked ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.3)',
                  border: unlocked ? `1px solid ${rStyle.border}` : '1px solid var(--border-subtle)',
                  opacity: unlocked ? 1 : 0.62,
                }}
              >
                <span className="text-xl shrink-0">{unlocked ? def.icon : '🔒'}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black truncate" style={{ color: unlocked ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    {def.title}
                  </div>
                  <div className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                    {unlocked ? `✅ مفتوح • +${def.xp} XP` : def.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-[1140px] pt-1">
        <button
          type="button"
          onClick={onRematch}
          className="py-3 px-7 text-sm font-black rounded-xl cursor-pointer border-0 transition-transform hover:scale-105"
          style={{
            background: 'linear-gradient(90deg, var(--primary), var(--secondary), var(--accent))',
            color: 'var(--btn-text-dark)',
            boxShadow: '0 8px 24px var(--glow-primary)',
          }}
        >
          ⚔️ جولة ثأرية
        </button>
        <button
          type="button"
          onClick={onGoToCharSelect}
          className="py-3 px-6 text-sm font-black rounded-xl cursor-pointer"
          style={{
            background: 'linear-gradient(90deg, var(--surface-2), var(--surface-3))',
            border: '1.5px solid var(--border-main)',
            color: 'var(--accent-soft)',
          }}
        >
          👕 تغيير الشخصيات والملابس
        </button>
        <button
          type="button"
          onClick={onGoToMenu}
          className="py-3 px-6 text-sm font-black rounded-xl cursor-pointer"
          style={{
            background: 'linear-gradient(90deg, var(--surface-2), var(--surface-3))',
            border: '1.5px solid var(--border-subtle)',
            color: 'var(--text-main)',
          }}
        >
          🏠 القائمة الرئيسية
        </button>
      </div>
    </div>
  );
};
