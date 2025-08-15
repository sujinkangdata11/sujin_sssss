
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Language, LanguageOption } from '../types';
import { SUPPORTED_LANGUAGES } from '../constants';
import './LanguageSelector.css';

interface LanguageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (lang: Language) => void;
  currentLanguage: Language;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ isOpen, onClose, onSelect, currentLanguage }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLanguages = useMemo(() => {
    return SUPPORTED_LANGUAGES.filter(lang =>
      lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  if (!isOpen) {
    return null;
  }

  const handleSelect = (langCode: Language) => {
    onSelect(langCode);
    setSearchTerm('');
    onClose();
  };

  return createPortal(
    <div
      className="language-selector-overlay"
      onClick={onClose}
    >
      <div
        className="language-selector-modal"
        onClick={e => e.stopPropagation()}
      >
        <div className="language-selector-header">
          <h2 className="language-selector-title">Select Language</h2>
        </div>
        <div className="language-selector-search-container">
          <input
            type="text"
            placeholder="Search language..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="language-selector-search"
            autoFocus
          />
        </div>
        <ul className="language-selector-list custom-scrollbar">
          {filteredLanguages.map(lang => (
            <li key={lang.code}>
              <button
                onClick={() => handleSelect(lang.code)}
                className={`language-selector-item ${
                  currentLanguage === lang.code
                    ? 'active'
                    : 'inactive'
                }`}
              >
                <span className="language-selector-native-name">{lang.nativeName}</span>
                <span className="language-selector-english-name">{lang.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body
  );
};

export default LanguageSelector;
