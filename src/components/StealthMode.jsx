import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSafety } from '@/lib/safetyContext.jsx';

export default function StealthMode() {
  const { settings, stealthMode, setStealthMode } = useSafety();
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [temp] = useState(23);
  const [tapSequence, setTapSequence] = useState([]);

  // Hidden gesture: tap the display 5 times quickly to exit stealth mode
  const handleDisplayTap = () => {
    const now = Date.now();
    const newSequence = [...tapSequence, now].filter(t => now - t < 1000);
    setTapSequence(newSequence);

    if (newSequence.length >= 5) {
      setStealthMode(false);
      setTapSequence([]);
    }
  };

  if (!stealthMode) return null;

  // Calculator View
  if (settings.stealthModeType === 'calculator') {
    const handleCalcClick = (value) => {
      if (value === 'C') {
        setCalcDisplay('0');
      } else if (value === '=') {
        try {
          setCalcDisplay(String(eval(calcDisplay)));
        } catch {
          setCalcDisplay('Error');
        }
      } else {
        setCalcDisplay(calcDisplay === '0' ? String(value) : calcDisplay + value);
      }
    };

    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xs bg-gray-900 rounded-3xl shadow-2xl p-6 border border-gray-800"
        >
          <div
            onClick={handleDisplayTap}
            className="bg-gray-800 rounded-2xl p-6 mb-6 text-right cursor-pointer active:scale-95 transition-transform"
          >
            <p className="text-gray-500 text-sm font-mono">Calculator</p>
            <p className="text-white text-4xl font-mono font-bold tracking-wider break-words">
              {calcDisplay}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[
              ['7', '8', '9', '/'],
              ['4', '5', '6', '*'],
              ['1', '2', '3', '-'],
              ['0', '.', '=', '+'],
            ].map((row, i) => (
              <React.Fragment key={i}>
                {row.map((btn) => (
                  <button
                    key={btn}
                    onClick={() => handleCalcClick(btn)}
                    className={`p-4 rounded-xl font-semibold text-lg transition-all active:scale-90 ${
                      btn === '=' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white col-span-1'
                        : 'bg-gray-800 hover:bg-gray-700 text-white'
                    }`}
                  >
                    {btn}
                  </button>
                ))}
              </React.Fragment>
            ))}
            <button
              onClick={() => handleCalcClick('C')}
              className="col-span-4 bg-red-600 hover:bg-red-700 text-white p-4 rounded-xl font-semibold transition-all active:scale-90"
            >
              Clear
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Weather View
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-white/80 text-sm font-medium mb-2">Today</p>
        <p className="text-white/60 text-xs mb-8">Sydney, Australia</p>

        <motion.div
          onClick={handleDisplayTap}
          className="text-8xl mb-6 cursor-pointer active:scale-95 transition-transform"
        >
          ☀️
        </motion.div>

        <div className="text-white">
          <p className="text-6xl font-light mb-2">{temp}°</p>
          <p className="text-2xl font-light mb-8">Sunny</p>
        </div>

        <div className="flex gap-8 justify-center text-white/90">
          <div>
            <p className="text-sm opacity-70 mb-1">Humidity</p>
            <p className="text-xl font-semibold">65%</p>
          </div>
          <div>
            <p className="text-sm opacity-70 mb-1">Wind</p>
            <p className="text-xl font-semibold">12 km/h</p>
          </div>
          <div>
            <p className="text-sm opacity-70 mb-1">UV Index</p>
            <p className="text-xl font-semibold">8</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}