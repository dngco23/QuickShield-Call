import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCountryOptions, getDefaultNumberForCountry } from '@/lib/countryNumbers';
import PrivacyPurge from '@/components/PrivacyPurge';
import MapDownloader from '@/components/MapDownloader';
import SubscriptionCard from '@/components/SubscriptionCard';
import VoiceCommandSetup from '@/components/VoiceCommandSetup';
import DeleteAccount from '@/components/DeleteAccount';
import { useTheme } from '@/lib/useTheme';

export default function Settings() {
  const navigate = useNavigate();
  const { isDark, toggle: toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    emergencyContact1Name: '',
    emergencyContact1Number: '',
    emergencyContact2Name: '',
    emergencyContact2Number: '',
    privacyPurgePin: '',
    privacyPurgeDays: 30,
    country: 'AU',
    voiceCommandTrigger: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setForm({
          emergencyContact1Name: currentUser.emergencyContact1Name || '',
          emergencyContact1Number: currentUser.emergencyContact1Number || '',
          emergencyContact2Name: currentUser.emergencyContact2Name || '',
          emergencyContact2Number: currentUser.emergencyContact2Number || '',
          privacyPurgePin: currentUser.privacyPurgePin || '',
          privacyPurgeDays: currentUser.privacyPurgeDays || 30,
          country: currentUser.country || 'AU',
          voiceCommandTrigger: currentUser.voiceCommandTrigger || '',
        });
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        emergencyContact1Name: form.emergencyContact1Name,
        emergencyContact1Number: form.emergencyContact1Number,
        emergencyContact2Name: form.emergencyContact2Name,
        emergencyContact2Number: form.emergencyContact2Number,
        privacyPurgePin: form.privacyPurgePin,
        privacyPurgeDays: form.privacyPurgeDays,
        country: form.country,
        voiceCommandTrigger: form.voiceCommandTrigger,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-body">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="px-5 pt-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-body font-medium">Back</span>
          </button>

          <h1 className="font-display text-2xl font-semibold text-foreground mb-2">Settings</h1>
          <p className="text-sm text-muted-foreground font-body mb-6">
            Manage your emergency contacts for the SOS feature
          </p>
        </motion.div>

        {/* Dark Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border/50 p-4 max-w-2xl mb-4 flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-medium text-foreground">Dark Mode</p>
            <p className="text-xs text-muted-foreground">Follows system preference by default</p>
          </div>
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`relative w-12 h-6 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center ${isDark ? 'bg-primary' : 'bg-muted'}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isDark ? 'translate-x-6' : ''}`} />
          </button>
        </motion.div>

        {/* Subscription Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card rounded-2xl border border-border/50 p-6 max-w-2xl mb-4"
        >
          <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider mb-4">Subscription</p>
          <SubscriptionCard />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border/50 p-6 max-w-2xl"
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Your Country</Label>
              <Select value={form.country} onValueChange={(value) => setForm({ ...form, country: value })}>
                <SelectTrigger className="bg-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getCountryOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This sets the default caller number format for fake calls
              </p>
            </div>

            <div className="border-b border-border/50 pb-5">
              <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider mb-4">Primary Contact</p>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Name</Label>
                <Input
                  value={form.emergencyContact1Name}
                  onChange={(e) => setForm({ ...form, emergencyContact1Name: e.target.value })}
                  placeholder="e.g. Mom, Best Friend"
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2 mt-3">
                <Label className="text-sm text-muted-foreground">Phone Number</Label>
                <Input
                  value={form.emergencyContact1Number}
                  onChange={(e) => setForm({ ...form, emergencyContact1Number: e.target.value })}
                  placeholder="+1 (555) 012-3456"
                  className="bg-muted/50"
                />
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider mb-4">Secondary Contact</p>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Name</Label>
                <Input
                  value={form.emergencyContact2Name}
                  onChange={(e) => setForm({ ...form, emergencyContact2Name: e.target.value })}
                  placeholder="e.g. Partner, Trusted Friend"
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2 mt-3">
                <Label className="text-sm text-muted-foreground">Phone Number</Label>
                <Input
                  value={form.emergencyContact2Number}
                  onChange={(e) => setForm({ ...form, emergencyContact2Number: e.target.value })}
                  placeholder="+1 (555) 012-3456"
                  className="bg-muted/50"
                />
              </div>
            </div>

            <div className="bg-accent/30 border border-accent rounded-xl p-4 mt-5">
              <p className="text-xs text-accent-foreground/70 font-body">
                💡 Your emergency contacts will receive SMS alerts with your GPS location when you activate SOS. Both contacts will be available in Panic Mode messaging.
              </p>
            </div>

            <Link to="/emergency-contacts" className="block mt-5 pt-5 border-t border-border/50">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">Manage Emergency Contacts</p>
                  <p className="text-xs text-muted-foreground mt-1">Add, edit, and organize contacts with priority levels</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </div>
            </Link>

            <PrivacyPurge 
              privacyPurgePin={form.privacyPurgePin}
              privacyPurgeDays={form.privacyPurgeDays}
            />

            <div className="border-t border-border/50 pt-5">
              <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider mb-4">Privacy Settings</p>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Privacy PIN (4-6 digits)</Label>
                  <Input
                    type="password"
                    value={form.privacyPurgePin}
                    onChange={(e) => setForm({ ...form, privacyPurgePin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    placeholder="••••"
                    maxLength={6}
                    className="bg-muted/50 tracking-widest text-center"
                  />
                  <p className="text-xs text-muted-foreground">Required to immediately purge all logs</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Auto-Purge After (days)</Label>
                  <Select value={form.privacyPurgeDays.toString()} onValueChange={(value) => setForm({ ...form, privacyPurgeDays: parseInt(value) })}>
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Old logs will be automatically deleted</p>
                </div>
              </div>
            </div>

            <MapDownloader />

            <div className="border-t border-border/50 pt-5">
              <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider mb-4">Voice Commands</p>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Custom Trigger Word</Label>
                <Input
                  value={form.voiceCommandTrigger}
                  onChange={(e) => setForm({ ...form, voiceCommandTrigger: e.target.value.toLowerCase() })}
                  placeholder="e.g. help, emergency, alert"
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">
                  Say this word to trigger a fake call. Built-in triggers: "SOS" and "panic"
                </p>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border-t border-destructive/20 pt-5 mt-5">
            <p className="text-xs font-medium text-destructive/60 uppercase tracking-wider mb-3">Danger Zone</p>
            <DeleteAccount />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || saved}
            className="w-full mt-6 bg-primary hover:bg-primary/90 disabled:opacity-70 min-h-[44px]"
          >
            {saved ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved</span>
              </div>
            ) : saving ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </div>
            ) : (
              'Save Contact'
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}