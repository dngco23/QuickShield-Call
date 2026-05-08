import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTrial } from '@/lib/trialContext';

export default function TrialBanner() {
  const { trialInfo, isPro } = useTrial();

  if (!trialInfo || trialInfo.isExpired || isPro) {
    return null;
  }

  const isWarning = trialInfo.daysRemaining <= 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`px-5 pt-4 ${isWarning ? 'bg-red-50' : 'bg-blue-50'}`}
    >
      <div className={`rounded-lg p-4 flex items-center justify-between border ${
        isWarning ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'
      }`}>
        <div className="flex items-center gap-3">
          <Clock className={`w-5 h-5 flex-shrink-0 ${isWarning ? 'text-red-600' : 'text-blue-600'}`} />
          <div>
            <p className={`text-sm font-semibold ${isWarning ? 'text-red-900' : 'text-blue-900'}`}>
              {trialInfo.daysRemaining} day{trialInfo.daysRemaining !== 1 ? 's' : ''} of free trial remaining
            </p>
            <p className={`text-xs ${isWarning ? 'text-red-700' : 'text-blue-700'}`}>
              Unlock all pro features to continue after trial expires
            </p>
          </div>
        </div>
        <Link
          to="/settings"
          className={`flex-shrink-0 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
            isWarning
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <Zap className="w-4 h-4 inline mr-1" />
          Upgrade
        </Link>
      </div>
    </motion.div>
  );
}