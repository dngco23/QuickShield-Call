import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, BookOpen, MapPin, ShieldAlert } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format, subDays, startOfDay } from 'date-fns';

const DAYS = 7;

export default function ActivityDashboard() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ sos: 0, journals: 0, zones: 0, recordings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [recordings, journals, zoneNotifs] = await Promise.all([
          base44.entities.Recording.list('-created_date', 100),
          base44.entities.JournalEntry.list('-created_date', 100),
          base44.entities.ZoneNotification.list('-created_date', 100),
        ]);

        // Build last 7 days buckets
        const days = Array.from({ length: DAYS }, (_, i) => {
          const date = startOfDay(subDays(new Date(), DAYS - 1 - i));
          return { date, label: format(date, 'EEE'), sos: 0, journal: 0, zone: 0 };
        });

        const bucket = (dateStr) => {
          const d = startOfDay(new Date(dateStr));
          return days.findIndex(b => b.date.getTime() === d.getTime());
        };

        recordings.forEach(r => {
          const i = bucket(r.created_date);
          if (i >= 0) days[i].sos++;
        });
        journals.forEach(j => {
          const i = bucket(j.created_date);
          if (i >= 0) days[i].journal++;
        });
        zoneNotifs.forEach(z => {
          const i = bucket(z.created_date);
          if (i >= 0) days[i].zone++;
        });

        setData(days.map(d => ({ label: d.label, Safety: d.sos, Journal: d.journal, Zone: d.zone })));
        setStats({
          sos: recordings.filter(r => r.event_type === 'sos').length,
          recordings: recordings.length,
          journals: journals.length,
          zones: zoneNotifs.length,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = [
    { icon: ShieldAlert, label: 'SOS Events', value: stats.sos, color: 'text-red-500', bg: 'bg-red-50' },
    { icon: BookOpen, label: 'Journal Entries', value: stats.journals, color: 'text-primary', bg: 'bg-primary/10' },
    { icon: MapPin, label: 'Zone Alerts', value: stats.zones, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: Shield, label: 'Recordings', value: stats.recordings, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  if (loading) {
    return (
      <div className="bg-card border border-border/50 rounded-2xl p-5">
        <div className="h-40 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card border border-border/50 rounded-2xl p-5 space-y-5"
    >
      <div>
        <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider">Activity Overview</p>
        <p className="text-sm text-muted-foreground mt-0.5">Last 7 days</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-3 flex items-center gap-3`}>
            <div className={`${s.color} flex-shrink-0`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Chart */}
      <div>
        <p className="text-xs text-muted-foreground mb-3">Daily activity breakdown</p>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={data} barSize={8} barGap={2}>
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: 'none', fontSize: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}
              cursor={{ fill: 'hsl(var(--muted))', radius: 4 }}
            />
            <Bar dataKey="Safety" fill="#ef4444" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Journal" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Zone" fill="#10b981" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 justify-center">
          {[['Safety', '#ef4444'], ['Journal', 'hsl(var(--primary))'], ['Zone', '#10b981']].map(([label, color]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}