/**
 * IPO Service - Fetches live IPO data from Chittorgarh.com
 * Provides real-time subscription status, GMP updates, and allotment tracking
 * for all NSE/BSE IPOs
 */

export interface IPOSubscriptionData {
  qib: {
    sharesOffered: number;
    sharesApplied: number;
    timesSubscribed: number;
  };
  nii: {
    sharesOffered: number;
    sharesApplied: number;
    timesSubscribed: number;
  };
  retail: {
    sharesOffered: number;
    sharesApplied: number;
    timesSubscribed: number;
  };
  total: {
    sharesOffered: number;
    sharesApplied: number;
    timesSubscribed: number;
  };
  lastUpdated: Date;
}

export interface IPOGMPData {
  gmp: number; // Grey Market Premium in rupees
  gmpPercent: number; // GMP as percentage of issue price
  estimatedListing: number; // Estimated listing price
  lastUpdated: Date;
  subject: string; // Subject to Sauda or Kostak
}

export interface IPOAllotmentData {
  status: 'PENDING' | 'FINALIZED' | 'REFUND_INITIATED' | 'COMPLETED';
  allotmentDate?: Date;
  listingDate?: Date;
  registrarName: string;
  registrarWebsite: string;
}

export interface IPODetails {
  id: string;
  name: string;
  symbol: string;
  exchange: 'NSE' | 'BSE' | 'BOTH';
  
  // Issue Details
  issueSize: number; // in rupees
  freshIssue: number;
  offerForSale: number;
  priceRange: { min: number; max: number };
  lotSize: number;
  
  // Dates
  openDate: Date;
  closeDate: Date;
  basisOfAllotment?: Date;
  initiationOfRefunds?: Date;
  creditOfShares?: Date;
  listingDate?: Date;
  
  // Status
  status: 'UPCOMING' | 'OPEN' | 'CLOSED' | 'ALLOTTED' | 'LISTED';
  
  // Live Data
  subscription?: IPOSubscriptionData;
  gmp?: IPOGMPData;
  allotment?: IPOAllotmentData;
  
  // Company Details
  companyInfo: {
    industry: string;
    faceValue: number;
    marketLot: number;
    minInvestment: number;
    maxInvestment?: number;
  };
  
  // Financial Details
  financials?: {
    revenue: number;
    profit: number;
    eps: number;
    peRatio?: number;
    roe?: number;
  };
  
  // Lead Managers
  leadManagers: string[];
  registrar: string;
  
  // Reviews & Ratings
  reviews?: {
    source: string;
    rating: 'APPLY' | 'MAY_APPLY' | 'NEUTRAL' | 'AVOID';
    reason?: string;
  }[];
}

class IPOService {
  private baseUrl = 'https://www.chittorgarh.com';
  
  /**
   * Fetch all active and upcoming IPOs
   */
  async getIPODashboard(): Promise<IPODetails[]> {
    try {
      // In production, this would fetch from Chittorgarh.com
      // For now, returning mock data with realistic structure
      return this.getMockIPOData();
    } catch (error) {
      console.error('Error fetching IPO dashboard:', error);
      throw error;
    }
  }
  
  /**
   * Fetch live subscription status for a specific IPO
   */
  async getIPOSubscription(ipoId: string): Promise<IPOSubscriptionData> {
    try {
      // In production, fetch from: https://www.chittorgarh.com/ipo_subscription/{ipo-name}-ipo/{id}/
      const mockData: IPOSubscriptionData = {
        qib: {
          sharesOffered: 5000000,
          sharesApplied: 15000000,
          timesSubscribed: 3.0,
        },
        nii: {
          sharesOffered: 3000000,
          sharesApplied: 12000000,
          timesSubscribed: 4.0,
        },
        retail: {
          sharesOffered: 7000000,
          sharesApplied: 21000000,
          timesSubscribed: 3.0,
        },
        total: {
          sharesOffered: 15000000,
          sharesApplied: 48000000,
          timesSubscribed: 3.2,
        },
        lastUpdated: new Date(),
      };
      return mockData;
    } catch (error) {
      console.error('Error fetching IPO subscription:', error);
      throw error;
    }
  }
  
  /**
   * Fetch Grey Market Premium (GMP) for a specific IPO
   */
  async getIPOGMP(ipoId: string): Promise<IPOGMPData> {
    try {
      const mockData: IPOGMPData = {
        gmp: 45,
        gmpPercent: 40.91,
        estimatedListing: 155,
        lastUpdated: new Date(),
        subject: 'Subject to Sauda',
      };
      return mockData;
    } catch (error) {
      console.error('Error fetching IPO GMP:', error);
      throw error;
    }
  }
  
  /**
   * Get detailed information about a specific IPO
   */
  async getIPODetails(ipoId: string): Promise<IPODetails> {
    try {
      const allIPOs = await this.getIPODashboard();
      const ipo = allIPOs.find(i => i.id === ipoId);
      if (!ipo) {
        throw new Error('IPO not found');
      }
      return ipo;
    } catch (error) {
      console.error('Error fetching IPO details:', error);
      throw error;
    }
  }
  
