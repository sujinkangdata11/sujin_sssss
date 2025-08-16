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
    // Save content images to localStorage
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

    // For now, save to localStorage as a demo
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
    
    if (thumbnailFile) {
      // Convert thumbnail to base64 and save
      const reader = new FileReader();
      reader.onload = () => {
        const thumbnailKey = `thumbnail_${data.pageNumber}_${data.articleId}`;
        localStorage.setItem(thumbnailKey, reader.result as string);
      };
      reader.readAsDataURL(thumbnailFile);
    }

    // Clear temporary image files
    sessionStorage.removeItem('tempImageFiles');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Article published successfully to localStorage!');
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