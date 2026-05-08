import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Loader2, Users, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useTrial } from '@/lib/trialContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PaywallOverlay from '@/components/PaywallOverlay';

export default function FamilyMembers() {
  const { hasFeatureAccess } = useTrial();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: 'friend',
    is_emergency_contact: false
  });

  const hasAccess = hasFeatureAccess('family_members');

  useEffect(() => {
    if (hasAccess) {
      loadMembers();
    } else {
      setLoading(false);
    }
  }, [hasAccess]);

  const loadMembers = async () => {
    try {
      const loadedMembers = await base44.entities.FamilyMember.list();
      setMembers(loadedMembers);
    } catch (error) {
      console.error('Failed to load family members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!formData.name || !formData.phone) {
      alert('Please fill in all fields');
      return;
    }

    setSaving(true);
    try {
      await base44.entities.FamilyMember.create(formData);
      setFormData({ name: '', phone: '', relationship: 'friend', is_emergency_contact: false });
      setShowForm(false);
      await loadMembers();
    } catch (error) {
      console.error('Failed to add family member:', error);
      alert('Failed to add family member');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm('Remove this family member?')) return;
    try {
      await base44.entities.FamilyMember.delete(memberId);
      await loadMembers();
    } catch (error) {
      console.error('Failed to delete family member:', error);
    }
  };

  const handleAddClick = () => {
    if (!hasAccess) {
      setShowPaywall(true);
    } else {
      setShowForm(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <>
        {showPaywall && (
          <PaywallOverlay
            featureName="Family Members"
            onClose={() => setShowPaywall(false)}
          />
        )}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-5"
        >
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-foreground mb-1">Family Members</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Upgrade to Pro to add and track family members on your dashboard
              </p>
              <Button
                onClick={handleAddClick}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                Unlock Feature
              </Button>
            </div>
          </div>
        </motion.div>
      </>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-semibold text-foreground">Family</h2>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            size="sm"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-card rounded-lg border border-border p-4 space-y-3"
            >
              <div>
                <Label className="text-xs text-muted-foreground">Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Mom, Best Friend"
                  className="mt-1 bg-muted/50"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 012-3456"
                  className="mt-1 bg-muted/50"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Relationship</Label>
                <Select
                  value={formData.relationship}
                  onValueChange={(value) => setFormData({ ...formData, relationship: value })}
                >
                  <SelectTrigger className="mt-1 bg-muted/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mother">Mother</SelectItem>
                    <SelectItem value="father">Father</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3 px-3 py-2 bg-muted/30 rounded-lg">
                <input
                  type="checkbox"
                  id="emergency"
                  checked={formData.is_emergency_contact}
                  onChange={(e) => setFormData({ ...formData, is_emergency_contact: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="emergency" className="text-xs text-muted-foreground cursor-pointer">
                  Include in SOS alerts
                </label>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAddMember}
                  disabled={saving}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Add Member
                </Button>
                <Button
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ name: '', phone: '', relationship: 'friend', is_emergency_contact: false });
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {members.length > 0 && (
          <div className="space-y-2">
            {members.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-muted/30 rounded-lg p-3 flex items-center justify-between border border-border/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {member.relationship.charAt(0).toUpperCase() + member.relationship.slice(1)}
                    {member.is_emergency_contact && ' • 🚨 SOS'}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteMember(member.id)}
                  className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {members.length === 0 && !showForm && (
          <div className="text-center py-8">
            <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No family members added yet</p>
          </div>
        )}
      </motion.div>
    </>
  );
}