import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { searchLocations } from '@/data/worldLocations';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

type LocationSuggestion = {
  label: string;
  value: string;
  type: string;
};

export const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  placeholder = "Escribe una ciudad o país..."
}) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update suggestions when value changes
  useEffect(() => {
    if (value.length > 0) {
      setSuggestions(searchLocations(value));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setShowSuggestions(false);
      return;
    }

    if (event.key === 'Enter' && showSuggestions && suggestions.length > 0) {
      event.preventDefault();
      handleSelectSuggestion(suggestions[0].value);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-[32px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
        <MapPin className="absolute left-8 top-1/2 -translate-y-1/2 text-emerald-500 w-6 h-6 z-10 pointer-events-none" />
        <Input
          name="location"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value.length > 0 && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className="h-20 pl-16 pr-8 bg-white/[0.03] border-white/[0.08] focus:ring-2 focus:ring-emerald-500/30 rounded-[28px] text-xl font-bold transition-all placeholder:text-gray-700"
        />
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-4 bg-black/80 backdrop-blur-3xl rounded-[32px] border border-white/[0.08] shadow-[0_40px_100px_rgba(0,0,0,0.8)] z-50 max-h-[400px] overflow-hidden"
          >
            <div className="p-2">
              {suggestions.map((loc, idx) => (
                <button
                  type="button"
                  key={`${loc.value}-${idx}`}
                  onClick={() => handleSelectSuggestion(loc.value)}
                  className="w-full px-6 py-5 text-left hover:bg-emerald-500/10 rounded-2xl transition-all flex items-center gap-4 group"
                >
                  <div className={`p-2.5 rounded-xl ${loc.type === 'country' ? 'bg-emerald-500/10' : 'bg-blue-500/10'}`}>
                    <MapPin className={`w-5 h-5 ${loc.type === 'country' ? 'text-emerald-500' : 'text-blue-500'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-white text-lg tracking-tight">{loc.label}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-0.5">
                      {loc.type === 'country' ? 'País' : 'Ciudad'}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/0 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No results message */}
      <AnimatePresence>
        {showSuggestions && value.length > 0 && suggestions.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-4 bg-black/80 backdrop-blur-3xl rounded-[32px] border border-white/[0.08] shadow-[0_40px_100px_rgba(0,0,0,0.8)] z-50 p-10 text-center"
          >
            <p className="text-gray-400 font-bold text-lg">
              No encontramos <span className="text-white">"{value}"</span>
            </p>
            <p className="text-xs text-emerald-500/60 font-black uppercase tracking-[0.2em] mt-3">
              Puedes continuar escribiendo tu ubicación personalizada
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
