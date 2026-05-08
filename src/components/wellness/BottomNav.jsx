import React from 'react';
import { Home, BookOpen, BarChart3, Settings } from 'lucide-react';
import { useSafety } from '@/lib/safetyContext.jsx';

export default function BottomNav() {
  const { setShowSettings } = useSafety();
  const [settingsTapCount, setSettingsTapCount] = React.useState(0);
  const settingsTapTimer = React.useRef(null);

  // Triple tap the "Insights" icon to open hidden settings
  const handleInsightsTap = () => {
    setSettingsTapCount((prev) => {
      const newCount = prev + 1;
      clearTimeout(settingsTapTimer.current);
      
      if (newCount >= 3) {
        setShowSettings(true);
        return 0;
      }
      
      settingsTapTimer.current = setTimeout(() => {
        setSettingsTapCount(0);
      }, 800);
      
      return newCount;
    });
  };

  const items = [
    { icon: Home, label: "Home", active: true, onClick: () => {} },
    { icon: BookOpen, label: "Journal", active: false, onClick: () => {} },
    { icon: BarChart3, label: "Insights", active: false, onClick: handleInsightsTap },
    { icon: Settings, label: "More", active: false, onClick: () => {} },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/50 px-4 pb-6 pt-2 z-50">
      <div className="flex justify-around max-w-md mx-auto">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors ${
              item.active ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-body font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}