import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Image,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IPO } from '../../src/types';
import { format } from 'date-fns';
import { newsService, NewsArticle } from '../../src/services/newsService';
import { ipoService } from '../../src/services/ipoService';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useRouter } from 'expo-router';
import TopIndicesCarousel from '../../src/components/TopIndicesCarousel';
import { useTheme } from '../../src/contexts/ThemeContext';
import FloatingTradeButton from '../../src/components/FloatingTradeButton';

// Remove mock IPO data - now using live data from ipoService

export default function BidsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'IPOS' | 'GSEC' | 'MUTUAL_FUNDS' | 'NEWS'>('IPOS');
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [ipos, setIpos] = useState<IPO[]>([]);
  const [iposLoading, setIposLoading] = useState(false);
  const { user } = useAuthStore();
  const logoScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (activeTab === 'NEWS') {
      loadNews();
    } else if (activeTab === 'IPOS') {
      loadIPOs();
    }
  }, [activeTab]);

  useEffect(() => {
    // Load IPOs on mount
    loadIPOs();
    
    // iOS-specific logo animation
    if (Platform.OS === 'ios') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(logoScale, {
            toValue: 1.05,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(logoScale, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, []);

  const loadIPOs = async () => {
    setIposLoading(true);
    try {
      const ipoData = await ipoService.getIPODashboard();
      setIpos(ipoData);
    } catch (error) {
      console.error('Error loading IPOs:', error);
    } finally {
      setIposLoading(false);
    }
  };

  const loadNews = async () => {
    setNewsLoading(true);
    try {
      const indiaNews = await newsService.getIndiaMarketNews();
      setNews(indiaNews);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setNewsLoading(false);
    }
  };

  const handleIPOPress = (ipo: IPO) => {
    // Navigate to IPO bid placement screen
    router.push({
      pathname: '/ipo-bid',
      params: { 
        ipoId: ipo.id,
        ipoName: ipo.name,
        symbol: ipo.symbol,
      },
    });
  };

  // Get user's first name for greeting
  const getUserName = () => {
    if (user?.displayName) {
      return user.displayName.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <View style={createStyles(theme).container}>
      <View style={createStyles(theme).header}>
        <View style={createStyles(theme).headerLeft}>
          <Animated.View style={{ transform: [{ scale: logoScale }] }}>
            <Image
              source={require('../../assets/images/Wealth.png')}
              style={createStyles(theme).logo}
              resizeMode="contain"
            />
          </Animated.View>
          <Text style={createStyles(theme).title}>Hey {getUserName()}!</Text>
        </View>
        <TouchableOpacity style={createStyles(theme).headerButton}>
          <Ionicons name="notifications-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Top Indices Carousel */}
      <TopIndicesCarousel />

      <View style={createStyles(theme).tabs}>
        <TouchableOpacity
          style={[createStyles(theme).tab, activeTab === 'IPOS' && createStyles(theme).activeTab]}
          onPress={() => setActiveTab('IPOS')}
        >
          <Text
            style={[
              createStyles(theme).tabText,
              activeTab === 'IPOS' && createStyles(theme).activeTabText,
            ]}
          >
            IPOs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[createStyles(theme).tab, activeTab === 'GSEC' && createStyles(theme).activeTab]}
          onPress={() => setActiveTab('GSEC')}
        >
          <Text
            style={[
              createStyles(theme).tabText,
              activeTab === 'GSEC' && createStyles(theme).activeTabText,
            ]}
          >
            G-Secs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[createStyles(theme).tab, activeTab === 'MUTUAL_FUNDS' && createStyles(theme).activeTab]}
          onPress={() => setActiveTab('MUTUAL_FUNDS')}
        >
          <Text
            style={[
              createStyles(theme).tabText,
              activeTab === 'MUTUAL_FUNDS' && createStyles(theme).activeTabText,
            ]}
          >
            Mutual Funds
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[createStyles(theme).tab, activeTab === 'NEWS' && createStyles(theme).activeTab]}
          onPress={() => setActiveTab('NEWS')}
        >
          <Text
            style={[
              createStyles(theme).tabText,
              activeTab === 'NEWS' && createStyles(theme).activeTabText,
            ]}
          >
            News
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'IPOS' && (
        <FlatList
          data={ipos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <IPOCard ipo={item} onPress={() => handleIPOPress(item)} theme={theme} />}
          contentContainerStyle={createStyles(theme).listContent}
          refreshControl={
            <RefreshControl
              refreshing={iposLoading}
              onRefresh={loadIPOs}
              tintColor={theme.primary}
            />
          }
          ListEmptyComponent={
            <View style={createStyles(theme).emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color={theme.textMuted} />
              <Text style={createStyles(theme).emptyText}>No IPOs available</Text>
              <Text style={createStyles(theme).emptySubtext}>Check back later for new offerings</Text>
            </View>
          }
        />
      )}

      {activeTab === 'GSEC' && (
        <View style={createStyles(theme).emptyContainer}>
          <Ionicons name="trending-up-outline" size={64} color={theme.textMuted} />
          <Text style={createStyles(theme).emptyText}>Government Securities</Text>
          <Text style={createStyles(theme).emptySubtext}>Coming soon in paper trading mode</Text>
        </View>
      )}

      {activeTab === 'MUTUAL_FUNDS' && (
        <View style={createStyles(theme).emptyContainer}>
          <Ionicons name="pie-chart-outline" size={64} color={theme.textMuted} />
          <Text style={createStyles(theme).emptyText}>Mutual Funds</Text>
          <Text style={createStyles(theme).emptySubtext}>SIP and lump sum investments</Text>
        </View>
      )}

      {activeTab === 'NEWS' && (
        <ScrollView
          contentContainerStyle={createStyles(theme).newsContainer}
          refreshControl={
            <RefreshControl
              refreshing={newsLoading}
              onRefresh={loadNews}
              tintColor={theme.primary}
            />
          }
        >
          {news.length === 0 && !newsLoading ? (
            <View style={createStyles(theme).emptyContainer}>
              <Ionicons name="newspaper-outline" size={64} color={theme.textMuted} />
              <Text style={createStyles(theme).emptyText}>No news available</Text>
            </View>
          ) : (
            news.map((article) => (
              <View key={article.id} style={createStyles(theme).newsCard}>
                <View style={createStyles(theme).newsHeader}>
                  <Text style={createStyles(theme).newsSource}>{article.source}</Text>
                  <Text style={createStyles(theme).newsDate}>
                    {format(new Date(article.datetime), 'dd MMM, yyyy')}
                  </Text>
                </View>
                <Text style={createStyles(theme).newsTitle}>{article.headline}</Text>
                {article.summary && (
                  <Text style={createStyles(theme).newsContent} numberOfLines={4}>
                    {article.summary}
                  </Text>
                )}
                {article.url && article.url !== '#' && (
                  <TouchableOpacity
                    style={createStyles(theme).readMoreButton}
                    onPress={() => {
                      // Handle news URL opening
                      console.log('Open news:', article.url);
                    }}
                  >
                    <Text style={createStyles(theme).readMoreText}>Read More</Text>
                    <Ionicons name="arrow-forward" size={16} color={theme.primary} />
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
      
      <FloatingTradeButton />
    </View>
  );
}

function IPOCard({ ipo, onPress, theme }: { ipo: IPO; onPress: () => void; theme: any }) {
  const statusColors: Record<string, string> = {
    UPCOMING: theme.warning,
    OPEN: theme.success,
    CLOSED: theme.textMuted,
    ALLOTTED: theme.primary,
    LISTED: theme.primary,
  };

  return (
    <TouchableOpacity 
      style={createStyles(theme).ipoCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={createStyles(theme).ipoHeader}>
        <View style={{ flex: 1 }}>
          <Text style={createStyles(theme).ipoName}>{ipo.name}</Text>
          <Text style={createStyles(theme).ipoSymbol}>
            {ipo.symbol} • {ipo.exchange} • {ipo.companyInfo.industry}
          </Text>
        </View>
        <View style={[createStyles(theme).statusBadge, { backgroundColor: statusColors[ipo.status] }]}>
          <Text style={createStyles(theme).statusText}>{ipo.status}</Text>
        </View>
      </View>

      <View style={createStyles(theme).ipoDetails}>
        <View style={createStyles(theme).ipoRow}>
          <Text style={createStyles(theme).ipoLabel}>Price Range:</Text>
          <Text style={createStyles(theme).ipoValue}>
            ₹{ipo.priceRange.min} - ₹{ipo.priceRange.max}
          </Text>
        </View>
        <View style={createStyles(theme).ipoRow}>
          <Text style={createStyles(theme).ipoLabel}>Issue Size:</Text>
          <Text style={createStyles(theme).ipoValue}>
            ₹{(ipo.issueSize / 10000000).toFixed(0)} Cr
          </Text>
        </View>
        <View style={createStyles(theme).ipoRow}>
          <Text style={createStyles(theme).ipoLabel}>Lot Size:</Text>
          <Text style={createStyles(theme).ipoValue}>
            {ipo.lotSize} shares (₹{ipo.companyInfo.minInvestment.toLocaleString('en-IN')})
          </Text>
        </View>
        <View style={createStyles(theme).ipoRow}>
          <Text style={createStyles(theme).ipoLabel}>Open - Close:</Text>
          <Text style={createStyles(theme).ipoValue}>
            {format(ipo.openDate, 'dd MMM')} - {format(ipo.closeDate, 'dd MMM yyyy')}
          </Text>
        </View>
        
        {/* GMP Data */}
        {ipo.gmp && ipo.gmp.gmp > 0 && (
          <View style={[createStyles(theme).gmpContainer, { backgroundColor: theme.success + '20' }]}>
            <View style={createStyles(theme).gmpRow}>
              <Text style={createStyles(theme).gmpLabel}>GMP:</Text>
              <Text style={[createStyles(theme).gmpValue, { color: theme.success }]}>
                ₹{ipo.gmp.gmp} ({ipo.gmp.gmpPercent.toFixed(2)}%)
              </Text>
            </View>
            <View style={createStyles(theme).gmpRow}>
              <Text style={createStyles(theme).gmpLabel}>Est. Listing:</Text>
              <Text style={[createStyles(theme).gmpValue, { color: theme.success }]}>
                ₹{ipo.gmp.estimatedListing}
              </Text>
            </View>
          </View>
        )}
        
        {/* Subscription Status */}
        {ipo.subscription && ipo.status === 'OPEN' && (
          <View style={createStyles(theme).subscriptionContainer}>
            <Text style={createStyles(theme).subscriptionTitle}>Live Subscription Status</Text>
            <View style={createStyles(theme).subscriptionGrid}>
              <View style={createStyles(theme).subscriptionItem}>
                <Text style={createStyles(theme).subscriptionLabel}>QIB</Text>
                <Text style={[createStyles(theme).subscriptionValue, { 
                  color: ipo.subscription.qib.timesSubscribed >= 1 ? theme.success : theme.warning 
                }]}>
                  {ipo.subscription.qib.timesSubscribed.toFixed(2)}x
                </Text>
              </View>
              <View style={createStyles(theme).subscriptionItem}>
                <Text style={createStyles(theme).subscriptionLabel}>NII</Text>
                <Text style={[createStyles(theme).subscriptionValue, { 
                  color: ipo.subscription.nii.timesSubscribed >= 1 ? theme.success : theme.warning 
                }]}>
                  {ipo.subscription.nii.timesSubscribed.toFixed(2)}x
                </Text>
              </View>
              <View style={createStyles(theme).subscriptionItem}>
                <Text style={createStyles(theme).subscriptionLabel}>Retail</Text>
                <Text style={[createStyles(theme).subscriptionValue, { 
                  color: ipo.subscription.retail.timesSubscribed >= 1 ? theme.success : theme.warning 
                }]}>
                  {ipo.subscription.retail.timesSubscribed.toFixed(2)}x
                </Text>
              </View>
              <View style={createStyles(theme).subscriptionItem}>
                <Text style={createStyles(theme).subscriptionLabel}>Total</Text>
                <Text style={[createStyles(theme).subscriptionValue, { 
                  color: ipo.subscription.total.timesSubscribed >= 1 ? theme.success : theme.warning 
                }]}>
                  {ipo.subscription.total.timesSubscribed.toFixed(2)}x
                </Text>
              </View>
            </View>
            <Text style={createStyles(theme).subscriptionUpdate}>
              Updated: {format(ipo.subscription.lastUpdated, 'dd MMM, hh:mm a')}
            </Text>
          </View>
        )}
        
        {/* Reviews */}
        {ipo.reviews && ipo.reviews.length > 0 && (
          <View style={createStyles(theme).reviewsContainer}>
            <Text style={createStyles(theme).reviewsTitle}>Expert Reviews</Text>
            <View style={createStyles(theme).reviewsGrid}>
              {ipo.reviews.map((review, index) => (
                <View key={index} style={createStyles(theme).reviewChip}>
                  <Text style={createStyles(theme).reviewSource}>{review.source}</Text>
                  <Text style={[
                    createStyles(theme).reviewRating,
                    { color: review.rating === 'APPLY' ? theme.success : 
                             review.rating === 'AVOID' ? theme.loss : theme.warning }
                  ]}>
                    {review.rating.replace('_', ' ')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {ipo.status === 'OPEN' && (
          <View style={createStyles(theme).bidButtonContainer}>
            <Ionicons name="arrow-forward-circle" size={24} color={theme.primary} />
            <Text style={createStyles(theme).bidButtonText}>Tap to Place Bid</Text>
          </View>
        )}
        
        {ipo.status === 'CLOSED' && ipo.allotment && (
          <View style={createStyles(theme).allotmentContainer}>
            <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
            <Text style={createStyles(theme).allotmentText}>
              Allotment: {ipo.allotment.status === 'FINALIZED' ? 'Finalized' : 'Pending'}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 55 : 45,
    paddingBottom: 12,
    backgroundColor: theme.surface,
    ...(Platform.OS === 'ios' && {
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    }),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: Platform.OS === 'ios' ? 56 : 52,
    height: Platform.OS === 'ios' ? 56 : 52,
    borderRadius: Platform.OS === 'ios' ? 14 : 12,
    ...(Platform.OS === 'ios' && {
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    }),
  },
  title: {
    fontSize: Platform.OS === 'ios' ? 24 : 22,
    fontWeight: Platform.OS === 'ios' ? '800' : 'bold',
    color: theme.text,
    ...(Platform.OS === 'ios' && {
      letterSpacing: 0.5,
      textShadowColor: theme.text + '1A',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    }),
  },
  headerButton: {
    padding: 6,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.card,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.primary,
  },
  tabText: {
    color: theme.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  activeTabText: {
    color: theme.primary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: theme.textMuted,
    fontSize: 14,
    marginTop: 8,
  },
  ipoCard: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  ipoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ipoName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 4,
  },
  ipoSymbol: {
    fontSize: 12,
    color: theme.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: theme.text,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  ipoDetails: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 12,
  },
  ipoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ipoLabel: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  ipoValue: {
    fontSize: 14,
    color: theme.text,
    fontWeight: '600',
  },
  bidButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  bidButtonText: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  gmpContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.success + '40',
  },
  gmpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  gmpLabel: {
    fontSize: 13,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  gmpValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  subscriptionContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: theme.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  subscriptionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  subscriptionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  subscriptionItem: {
    alignItems: 'center',
  },
  subscriptionLabel: {
    fontSize: 11,
    color: theme.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  subscriptionValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subscriptionUpdate: {
    fontSize: 10,
    color: theme.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  reviewsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  reviewsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  reviewsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reviewChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  reviewSource: {
    fontSize: 10,
    color: theme.textMuted,
    marginBottom: 2,
  },
  reviewRating: {
    fontSize: 11,
    fontWeight: '600',
  },
  allotmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  allotmentText: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '600',
  },
  newsContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  newsCard: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  newsSource: {
    fontSize: 12,
    color: theme.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  newsDate: {
    fontSize: 12,
    color: theme.textMuted,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 12,
    lineHeight: 24,
  },
  newsContent: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  readMoreText: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
});
