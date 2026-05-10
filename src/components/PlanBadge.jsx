import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useSubscription } from '@/lib/useSubscription';

const PLAN_STYLES = {
  Plus: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
  Pro: 'bg-gradient-to-r from-primary to-primary/80 text-white',
  Free: 'bg-muted text-muted-foreground',
};

export default function PlanBadge() {
  const { planName, loading } = useSubscription();

  if (loading) return null;

  return (
    <Link to="/pricing">
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${PLAN_STYLES[planName] || PLAN_STYLES.Free}`}>
        <Shield className="w-3 h-3" />
        {planName}
      </div>
    </Link>
  );
}