import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    emergencyContact1Name: '',
    emergencyContact1Number: '',
    emergencyContact2Name: '',
    emergencyContact2Number: '',
    country: 'AU',
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
          country: currentUser.country || 'AU',
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
        country: form.country,
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

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border/50 p-6 max-w-md"
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
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || saved}
            className="w-full mt-6 bg-primary hover:bg-primary/90 disabled:opacity-70"
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