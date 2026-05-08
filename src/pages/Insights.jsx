import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3, TrendingUp, AlertCircle, Phone, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const StatCard = ({ icon: IconComponent, label, value, subtext, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-card rounded-2xl border border-border p-4"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <IconComponent className="w-5 h-5" />
      </div>
    </div>
  </motion.div>
);

export default function Insights() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    sosActivations: 0,
    fakeCalls: 0,
    panicSessions: 0,
    checkIns: 0,
    recordingsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Fetch recordings to count SOS activations
        const recordings = await base44.entities.Recording.list();
        const sosCount = recordings.filter((r) => r.event_type === 'sos').length;
        const fakeCallCount = recordings.filter((r) => r.event_type === 'fake_call').length;

        // Get usage from localStorage
        const journalEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
        const panicSessions = JSON.parse(localStorage.getItem('panicSessions') || '[]').length;
        const checkIns = JSON.parse(localStorage.getItem('checkIns') || '[]').length;

        setStats({
          sosActivations: sosCount,
          fakeCalls: fakeCallCount,
          panicSessions,
          checkIns,
          recordingsCount: recordings.length,
        });
      } catch (_) {
        // Fallback to localStorage only
        const panicSessions = JSON.parse(localStorage.getItem('panicSessions') || '[]').length;
        const checkIns = JSON.parse(localStorage.getItem('checkIns') || '[]').length;
        setStats((prev) => ({
          ...prev,
          panicSessions,
          checkIns,
        }));
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const totalActivations = stats.sosActivations + stats.fakeCalls + stats.panicSessions + stats.checkIns;
  const weeklyAverage = Math.ceil(totalActivations / 4);

  return (
    <div className="min-h-screen bg-background pb-20">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-5 pt-8 pb-6"
      >
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h1 className="font-display text-2xl font-semibold">Insights</h1>
        </div>
      </motion.div>

      <div className="px-5 space-y-6">
        {/* Overview */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Safety Features Usage</p>
          <StatCard
            icon={TrendingUp}
            label="Total Activations"
            value={totalActivations}
            subtext={`~${weeklyAverage} per week`}
            color="bg-primary/10 text-primary"
          />
        </div>

        {/* Feature Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={AlertCircle}
            label="SOS Activations"
            value={stats.sosActivations}
            color="bg-destructive/10 text-destructive"
          />
          <StatCard
            icon={Phone}
            label="Fake Calls"
            value={stats.fakeCalls}
            color="bg-primary/10 text-primary"
          />
          <StatCard
            icon={AlertCircle}
            label="Panic Sessions"
            value={stats.panicSessions}
            color="bg-yellow-500/10 text-yellow-600"
          />
          <StatCard
            icon={Clock}
            label="Check-Ins"
            value={stats.checkIns}
            color="bg-green-500/10 text-green-600"
          />
        </div>

        {/* Usage Insights */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl border border-border p-4 space-y-3"
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Insights</p>
          <div className="space-y-2">
            {totalActivations === 0 ? (
              <p className="text-sm text-muted-foreground">Start using safety features to see insights about your usage patterns.</p>
            ) : (
              <>
                <p className="text-sm text-foreground">
                  You've activated safety features <span className="font-semibold">{totalActivations} times</span>.
                </p>
                {stats.sosActivations > 0 && (
                  <p className="text-sm text-foreground/70">
                    Your most used feature is <span className="font-medium">SOS</span> ({stats.sosActivations} times).
                  </p>
                )}
                {stats.checkIns > 0 && (
                  <p className="text-sm text-foreground/70">
                    You've completed <span className="font-medium">{stats.checkIns} check-ins</span>, showing good safety awareness.
                  </p>
                )}
              </>
            )}
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-accent/20 rounded-2xl border border-accent/40 p-4"
        >
          <p className="text-xs font-medium text-accent-foreground uppercase tracking-wide mb-2">Safety Tip</p>
          <p className="text-sm text-accent-foreground/80">
            Regular check-ins help you stay aware of your surroundings and build confidence in your safety practices.
          </p>
        </motion.div>
      </div>
    </div>
  );
}