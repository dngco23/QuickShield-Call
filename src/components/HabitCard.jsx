import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, Flame } from 'lucide-react';
import { Sparkline } from './Sparkline';

const colorMap = {
  red: 'bg-red-50 border-red-200',
  orange: 'bg-orange-50 border-orange-200',
  yellow: 'bg-yellow-50 border-yellow-200',
  green: 'bg-green-50 border-green-200',
  blue: 'bg-blue-50 border-blue-200',
  purple: 'bg-purple-50 border-purple-200',
  pink: 'bg-pink-50 border-pink-200',
};

const colorTextMap = {
  red: 'text-red-700',
  orange: 'text-orange-700',
  yellow: 'text-yellow-700',
  green: 'text-green-700',
  blue: 'text-blue-700',
  purple: 'text-purple-700',
  pink: 'text-pink-700',
};

export default function HabitCard({ habit, onComplete, isCompleting }) {
  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = (habit.completion_dates || []).includes(today);
  
  const weeklyData = habit.weekly_completions || [0, 0, 0, 0, 0, 0, 0];
  const weeklyTotal = weeklyData.reduce((a, b) => a + b, 0);
  const completionRate = Math.round((weeklyTotal / 7) * 100);

  const colorClass = colorMap[habit.color] || colorMap.blue;
  const colorText = colorTextMap[habit.color] || colorTextMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-4 transition-all ${colorClass} ${
        isCompletedToday ? 'ring-2 ring-accent' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{habit.icon || '⭐'}</span>
            <h3 className="font-medium text-foreground">{habit.title}</h3>
          </div>
          {habit.description && (
            <p className="text-xs text-foreground/60 ml-7">{habit.description}</p>
          )}
        </div>
        <motion.button
          onClick={onComplete}
          disabled={isCompletedToday || isCompleting}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition-all ${
            isCompletedToday
              ? `bg-accent text-accent-foreground`
              : `bg-white/50 border border-white hover:bg-white`
          } ${isCompleting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isCompletedToday ? (
            <Check className="w-4 h-4" />
          ) : (
            <Check className="w-4 h-4 opacity-30" />
          )}
        </motion.button>
      </div>

      <div className="space-y-3">
        {/* Streak Display */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Flame className={`w-4 h-4 ${habit.current_streak > 0 ? 'text-orange-500' : 'text-muted-foreground/30'}`} />
            <div>
              <p className="text-xs text-foreground/60">Current Streak</p>
              <p className={`text-sm font-bold ${colorText}`}>{habit.current_streak} days</p>
            </div>
          </div>
          <div className="border-l border-white/30" />
          <div>
            <p className="text-xs text-foreground/60">Best Streak</p>
            <p className={`text-sm font-bold ${colorText}`}>{habit.longest_streak || 0} days</p>
          </div>
        </div>

        {/* Sparkline Chart */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-foreground/70">This Week</p>
            <p className={`text-xs font-bold ${colorText}`}>{completionRate}%</p>
          </div>
          <Sparkline
            data={weeklyData}
            color={habit.color}
            height={30}
          />
          <div className="flex justify-between text-xs text-foreground/50 px-0.5">
            <span>Sun</span>
            <span>Sat</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}