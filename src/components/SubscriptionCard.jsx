import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, ExternalLink, CreditCard, Calendar, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function SubscriptionCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await base44.functions.invoke('getBillingPortal', {});
        setData(res.data);
      } catch (err) {
        setError('Could not load subscription info.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleManageBilling = async () => {
    if (window.self !== window.top) {
      alert('Billing portal only works in the published app. Please visit the app directly.');
      return;
    }
    if (data?.portalUrl) {
      setPortalLoading(true);
      window.location.href = data.portalUrl;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
        {error}
      </div>
    );
  }

  const { subscription, portalUrl } = data || {};

  if (!subscription) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 bg-muted/30 rounded-xl p-4 border border-border/50">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Shield className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Free Plan</p>
            <p className="text-xs text-muted-foreground">Basic safety features</p>
          </div>
        </div>
        <Link to="/pricing">
          <Button className="w-full bg-primary hover:bg-primary/90">
            Upgrade to Pro or Plus
          </Button>
        </Link>
      </div>
    );
  }

  const planColors = {
    Pro: 'from-primary/10 to-primary/5 border-primary/20',
    Plus: 'from-purple-500/10 to-purple-500/5 border-purple-500/20',
  };
  const planIconColors = {
    Pro: 'bg-primary/15 text-primary',
    Plus: 'bg-purple-500/15 text-purple-600',
  };

  const colorClass = planColors[subscription.planName] || planColors.Pro;
  const iconColor = planIconColors[subscription.planName] || planIconColors.Pro;

  return (
    <div className="space-y-3">
      <div className={`bg-gradient-to-br ${colorClass} border rounded-xl p-4 space-y-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconColor}`}>
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{subscription.planName} Plan</p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                subscription.cancelAtPeriodEnd
                  ? 'bg-orange-100 text-orange-600'
                  : 'bg-green-100 text-green-600'
              }`}>
                {subscription.cancelAtPeriodEnd ? 'Cancels soon' : 'Active'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-foreground">
              {subscription.currency} ${subscription.amount}
            </p>
            <p className="text-xs text-muted-foreground">/ {subscription.interval}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {subscription.cancelAtPeriodEnd ? 'Access until' : 'Renews on'}{' '}
            {format(new Date(subscription.currentPeriodEnd), 'MMM d, yyyy')}
          </span>
        </div>
      </div>

      {portalUrl && (
        <Button
          onClick={handleManageBilling}
          disabled={portalLoading}
          variant="outline"
          className="w-full"
        >
          {portalLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <CreditCard className="w-4 h-4 mr-2" />
          )}
          Manage Billing
          <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-50" />
        </Button>
      )}
    </div>
  );
}