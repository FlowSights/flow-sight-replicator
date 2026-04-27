import React from 'react';

interface PlatformPreviewProps {
  platform: 'meta' | 'google' | 'tiktok' | 'linkedin';
  headline: string;
  description: string;
  cta: string;
  imageUrl: string;
}

export const PlatformPreview: React.FC<PlatformPreviewProps> = ({
  platform,
  headline,
  description,
  cta,
  imageUrl,
}) => {
  const logos = {
    metaSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#0A66C2"/><path d="M35 50C35 42 40 35 50 35C60 35 65 42 65 50C65 58 60 65 50 65C40 65 35 58 35 50M40 50C40 55 44 58 50 58C56 58 60 55 60 50C60 45 56 42 50 42C44 42 40 45 40 50" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    googleSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="white" stroke="#f0f0f0" stroke-width="1"/><circle cx="30" cy="65" r="8" fill="#FBBC04"/><path d="M50 25L65 65H35L50 25Z" fill="#4285F4"/><circle cx="70" cy="65" r="8" fill="#EA4335"/><path d="M50 40L60 60H40L50 40Z" fill="#34A853"/></svg>`,
    meta: "/logos/meta-icon.png",
    google: "/logos/google-ads-icon.png",
    tiktok: "https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg",
    linkedin: "https://upload.wikimedia.org/wikipedia/commons/0/01/LinkedIn_Logo.svg",
    facebook_f: "https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"
  };

  switch (platform) {
    case 'meta':
      return (
        <div className="bg-white rounded-lg overflow-hidden shadow-lg max-w-md mx-auto border border-gray-200">
          {/* Meta Feed Post */}
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <img src={logos.facebook_f} alt="FB" className="w-8 h-8 rounded-full" />
              <div>
                <div className="text-[14px] font-bold text-[#050505]">FlowSights</div>
                <div className="text-[12px] text-[#65676b] flex items-center gap-1">
                  Publicidad <span className="text-[10px]">🌐</span>
                </div>
              </div>
            </div>
            <p className="text-[14px] text-[#050505] mb-3 leading-tight">{description}</p>
          </div>
          <img src={imageUrl} alt="Ad" className="w-full h-64 object-cover" />
          <div className="p-3 bg-[#f0f2f5] flex justify-between items-center">
            <div className="flex-1 min-w-0 pr-2">
              <div className="text-[12px] text-[#65676b] uppercase truncate">FLOWSIGHTS.COM</div>
              <div className="text-[16px] font-bold text-[#050505] truncate">{headline}</div>
            </div>
            <button className="bg-[#e4e6eb] text-[#050505] font-bold py-2 px-4 rounded-lg text-[14px] hover:bg-[#d8dadf] transition shrink-0 uppercase">
              {cta}
            </button>
          </div>
        </div>
      );

    case 'google':
      return (
        <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto border border-gray-200 shadow-sm">
          {/* Google Search Ad */}
          <div className="flex items-center gap-2 mb-3">
            <svg className="h-6 w-auto" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="white" stroke="#f0f0f0" stroke-width="1"/><circle cx="30" cy="65" r="8" fill="#FBBC04"/><path d="M50 25L65 65H35L50 25Z" fill="#4285F4"/><circle cx="70" cy="65" r="8" fill="#EA4335"/><path d="M50 40L60 60H40L50 40Z" fill="#34A853"/></svg>
            <div className="text-[12px] text-[#202124] border border-gray-300 px-1 rounded">Patrocinado</div>
          </div>
          <div className="text-[14px] text-[#202124] mb-1">
            https://www.flowsights.com
          </div>
          <h3 className="text-[20px] text-[#1a0dab] font-medium mb-1 hover:underline cursor-pointer leading-tight">
            {headline} | Inteligencia Operativa
          </h3>
          <p className="text-[14px] text-[#4d5156] leading-relaxed">
            {description}
          </p>
        </div>
      );

    case 'tiktok':
      return (
        <div className="bg-black rounded-3xl overflow-hidden shadow-2xl max-w-[280px] mx-auto aspect-[9/16] relative flex flex-col border-[6px] border-gray-800">
          {/* TikTok Video Ad */}
          <img src={imageUrl} alt="Ad" className="w-full h-full object-cover opacity-80" />
          
          <div className="absolute top-4 left-4 flex gap-4 text-white/80 text-[13px] font-bold">
            <span className="border-b-2 border-white">Para ti</span>
            <span>Siguiendo</span>
          </div>

          <div className="absolute right-3 bottom-32 flex flex-col gap-5 items-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center font-bold text-white text-xs">FS</div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">❤️</div>
              <span className="text-[10px] text-white">12.4K</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">💬</div>
              <span className="text-[10px] text-white">842</span>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-black/80 to-transparent">
            <div className="text-white font-bold text-[15px] mb-1">@FlowSights</div>
            <p className="text-white text-[13px] mb-3 leading-snug">{headline} - {description}</p>
            <button className="w-full bg-[#ff0050] text-white font-bold py-2.5 rounded-sm text-[14px] hover:opacity-90 transition">
              {cta}
            </button>
          </div>
          
          <div className="absolute top-4 right-4">
             <img src={logos.tiktok} alt="TikTok" className="h-6 invert opacity-70" />
          </div>
        </div>
      );

    case 'linkedin':
      return (
        <div className="bg-white rounded-lg overflow-hidden shadow-md max-w-md mx-auto border border-gray-200">
          {/* LinkedIn Post */}
          <div className="p-3 flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-emerald-600 rounded flex items-center justify-center text-white font-bold">FS</div>
              <div>
                <div className="text-[14px] font-bold text-gray-900">FlowSights</div>
                <div className="text-[12px] text-gray-500">12,450 seguidores</div>
                <div className="text-[12px] text-gray-500 flex items-center gap-1">Promocionado • <img src={logos.linkedin} className="h-3 ml-1" alt="LinkedIn" /></div>
              </div>
            </div>
            <button className="text-blue-600 font-bold text-[14px] hover:bg-blue-50 px-2 py-1 rounded">+ Seguir</button>
          </div>
          <div className="px-3 pb-3">
             <p className="text-[14px] text-gray-800 leading-normal">{description}</p>
          </div>
          <div className="relative">
            <img src={imageUrl} alt="Ad" className="w-full h-56 object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-3 flex justify-between items-center backdrop-blur-sm">
               <div className="text-white font-bold text-[14px] truncate mr-2">{headline}</div>
               <button className="border-2 border-white text-white font-bold py-1 px-4 rounded-full text-[14px] hover:bg-white/10 transition shrink-0">
                {cta}
              </button>
            </div>
          </div>
          <div className="p-2 border-t border-gray-100 flex gap-4">
             <span className="text-[12px] text-gray-500 font-bold ml-2">Recomendar</span>
             <span className="text-[12px] text-gray-500 font-bold">Comentar</span>
             <span className="text-[12px] text-gray-500 font-bold">Compartir</span>
          </div>
        </div>
      );

    default:
      return null;
  }
};
