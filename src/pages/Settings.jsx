import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ emergencyContactName: '', emergencyContactNumber: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setForm({
          emergencyContactName: currentUser.emergencyContactName || '',
          emergencyContactNumber: currentUser.emergencyContactNumber || '',
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
        emergencyContactName: form.emergencyContactName,
        emergencyContactNumber: form.emergencyContactNumber,
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
            Manage your emergency contact for the SOS feature
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
              <Label className="text-sm text-muted-foreground">Contact Name</Label>
              <Input
                value={form.emergencyContactName}
                onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
                placeholder="e.g. Mom, Best Friend, Partner"
                className="bg-muted/50"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Contact Phone Number</Label>
              <Input
                value={form.emergencyContactNumber}
                onChange={(e) => setForm({ ...form, emergencyContactNumber: e.target.value })}
                placeholder="+1 (555) 012-3456"
                className="bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">
                This is where SOS alerts will be sent
              </p>
            </div>

            <div className="bg-accent/30 border border-accent rounded-xl p-4">
              <p className="text-xs text-accent-foreground/70 font-body">
                💡 Your emergency contact will receive an SMS with your GPS location when you activate SOS.
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