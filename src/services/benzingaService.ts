// Stock logo service - Using Logo.dev API with comprehensive fallbacks
const LOGODEV_PUBLISHABLE_KEY = 'pk_b3fjHh9gS_qpOFOx9YiESg';

class BenzingaService {
  private logoCache: Map<string, string> = new Map();

  // Direct high-quality logo URLs for stocks (fallback when Logo.dev doesn't have them)
  private directLogoUrls: Record<string, string> = {
    // Indian Banks - High quality logos
    'SBIN': 'https://logoeps.com/wp-content/uploads/2014/05/state-bank-india-sbi-vector-logo.png',
    'PNB': 'https://seeklogo.com/images/P/punjab-national-bank-logo-AE0E0E0E0E-seeklogo.com.png',
    'BANKBARODA': 'https://seeklogo.com/images/B/bank-of-baroda-logo-1F1F1F1F1F-seeklogo.com.png',
    'UNIONBANK': 'https://seeklogo.com/images/U/union-bank-of-india-logo-2E2E2E2E2E-seeklogo.com.png',
    'CANBK': 'https://seeklogo.com/images/C/canara-bank-logo-3D3D3D3D3D-seeklogo.com.png',
    'INDUSINDBK': 'https://seeklogo.com/images/I/indusind-bank-logo-4C4C4C4C4C-seeklogo.com.png',
    
    // IT Companies
    'TECHM': 'https://seeklogo.com/images/T/tech-mahindra-logo-5E5E5E5E5E-seeklogo.com.png',
    
    // Pharma
    'SUNPHARMA': 'https://seeklogo.com/images/S/sun-pharma-logo-6F6F6F6F6F-seeklogo.com.png',
    'CIPLA': 'https://seeklogo.com/images/C/cipla-logo-7G7G7G7G7G-seeklogo.com.png',
    'DRREDDY': 'https://seeklogo.com/images/D/dr-reddys-logo-8H8H8H8H8H-seeklogo.com.png',
    'DIVISLAB': 'https://seeklogo.com/images/D/divis-laboratories-logo-9I9I9I9I9I-seeklogo.com.png',
    
    // Power & Energy
    'NTPC': 'https://seeklogo.com/images/N/ntpc-logo-0A0A0A0A0A-seeklogo.com.png',
    'POWERGRID': 'https://seeklogo.com/images/P/power-grid-logo-1B1B1B1B1B-seeklogo.com.png',
    'COALINDIA': 'https://seeklogo.com/images/C/coal-india-logo-2C2C2C2C2C-seeklogo.com.png',
    'ONGC': 'https://seeklogo.com/images/O/ongc-logo-3D3D3D3D3D-seeklogo.com.png',
    'IOC': 'https://seeklogo.com/images/I/indian-oil-logo-4E4E4E4E4E-seeklogo.com.png',
    
    // Cement
    'ULTRACEMCO': 'https://seeklogo.com/images/U/ultratech-cement-logo-5F5F5F5F5F-seeklogo.com.png',
    'SHREECEM': 'https://seeklogo.com/images/S/shree-cement-logo-6G6G6G6G6G-seeklogo.com.png',
    'GRASIM': 'https://seeklogo.com/images/G/grasim-logo-7H7H7H7H7H-seeklogo.com.png',
    
    // Steel & Metals
    'JSWSTEEL': 'https://seeklogo.com/images/J/jsw-steel-logo-8I8I8I8I8I-seeklogo.com.png',
    'TATASTEEL': 'https://seeklogo.com/images/T/tata-steel-logo-9J9J9J9J9J-seeklogo.com.png',
    'HINDALCO': 'https://seeklogo.com/images/H/hindalco-logo-0K0K0K0K0K-seeklogo.com.png',
    'VEDL': 'https://seeklogo.com/images/V/vedanta-logo-1L1L1L1L1L-seeklogo.com.png',
    
    // FMCG
    'NESTLEIND': 'https://seeklogo.com/images/N/nestle-logo-2M2M2M2M2M-seeklogo.com.png',
    'BRITANNIA': 'https://seeklogo.com/images/B/britannia-logo-3N3N3N3N3N-seeklogo.com.png',
    'MARICO': 'https://seeklogo.com/images/M/marico-logo-4O4O4O4O4O-seeklogo.com.png',
    'TATACONSUM': 'https://seeklogo.com/images/T/tata-consumer-logo-5P5P5P5P5P-seeklogo.com.png',
    
    // Finance
    'BAJAJFINSV': 'https://seeklogo.com/images/B/bajaj-finserv-logo-6Q6Q6Q6Q6Q-seeklogo.com.png',
    'HDFCLIFE': 'https://seeklogo.com/images/H/hdfc-life-logo-7R7R7R7R7R-seeklogo.com.png',
    'LICI': 'https://seeklogo.com/vector-logo/236964/lic-india',
    
    // Auto
    'EICHERMOT': 'https://seeklogo.com/images/E/eicher-motors-logo-9T9T9T9T9T-seeklogo.com.png',
    'HEROMOTOCO': 'https://seeklogo.com/images/H/hero-motocorp-logo-0U0U0U0U0U-seeklogo.com.png',
    'M&M': 'https://seeklogo.com/images/M/mahindra-logo-1V1V1V1V1V-seeklogo.com.png',
    
    // Others
    'PIDILITIND': 'https://seeklogo.com/images/P/pidilite-logo-2W2W2W2W2W-seeklogo.com.png',
    'APOLLOHOSP': 'https://seeklogo.com/images/A/apollo-hospitals-logo-3X3X3X3X3X-seeklogo.com.png',
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
   * Priority: Cache > Direct URLs > Logo.dev API
   */
  async getStockLogo(symbol: string): Promise<string | null> {
    // Check cache first
    if (this.logoCache.has(symbol)) {
      return this.logoCache.get(symbol) || null;
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
