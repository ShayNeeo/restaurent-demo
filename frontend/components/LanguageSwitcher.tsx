"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const languages = [
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" }
];

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentLang, setCurrentLang] = useState("de");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detect current language from pathname
    if (pathname.startsWith("/en")) {
      setCurrentLang("en");
    } else if (pathname.startsWith("/vi")) {
      setCurrentLang("vi");
    } else {
      setCurrentLang("de");
    }
  }, [pathname]);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    if (langCode === currentLang) {
      setIsOpen(false);
      return;
    }

    // Remove language prefix from current path
    let newPath = pathname.replace(/^\/(en|vi)/, "") || "/";

    // Add new language prefix if not German
    if (langCode !== "de") {
      newPath = `/${langCode}${newPath}`;
    }

    setIsOpen(false);
    router.push(newPath);
  };

  const currentLanguage = languages.find((lang) => lang.code === currentLang);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/30"
        aria-label="Language selector"
        aria-expanded={isOpen}
      >
        <span>{currentLanguage?.flag}</span>
        <span className="hidden xs:inline">{currentLanguage?.label}</span>
        <svg
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 origin-top-right rounded-lg border border-white/10 bg-gray-950/95 shadow-xl backdrop-blur animate-in fade-in zoom-in-95 duration-200">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition ${
                currentLang === lang.code
                  ? "bg-brand/40 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              } ${
                languages.indexOf(lang) !== languages.length - 1
                  ? "border-b border-white/10"
                  : ""
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="font-medium">{lang.label}</span>
              {currentLang === lang.code && (
                <svg
                  className="ml-auto h-5 w-5 text-brand"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

