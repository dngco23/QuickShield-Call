import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useSafety } from '@/lib/safetyContext.jsx';

export default function HiddenSettings() {
  const { showSettings, setShowSettings, settings, saveSettings, stealthMode, setStealthMode } = useSafety();
  const [form, setForm] = useState(settings);

  const handleSave = () => {
    saveSettings(form);
    setShowSettings(false);
  };

  return (
    <AnimatePresence>
      {showSettings && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowSettings(false)}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold text-foreground">Preferences</h2>
              <button onClick={() => setShowSettings(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Caller Name</Label>
                <Input
                  value={form.callerName}
                  onChange={(e) => setForm({ ...form, callerName: e.target.value })}
                  placeholder="e.g. Mom, Sarah, Work"
                  className="bg-muted/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Caller Number</Label>
                <Input
                  value={form.callerNumber}
                  onChange={(e) => setForm({ ...form, callerNumber: e.target.value })}
                  placeholder="+1 (555) 012-3456"
                  className="bg-muted/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Trigger Word</Label>
                <Input
                  value={form.triggerWord}
                  onChange={(e) => setForm({ ...form, triggerWord: e.target.value.toLowerCase() })}
                  placeholder="Type in search to activate"
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">Type this word in the search bar to trigger a call</p>
              </div>

              <div className="border-t border-border/50 pt-4 mt-1">
                <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider mb-4">SOS Emergency Contact</p>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Contact Name</Label>
                    <Input
                      value={form.emergencyContactName}
                      onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
                      placeholder="e.g. Mom, Best Friend"
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
                    <p className="text-xs text-muted-foreground">SOS SMS will be sent to this number</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm text-muted-foreground">
                  Call Delay: {form.callDelay}s
                </Label>
                <Slider
                  value={[form.callDelay]}
                  onValueChange={([v]) => setForm({ ...form, callDelay: v })}
                  min={0}
                  max={30}
                  step={1}
                  className="py-2"
                />
                <p className="text-xs text-muted-foreground">Seconds before the call appears after triggering</p>
              </div>

              <div className="border-t border-border/50 pt-4 mt-1">
                <p className="text-xs font-medium text-foreground/60 uppercase tracking-wider mb-4">Voice Control (Beta)</p>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Voice Wake-Word</Label>
                  <Input
                    value={form.voiceWakeWord}
                    onChange={(e) => setForm({ ...form, voiceWakeWord: e.target.value.toLowerCase() })}
                    placeholder="e.g. help, code red, mayday"
                    className="bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground">Leave empty to disable. The app will listen for this word and trigger the fake call.</p>
                </div>
              </div>

              <div className="border-t border-border/50 pt-4 mt-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Stealth Mode</p>
                    <p className="text-xs text-muted-foreground">Hide as calculator or weather app</p>
                  </div>
                  <button
                    onClick={() => setStealthMode(!stealthMode)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      stealthMode ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        stealthMode ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>
                {stealthMode && (
                  <div className="mt-3 space-y-2">
                    <Label className="text-sm text-muted-foreground">Choose Disguise</Label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setForm({ ...form, stealthModeType: 'calculator' })}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                          form.stealthModeType === 'calculator'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        🧮 Calculator
                      </button>
                      <button
                        onClick={() => setForm({ ...form, stealthModeType: 'weather' })}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                          form.stealthModeType === 'weather'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        ☀️ Weather
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground pt-2">Tap the display 5 times to exit stealth mode</p>
                  </div>
                )}
              </div>
            </div>

            <Button onClick={handleSave} className="w-full mt-6 bg-primary hover:bg-primary/90">
              Save Changes
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}