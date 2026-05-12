import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useBackNav } from '@/lib/useBackNav';

const sections = [
  {
    title: 'Information We Collect',
    body: `QuickShield collects only the information necessary to provide safety features:
• Location data — used in real-time during SOS and zone monitoring, never stored on our servers without your consent.
• Emergency contact details — stored locally on your device and used solely to send SOS alerts.
• Journal entries and mood data — stored encrypted and never shared with third parties.
• Audio recordings triggered by SOS — temporarily uploaded to send to your emergency contacts, then deleted.`,
  },
  {
    title: 'How We Use Your Information',
    body: `We use your information exclusively to:
• Send SOS alerts and location data to your designated emergency contacts.
• Notify you when you enter or exit defined safe zones.
• Power offline maps and local safety features.
• Improve app stability and performance (anonymised crash data only).

We do not sell, rent, or share your personal data with advertisers or third-party data brokers.`,
  },
  {
    title: 'Data Storage & Security',
    body: `• Most sensitive data (journal entries, emergency contacts) is stored locally on your device.
• Data synced to our servers is encrypted in transit (TLS) and at rest.
• You can delete all your data at any time via Settings → Danger Zone → Delete Account.
• The Privacy Purge feature lets you instantly wipe all logs with your PIN.`,
  },
  {
    title: 'Location Data',
    body: `Location is accessed only when you actively use safety features (SOS, Panic Mode, Zone Monitoring). We do not run background location tracking beyond what you have explicitly enabled. Location data shared with emergency contacts is sent directly and is not retained on our servers after delivery.`,
  },
  {
    title: 'Third-Party Services',
    body: `QuickShield uses the following third-party services:
• OpenStreetMap — for map tiles (offline and online). Subject to OSM's own privacy policy.
• Twilio — to deliver SMS alerts to your emergency contacts.
• Stripe — to process subscription payments securely.

None of these services receive your journal, mood, or audio data.`,
  },
  {
    title: 'Your Rights',
    body: `You have the right to:
• Access the personal data we hold about you.
• Request correction or deletion of your data.
• Export your data at any time.
• Withdraw consent and delete your account permanently.

To exercise any of these rights, use the in-app tools under Settings or contact us at the address below.`,
  },
  {
    title: 'Children\'s Privacy',
    body: `QuickShield is not directed at children under 13. If you believe a child has provided us with personal information without parental consent, please contact us and we will delete it promptly.`,
  },
  {
    title: 'Changes to This Policy',
    body: `We may update this policy from time to time. We will notify you of significant changes via in-app notification. Continued use of the app after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: 'Contact Us',
    body: `For privacy-related questions or requests, please contact us through the Contact page in the app, or email: privacy@quickshieldcall.app`,
  },
];

export default function PrivacyPolicy() {
  const goBack = useBackNav('/');

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="px-5 pt-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={goBack}
            aria-label="Go back"
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            <span className="text-sm font-body font-medium">Back</span>
          </button>

          <h1 className="font-display text-3xl font-semibold text-foreground mb-1">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground font-body mb-8">Last updated: May 2026</p>
        </motion.div>

        <div className="max-w-2xl space-y-6">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="text-sm text-foreground/80 font-body leading-relaxed bg-accent/20 border border-accent/30 rounded-2xl p-4"
          >
            Your safety and privacy are at the core of QuickShield. This policy explains what data we collect, why we collect it, and how you stay in control.
          </motion.p>

          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.04 }}
              className="bg-card border border-border/50 rounded-2xl p-5"
            >
              <h2 className="font-display text-base font-semibold text-foreground mb-3">{section.title}</h2>
              <p className="text-sm text-muted-foreground font-body leading-relaxed whitespace-pre-line">{section.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}