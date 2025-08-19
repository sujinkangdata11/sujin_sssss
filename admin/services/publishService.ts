import { Language } from '../../types';

interface PublishData {
  pageNumber: number;
  articleId: number;
  language: Language;
  title: string;
  excerpt: string;
  category: string;
  content: string;
  date: string;
}

export const publishArticle = async (data: PublishData, thumbnailFile?: File): Promise<void> => {
  try {
    // Save content images to localStorage (for immediate use)
    const imageFiles = JSON.parse(sessionStorage.getItem('tempImageFiles') || '{}');
    console.log('Found temp image files:', Object.keys(imageFiles));
    
    // Wait for all images to be saved
    const imagePromises = Object.entries(imageFiles).map(([imageName, objectUrl]) => {
      return new Promise<void>((resolve, reject) => {
        fetch(objectUrl as string)
          .then(response => response.blob())
          .then(blob => {
            const reader = new FileReader();
            reader.onload = () => {
              const imageKey = `published_image_${imageName}`;
              localStorage.setItem(imageKey, reader.result as string);
              console.log('Saved image to localStorage:', imageKey);
              resolve();
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
          .catch(reject);
      });
    });

    // Wait for all images to be processed
    await Promise.all(imagePromises);

    // Create article content in text file format
    const articleContent = createArticleTextContent(data);
    
    // Create file download
    downloadArticleFile(data, articleContent);

    // Also save to localStorage for immediate preview
    const articleKey = `article_${data.pageNumber}_${data.articleId}_${data.language}`;
    
    // Create article object
    const article = {
      id: data.articleId,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      category: data.category,
      date: data.date,
      language: data.language,
      pageNumber: data.pageNumber,
      published: true,
      createdAt: new Date().toISOString()
    };

    // Save to localStorage
    localStorage.setItem(articleKey, JSON.stringify(article));
    
    // Also save to a list of published articles
    const publishedArticlesKey = 'published_articles';
    const existingArticles = JSON.parse(localStorage.getItem(publishedArticlesKey) || '[]');
    
    // Remove existing article with same id/language if exists
    const filteredArticles = existingArticles.filter(
      (a: any) => !(a.id === data.articleId && a.language === data.language && a.pageNumber === data.pageNumber)
    );
    
    // Add new article
    filteredArticles.push(article);
    
    // Sort by date (newest first)
    filteredArticles.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    localStorage.setItem(publishedArticlesKey, JSON.stringify(filteredArticles));

    // Clear temporary image files
    sessionStorage.removeItem('tempImageFiles');
    
    console.log('Article published successfully and deployed!');
    console.log('Article:', article);
    
  } catch (error) {
    console.error('Error publishing article:', error);
    throw error;
  }
};

const getThumbnailExtension = (file: File): string => {
  const mimeType = file.type;
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return 'jpg';
  }
};

// Create article text content in the format expected by contentService
const createArticleTextContent = (data: PublishData): string => {
  const content = `title: ${data.title}
excerpt: ${data.excerpt}
category: ${data.category}
date: ${data.date}

${data.content}`;
  
  return content;
};

// Download article as text file
const downloadArticleFile = (data: PublishData, content: string): void => {
  const filename = `page${data.pageNumber}_article${data.articleId}_${data.language}.txt`;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  URL.revokeObjectURL(url);
  
  console.log(`📥 Downloaded article file: ${filename}`);
};

// Download thumbnail image
const downloadThumbnailFile = (data: PublishData, thumbnailFile: File): void => {
  const extension = getThumbnailExtension(thumbnailFile);
  const filename = `page${data.pageNumber}_article${data.articleId}_${data.language}_thumbnail.${extension}`;
  
  const url = URL.createObjectURL(thumbnailFile);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  URL.revokeObjectURL(url);
  
  console.log(`📥 Downloaded thumbnail file: ${filename}`);
};


// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove data:image/xxx;base64, prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};