import React, { useState, useRef } from 'react';
import { Home, BookOpen, BarChart3, Settings, MapPin } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSafety } from '@/lib/safetyContext.jsx';

const NAV_ITEMS = [
  { icon: Home,     label: 'Home',     path: '/' },
  { icon: BookOpen, label: 'Journal',  path: '/journal', isJournal: true },
  { icon: MapPin,   label: 'Zones',    path: '/zones' },
  { icon: BarChart3,label: 'Insights', path: '/insights' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setShowSettings } = useSafety();
  const [settingsTapCount, setSettingsTapCount] = useState(0);
  const settingsTapTimer = useRef(null);

  const handleJournalTap = () => {
    setSettingsTapCount((prev) => {
      const newCount = prev + 1;
      clearTimeout(settingsTapTimer.current);
      if (newCount >= 3) { setShowSettings(true); return 0; }
      settingsTapTimer.current = setTimeout(() => setSettingsTapCount(0), 800);
      return newCount;
    });
  };

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/50 z-50"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)', paddingLeft: 'env(safe-area-inset-left, 0px)', paddingRight: 'env(safe-area-inset-right, 0px)' }}
    >
      <div className="flex justify-around max-w-md mx-auto pt-2 px-2">
        {NAV_ITEMS.map(({ icon: Icon, label, path, isJournal }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={label}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => {
                if (isJournal) handleJournalTap();
                // Re-tap active tab → scroll to top
                if (isActive) window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate(path);
              }}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-colors min-w-[44px] min-h-[44px] justify-center ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span className="text-[10px] font-body font-medium">{label}</span>
            </button>
          );
        })}
      </div>
      <div className="flex justify-center gap-5 pt-1 pb-1 border-t border-border/30 mt-1">
        <Link to="/about" className="text-[10px] text-muted-foreground hover:text-primary transition-colors font-body min-h-[44px] flex items-center">About</Link>
        <Link to="/contact" className="text-[10px] text-muted-foreground hover:text-primary transition-colors font-body min-h-[44px] flex items-center">Contact</Link>
      </div>
    </nav>
  );
}