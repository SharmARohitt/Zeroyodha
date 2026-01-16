// Stock logo service - Using Logo.dev API with comprehensive fallbacks
const LOGODEV_PUBLISHABLE_KEY = 'pk_b3fjHh9gS_qpOFOx9YiESg';

class BenzingaService {
  private logoCache: Map<string, string> = new Map();

  // Stocks to skip logo fetching (use colored initials instead to prevent blinking)
  private skipLogoFetch: Set<string> = new Set([
    'SBIN', 'LICI', 'ULTRACEMCO', 'NESTLEIND', 'SUNPHARMA',
    'ONGC', 'NTPC', 'POWERGRID', 'COALINDIA', 'TECHM',
    'JSWSTEEL', 'TATASTEEL',
  ]);

  // Direct high-quality logo URLs for stocks (fallback when Logo.dev doesn't have them)
  private directLogoUrls: Record<string, string> = {
    // Priority 12 stocks - Using reliable static URLs to prevent blinking
    'SBIN': 'https://logo.clearbit.com/sbi.co.in',
    'LICI': 'https://logo.clearbit.com/licindia.in',
    'ULTRACEMCO': 'https://logo.clearbit.com/ultratechcement.com',
    'NESTLEIND': 'https://logo.clearbit.com/nestle.in',
    'SUNPHARMA': 'https://logo.clearbit.com/sunpharma.com',
    'ONGC': 'https://logo.clearbit.com/ongcindia.com',
    'NTPC': 'https://logo.clearbit.com/ntpc.co.in',
    'POWERGRID': 'https://logo.clearbit.com/powergridindia.com',
    'COALINDIA': 'https://logo.clearbit.com/coalindia.in',
    'TECHM': 'https://logo.clearbit.com/techmahindra.com',
    'JSWSTEEL': 'https://logo.clearbit.com/jsw.in',
    'TATASTEEL': 'https://logo.clearbit.com/tatasteel.com',
    
    // Other Indian Banks
    'PNB': 'https://logo.clearbit.com/pnbindia.in',
    'BANKBARODA': 'https://logo.clearbit.com/bankofbaroda.in',
    'UNIONBANK': 'https://logo.clearbit.com/unionbankofindia.co.in',
    'CANBK': 'https://logo.clearbit.com/canarabank.com',
    'INDUSINDBK': 'https://logo.clearbit.com/indusind.com',
    
    // Pharma
    'CIPLA': 'https://logo.clearbit.com/cipla.com',
    'DRREDDY': 'https://logo.clearbit.com/drreddys.com',
    'DIVISLAB': 'https://logo.clearbit.com/divilabs.com',
    
    // Power & Energy
    'IOC': 'https://logo.clearbit.com/iocl.com',
    
    // Cement
    'SHREECEM': 'https://logo.clearbit.com/shreecement.com',
    'GRASIM': 'https://logo.clearbit.com/grasim.com',
    
    // Steel & Metals
    'HINDALCO': 'https://logo.clearbit.com/hindalco.com',
    'VEDL': 'https://logo.clearbit.com/vedantaresources.com',
    
    // FMCG
    'BRITANNIA': 'https://logo.clearbit.com/britannia.co.in',
    'MARICO': 'https://logo.clearbit.com/marico.com',
    'TATACONSUM': 'https://logo.clearbit.com/tataconsum.com',
    
    // Finance
    'BAJAJFINSV': 'https://logo.clearbit.com/bajajfinserv.in',
    'HDFCLIFE': 'https://logo.clearbit.com/hdfclife.com',
    
    // Auto
    'EICHERMOT': 'https://logo.clearbit.com/eicher.in',
    'HEROMOTOCO': 'https://logo.clearbit.com/heromotocorp.com',
    'M&M': 'https://logo.clearbit.com/mahindra.com',
    
    // Others
    'PIDILITIND': 'https://logo.clearbit.com/pidilite.com',
    'APOLLOHOSP': 'https://logo.clearbit.com/apollohospitals.com',
  };

