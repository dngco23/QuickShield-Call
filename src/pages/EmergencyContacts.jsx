import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Edit2, AlertCircle, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
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

export default function EmergencyContacts() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', priority: 'secondary' });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const data = await base44.entities.EmergencyContact.list();
      setContacts(data);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      if (editingId) {
        await base44.entities.EmergencyContact.update(editingId, {
          name: form.name,
          phone: form.phone,
          priority: form.priority,
        });
      } else {
        await base44.entities.EmergencyContact.create({
          name: form.name,
          phone: form.phone,
          priority: form.priority,
        });
      }
      await loadContacts();
      resetForm();
    } catch (error) {
      console.error('Failed to save contact:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contact?')) return;
    try {
      await base44.entities.EmergencyContact.delete(id);
      await loadContacts();
    } catch (error) {
      console.error('Failed to delete contact:', error);
    }
  };

  const handleEdit = (contact) => {
    setEditingId(contact.id);
    setForm({ name: contact.name, phone: contact.phone, priority: contact.priority });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({ name: '', phone: '', priority: 'secondary' });
    setEditingId(null);
    setShowForm(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'primary':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'secondary':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'tertiary':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="px-5 pt-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-body font-medium">Back</span>
          </button>

          <h1 className="font-display text-2xl font-semibold text-foreground mb-2">
            Emergency Contacts
          </h1>
          <p className="text-sm text-muted-foreground font-body mb-6">
            Manage your emergency contacts and set priority levels
          </p>
        </motion.div>

        {/* Add/Edit Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-card rounded-2xl border border-border/50 p-6 mb-6"
            >
              <h2 className="font-display text-lg font-semibold mb-4">
                {editingId ? 'Edit Contact' : 'Add New Contact'}
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Mom"
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Phone Number</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+1 (555) 012-3456"
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Priority</Label>
                  <Select value={form.priority} onValueChange={(value) => setForm({ ...form, priority: value })}>
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary - First to be contacted</SelectItem>
                      <SelectItem value="secondary">Secondary - Second contact</SelectItem>
                      <SelectItem value="tertiary">Tertiary - Backup contact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleSubmit}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {editingId ? 'Update Contact' : 'Add Contact'}
                  </Button>
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Button */}
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="w-full mb-6 bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        )}

        {/* Contacts List */}
        <div className="space-y-3">
          {contacts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No emergency contacts yet. Add your first contact.</p>
            </motion.div>
          ) : (
            contacts.map((contact, idx) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-card rounded-2xl border border-border/50 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-body font-semibold text-foreground">{contact.name}</h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getPriorityColor(contact.priority)}`}>
                        {contact.priority.charAt(0).toUpperCase() + contact.priority.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground font-body">{contact.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`tel:${contact.phone}`}
                      className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                      title="Call"
                    >
                      <Phone className="w-4 h-4 text-green-600" />
                    </a>
                    <button
                      onClick={() => handleEdit(contact)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4 text-primary" />
                    </button>
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-accent/30 border border-accent rounded-xl p-4 mt-6"
        >
          <p className="text-xs text-accent-foreground/70 font-body leading-relaxed">
            💡 Primary contacts will be contacted first during SOS. Set priority levels for backup contacts.
          </p>
        </motion.div>
      </div>
    </div>
  );
}