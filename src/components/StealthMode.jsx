import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSafety } from '@/lib/safetyContext.jsx';

// ─── Shared exit gesture hook ───────────────────────────────────────────────
function useExitGesture(onExit) {
  const [taps, setTaps] = useState([]);
  const handleTap = () => {
    const now = Date.now();
    const recent = [...taps, now].filter(t => now - t < 1500);
    setTaps(recent);
    if (recent.length >= 5) { onExit(); setTaps([]); }
  };
  return handleTap;
}

// ─── Calculator disguise ─────────────────────────────────────────────────────
function CalcView({ onExit }) {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState(null);
  const [op, setOp] = useState(null);
  const [fresh, setFresh] = useState(false);
  const handleTap = useExitGesture(onExit);

  const press = (val) => {
    if (val === 'AC') { setDisplay('0'); setPrev(null); setOp(null); setFresh(false); return; }
    if (val === '+/-') { setDisplay(d => d.startsWith('-') ? d.slice(1) : '-' + d); return; }
    if (val === '%') { setDisplay(d => String(parseFloat(d) / 100)); return; }
    if (['+', '−', '×', '÷'].includes(val)) {
      setPrev(parseFloat(display)); setOp(val); setFresh(true); return;
    }
    if (val === '=') {
      if (prev === null || !op) return;
      const cur = parseFloat(display);
      const map = { '+': prev + cur, '−': prev - cur, '×': prev * cur, '÷': prev / cur };
      setDisplay(String(map[op])); setPrev(null); setOp(null); setFresh(true); return;
    }
    if (val === '.') {
      if (fresh) { setDisplay('0.'); setFresh(false); return; }
      if (!display.includes('.')) setDisplay(d => d + '.');
      return;
    }
    if (fresh) { setDisplay(String(val)); setFresh(false); }
    else setDisplay(d => d === '0' ? String(val) : d + val);
  };

  const rows = [
    ['AC', '+/-', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '−'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ];

  return (
    <div className="min-h-screen bg-black flex flex-col justify-end pb-6 px-4 select-none">
      {/* Display */}
      <div onClick={handleTap} className="px-2 pb-4 cursor-pointer">
        <p className="text-white/30 text-xs text-right mb-1 font-mono">
          {op ? `${prev} ${op}` : ''}
        </p>
        <p className="text-white font-light text-right leading-none"
           style={{ fontSize: display.length > 9 ? '2.5rem' : display.length > 6 ? '3.5rem' : '5rem' }}>
          {display}
        </p>
      </div>

      {/* Buttons */}
      <div className="space-y-3">
        {rows.map((row, ri) => (
          <div key={ri} className={`grid gap-3 ${row.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
            {row.map((btn) => {
              const isOp = ['÷', '×', '−', '+', '='].includes(btn);
              const isFunc = ['AC', '+/-', '%'].includes(btn);
              const isZero = btn === '0' && row.length === 3;
              return (
                <button
                  key={btn}
                  onClick={() => press(btn)}
                  className={`
                    ${isZero ? 'col-span-2 text-left pl-8' : ''}
                    h-20 rounded-full text-2xl font-medium transition-all active:opacity-70
                    ${isOp ? 'bg-amber-500 text-white' : isFunc ? 'bg-neutral-600 text-white' : 'bg-neutral-800 text-white'}
                  `}
                >
                  {btn}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Weather disguise ─────────────────────────────────────────────────────────
const FORECAST = [
  { day: 'Mon', icon: '☀️', hi: 28, lo: 19 },
  { day: 'Tue', icon: '🌤', hi: 25, lo: 17 },
  { day: 'Wed', icon: '🌧', hi: 21, lo: 15 },
  { day: 'Thu', icon: '⛅', hi: 24, lo: 16 },
  { day: 'Fri', icon: '☀️', hi: 29, lo: 20 },
];

function WeatherView({ onExit }) {
  const handleTap = useExitGesture(onExit);
  const time = new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-blue-600 flex flex-col px-5 pt-14 pb-8 select-none">
      {/* Top */}
      <div className="flex-1 flex flex-col items-center text-white">
        <p className="text-sm opacity-70 mb-1">{time}</p>
        <p className="text-2xl font-semibold mb-1">Brisbane</p>
        <p className="text-sm opacity-60 mb-10">Queensland, Australia</p>

        <div onClick={handleTap} className="cursor-pointer flex flex-col items-center active:opacity-80 transition-opacity">
          <p className="text-9xl mb-2">☀️</p>
          <p className="text-8xl font-thin mb-1">23°</p>
          <p className="text-xl opacity-90 mb-2">Sunny</p>
          <p className="text-sm opacity-60">H:29° L:18°</p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
        <div className="grid grid-cols-3 gap-4 text-white text-center">
          {[['💧', '65%', 'Humidity'], ['💨', '12 km/h', 'Wind'], ['☀️', 'High 8', 'UV Index']].map(([icon, val, label]) => (
            <div key={label}>
              <p className="text-xs opacity-70 mb-1">{label}</p>
              <p className="text-sm font-semibold">{icon} {val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Forecast */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
        <p className="text-white/60 text-xs uppercase tracking-wider mb-3">5-Day Forecast</p>
        <div className="space-y-2">
          {FORECAST.map(({ day, icon, hi, lo }) => (
            <div key={day} className="flex items-center justify-between text-white">
              <p className="w-10 text-sm opacity-80">{day}</p>
              <p className="text-lg">{icon}</p>
              <div className="flex gap-3 text-sm">
                <span className="opacity-60">{lo}°</span>
                <span className="font-medium">{hi}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── News disguise ─────────────────────────────────────────────────────────────
const NEWS_STORIES = [
  {
    category: 'WORLD',
    headline: 'Global Leaders Meet to Discuss Climate Agreements',
    summary: 'Representatives from over 80 nations convened in Geneva to finalise new emissions targets for the coming decade.',
    time: '2h ago',
    img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&q=60',
  },
  {
    category: 'TECHNOLOGY',
    headline: 'New Smartphone Models Break Pre-Order Records',
    summary: 'The latest flagship devices sold out within hours, driven by improved camera systems and battery life.',
    time: '4h ago',
    img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=60',
  },
  {
    category: 'SPORT',
    headline: 'Local Team Advances to Championship Finals',
    summary: 'A stunning last-minute goal sealed the victory in front of a sold-out home crowd.',
    time: '6h ago',
    img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=60',
  },
  {
    category: 'HEALTH',
    headline: 'Study Finds Daily Walks Reduce Stress Significantly',
    summary: 'Researchers from three major universities confirmed the link between regular movement and mental wellbeing.',
    time: '8h ago',
    img: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&q=60',
  },
  {
    category: 'BUSINESS',
    headline: 'Markets Close Higher on Strong Economic Data',
    summary: 'Positive employment figures lifted investor sentiment, with the main index gaining 1.4% by close.',
    time: '10h ago',
    img: null,
  },
];

function NewsView({ onExit }) {
  const handleTap = useExitGesture(onExit);
  const [active, setActive] = useState(null);

  const catColors = {
    WORLD: 'text-red-500', TECHNOLOGY: 'text-blue-500', SPORT: 'text-green-600',
    HEALTH: 'text-purple-500', BUSINESS: 'text-amber-600',
  };

  if (active !== null) {
    const story = NEWS_STORIES[active];
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-gray-100">
          <button onClick={() => setActive(null)} className="text-blue-600 font-medium text-sm">← Back</button>
          <p className="text-sm font-semibold text-gray-800 flex-1 text-center pr-12">NewsNow</p>
        </div>
        {story.img && (
          <img src={story.img} alt="" className="w-full h-52 object-cover" />
        )}
        <div className="px-5 pt-5 flex-1">
          <p className={`text-xs font-bold tracking-wider mb-2 ${catColors[story.category]}`}>{story.category}</p>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-3">{story.headline}</h1>
          <p className="text-xs text-gray-400 mb-4">{story.time} · Staff Reporter</p>
          <p className="text-gray-700 leading-relaxed text-base">{story.summary}</p>
          <p className="text-gray-500 mt-4 leading-relaxed text-sm">
            Ongoing developments are being closely monitored by international observers. Officials
            have pledged to release further updates as the situation evolves throughout the week.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col select-none">
      {/* Header */}
      <div onClick={handleTap} className="bg-white border-b border-gray-200 px-4 pt-12 pb-3 cursor-pointer">
        <p className="text-center text-2xl font-bold text-gray-900 tracking-tight">NewsNow</p>
        <p className="text-center text-xs text-gray-400 mt-0.5">
          {new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Top tabs */}
      <div className="bg-white border-b border-gray-100 px-4 py-2 flex gap-5 overflow-x-auto text-sm">
        {['Top Stories', 'World', 'Tech', 'Sport', 'Business'].map((tab, i) => (
          <button key={tab} className={`whitespace-nowrap pb-1 font-medium transition-colors ${i === 0 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Stories */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero story */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setActive(0)}
          className="w-full text-left bg-white border-b border-gray-100 block"
        >
          <img src={NEWS_STORIES[0].img} alt="" className="w-full h-48 object-cover" />
          <div className="px-4 py-4">
            <p className={`text-xs font-bold tracking-wider mb-1.5 ${catColors[NEWS_STORIES[0].category]}`}>{NEWS_STORIES[0].category}</p>
            <p className="text-lg font-bold text-gray-900 leading-tight mb-1">{NEWS_STORIES[0].headline}</p>
            <p className="text-xs text-gray-400">{NEWS_STORIES[0].time}</p>
          </div>
        </motion.button>

        {/* List stories */}
        {NEWS_STORIES.slice(1).map((story, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setActive(i + 1)}
            className="w-full text-left bg-white border-b border-gray-100 px-4 py-4 flex gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className={`text-[10px] font-bold tracking-wider mb-1 ${catColors[story.category]}`}>{story.category}</p>
              <p className="text-sm font-semibold text-gray-900 leading-snug mb-1 line-clamp-2">{story.headline}</p>
              <p className="text-xs text-gray-400">{story.time}</p>
            </div>
            {story.img && (
              <img src={story.img} alt="" className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export default function StealthMode() {
  const { stealthMode, setStealthMode, settings } = useSafety();
  if (!stealthMode) return null;

  const exit = () => setStealthMode(false);

  if (settings.stealthModeType === 'calculator') return <CalcView onExit={exit} />;
  if (settings.stealthModeType === 'news') return <NewsView onExit={exit} />;
  return <WeatherView onExit={exit} />;
}