import React, { useState } from 'react';
import { Language } from '../../types';
import { publishArticle } from '../services/publishService';
import { loadArticleFromFile } from '../../services/contentService';

const ContentEditor: React.FC = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [articleId, setArticleId] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('Technology');
  const [content, setContent] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const languages = [
    { code: 'en' as Language, name: 'English' },
    { code: 'ko' as Language, name: '한국어' },
    { code: 'ja' as Language, name: '日本語' },
    { code: 'zh' as Language, name: '中文' },
    { code: 'hi' as Language, name: 'हिन्दी' },
    { code: 'es' as Language, name: 'Español' },
    { code: 'fr' as Language, name: 'Français' },
    { code: 'de' as Language, name: 'Deutsch' },
    { code: 'nl' as Language, name: 'Nederlands' },
    { code: 'pt' as Language, name: 'Português' },
    { code: 'ru' as Language, name: 'Русский' },
  ];

  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Please fill in at least the title and content');
      return;
    }

    // Check if article already exists
    const articleKey = `article_${pageNumber}_${articleId}_${selectedLanguage}`;
    const existingArticle = localStorage.getItem(articleKey);
    
    if (existingArticle) {
      const confirmed = confirm(
        `페이지 ${pageNumber}, 피드 ${articleId} (${selectedLanguage.toUpperCase()}) 기사가 이미 존재합니다.\n덮어쓰시겠습니까?`
      );
      if (!confirmed) {
        return;
      }
    }

    try {
      setIsPublishing(true);
      
      // DEBUG: 줄바꿈 문제 체크
      console.log('=== PUBLISH DEBUG ===');
      console.log('Content raw:', content);
      console.log('Content lines:', content.split('\n').length);
      console.log('Content with escaped newlines:', content.replace(/\n/g, '\\n'));
      console.log('Content with JSON.stringify:', JSON.stringify(content));
      
      // Create content object
      const contentData = {
        pageNumber,
        articleId,
        language: selectedLanguage,
        title,
        excerpt,
        category,
        content: content, // 명시적으로 content 그대로 전달
        date: new Date().toISOString().split('T')[0]
      };

      console.log('ContentData content:', JSON.stringify(contentData.content));

      await publishArticle(contentData, thumbnailFile || undefined);
      
      alert('Content published successfully!');
      
      // Reset form
      setTitle('');
      setExcerpt('');
      setContent('');
      setThumbnailFile(null);
      
    } catch (error) {
      console.error('Error publishing:', error);
      alert('Error publishing content: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsPublishing(false);
    }
  };

  const insertBold = () => {
    setContent(prev => prev + '**텍스트**');
  };

  const insertLarge = () => {
    setContent(prev => prev + '##텍스트');
  };

  const insertPurple = () => {
    setContent(prev => prev + '[[purple:텍스트]]');
  };

  const insertYoutube = () => {
    setContent(prev => prev + '[YOUTUBE:https://youtu.be/VIDEO_ID]');
  };

  const insertDivider = () => {
    setContent(prev => prev + (prev ? '\n\n' : '') + '---' + '\n\n');
  };

  const insertImage = () => {
    // Create a hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Generate unique filename
        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const uniqueFileName = `admin_${timestamp}.${extension}`;
        
        // Create object URL for preview
        const objectUrl = URL.createObjectURL(file);
        
        // Store the file object for uploading when publishing
        const imageFiles = JSON.parse(sessionStorage.getItem('tempImageFiles') || '{}');
        imageFiles[uniqueFileName] = objectUrl;
        sessionStorage.setItem('tempImageFiles', JSON.stringify(imageFiles));
        
        // Insert image tag with filename
        const imageTag = `[IMAGE:${uniqueFileName}]`;
        setContent(prev => prev + (prev ? '\n\n' : '') + imageTag + '\n\n');
        
        alert(`이미지 "${file.name}"가 추가되었습니다!`);
      }
    };
    
    // Trigger file selection
    fileInput.click();
  };

  const handleLoadArticle = async () => {
    if (!pageNumber || !articleId) {
      alert('Please enter page number and article ID');
      return;
    }

    try {
      setIsLoading(true);
      const article = await loadArticleFromFile(pageNumber, articleId, selectedLanguage);
      
      if (article) {
        setTitle(article.title);
        setExcerpt(article.excerpt);
        setContent(article.content);
        setCategory(article.category || 'Technology');
        
        // Check if there's a thumbnail in localStorage
        const thumbnailKey = `thumbnail_${pageNumber}_${articleId}`;
        const storedThumbnail = localStorage.getItem(thumbnailKey);
        if (storedThumbnail) {
          // Convert base64 back to File object (for display purposes)
          // Note: This is simplified - in a real app you'd want better file handling
        }
        
        alert('Article loaded successfully!');
      } else {
        alert('Article not found');
      }
    } catch (error) {
      console.error('Error loading article:', error);
      alert('Error loading article: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearForm = () => {
    if (confirm('Are you sure you want to clear all fields?')) {
      setTitle('');
      setExcerpt('');
      setContent('');
      setThumbnailFile(null);
      setCategory('Technology');
    }
  };


  return (
    <div className="admin-editor">
      {/* File Loader Section */}
      <div className="admin-section">
        <h2 className="admin-section-title">📁 파일 불러오기</h2>
        <div className="admin-load-controls">
          <div className="admin-load-group">
            <label>페이지 번호:</label>
            <input
              type="number"
              value={pageNumber}
              onChange={(e) => setPageNumber(Number(e.target.value))}
              min="1"
              placeholder="1"
            />
          </div>
          
          <div className="admin-load-group">
            <label>피드 숫자:</label>
            <input
              type="number"
              value={articleId}
              onChange={(e) => setArticleId(Number(e.target.value))}
              min="1"
              placeholder="1"
            />
          </div>

          <div className="admin-load-group">
            <label>언어 선택:</label>
            <select 
              value={selectedLanguage} 
              onChange={(e) => setSelectedLanguage(e.target.value as Language)}
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-load-group">
            <button 
              type="button"
              onClick={handleLoadArticle}
              disabled={isLoading}
              className="admin-load-btn"
            >
              {isLoading ? '불러오는 중...' : '불러오기'}
            </button>
          </div>
        </div>
      </div>

      {/* Writing Section */}
      <div className="admin-section">
        <h2 className="admin-section-title">✍️ 글쓰기</h2>
        
        {/* Basic Settings */}
        <div className="admin-write-settings">
          <div className="admin-setting-group">
            <label>페이지:</label>
            <input
              type="number"
              value={pageNumber}
              onChange={(e) => setPageNumber(Number(e.target.value))}
              min="1"
            />
          </div>
          
          <div className="admin-setting-group">
            <label>피드 숫자:</label>
            <input
              type="number"
              value={articleId}
              onChange={(e) => setArticleId(Number(e.target.value))}
              min="1"
            />
          </div>

          <div className="admin-setting-group">
            <label>Category:</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Technology">Technology</option>
              <option value="Business">Business</option>
              <option value="Entertainment">Entertainment</option>
            </select>
          </div>

          <div className="admin-setting-group">
            <label>Thumbnail:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
            />
            {thumbnailFile && (
              <div className="admin-file-preview">
                <span>📎 {thumbnailFile.name}</span>
                <button 
                  type="button"
                  onClick={() => setThumbnailFile(null)}
                  className="admin-remove-file"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Language Tabs */}
      <div className="admin-language-tabs">
        {languages.map(lang => (
          <button
            key={lang.code}
            type="button"
            className={`admin-lang-tab ${selectedLanguage === lang.code ? 'active' : ''}`}
            onClick={() => setSelectedLanguage(lang.code)}
          >
            {lang.name}
          </button>
        ))}
      </div>

      {/* Content Form */}
      <div className="admin-content-form">
        <div className="admin-form-group">
          <label>Title:</label>
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title"
            rows={2}
            style={{
              resize: 'vertical',
              minHeight: '3rem',
              lineHeight: '1.5'
            }}
          />
        </div>

        <div className="admin-form-group">
          <label>Excerpt:</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Brief description..."
            rows={3}
          />
        </div>

        <div className="admin-form-group">
          <label>Content:</label>
          <div className="admin-toolbar">
            <button type="button" onClick={insertBold}>**Bold**</button>
            <button type="button" onClick={insertLarge}>##Large</button>
            <button type="button" onClick={insertPurple} style={{ color: '#7c3aed' }}>💜 Purple</button>
            <button type="button" onClick={insertDivider} style={{ color: '#6b7280' }}>➖ Divider</button>
            <button type="button" onClick={insertYoutube} style={{ color: '#ff0000' }}>📺 YouTube</button>
            <button type="button" onClick={insertImage}>🖼️ Image</button>
          </div>
          
          <div style={{ position: 'relative' }}>
            <textarea
              value={content}
              onChange={(e) => {
                console.log('Content change:', e.target.value);
                console.log('Line breaks detected:', e.target.value.split('\n').length - 1);
                setContent(e.target.value);
              }}
              onKeyDown={(e) => {
                console.log('Key pressed:', e.key);
                if (e.key === 'Enter') {
                  console.log('Enter key pressed - should create line break');
                }
              }}
              placeholder="Write your content here...

엔터키를 눌러서 줄바꿈을 만들 수 있습니다.
**볼드텍스트** 또는 ##큰글씨## 또는 [[purple:보라색텍스트]] 또는 --- 구분선 사용 가능"
              rows={20}
              className="admin-content-textarea"
              style={{ 
                width: '100%',
                resize: 'vertical',
                fontFamily: 'Monaco, Menlo, monospace',
                fontSize: '0.9rem',
                padding: '0.75rem',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                color: '#000000',
                background: '#ffffff',
                whiteSpace: 'pre-wrap'
              }}
            />
            
            {/* Floating image previews */}
            <div style={{ 
              position: 'absolute', 
              top: '0.75rem', 
              right: '0.75rem', 
              maxWidth: '200px',
              background: 'rgba(248, 249, 250, 0.95)',
              border: '1px solid #e9ecef',
              borderRadius: '4px',
              padding: '0.5rem',
              display: content.includes('[IMAGE:') ? 'block' : 'none'
            }}>
              <div style={{ fontSize: '0.8rem', color: '#6c757d', marginBottom: '0.5rem' }}>업로드된 이미지:</div>
              {content.split('\n').map((line, index) => {
                if (line.includes('[IMAGE:')) {
                  const imageName = line.match(/\[IMAGE:(.*?)\]/)?.[1];
                  if (imageName) {
                    const imageFiles = JSON.parse(sessionStorage.getItem('tempImageFiles') || '{}');
                    const imageUrl = imageFiles[imageName];
                    if (imageUrl) {
                      return (
                        <div key={index} style={{ marginBottom: '0.5rem' }}>
                          <img 
                            src={imageUrl} 
                            alt={imageName}
                            style={{ 
                              maxWidth: '100%', 
                              height: 'auto', 
                              border: '1px solid #ddd', 
                              borderRadius: '4px' 
                            }}
                          />
                          <div style={{ fontSize: '0.7rem', color: '#6c757d', marginTop: '0.2rem' }}>
                            📷 {imageName}
                          </div>
                        </div>
                      );
                    }
                  }
                }
                return null;
              })}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            type="button"
            onClick={handleClearForm}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: '600',
              flex: '1'
            }}
          >
            Clear Form
          </button>
          
          <button 
            type="button"
            onClick={handlePublish} 
            className="admin-publish-btn"
            disabled={isPublishing}
            style={{ flex: '2' }}
          >
            {isPublishing ? 'Publishing...' : 'Publish Article'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;