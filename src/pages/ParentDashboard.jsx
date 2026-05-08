import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Battery, LogOut, Plus, Loader2, Link2, MapPinOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ChildCard from '@/components/ChildCard';

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [linkedChildren, setLinkedChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [childEmail, setChildEmail] = useState('');
  const [childName, setChildName] = useState('');
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Refresh every 5 seconds for real-time updates
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      const links = await base44.entities.LinkedAccount.filter({
        parent_email: currentUser.email
      });
      setLinkedChildren(links);
    } catch (error) {
      console.error('Failed to load parent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkChild = async () => {
    if (!childEmail || !childName) {
      alert('Please fill in all fields');
      return;
    }

    setLinking(true);
    try {
      await base44.entities.LinkedAccount.create({
        parent_email: user.email,
        child_email: childEmail.toLowerCase(),
        child_name: childName,
        link_status: 'pending'
      });
      setChildEmail('');
      setChildName('');
      setShowLinkForm(false);
      await loadData();
    } catch (error) {
      console.error('Failed to link child account:', error);
      alert('Failed to link account. Ensure the email is correct.');
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = async (linkId) => {
    if (!window.confirm('Unlink this child account?')) return;
    try {
      await base44.entities.LinkedAccount.delete(linkId);
      await loadData();
    } catch (error) {
      console.error('Failed to unlink:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-5 pt-8 pb-6"
      >
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-primary" />
          <h1 className="font-display text-2xl font-semibold">Parental Controls</h1>
        </div>
      </motion.div>

      <div className="px-5 space-y-4">
        {!showLinkForm ? (
          <Button
            onClick={() => setShowLinkForm(true)}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Link Child Account
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-4 space-y-4"
          >
            <div>
              <Label className="text-sm text-muted-foreground">Child's Email</Label>
              <Input
                value={childEmail}
                onChange={(e) => setChildEmail(e.target.value)}
                placeholder="child@example.com"
                className="mt-1 bg-muted/50"
              />
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Child's Name</Label>
              <Input
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="e.g., Emma, Alex"
                className="mt-1 bg-muted/50"
              />
            </div>

            <p className="text-xs text-muted-foreground bg-accent/30 border border-accent rounded-lg p-3">
              💡 The child will need to accept the link from their device. A notification will be sent to their app.
            </p>

            <div className="flex gap-2">
              <Button
                onClick={handleLinkChild}
                disabled={linking}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {linking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Send Link Request
              </Button>
              <Button
                onClick={() => {
                  setShowLinkForm(false);
                  setChildEmail('');
                  setChildName('');
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {linkedChildren.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
              Linked Children
            </p>
            {linkedChildren.map((child) => (
              <ChildCard
                key={child.id}
                child={child}
                onUnlink={() => handleUnlink(child.id)}
              />
            ))}
          </div>
        )}

        {linkedChildren.length === 0 && !showLinkForm && (
          <div className="text-center py-12">
            <MapPinOff className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No linked children yet. Add one to start monitoring.
            </p>
          </div>
        )}

        <div className="bg-accent/30 border border-accent rounded-lg p-4">
          <p className="text-xs text-accent-foreground/70 font-body leading-relaxed">
            📍 <span className="font-medium">Real-time Monitoring:</span> View your child's live location, battery level, and zone activity. Updates refresh every 5 seconds.
          </p>
        </div>
      </div>
    </div>
  );
}