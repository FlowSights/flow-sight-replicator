import React, { useState, useMemo } from 'react';
import { Search, MapPin, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SmartLocationSelectorProps {
  value: string;
  onChange: (location: string) => void;
}

const countries = [
  // América Latina
  { name: 'Argentina', code: 'AR', region: 'América Latina', flag: '🇦🇷' },
  { name: 'Brasil', code: 'BR', region: 'América Latina', flag: '🇧🇷' },
  { name: 'Chile', code: 'CL', region: 'América Latina', flag: '🇨🇱' },
  { name: 'Colombia', code: 'CO', region: 'América Latina', flag: '🇨🇴' },
  { name: 'Costa Rica', code: 'CR', region: 'América Latina', flag: '🇨🇷' },
  { name: 'Ecuador', code: 'EC', region: 'América Latina', flag: '🇪🇨' },
  { name: 'El Salvador', code: 'SV', region: 'América Latina', flag: '🇸🇻' },
  { name: 'Guatemala', code: 'GT', region: 'América Latina', flag: '🇬🇹' },
  { name: 'Honduras', code: 'HN', region: 'América Latina', flag: '🇭🇳' },
  { name: 'México', code: 'MX', region: 'América Latina', flag: '🇲🇽' },
  { name: 'Nicaragua', code: 'NI', region: 'América Latina', flag: '🇳🇮' },
  { name: 'Panamá', code: 'PA', region: 'América Latina', flag: '🇵🇦' },
  { name: 'Paraguay', code: 'PY', region: 'América Latina', flag: '🇵🇾' },
  { name: 'Perú', code: 'PE', region: 'América Latina', flag: '🇵🇪' },
  { name: 'República Dominicana', code: 'DO', region: 'América Latina', flag: '🇩🇴' },
  { name: 'Uruguay', code: 'UY', region: 'América Latina', flag: '🇺🇾' },
  { name: 'Venezuela', code: 'VE', region: 'América Latina', flag: '🇻🇪' },
  
  // Europa
  { name: 'Alemania', code: 'DE', region: 'Europa', flag: '🇩🇪' },
  { name: 'Austria', code: 'AT', region: 'Europa', flag: '🇦🇹' },
  { name: 'Bélgica', code: 'BE', region: 'Europa', flag: '🇧🇪' },
  { name: 'Bulgaria', code: 'BG', region: 'Europa', flag: '🇧🇬' },
  { name: 'Croacia', code: 'HR', region: 'Europa', flag: '🇭🇷' },
  { name: 'Dinamarca', code: 'DK', region: 'Europa', flag: '🇩🇰' },
  { name: 'Eslovaquia', code: 'SK', region: 'Europa', flag: '🇸🇰' },
  { name: 'Eslovenia', code: 'SI', region: 'Europa', flag: '🇸🇮' },
  { name: 'España', code: 'ES', region: 'Europa', flag: '🇪🇸' },
  { name: 'Estonia', code: 'EE', region: 'Europa', flag: '🇪🇪' },
  { name: 'Finlandia', code: 'FI', region: 'Europa', flag: '🇫🇮' },
  { name: 'Francia', code: 'FR', region: 'Europa', flag: '🇫🇷' },
  { name: 'Grecia', code: 'GR', region: 'Europa', flag: '🇬🇷' },
  { name: 'Hungría', code: 'HU', region: 'Europa', flag: '🇭🇺' },
  { name: 'Irlanda', code: 'IE', region: 'Europa', flag: '🇮🇪' },
  { name: 'Islandia', code: 'IS', region: 'Europa', flag: '🇮🇸' },
  { name: 'Italia', code: 'IT', region: 'Europa', flag: '🇮🇹' },
  { name: 'Letonia', code: 'LV', region: 'Europa', flag: '🇱🇻' },
  { name: 'Lituania', code: 'LT', region: 'Europa', flag: '🇱🇹' },
  { name: 'Luxemburgo', code: 'LU', region: 'Europa', flag: '🇱🇺' },
  { name: 'Malta', code: 'MT', region: 'Europa', flag: '🇲🇹' },
  { name: 'Noruega', code: 'NO', region: 'Europa', flag: '🇳🇴' },
  { name: 'Países Bajos', code: 'NL', region: 'Europa', flag: '🇳🇱' },
  { name: 'Polonia', code: 'PL', region: 'Europa', flag: '🇵🇱' },
  { name: 'Portugal', code: 'PT', region: 'Europa', flag: '🇵🇹' },
  { name: 'Reino Unido', code: 'GB', region: 'Europa', flag: '🇬🇧' },
  { name: 'República Checa', code: 'CZ', region: 'Europa', flag: '🇨🇿' },
  { name: 'Rumania', code: 'RO', region: 'Europa', flag: '🇷🇴' },
  { name: 'Rusia', code: 'RU', region: 'Europa', flag: '🇷🇺' },
  { name: 'Suecia', code: 'SE', region: 'Europa', flag: '🇸🇪' },
  { name: 'Suiza', code: 'CH', region: 'Europa', flag: '🇨🇭' },
  
  // Asia
  { name: 'China', code: 'CN', region: 'Asia', flag: '🇨🇳' },
  { name: 'Corea del Sur', code: 'KR', region: 'Asia', flag: '🇰🇷' },
  { name: 'Filipinas', code: 'PH', region: 'Asia', flag: '🇵🇭' },
  { name: 'Hong Kong', code: 'HK', region: 'Asia', flag: '🇭🇰' },
  { name: 'India', code: 'IN', region: 'Asia', flag: '🇮🇳' },
  { name: 'Indonesia', code: 'ID', region: 'Asia', flag: '🇮🇩' },
  { name: 'Japón', code: 'JP', region: 'Asia', flag: '🇯🇵' },
  { name: 'Malasia', code: 'MY', region: 'Asia', flag: '🇲🇾' },
  { name: 'Singapur', code: 'SG', region: 'Asia', flag: '🇸🇬' },
  { name: 'Tailandia', code: 'TH', region: 'Asia', flag: '🇹🇭' },
  { name: 'Taiwán', code: 'TW', region: 'Asia', flag: '🇹🇼' },
  { name: 'Vietnam', code: 'VN', region: 'Asia', flag: '🇻🇳' },
  
  // América del Norte
  { name: 'Canadá', code: 'CA', region: 'América del Norte', flag: '🇨🇦' },
  { name: 'Estados Unidos', code: 'US', region: 'América del Norte', flag: '🇺🇸' },
  
  // Oceanía
  { name: 'Australia', code: 'AU', region: 'Oceanía', flag: '🇦🇺' },
  { name: 'Nueva Zelanda', code: 'NZ', region: 'Oceanía', flag: '🇳🇿' },
  
  // Oriente Medio
  { name: 'Arabia Saudita', code: 'SA', region: 'Oriente Medio', flag: '🇸🇦' },
  { name: 'Emiratos Árabes Unidos', code: 'AE', region: 'Oriente Medio', flag: '🇦🇪' },
  { name: 'Israel', code: 'IL', region: 'Oriente Medio', flag: '🇮🇱' },
  { name: 'Turquía', code: 'TR', region: 'Oriente Medio', flag: '🇹🇷' },
  
  // África
  { name: 'Sudáfrica', code: 'ZA', region: 'África', flag: '🇿🇦' },
  { name: 'Egipto', code: 'EG', region: 'África', flag: '🇪🇬' },
  { name: 'Nigeria', code: 'NG', region: 'África', flag: '🇳🇬' },
];

export const SmartLocationSelector: React.FC<SmartLocationSelectorProps> = ({
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countries;
    const query = searchQuery.toLowerCase();
    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        country.code.toLowerCase().includes(query) ||
        country.region.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const groupedCountries = useMemo(() => {
    const grouped: Record<string, typeof countries> = {};
    filteredCountries.forEach((country) => {
      if (!grouped[country.region]) {
        grouped[country.region] = [];
      }
      grouped[country.region].push(country);
    });
    return grouped;
  }, [filteredCountries]);

  const selectedCountry = countries.find((c) => c.name === value);

  return (
    <div className="relative w-full">
      {/* Botón Principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-500 transition bg-white dark:bg-slate-800"
      >
        <div className="flex items-center gap-3">
          {selectedCountry ? (
            <>
              <span className="text-2xl">{selectedCountry.flag}</span>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedCountry.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedCountry.region}
                </p>
              </div>
            </>
          ) : (
            <>
              <Globe className="text-gray-400" size={20} />
              <span className="text-gray-500 dark:text-gray-400">Selecciona un país</span>
            </>
          )}
        </div>
        <Search size={20} className="text-gray-400" />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden flex flex-col"
          >
            {/* Barra de Búsqueda */}
            <div className="sticky top-0 p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg">
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Busca un país o región..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  autoFocus
                />
              </div>
            </div>

            {/* Lista de Países */}
            <div className="overflow-y-auto flex-1">
              {Object.entries(groupedCountries).map(([region, regionCountries]) => (
                <div key={region}>
                  <div className="sticky top-0 px-4 py-2 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      {region}
                    </p>
                  </div>
                  {regionCountries.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => {
                        onChange(country.name);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-slate-700 transition text-left ${
                        value === country.name
                          ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500'
                          : ''
                      }`}
                    >
                      <span className="text-2xl">{country.flag}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {country.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {country.code}
                        </p>
                      </div>
                      {value === country.name && (
                        <div className="ml-auto w-2 h-2 bg-green-500 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
