import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const HABIT_EMOJIS = ['⭐', '🏃', '📚', '🧘', '💪', '🎵', '🎨', '📝', '🥗', '😴', '💧', '🧠'];
const COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'];

export default function HabitForm({ onSubmit, onCancel, isLoading }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    icon: '⭐',
    color: 'blue',
    goal_frequency: 'daily'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Please enter a habit name');
      return;
    }
    onSubmit({
      ...form,
      completion_dates: [],
      current_streak: 0,
      longest_streak: 0,
      weekly_completions: [0, 0, 0, 0, 0, 0, 0],
      is_active: true
    });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-muted/30 border border-border rounded-xl p-4 space-y-4"
    >
      <div>
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Habit Name</Label>
        <Input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g., Morning meditation, Exercise"
          className="mt-1 bg-background"
        />
      </div>

      <div>
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description (optional)</Label>
        <Input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Why this habit matters to you"
          className="mt-1 bg-background"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Icon</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {HABIT_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setForm({ ...form, icon: emoji })}
                className={`p-2 rounded-lg border transition-all ${
                  form.icon === emoji
                    ? 'bg-primary/20 border-primary'
                    : 'bg-background border-border hover:bg-muted'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Color</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm({ ...form, color: c })}
                className={`h-8 w-8 rounded-full border-2 transition-all ${
                  form.color === c ? 'border-foreground scale-110' : 'border-transparent'
                }`}
                style={{
                  backgroundColor: {
                    red: '#ef4444',
                    orange: '#f97316',
                    yellow: '#eab308',
                    green: '#22c55e',
                    blue: '#3b82f6',
                    purple: '#a855f7',
                    pink: '#ec4899',
                  }[c]
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Habit'
          )}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </motion.form>
  );
}