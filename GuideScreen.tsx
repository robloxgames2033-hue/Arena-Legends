import React from 'react';
import { PASSIVE_GUIDE_ITEMS } from '../data/gameData';

interface GuideScreenProps {
  onBack: () => void;
  onNextToChars: () => void;
}

export const GuideScreen: React.FC<GuideScreenProps> = ({ onBack, onNextToChars }) => {
  const p1Moves = [
    { label: 'حركة', keys: ['A', 'D'] },
    { label: 'قفز', keys: ['W'] },
    { label: 'صد وواقية', keys: ['S'] },
    { label: 'اندفاع', keys: ['Q'] },
    { label: 'إمساك ورمي', keys: ['E'] },
    { label: 'هجوم', keys: ['F'] },
    { label: 'ركلة', keys: ['G'] },
    { label: 'EX (50%)', keys: ['R'] },
    { label: 'القاضية (100%)', keys: ['H'] },
    { label: 'إيقاف مؤقت', keys: ['Esc'] },
  ];

  const p2Moves = [
    { label: 'حركة', keys: ['◄', '►'] },
    { label: 'قفز', keys: ['▲'] },
    { label: 'صد وواقية', keys: ['▼'] },
    { label: 'اندفاع', keys: ['O'] },
    { label: 'إمساك ورمي', keys: ['P'] },
    { label: 'هجوم', keys: ['K'] },
    { label: 'ركلة', keys: ['L'] },
    { label: 'EX (50%)', keys: ['U'] },
    { label: 'القاضية (100%)', keys: ['M'] },
  ];

  return (
    <div className="screen pt-10">
      <div className="w-full max-w-[1100px] flex items-center justify-between gap-3 flex-wrap">
        <span
          className="px-3 py-1 rounded-full text-xs font-black tracking-wider"
          style={{
            background: 'var(--glow-primary)',
            color: 'var(--accent)',
            border: '1px solid var(--border-main)',
          }}
        >
          AREN-LEGENG GUIDE
        </span>
        <h1 className="title-gradient text-2xl sm:text-[26px] m-0 text-center">
          دليل الحركات والقدرات — ساحة الأساطير
        </h1>
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2 text-sm font-black rounded-[10px] cursor-pointer transition-transform hover:translate-x-1"
          style={{
            background: 'linear-gradient(90deg, var(--surface-2), var(--surface-3))',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-main)',
          }}
        >
          ➔ رجوع للقائمة الرئيسية
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1.25fr] gap-3.5 w-full max-w-[1100px] flex-1 my-2.5 overflow-y-auto">
        <div
          className="rounded-[14px] p-3.5 flex flex-col gap-2.5"
          style={{
            background: 'linear-gradient(145deg, var(--surface-2), var(--surface-3))',
            border: '1.5px solid var(--border-subtle)',
          }}
        >
          <h3 className="m-0 text-[15.5px] font-black flex items-center justify-between" style={{ color: 'var(--accent)' }}>
            <span>🎮 أزرار التحكم والقتال</span>
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              P1 &amp; P2
            </span>
          </h3>

          <div
            className="rounded-[10px] p-2.5"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="text-[13px] font-black mb-1.5" style={{ color: 'var(--accent)' }}>
              اللاعب الأول (P1)
            </div>
            <div className="flex flex-wrap gap-1.5 text-[11.5px]" style={{ color: 'var(--accent-soft)' }}>
              {p1Moves.map((m) => (
                <span
                  key={m.label}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[7px]"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}
                >
                  <span>{m.label}</span>
                  {m.keys.map((k) => (
                    <span
                      key={k}
                      className="px-1.5 rounded font-mono font-bold text-[11px]"
                      style={{
                        background: 'var(--bg-dark)',
                        border: '1px solid var(--secondary)',
                        color: 'var(--accent)',
                      }}
                    >
                      {k}
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>

          <div
            className="rounded-[10px] p-2.5"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="text-[13px] font-black mb-1.5" style={{ color: 'var(--primary)' }}>
              اللاعب الثاني (P2)
            </div>
            <div className="flex flex-wrap gap-1.5 text-[11.5px]" style={{ color: 'var(--accent-soft)' }}>
              {p2Moves.map((m) => (
                <span
                  key={m.label}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[7px]"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}
                >
                  <span>{m.label}</span>
                  {m.keys.map((k) => (
                    <span
                      key={k}
                      className="px-1.5 rounded font-mono font-bold text-[11px]"
                      style={{
                        background: 'var(--bg-dark)',
                        border: '1px solid var(--secondary)',
                        color: 'var(--accent)',
                      }}
                    >
                      {k}
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>

          <div
            className="rounded-[10px] p-2.5"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="text-[13px] font-black mb-1.5" style={{ color: 'var(--accent)' }}>
              🔥 قواعد الحلبة والتحسينات
            </div>
            <div className="flex flex-col gap-1 text-[11.5px]" style={{ color: 'var(--accent-soft)' }}>
              <span>• <b>عدّاد التحمل والصد:</b> الصد والاندفاع يستهلكان التحمل؛ نفاد التحمل يسبب كسر الدفاع (Guard Crush).</span>
              <span>• <b>الإمساك والرمي والاسترداد:</b> استخدم (E / P) لرمي الخصم وكسر الصد، واضغط حركة/اندفاع عند السقوط للنهوض السريع (Tech Roll).</span>
              <span>• <b>حركة EX (50%) وتفاعل الحلبة:</b> أطلق حركة EX بنصف الطاقة، واستفد من صناديق الحلبة التفاعلية.</span>
            </div>
          </div>
        </div>

        <div
          className="rounded-[14px] p-3.5 flex flex-col gap-2.5"
          style={{
            background: 'linear-gradient(145deg, var(--surface-2), var(--surface-3))',
            border: '1.5px solid var(--border-subtle)',
          }}
        >
          <h3 className="m-0 text-[15.5px] font-black flex items-center justify-between" style={{ color: 'var(--accent)' }}>
            <span>🌟 قدرات الأبطال الأصلية (9 شخصيات)</span>
            <span className="text-[11px]" style={{ color: 'var(--accent)' }}>
              36 زياً
            </span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {PASSIVE_GUIDE_ITEMS.map((item) => (
              <div
                key={item.name}
                className="rounded-[10px] p-2.5"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}
              >
                <div className="text-[12px] font-black mb-0.5" style={{ color: 'var(--accent)' }}>
                  {item.name}
                </div>
                <div className="text-[11px] leading-snug" style={{ color: 'var(--text-muted)' }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="w-full max-w-[1140px] flex justify-between items-center pt-2.5 gap-2.5 flex-wrap"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2 text-[14.5px] font-black rounded-[10px] cursor-pointer"
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
          onClick={onNextToChars}
          className="px-6 py-2 text-[14.5px] font-black rounded-[10px] cursor-pointer border-0"
          style={{
            background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
            color: 'var(--text-main)',
            boxShadow: '0 0 18px var(--glow-primary)',
          }}
        >
          اختيار الشخصيات ⬅️
        </button>
      </div>
    </div>
  );
};
