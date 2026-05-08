import React, { useState, useRef } from 'react';
import { Search } from 'lucide-react';
import { useSafety } from '@/lib/safetyContext.jsx';

export default function SearchBar() {
  const [value, setValue] = useState('');
  const { settings, triggerCall } = useSafety();
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const v = e.target.value;
    setValue(v);

    // Check if trigger word is typed
    if (settings.triggerWord && v.toLowerCase().trim() === settings.triggerWord.toLowerCase().trim()) {
      triggerCall();
      setValue('');
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search wellness tips..."
        className="w-full pl-11 pr-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
      />
    </div>
  );
}