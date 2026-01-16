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
import { useAuthStore } from '../../src/store/useAuthStore';
import { useRouter } from 'expo-router';
import TopIndicesCarousel from '../../src/components/TopIndicesCarousel';

// Theme colors
const colors = {
  primary: '#00D4FF', // Blue Neon
  profit: '#00C853',
  loss: '#FF5252',
  warning: '#FFC107',
  background: '#000000',
  backgroundSecondary: '#0A0A0A',
  card: '#1A1A1A',
  border: '#2A2A2A',
  text: '#FFFFFF',
  textMuted: '#666666',
  textSecondary: '#999999',
};

// Mock IPO data
const mockIPOs: IPO[] = [
  {
    id: '1',
    name: 'TechCorp India',
    symbol: 'TECHCORP',
    exchange: 'NSE',
    issueSize: 5000000000,
    priceRange: { min: 100, max: 110 },
    openDate: new Date('2024-12-15'),
    closeDate: new Date('2024-12-17'),
    listingDate: new Date('2024-12-20'),
    status: 'UPCOMING',
  },
  {
    id: '2',
    name: 'GreenEnergy Ltd',
    symbol: 'GREEN',
    exchange: 'BSE',
    issueSize: 3000000000,
    priceRange: { min: 50, max: 55 },
    openDate: new Date('2024-12-10'),
    closeDate: new Date('2024-12-12'),
    listingDate: new Date('2024-12-15'),
    status: 'OPEN',
  },
];