  // Map stock symbols to company domains for Logo.dev
  private symbolToDomain: Record<string, string> = {
    // Indian Stocks
    'RELIANCE': 'ril.com',
    'TCS': 'tcs.com',
    'HDFCBANK': 'hdfcbank.com',
    'INFY': 'infosys.com',
    'ICICIBANK': 'icicibank.com',
    'BHARTIARTL': 'airtel.in',
    'SBIN': 'onlinesbi.sbi',
    'BAJFINANCE': 'bajajfinserv.in',
    'ITC': 'itcportal.com',
    'HINDUNILVR': 'hul.co.in',
    'KOTAKBANK': 'kotak.com',
    'LT': 'larsentoubro.com',
    'AXISBANK': 'axisbank.com',
    'MARUTI': 'marutisuzuki.com',
    'TITAN': 'titan.co.in',
    'ASIANPAINT': 'asianpaints.com',
    'ULTRACEMCO': 'ultratechcement.com',
    'NESTLEIND': 'nestle.in',
    'WIPRO': 'wipro.com',
    'HCLTECH': 'hcltech.com',
    'SUNPHARMA': 'sunpharma.com',
    'ONGC': 'ongcindia.com',
    'NTPC': 'ntpc.co.in',
    'POWERGRID': 'powergridindia.com',
    'COALINDIA': 'coalindia.in',
    'TECHM': 'techmahindra.com',
    'TATAMOTORS': 'tatamotors.com',
    'JSWSTEEL': 'jsw.in',
    'TATASTEEL': 'tatasteel.com',
    'INDUSINDBK': 'indusind.com',
    'ADANIENT': 'adani.com',
    'ADANIPORTS': 'adaniports.com',
    'APOLLOHOSP': 'apollohospitals.com',
    'CIPLA': 'cipla.com',
    'DRREDDY': 'drreddys.com',
    'BRITANNIA': 'britannia.co.in',
    'LICI': 'licindia.in',
    'EICHERMOT': 'eicher.in',
    'HEROMOTOCO': 'heromotocorp.com',
    'HINDALCO': 'hindalco.com',
    'IOC': 'iocl.com',
    'M&M': 'mahindra.com',
    'MARICO': 'marico.com',
    'PIDILITIND': 'pidilite.com',
    'SHREECEM': 'shreecement.com',
    'TATACONSUM': 'tataconsum.com',
    'VEDL': 'vedantaresources.com',
    'GRASIM': 'grasim.com',
    'HDFCLIFE': 'hdfclife.com',
    'BAJAJFINSV': 'bajajfinserv.in',
    'DIVISLAB': 'drreddys.com',
    'PNB': 'pnbindia.in',
    'BANKBARODA': 'bankofbaroda.in',
    'UNIONBANK': 'unionbankofindia.co.in',
    'CANBK': 'canarabank.com',
    
    // US Stocks
    'AAPL': 'apple.com',
    'GOOGL': 'google.com',
    'MSFT': 'microsoft.com',
    'AMZN': 'amazon.com',
    'TSLA': 'tesla.com',
    'META': 'meta.com',
    'NVDA': 'nvidia.com',
    'NFLX': 'netflix.com',
    'FB': 'facebook.com',
  };

  /**
   * Get cached logo (synchronous)
   */
  getCachedLogo(symbol: string): string | null {
    return this.logoCache.get(symbol) || null;
  }

  /**
   * Fetch stock logo with comprehensive fallback system
   * Priority: Cache > Skip List (null) > Direct URLs > Logo.dev API
   */
  async getStockLogo(symbol: string): Promise<string | null> {
    // Check cache first
    if (this.logoCache.has(symbol)) {
      return this.logoCache.get(symbol) || null;
    }

    // Skip logo fetching for problematic stocks (prevents blinking)
    if (this.skipLogoFetch.has(symbol)) {
      console.log(`⏭️  Skipping logo fetch for ${symbol} (using colored initials)`);
      return null;
    }

    // Check if we have a direct logo URL (highest quality, instant)
    if (this.directLogoUrls[symbol]) {
      const logo = this.directLogoUrls[symbol];
      this.logoCache.set(symbol, logo);
      console.log(`✅ Using direct logo URL for ${symbol}`);
      return logo;
    }

    try {
      const domain = this.symbolToDomain[symbol];
      if (!domain) {
        console.log(`No domain mapping for ${symbol}`);
        return null;
      }

      // Use Logo.dev API with publishable key
      const logoUrl = `https://img.logo.dev/${domain}?token=${LOGODEV_PUBLISHABLE_KEY}&size=200&format=png`;
      
      this.logoCache.set(symbol, logoUrl);
      console.log(`✅ Generated Logo.dev URL for ${symbol}`);
      return logoUrl;
    } catch (error) {
      console.error(`Error generating logo for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Fetch multiple stock logos in batch
   */
  async getStockLogos(symbols: string[]): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    
    console.log(`📊 Loading logos for ${symbols.length} stocks...`);
    
    // Generate logo URLs for all symbols
    for (const symbol of symbols) {
      try {
        const logo = await this.getStockLogo(symbol);
        if (logo) {
          results.set(symbol, logo);
        }
      } catch (error) {
        console.error(`Error generating logo for ${symbol}:`, error);
      }
    }

    const directCount = symbols.filter(s => this.directLogoUrls[s]).length;
    const logodevCount = results.size - directCount;
    
    console.log(`✅ Loaded ${results.size}/${symbols.length} logos (${directCount} direct, ${logodevCount} Logo.dev)`);
    return results;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.logoCache.clear();
  }
}

export const benzingaService = new BenzingaService();
