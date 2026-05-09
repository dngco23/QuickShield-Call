import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Heart, Users, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="px-5 pt-8 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-body font-medium">Back</span>
          </button>

          <h1 className="font-display text-3xl font-semibold text-foreground mb-2">About QuickShield Call</h1>
          <p className="text-muted-foreground text-sm mb-8">Your personal safety companion</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="bg-card rounded-2xl border border-border/50 p-6">
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">What is QuickShield Call?</h2>
            <p className="text-foreground/80 font-body leading-relaxed">
              QuickShield Call is a personal safety application designed to give you peace of mind wherever you go.
              Whether you're walking home late at night, meeting someone new, or simply want a discreet way to call
              for help, QuickShield Call puts powerful safety tools in your pocket. Our app features an emergency
              SOS button that alerts your trusted contacts with your GPS location, a fake call simulator to help
              you exit uncomfortable situations gracefully, real-time zone monitoring so loved ones know you've
              arrived safely, and a stealth mode that disguises the app as a calculator or weather widget.
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 p-6">
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">Who is it for?</h2>
            <p className="text-foreground/80 font-body leading-relaxed">
              QuickShield Call is built for anyone who values personal safety — students commuting home,
              professionals working late shifts, parents wanting to stay connected with their children,
              travellers exploring unfamiliar places, and survivors of domestic abuse who need discreet
              emergency access. Our parent dashboard allows families to link accounts and monitor real-time
              locations, battery levels, and safe-zone arrivals. No matter your situation, QuickShield Call
              adapts to your needs with customisable contacts, check-ins, and alert messages.
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 p-6">
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">Who builds it?</h2>
            <p className="text-foreground/80 font-body leading-relaxed">
              QuickShield Call is built by a passionate team dedicated to making personal safety technology
              accessible to everyone. We believe that feeling safe should never be a luxury. Our team continuously
              improves the app based on real user feedback, adding features that matter most — from offline panic
              mode to secure audio recordings. We are committed to privacy-first design, ensuring your data stays
              yours and is never shared without your consent.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Shield, label: 'Emergency SOS', desc: 'Instant alerts with GPS' },
              { icon: Heart, label: 'Wellness Tracking', desc: 'Daily mood & journal' },
              { icon: Users, label: 'Family Safety', desc: 'Linked account monitoring' },
              { icon: Zap, label: 'Stealth Mode', desc: 'Discreet disguise options' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex flex-col gap-2">
                <Icon className="w-5 h-5 text-primary" />
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}