export default function BidsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'IPOS' | 'GSEC' | 'MUTUAL_FUNDS' | 'NEWS'>('IPOS');
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const { user } = useAuthStore();
  const logoScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (activeTab === 'NEWS') {
      loadNews();
    }
  }, [activeTab]);

  useEffect(() => {
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
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Animated.View style={{ transform: [{ scale: logoScale }] }}>
            <Image
              source={require('../../assets/images/Wealth.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
          <Text style={styles.title}>Hey {getUserName()}!</Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Top Indices Carousel */}
      <TopIndicesCarousel />

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'IPOS' && styles.activeTab]}
          onPress={() => setActiveTab('IPOS')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'IPOS' && styles.activeTabText,
            ]}
          >
            IPOs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'GSEC' && styles.activeTab]}
          onPress={() => setActiveTab('GSEC')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'GSEC' && styles.activeTabText,
            ]}
          >
            G-Secs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'MUTUAL_FUNDS' && styles.activeTab]}
          onPress={() => setActiveTab('MUTUAL_FUNDS')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'MUTUAL_FUNDS' && styles.activeTabText,
            ]}
          >
            Mutual Funds
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'NEWS' && styles.activeTab]}
          onPress={() => setActiveTab('NEWS')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'NEWS' && styles.activeTabText,
            ]}
          >
            News
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'IPOS' && (
        <FlatList
          data={mockIPOs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <IPOCard ipo={item} onPress={() => handleIPOPress(item)} />}
          contentContainerStyle={styles.listContent}
        />
      )}

      {activeTab === 'GSEC' && (
        <View style={styles.emptyContainer}>
          <Ionicons name="trending-up-outline" size={64} color="#666" />
          <Text style={styles.emptyText}>Government Securities</Text>
          <Text style={styles.emptySubtext}>Coming soon in paper trading mode</Text>
        </View>
      )}

      {activeTab === 'MUTUAL_FUNDS' && (
        <View style={styles.emptyContainer}>
          <Ionicons name="pie-chart-outline" size={64} color="#666" />
          <Text style={styles.emptyText}>Mutual Funds</Text>
          <Text style={styles.emptySubtext}>SIP and lump sum investments</Text>
        </View>
      )}

      {activeTab === 'NEWS' && (
        <ScrollView
          contentContainerStyle={styles.newsContainer}
          refreshControl={
            <RefreshControl
              refreshing={newsLoading}
              onRefresh={loadNews}
              tintColor="#2962FF"
            />
          }
        >
          {news.length === 0 && !newsLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="newspaper-outline" size={64} color="#666" />
              <Text style={styles.emptyText}>No news available</Text>
            </View>
          ) : (
            news.map((article) => (
              <View key={article.id} style={styles.newsCard}>
                <View style={styles.newsHeader}>
                  <Text style={styles.newsSource}>{article.source}</Text>
                  <Text style={styles.newsDate}>
                    {format(new Date(article.datetime), 'dd MMM, yyyy')}
                  </Text>
                </View>
                <Text style={styles.newsTitle}>{article.headline}</Text>
                {article.summary && (
                  <Text style={styles.newsContent} numberOfLines={4}>
                    {article.summary}
                  </Text>
                )}
                {article.url && article.url !== '#' && (
                  <TouchableOpacity
                    style={styles.readMoreButton}
                    onPress={() => {
                      // Handle news URL opening
                      console.log('Open news:', article.url);
                    }}
                  >
                    <Text style={styles.readMoreText}>Read More</Text>
                    <Ionicons name="arrow-forward" size={16} color="#2962FF" />
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

function IPOCard({ ipo, onPress }: { ipo: IPO; onPress: () => void }) {
  const statusColors: Record<string, string> = {
    UPCOMING: '#FFC107',
    OPEN: '#00C853',
    CLOSED: '#999',
    LISTED: '#2962FF',
  };

  return (
    <TouchableOpacity 
      style={styles.ipoCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.ipoHeader}>
        <View>
          <Text style={styles.ipoName}>{ipo.name}</Text>
          <Text style={styles.ipoSymbol}>{ipo.symbol} • {ipo.exchange}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[ipo.status] }]}>
          <Text style={styles.statusText}>{ipo.status}</Text>
        </View>
      </View>

      <View style={styles.ipoDetails}>
        <View style={styles.ipoRow}>
          <Text style={styles.ipoLabel}>Price Range:</Text>
          <Text style={styles.ipoValue}>
            ₹{ipo.priceRange.min} - ₹{ipo.priceRange.max}
          </Text>
        </View>
        <View style={styles.ipoRow}>
          <Text style={styles.ipoLabel}>Issue Size:</Text>
          <Text style={styles.ipoValue}>
            ₹{(ipo.issueSize / 1000000000).toFixed(2)}B
          </Text>
        </View>
        <View style={styles.ipoRow}>
          <Text style={styles.ipoLabel}>Open Date:</Text>
          <Text style={styles.ipoValue}>
            {format(ipo.openDate, 'dd MMM yyyy')}
          </Text>
        </View>
        <View style={styles.ipoRow}>
          <Text style={styles.ipoLabel}>Close Date:</Text>
          <Text style={styles.ipoValue}>
            {format(ipo.closeDate, 'dd MMM yyyy')}
          </Text>
        </View>
        {ipo.status === 'OPEN' && (
          <View style={styles.bidButtonContainer}>
            <Ionicons name="arrow-forward-circle" size={24} color={colors.primary} />
            <Text style={styles.bidButtonText}>Tap to Place Bid</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 55 : 45,
    paddingBottom: 12,
    backgroundColor: colors.backgroundSecondary,
    ...(Platform.OS === 'ios' && {
      shadowColor: colors.primary,
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
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    }),
  },
  title: {
    fontSize: Platform.OS === 'ios' ? 24 : 22,
    fontWeight: Platform.OS === 'ios' ? '800' : 'bold',
    color: colors.text,
    ...(Platform.OS === 'ios' && {
      letterSpacing: 0.5,
      textShadowColor: 'rgba(255, 255, 255, 0.1)',
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
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.card,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.primary,
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
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 8,
  },
  ipoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.text,
    marginBottom: 4,
  },
  ipoSymbol: {
    fontSize: 12,
    color: colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  ipoDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  ipoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ipoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  ipoValue: {
    fontSize: 14,
    color: colors.text,
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
    borderTopColor: colors.border,
  },
  bidButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  newsContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  newsCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  newsSource: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  newsDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    lineHeight: 24,
  },
  newsContent: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    marginBottom: 12,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  readMoreText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
});

