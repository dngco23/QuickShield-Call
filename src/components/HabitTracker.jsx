import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Check, Flame, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HabitCard from './HabitCard';
import HabitForm from './HabitForm';

export default function HabitTracker() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: habits = [], isLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: async () => {
      const allHabits = await base44.entities.Habit.list();
      return allHabits.filter((h) => h.is_active);
    },
  });

  const completeHabitMutation = useMutation({
    mutationFn: async (habitId) => {
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return;

      const today = new Date().toISOString().split('T')[0];
      const completionDates = habit.completion_dates || [];
      
      // Check if already completed today
      if (completionDates.includes(today)) {
        return; // Already completed
      }

      const newCompletionDates = [...completionDates, today];
      
      // Calculate streak
      let streak = 0;
      let checkDate = new Date();
      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (newCompletionDates.includes(dateStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      const longestStreak = Math.max(streak, habit.longest_streak || 0);
      
      // Update weekly completions
      const dayOfWeek = new Date().getDay();
      const weeklyCompletions = [...(habit.weekly_completions || [0, 0, 0, 0, 0, 0, 0])];
      weeklyCompletions[dayOfWeek]++;

      await base44.entities.Habit.update(habitId, {
        completion_dates: newCompletionDates,
        current_streak: streak,
        longest_streak: longestStreak,
        weekly_completions: weeklyCompletions
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const createHabitMutation = useMutation({
    mutationFn: async (habitData) => {
      await base44.entities.Habit.create(habitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      setShowForm(false);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card rounded-2xl border border-border/50 p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="font-display text-lg font-semibold text-foreground">Daily Habits</h2>
        </div>
        {habits.length > 0 && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
            {habits.length} active
          </span>
        )}
      </div>

      {!showForm ? (
        <Button
          onClick={() => setShowForm(true)}
          variant="outline"
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Habit
        </Button>
      ) : (
        <HabitForm
          onSubmit={(data) => createHabitMutation.mutate(data)}
          onCancel={() => setShowForm(false)}
          isLoading={createHabitMutation.isPending}
        />
      )}

      <AnimatePresence>
        {habits.length > 0 && (
          <div className="space-y-3">
            {habits.map((habit, idx) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onComplete={() => completeHabitMutation.mutate(habit.id)}
                isCompleting={completeHabitMutation.isPending}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {habits.length === 0 && !showForm && (
        <div className="text-center py-8">
          <Flame className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No habits yet. Create one to start building streaks.</p>
        </div>
      )}
    </motion.div>
  );
}