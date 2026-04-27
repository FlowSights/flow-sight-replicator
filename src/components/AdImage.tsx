import React, { useState, useEffect, useRef } from 'react';
import { ImageIcon, Loader2 } from 'lucide-react';

interface AdImageProps {
  src?: string;
  alt?: string;
  className?: string;
}

const DEFAULT_FALLBACK = "https://picsum.photos/seed/business/1200/630";
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 500;

export const AdImage: React.FC<AdImageProps> = ({ src, alt = "Ad", className = "" }) => {
  const [currentSrc, setCurrentSrc] = useState<string>(DEFAULT_FALLBACK);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const retryCount = useRef(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Reset state when src changes
    retryCount.current = 0;
    setHasError(false);
    
    if (!src || src === null || src === '') {
      console.log('[AdImage] No src provided — using fallback');
      setCurrentSrc(DEFAULT_FALLBACK);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    console.log('[AdImage] Loading image:', src.startsWith('data:') ? 'base64 image' : src);
    setCurrentSrc(src);

    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, [src]);

  const handleLoad = () => {
    console.log('[AdImage] ✅ Image loaded successfully:', currentSrc.startsWith('data:') ? 'base64' : currentSrc);
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    console.error('[AdImage] ❌ Failed to load:', currentSrc);

    // Si es una imagen base64, no reintentar - mostrar como cargada
    if (src && src.startsWith('data:')) {
      console.log('[AdImage] Base64 image loaded (may appear blank in some contexts)');
      setIsLoading(false);
      setHasError(false);
      return;
    }

    // Para URLs de usuario, intentar una sola vez con cache-busting
    if (retryCount.current < MAX_RETRIES && src) {
      retryCount.current += 1;
      console.log(`[AdImage] Retry ${retryCount.current}/${MAX_RETRIES}...`);

      retryTimer.current = setTimeout(() => {
        // Append cache-busting param
        const retryUrl = `${src}${src.includes('?') ? '&' : '?'}_t=${Date.now()}`;
        console.log('[AdImage] Retrying with:', retryUrl);
        setCurrentSrc(retryUrl);
      }, RETRY_DELAY_MS);
    } else {
      console.log('[AdImage] Max retries reached, using fallback');
      setHasError(true);
      setCurrentSrc(DEFAULT_FALLBACK);
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative w-full min-h-[200px] bg-gray-100 dark:bg-gray-800 overflow-hidden ${className}`}>
      {/* Skeleton loader while image is loading */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10 animate-pulse">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      )}

      <img
        key={currentSrc}
        src={currentSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={handleLoad}
        onError={handleError}
        style={{ display: isLoading ? 'none' : 'block' }}
      />

      {/* Only show icon placeholder if truly nothing loaded */}
      {!isLoading && hasError && currentSrc === DEFAULT_FALLBACK && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
          <ImageIcon className="w-12 h-12 opacity-20" />
        </div>
      )}
    </div>
  );
};
