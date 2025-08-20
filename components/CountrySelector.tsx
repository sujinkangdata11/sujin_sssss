
import React, { useState, useEffect, useRef } from 'react';
import { Country, Language } from '../types';
import { COUNTRIES } from '../constants';
import './CountrySelector.css';

interface CountrySelectorProps {
  selectedCountries: string[];
  onChange: (selected: string[]) => void;
  language: Language;
  hideSelectAll?: boolean;
}

const translations: Record<Language, Record<string, string>> = {
    en: { select: "Select countries", selected: "countries selected", search: "Search countries...", worldwide: "Worldwide (Select All)", topRPM: "High RPM Top 20", viralPowerhouse: "Viral Powers Top 20" },
    ko: { select: "국가 선택", selected: "개국 선택됨", search: "국가 검색...", worldwide: "전세계 (전체 선택)", topRPM: "고수익 20개국", viralPowerhouse: "바이럴 강국 20개국" },
    ja: { select: "国を選択", selected: "カ国選択済み", search: "国を検索...", worldwide: "全世界（すべて選択）", topRPM: "高収益20カ国", viralPowerhouse: "バイラル強国20" },
    zh: { select: "选择国家", selected: "个国家已选", search: "搜索国家...", worldwide: "全球 (全选)", topRPM: "高收益20国", viralPowerhouse: "病毒强国20" },
    hi: { select: "देश चुनें", selected: "देश चुने गए", search: "देश खोजें...", worldwide: "दुनिया भर में (सभी चुनें)", topRPM: "हाई RPM टॉप 20", viralPowerhouse: "वायरल पावर टॉप 20" },
    es: { select: "Seleccionar países", selected: "países seleccionados", search: "Buscar países...", worldwide: "Todo el mundo (Seleccionar todo)", topRPM: "Alto RPM Top 20", viralPowerhouse: "Potencias Virales 20" },
    fr: { select: "Sélectionner des pays", selected: "pays sélectionnés", search: "Rechercher des pays...", worldwide: "Monde entier (Tout sélectionner)", topRPM: "Haut RPM Top 20", viralPowerhouse: "Puissances Viral 20" },
    de: { select: "Länder auswählen", selected: "Länder ausgewählt", search: "Länder suchen...", worldwide: "Weltweit (Alle auswählen)", topRPM: "High RPM Top 20", viralPowerhouse: "Viral-Mächte Top 20" },
    nl: { select: "Landen selecteren", selected: "landen geselecteerd", search: "Landen zoeken...", worldwide: "Wereldwijd (Alles selecteren)", topRPM: "Hoge RPM Top 20", viralPowerhouse: "Virale Machten 20" },
    pt: { select: "Selecionar países", selected: "países selecionados", search: "Pesquisar países...", worldwide: "Mundo todo (Selecionar todos)", topRPM: "Alto RPM Top 20", viralPowerhouse: "Potências Virais 20" },
    ru: { select: "Выберите страны", selected: "стран выбрано", search: "Поиск стран...", worldwide: "Весь мир (Выбрать все)", topRPM: "Высокий RPM Топ 20", viralPowerhouse: "Вирусные Державы 20" },
};

