import React, { useState, useRef, useCallback } from 'react';
import { Home, BookOpen, BarChart3, Settings, MapPin } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSafety } from '@/lib/safetyContext.jsx';

const TABS = [
  { icon: Home,      label: 'Home',     root: '/' },
  { icon: BookOpen,  label: 'Journal',  root: '/journal', isJournal: true },
  { icon: MapPin,    label: 'Zones',    root: '/zones' },
  { icon: BarChart3, label: 'Insights', root: '/insights' },
  { icon: Settings,  label: 'Settings', root: '/settings' },
];

// Persist each tab's last visited path across renders
const tabHistories = Object.fromEntries(TABS.map(t => [t.root, t.root]));

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setShowSettings } = useSafety();
  const [settingsTapCount, setSettingsTapCount] = useState(0);
  const settingsTapTimer = useRef(null);

  // Determine the active tab root by matching the current path prefix
  const activeRoot = TABS.find(t =>
    t.root === '/'
      ? location.pathname === '/'
      : location.pathname === t.root || location.pathname.startsWith(t.root + '/')
  )?.root ?? '/';

  // Keep history map updated whenever location changes
  tabHistories[activeRoot] = location.pathname;

  const handleJournalTap = useCallback(() => {
    setSettingsTapCount((prev) => {
      const next = prev + 1;
      clearTimeout(settingsTapTimer.current);
      if (next >= 3) { setShowSettings(true); return 0; }
      settingsTapTimer.current = setTimeout(() => setSettingsTapCount(0), 800);
      return next;
    });
  }, [setShowSettings]);

  const handleTabPress = useCallback((tab) => {
    if (tab.isJournal) handleJournalTap();

    if (activeRoot === tab.root) {
      // Re-selecting active tab: reset to root and scroll to top
      tabHistories[tab.root] = tab.root;
      navigate(tab.root, { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Switching to a different tab: restore its last path
      const dest = tabHistories[tab.root] || tab.root;
      navigate(dest);
    }
  }, [activeRoot, navigate, handleJournalTap]);

  return (
    <nav
      role="navigation"
      aria-label="Main tabs"
      className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/50 z-50 select-none"
      style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      <div role="tablist" aria-label="App sections" className="flex justify-around max-w-md mx-auto pt-2 px-2">
        {TABS.map((tab) => {
          const isActive = activeRoot === tab.root;
          const Icon = tab.icon;
          return (
            <button
              key={tab.root}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
              aria-controls={`tabpanel-${tab.label.toLowerCase()}`}
              onClick={() => handleTabPress(tab)}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-colors min-w-[44px] min-h-[44px] justify-center
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
                ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span className="text-[10px] font-body font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-center gap-5 pt-1 pb-1 border-t border-border/30 mt-1">
        <a
          href="/about"
          onClick={(e) => { e.preventDefault(); navigate('/about'); }}
          className="text-[10px] text-muted-foreground hover:text-primary transition-colors font-body min-h-[44px] flex items-center
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded"
        >
          About
        </a>
        <a
          href="/contact"
          onClick={(e) => { e.preventDefault(); navigate('/contact'); }}
          className="text-[10px] text-muted-foreground hover:text-primary transition-colors font-body min-h-[44px] flex items-center
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded"
        >
          Contact
        </a>
        <a
          href="/privacy"
          onClick={(e) => { e.preventDefault(); navigate('/privacy'); }}
          className="text-[10px] text-muted-foreground hover:text-primary transition-colors font-body min-h-[44px] flex items-center
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded"
        >
          Privacy
        </a>
      </div>
    </nav>
  );
}