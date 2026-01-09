// Finnhub API Service for Market News
const FINNHUB_API_KEY = 'd5gc699r01qie3lhqqtgd5gc699r01qie3lhqqu0';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

export interface NewsArticle {
  id: number;
  headline: string;
  summary: string;
  source: string;
  image?: string;
  url: string;
  datetime: number;
  category: string;
}

export interface NewsResponse {
  data: NewsArticle[];
  hasMore: boolean;
}

class NewsService {
  /**
   * Get general market news
   */
  async getGeneralNews(): Promise<NewsArticle[]> {
    try {
      const response = await fetch(
        `${FINNHUB_BASE_URL}/news?category=general&token=${process.env.EXPO_PUBLIC_FINNHUB_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();
      return this.formatNewsArticles(data);
    } catch (error) {
      console.error('Error fetching general news:', error);
      // Return mock data as fallback
      return this.getMockNews();
    }
  }

  /**
   * Get news for a specific symbol (Indian stocks)
   */
  async getNewsForSymbol(symbol: string): Promise<NewsArticle[]> {
    try {
      // For Indian stocks, we'll use general news filtered by keyword
      // Finnhub primarily supports US stocks, so we'll use general news
      const response = await fetch(
        `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${this.getDateString(-7)}&to=${this.getDateString(0)}&token=${process.env.EXPO_PUBLIC_FINNHUB_API_KEY}`
      );
      
      if (!response.ok) {
        // Fallback to general news
        return this.getGeneralNews();
      }

      const data = await response.json();
      return this.formatNewsArticles(data);
    } catch (error) {
      console.error('Error fetching symbol news:', error);
      return this.getGeneralNews();
    }
  }

  /**
   * Get India-specific market news
   */
  async getIndiaMarketNews(): Promise<NewsArticle[]> {
    try {
      // Search for India-related news
      const response = await fetch(
        `${FINNHUB_BASE_URL}/news?category=general&token=${process.env.EXPO_PUBLIC_FINNHUB_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();
      // Filter for India-related news
      const indiaNews = data.filter((article: any) => {
        const headline = article.headline?.toLowerCase() || '';
        const summary = article.summary?.toLowerCase() || '';
        return (
          headline.includes('india') ||
          headline.includes('indian') ||
          headline.includes('nse') ||
          headline.includes('bse') ||
          headline.includes('nifty') ||
          headline.includes('sensex') ||
          summary.includes('india') ||
          summary.includes('indian')
        );
      });

      return this.formatNewsArticles(indiaNews.length > 0 ? indiaNews : data.slice(0, 10));
    } catch (error) {
      console.error('Error fetching India news:', error);
      return this.getMockNews();
    }
  }

  /**
   * Format news articles from Finnhub API
   */
  private formatNewsArticles(data: any[]): NewsArticle[] {
    return data.map((article) => ({
      id: article.id || Date.now() + Math.random(),
      headline: article.headline || article.title || 'No headline',
      summary: article.summary || article.description || '',
      source: article.source || 'Unknown',
      image: article.image || undefined,
      url: article.url || article.link || '#',
      datetime: article.datetime || article.publishedAt || Date.now(),
      category: article.category || 'general',
    }));
  }

  /**
   * Get date string in YYYY-MM-DD format
   */
  private getDateString(daysOffset: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
  }

  /**
   * Mock news data as fallback
   */
  private getMockNews(): NewsArticle[] {
    return [
      {
        id: 1,
        headline: 'NIFTY 50 Hits New All-Time High',
        summary: 'The NIFTY 50 index reached a new all-time high today, driven by strong performance in banking and IT sectors. The index closed at 24,500 points, up 1.2% from the previous close.',
        source: 'Economic Times',
        url: '#',
        datetime: Date.now(),
        category: 'market',
      },
      {
        id: 2,
        headline: 'RBI Keeps Repo Rate Unchanged at 6.5%',
        summary: 'The Reserve Bank of India maintained the repo rate at 6.5% in its latest monetary policy review. The central bank cited stable inflation and growth concerns.',
        source: 'Business Standard',
        url: '#',
        datetime: Date.now() - 86400000,
        category: 'policy',
      },
      {
        id: 3,
        headline: 'Indian IT Sector Shows Strong Q3 Results',
        summary: 'Major IT companies including TCS, Infosys, and Wipro reported better-than-expected quarterly results, with strong growth in digital services.',
        source: 'Mint',
        url: '#',
        datetime: Date.now() - 172800000,
        category: 'sector',
      },
      {
        id: 4,
        headline: 'Banking Stocks Rally on Positive Outlook',
        summary: 'Banking stocks surged today following positive commentary from analysts. HDFC Bank, ICICI Bank, and SBI led the gains in the banking index.',
        source: 'Financial Express',
        url: '#',
        datetime: Date.now() - 259200000,
        category: 'sector',
      },
      {
        id: 5,
        headline: 'FIIs Continue Buying in Indian Markets',
        summary: 'Foreign Institutional Investors (FIIs) remained net buyers for the third consecutive week, investing over ₹5,000 crores in Indian equities.',
        source: 'Moneycontrol',
        url: '#',
        datetime: Date.now() - 345600000,
        category: 'market',
      },
    ];
  }
}

export const newsService = new NewsService();

