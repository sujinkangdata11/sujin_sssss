import React, { useState, useRef } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface ApiKeyUploadProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onUpload: (keys: string[]) => void;
}

const ApiKeyUpload: React.FC<ApiKeyUploadProps> = ({ language, isOpen, onClose, onUpload }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedKeys, setUploadedKeys] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = (key: keyof typeof translations['en']) => translations[language][key] || translations['en'][key];

  const parseApiKeys = (text: string): string[] => {
    // Parse quoted strings separated by commas: "key1", "key2", "key3"
    const regex = /"([^"]+)"/g;
    const keys: string[] = [];
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      const key = match[1].trim();
      if (key.length > 0) {
        keys.push(key);
      }
    }
    
    // Remove duplicates and return unique keys only
    const uniqueKeys = [...new Set(keys)];
    
    if (keys.length !== uniqueKeys.length) {
      console.log(`🔍 Removed ${keys.length - uniqueKeys.length} duplicate API keys`);
    }
    
    return uniqueKeys;
  };

  const handleFileRead = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const keys = parseApiKeys(text);
      setUploadedKeys(keys);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        handleFileRead(file);
      } else {
        alert('Please upload a .txt file');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileRead(file);
    }
  };

  const handleUpload = () => {
    if (uploadedKeys.length > 0) {
      onUpload(uploadedKeys);
      onClose();
      setUploadedKeys([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content api-key-upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{t('apiKeyUploadTitle').split('\n').map((line, index) => (
            <React.Fragment key={index}>
              {line}
              {index < t('apiKeyUploadTitle').split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}</h3>
          <button className="modal-close" onClick={onClose}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="modal-body">
          <div 
            className={`file-drop-zone ${isDragOver ? 'drag-over' : ''}`}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="drop-zone-content">
              <div className="drop-zone-icon" style={{ transform: 'translateY(5px)' }}>📁</div>
              <p style={{ transform: 'translateY(-5px)' }}>Drag and Drop .txt file<br/>or click to here</p>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          <div className="file-format-example">
            <h4 className="example-title">
              <svg xmlns="http://www.w3.org/2000/svg" className="example-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              {t('txtExampleTitle')}
            </h4>
            <div className="format-example">
"AIzaSyABCDEFGH123456",<br/>
"AIzaSyXYZ789012345",<br/>
"AIzaSyQWERTY567890"
</div>
          </div>
          
          {uploadedKeys.length > 0 && (
            <div className="upload-status">
              <p className="keys-count">{uploadedKeys.length} keys found</p>
              <button className="upload-confirm-btn" onClick={handleUpload}>
                Upload {uploadedKeys.length} API Keys
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiKeyUpload;