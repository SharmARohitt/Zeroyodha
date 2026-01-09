import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IPO } from '../../src/types';
import { format } from 'date-fns';
import { newsService, NewsArticle } from '../../src/services/newsService';

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
  const [activeTab, setActiveTab] = useState<'IPOS' | 'GSEC' | 'NEWS'>('IPOS');
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'NEWS') {
      loadNews();
    }
  }, [activeTab]);

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
      </View>

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
          renderItem={({ item }) => <IPOCard ipo={item} />}
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

function IPOCard({ ipo }: { ipo: IPO }) {
  const statusColors: Record<string, string> = {
    UPCOMING: '#FFC107',
    OPEN: '#00C853',
    CLOSED: '#999',
    LISTED: '#2962FF',
  };

  return (
    <View style={styles.ipoCard}>
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
          <TouchableOpacity style={styles.bidButton}>
            <Text style={styles.bidButtonText}>Place Bid</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#0A0A0A',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0A0A0A',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#2962FF',
  },
  tabText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#2962FF',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  ipoCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  ipoSymbol: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  ipoDetails: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
  },
  ipoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ipoLabel: {
    fontSize: 14,
    color: '#999',
  },
  ipoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bidButton: {
    backgroundColor: '#2962FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  bidButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  newsContainer: {
    padding: 16,
  },
  newsCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  newsSource: {
    fontSize: 12,
    color: '#2962FF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  newsDate: {
    fontSize: 12,
    color: '#666',
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    color: '#2962FF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
});

