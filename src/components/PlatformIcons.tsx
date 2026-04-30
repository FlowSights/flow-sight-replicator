import React from 'react';
import { 
  Facebook, 
  Linkedin, 
  Search
} from 'lucide-react';

interface PlatformIconProps {
  platform: 'meta' | 'google' | 'tiktok' | 'linkedin';
  size?: number;
  className?: string;
}

export const PlatformIcon: React.FC<PlatformIconProps> = ({ platform, size = 24, className = '' }) => {
  switch (platform) {
    case 'meta':
      return <Facebook size={size} className={className} />;
    case 'google':
      return <Search size={size} className={className} />;
    case 'linkedin':
      return <Linkedin size={size} className={className} />;
    case 'tiktok':
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className={className}
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.59-1.01-.01 2.62.02 5.24-.02 7.86-.01 1.03-.2 2.09-.67 3.01-.5 1-1.28 1.86-2.22 2.47-1.35.88-3.03 1.23-4.58.93-1.64-.3-3.18-1.25-4.13-2.65-1.01-1.48-1.32-3.41-.85-5.15.35-1.31 1.15-2.5 2.26-3.3 1.25-.91 2.87-1.33 4.41-1.15.01 1.45.01 2.89 0 4.34-1.03-.24-2.18-.07-3.03.58-.7.54-1.05 1.46-.91 2.33.11.89.77 1.67 1.6 1.98.81.31 1.77.17 2.45-.37.49-.39.78-.99.82-1.61.03-3.66.01-7.33.02-11z" />
        </svg>
      );
    default:
      return null;
  }
};

export const platformColors = {
  meta: {
    primary: '#1877F2',
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-600 dark:text-blue-400',
  },
  google: {
    primary: '#4285F4',
    gradient: 'from-red-500 via-yellow-500 to-blue-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-600 dark:text-red-400',
  },
  tiktok: {
    primary: '#000000',
    gradient: 'from-black to-pink-500',
    bg: 'bg-slate-50 dark:bg-slate-900/10',
    border: 'border-slate-200 dark:border-slate-800',
    text: 'text-slate-900 dark:text-slate-100',
  },
  linkedin: {
    primary: '#0A66C2',
    gradient: 'from-blue-600 to-blue-800',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    border: 'border-indigo-200 dark:border-indigo-800',
    text: 'text-indigo-600 dark:text-indigo-400',
  },
};

export const platformNames = {
  meta: 'Meta (Facebook/Instagram)',
  google: 'Google Ads',
  tiktok: 'TikTok Ads',
  linkedin: 'LinkedIn Ads',
};
