import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const PRIORITY_COLORS = {
  primary: 'bg-red-500',
  secondary: 'bg-orange-400',
  tertiary: 'bg-blue-400',
};

const PRIORITY_INITIALS_BG = {
  primary: 'bg-red-100 text-red-700',
  secondary: 'bg-orange-100 text-orange-700',
  tertiary: 'bg-blue-100 text-blue-700',
};

export default function QuickDialContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.EmergencyContact.list()
      .then((data) => {
        // Sort by priority: primary first
        const order = { primary: 0, secondary: 1, tertiary: 2 };
        setContacts(data.sort((a, b) => (order[a.priority] ?? 3) - (order[b.priority] ?? 3)));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="bg-card rounded-2xl border border-border/50 p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-primary" />
          <h2 className="font-display text-lg font-semibold text-foreground">Quick Dial</h2>
        </div>
        <Link
          to="/emergency-contacts"
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-body"
        >
          Manage
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {contacts.length === 0 ? (
        <Link to="/emergency-contacts">
          <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-border hover:bg-muted/50 transition-colors">
            <Users className="w-5 h-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground font-body">Add emergency contacts for quick dialing</p>
          </div>
        </Link>
      ) : (
        <div className="space-y-2">
          {contacts.map((contact, idx) => (
            <motion.a
              key={contact.id}
              href={`tel:${contact.phone}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 active:bg-muted transition-colors group"
            >
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${PRIORITY_INITIALS_BG[contact.priority] || 'bg-muted text-muted-foreground'}`}>
                {contact.name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground font-body truncate">{contact.name}</p>
                <p className="text-xs text-muted-foreground font-body truncate">{contact.phone}</p>
              </div>

              {/* Priority dot + call icon */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`w-2 h-2 rounded-full ${PRIORITY_COLORS[contact.priority] || 'bg-gray-400'}`} />
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </motion.div>
  );
}