const CountrySelector: React.FC<CountrySelectorProps> = ({ selectedCountries, onChange, language, hideSelectAll = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredOption, setHoveredOption] = useState<'topRPM' | 'viral' | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{x: number, y: number}>({x: 0, y: 0});
  const wrapperRef = useRef<HTMLDivElement>(null);
  const t = (key: keyof typeof translations['en']) => translations[language][key] || translations['en'][key];


  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const allCountryCodes = COUNTRIES.map(c => c.code);
  const topRPMCountryCodes = ['NO', 'CH', 'DK', 'SE', 'FI', 'LU', 'IS', 'US', 'GB', 'AT', 'BE', 'NZ', 'SG', 'HK', 'IE', 'CA', 'AU', 'DE', 'NL', 'FR'];
  const viralPowerhouseCountryCodes = ['US', 'IN', 'BR', 'MX', 'KR', 'JP', 'ID', 'PH', 'TH', 'VN', 'GB', 'FR', 'DE', 'IT', 'ES', 'CA', 'AU', 'TR', 'RU', 'ZA'];
  
  // Get country names for tooltip in grid format
  const getCountryNames = (codes: string[]) => {
    const names = codes.map(code => COUNTRIES.find(c => c.code === code)?.name || code);
    return names;
  };
  
  // Handle mouse enter with position calculation
  const handleMouseEnter = (option: 'topRPM' | 'viral', event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const dropdownRect = wrapperRef.current?.getBoundingClientRect();
    
    if (dropdownRect) {
      // Position tooltip to the right of the dropdown
      setTooltipPosition({
        x: dropdownRect.right + 10,
        y: rect.top
      });
      setHoveredOption(option);
    }
  };
  
  const areAllSelected = selectedCountries.length === allCountryCodes.length;
  const areTopRPMSelected = topRPMCountryCodes.every(code => selectedCountries.includes(code)) && selectedCountries.length === topRPMCountryCodes.length;
  const areViralPowerhouseSelected = viralPowerhouseCountryCodes.every(code => selectedCountries.includes(code)) && selectedCountries.length === viralPowerhouseCountryCodes.length;

  const handleSelectAllToggle = () => {
      onChange(areAllSelected ? [] : allCountryCodes);
  }

  const handleTopRPMToggle = () => {
      onChange(areTopRPMSelected ? [] : topRPMCountryCodes);
  }

  const handleViralPowerhouseToggle = () => {
      onChange(areViralPowerhouseSelected ? [] : viralPowerhouseCountryCodes);
  }

  const handleToggle = (countryCode: string) => {
    const newSelection = selectedCountries.includes(countryCode)
      ? selectedCountries.filter(c => c !== countryCode)
      : [...selectedCountries, countryCode];
    onChange(newSelection);
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <div className="country-selector-container" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="country-selector-button"
      >
        <span className="country-selector-button-text">
          {selectedCountries.length === 0
            ? t('select')
            : `${selectedCountries.length} ${t('selected')}`}
        </span>
        <span className="country-selector-arrow">
          <svg className="country-selector-arrow-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 6.53 8.28a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3zm-3.72 9.28a.75.75 0 011.06 0L10 15.19l2.67-2.91a.75.75 0 111.06 1.06l-3.25 3.5a.75.75 0 01-1.06 0l-3.25-3.5a.75.75 0 010-1.06z" clipRule="evenodd" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="country-selector-dropdown custom-scrollbar">
          <div className="country-selector-search-container">
            <input
              type="text"
              placeholder={t('search')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="country-selector-search"
            />
          </div>
          <ul>
            {!hideSelectAll && (
              <li
                onClick={handleSelectAllToggle}
                className="country-selector-option"
              >
                <div className="country-selector-option-content">
                  <input
                    type="checkbox"
                    checked={areAllSelected}
                    readOnly
                    className="country-selector-checkbox"
                  />
                  <span className="country-selector-option-text worldwide">{t('worldwide')}</span>
                </div>
              </li>
            )}
            <li
              onClick={handleTopRPMToggle}
              className="country-selector-option country-option-with-tooltip"
              onMouseEnter={(e) => handleMouseEnter('topRPM', e)}
              onMouseLeave={() => setHoveredOption(null)}
            >
              <div className="country-selector-option-content">
                <input
                  type="checkbox"
                  checked={areTopRPMSelected}
                  readOnly
                  className="country-selector-checkbox"
                />
                <span className="country-selector-option-text top-rpm">{t('topRPM')}</span>
              </div>
            </li>
            <li
              onClick={handleViralPowerhouseToggle}
              className="country-selector-option country-option-with-tooltip"
              onMouseEnter={(e) => handleMouseEnter('viral', e)}
              onMouseLeave={() => setHoveredOption(null)}
            >
              <div className="country-selector-option-content">
                <input
                  type="checkbox"
                  checked={areViralPowerhouseSelected}
                  readOnly
                  className="country-selector-checkbox"
                />
                <span className="country-selector-option-text viral-powerhouse">{t('viralPowerhouse')}</span>
              </div>
            </li>
            <hr className="country-selector-divider"/>
            {filteredCountries.map(country => (
              <li
                key={country.code}
                onClick={() => handleToggle(country.code)}
                className="country-selector-option"
              >
                <div className="country-selector-option-content">
                  <input
                    type="checkbox"
                    checked={selectedCountries.includes(country.code)}
                    readOnly
                    className="country-selector-checkbox"
                  />
                  <span className="country-selector-option-text normal">{country.name}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Country tooltip popup */}
      {hoveredOption && (
        <div 
          className="country-tooltip"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`
          }}
        >
          <div className="country-tooltip-content">
            <div className="country-tooltip-grid">
              {hoveredOption === 'topRPM' && getCountryNames(topRPMCountryCodes).map((name, index) => (
                <div key={index} className="country-tooltip-item">{name}</div>
              ))}
              {hoveredOption === 'viral' && getCountryNames(viralPowerhouseCountryCodes).map((name, index) => (
                <div key={index} className="country-tooltip-item">{name}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountrySelector;