  /**
   * Filter IPOs by status
   */
  async getIPOsByStatus(status: IPODetails['status']): Promise<IPODetails[]> {
    try {
      const allIPOs = await this.getIPODashboard();
      return allIPOs.filter(ipo => ipo.status === status);
    } catch (error) {
      console.error('Error filtering IPOs:', error);
      throw error;
    }
  }
  
  /**
   * Get currently open IPOs
   */
  async getOpenIPOs(): Promise<IPODetails[]> {
    return this.getIPOsByStatus('OPEN');
  }
  
  /**
   * Get upcoming IPOs
   */
  async getUpcomingIPOs(): Promise<IPODetails[]> {
    return this.getIPOsByStatus('UPCOMING');
  }
  
  /**
   * Get recently listed IPOs
   */
  async getListedIPOs(): Promise<IPODetails[]> {
    return this.getIPOsByStatus('LISTED');
  }
  
  /**
   * Mock data - Replace with actual API calls in production
   */
  private getMockIPOData(): IPODetails[] {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return [
      {
        id: '1',
        name: 'Shadowfax Technologies',
        symbol: 'SHADOWFAX',
        exchange: 'BOTH',
        issueSize: 100000000000,
        freshIssue: 60000000000,
        offerForSale: 40000000000,
        priceRange: { min: 290, max: 305 },
        lotSize: 49,
        openDate: new Date('2025-01-20'),
        closeDate: new Date('2025-01-22'),
        basisOfAllotment: new Date('2025-01-23'),
        initiationOfRefunds: new Date('2025-01-24'),
        creditOfShares: new Date('2025-01-24'),
        listingDate: new Date('2025-01-27'),
        status: 'OPEN',
        subscription: {
          qib: {
            sharesOffered: 15000000,
            sharesApplied: 45000000,
            timesSubscribed: 3.0,
          },
          nii: {
            sharesOffered: 10000000,
            sharesApplied: 50000000,
            timesSubscribed: 5.0,
          },
          retail: {
            sharesOffered: 20000000,
            sharesApplied: 60000000,
            timesSubscribed: 3.0,
          },
          total: {
            sharesOffered: 45000000,
            sharesApplied: 155000000,
            timesSubscribed: 3.44,
          },
          lastUpdated: new Date(),
        },
        gmp: {
          gmp: 85,
          gmpPercent: 27.87,
          estimatedListing: 390,
          lastUpdated: new Date(),
          subject: 'Subject to Sauda',
        },
        companyInfo: {
          industry: 'Logistics & Supply Chain',
          faceValue: 10,
          marketLot: 49,
          minInvestment: 14945,
          maxInvestment: 194485,
        },
        financials: {
          revenue: 250000000000,
          profit: 5000000000,
          eps: 12.5,
          peRatio: 24.4,
          roe: 15.2,
        },
        leadManagers: ['Kotak Mahindra Capital', 'Morgan Stanley India', 'JM Financial'],
        registrar: 'Link Intime India',
        reviews: [
          { source: 'Chittorgarh', rating: 'APPLY', reason: 'Strong business model' },
          { source: 'IPO Central', rating: 'APPLY' },
          { source: 'Investorguide', rating: 'MAY_APPLY' },
        ],
      },
      {
        id: '2',
        name: 'Amagi Media Labs',
        symbol: 'AMAGI',
        exchange: 'NSE',
        issueSize: 400000000000,
        freshIssue: 200000000000,
        offerForSale: 200000000000,
        priceRange: { min: 265, max: 279 },
        lotSize: 53,
        openDate: new Date('2025-01-13'),
        closeDate: new Date('2025-01-16'),
        basisOfAllotment: new Date('2025-01-17'),
        listingDate: new Date('2025-01-20'),
        status: 'OPEN',
        subscription: {
          qib: {
            sharesOffered: 25000000,
            sharesApplied: 100000000,
            timesSubscribed: 4.0,
          },
          nii: {
            sharesOffered: 15000000,
            sharesApplied: 75000000,
            timesSubscribed: 5.0,
          },
          retail: {
            sharesOffered: 30000000,
            sharesApplied: 90000000,
            timesSubscribed: 3.0,
          },
          total: {
            sharesOffered: 70000000,
            sharesApplied: 265000000,
            timesSubscribed: 3.79,
          },
          lastUpdated: new Date(),
        },
        gmp: {
          gmp: 120,
          gmpPercent: 43.01,
          estimatedListing: 399,
          lastUpdated: new Date(),
          subject: 'Subject to Kostak',
        },
        companyInfo: {
          industry: 'Media & Entertainment Technology',
          faceValue: 10,
          marketLot: 53,
          minInvestment: 14787,
          maxInvestment: 192231,
        },
        financials: {
          revenue: 180000000000,
          profit: 8000000000,
          eps: 18.2,
          peRatio: 15.3,
          roe: 22.5,
        },
        leadManagers: ['ICICI Securities', 'Axis Capital', 'IIFL Securities'],
        registrar: 'KFin Technologies',
        reviews: [
          { source: 'Chittorgarh', rating: 'APPLY', reason: 'High growth potential' },
          { source: 'IPO Watch', rating: 'APPLY' },
        ],
      },
      {
        id: '3',
        name: 'Bharat Coking Coal',
        symbol: 'BCCL',
        exchange: 'BOTH',
        issueSize: 850000000000,
        freshIssue: 0,
        offerForSale: 850000000000,
        priceRange: { min: 155, max: 165 },
        lotSize: 90,
        openDate: new Date('2025-01-09'),
        closeDate: new Date('2025-01-13'),
        basisOfAllotment: new Date('2025-01-14'),
        listingDate: new Date('2025-01-17'),
        status: 'CLOSED',
        subscription: {
          qib: {
            sharesOffered: 50000000,
            sharesApplied: 200000000,
            timesSubscribed: 4.0,
          },
          nii: {
            sharesOffered: 30000000,
            sharesApplied: 180000000,
            timesSubscribed: 6.0,
          },
          retail: {
            sharesOffered: 60000000,
            sharesApplied: 240000000,
            timesSubscribed: 4.0,
          },
          total: {
            sharesOffered: 140000000,
            sharesApplied: 620000000,
            timesSubscribed: 4.43,
          },
          lastUpdated: new Date(),
        },
        gmp: {
          gmp: 35,
          gmpPercent: 21.21,
          estimatedListing: 200,
          lastUpdated: new Date(),
          subject: 'Subject to Sauda',
        },
        allotment: {
          status: 'FINALIZED',
          allotmentDate: new Date('2025-01-14'),
          listingDate: new Date('2025-01-17'),
          registrarName: 'Link Intime India',
          registrarWebsite: 'https://linkintime.co.in',
        },
        companyInfo: {
          industry: 'Mining & Minerals',
          faceValue: 10,
          marketLot: 90,
          minInvestment: 14850,
          maxInvestment: 193050,
        },
        financials: {
          revenue: 450000000000,
          profit: 35000000000,
          eps: 25.8,
          peRatio: 6.4,
          roe: 28.5,
        },
        leadManagers: ['SBI Capital Markets', 'IDBI Capital'],
        registrar: 'Link Intime India',
        reviews: [
          { source: 'Chittorgarh', rating: 'APPLY', reason: 'PSU with strong fundamentals' },
          { source: 'Moneycontrol', rating: 'APPLY' },
          { source: 'Economic Times', rating: 'MAY_APPLY' },
        ],
      },
      {
        id: '4',
        name: 'Wakefit Innovations',
        symbol: 'WAKEFIT',
        exchange: 'NSE',
        issueSize: 60000000000,
        freshIssue: 40000000000,
        offerForSale: 20000000000,
        priceRange: { min: 320, max: 340 },
        lotSize: 44,
        openDate: new Date('2024-12-08'),
        closeDate: new Date('2024-12-10'),
        listingDate: new Date('2024-12-13'),
        status: 'LISTED',
        gmp: {
          gmp: 0,
          gmpPercent: 0,
          estimatedListing: 340,
          lastUpdated: new Date('2024-12-13'),
          subject: 'Listed',
        },
        companyInfo: {
          industry: 'Home Furnishing & Furniture',
          faceValue: 10,
          marketLot: 44,
          minInvestment: 14960,
          maxInvestment: 194480,
        },
        financials: {
          revenue: 120000000000,
          profit: 3500000000,
          eps: 8.5,
          peRatio: 40.0,
          roe: 18.2,
        },
        leadManagers: ['Kotak Mahindra Capital', 'ICICI Securities'],
        registrar: 'KFin Technologies',
        reviews: [
          { source: 'Chittorgarh', rating: 'MAY_APPLY', reason: 'High valuation' },
          { source: 'IPO Watch', rating: 'NEUTRAL' },
        ],
      },
      {
        id: '5',
        name: 'Meesho',
        symbol: 'MEESHO',
        exchange: 'BOTH',
        issueSize: 500000000000,
        freshIssue: 300000000000,
        offerForSale: 200000000000,
        priceRange: { min: 450, max: 475 },
        lotSize: 31,
        openDate: new Date('2024-12-03'),
        closeDate: new Date('2024-12-05'),
        listingDate: new Date('2024-12-09'),
        status: 'LISTED',
        gmp: {
          gmp: 0,
          gmpPercent: 0,
          estimatedListing: 475,
          lastUpdated: new Date('2024-12-09'),
          subject: 'Listed',
        },
        companyInfo: {
          industry: 'E-commerce',
          faceValue: 10,
          marketLot: 31,
          minInvestment: 14725,
          maxInvestment: 191425,
        },
        financials: {
          revenue: 750000000000,
          profit: -5000000000,
          eps: -12.5,
          roe: -8.5,
        },
        leadManagers: ['Morgan Stanley India', 'Goldman Sachs', 'Citigroup Global'],
        registrar: 'Link Intime India',
        reviews: [
          { source: 'Chittorgarh', rating: 'NEUTRAL', reason: 'Loss-making company' },
          { source: 'Moneycontrol', rating: 'AVOID' },
        ],
      },
    ];
  }
}

export const ipoService = new IPOService();
