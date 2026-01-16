import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function AboutScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const styles = createStyles(theme);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>About</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoSection}>
          <View style={[styles.appIcon, { backgroundColor: theme.primary }]}>
            <Ionicons name="trending-up" size={48} color="#FFFFFF" />
          </View>
          <Text style={[styles.appName, { color: theme.text }]}>Trading App</Text>
          <Text style={[styles.version, { color: theme.textMuted }]}>Version 1.0.0</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>About Our App</Text>
        <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
          Welcome to Trading App, your comprehensive platform for stock market trading and investment. We provide real-time market data, advanced charting tools, and seamless trading experiences for both beginners and experienced traders.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Features</Text>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color={theme.success} />
          <Text style={[styles.featureText, { color: theme.textSecondary }]}>
            Real-time market data and quotes
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color={theme.success} />
          <Text style={[styles.featureText, { color: theme.textSecondary }]}>
            Interactive candlestick charts with zoom and pan
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color={theme.success} />
          <Text style={[styles.featureText, { color: theme.textSecondary }]}>
            Paper trading mode for practice
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color={theme.success} />
          <Text style={[styles.featureText, { color: theme.textSecondary }]}>
            Multiple watchlists and portfolio tracking
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color={theme.success} />
          <Text style={[styles.featureText, { color: theme.textSecondary }]}>
            Advanced order types (Market, Limit, Stop-Loss)
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color={theme.success} />
          <Text style={[styles.featureText, { color: theme.textSecondary }]}>
            IPO bidding and tracking
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color={theme.success} />
          <Text style={[styles.featureText, { color: theme.textSecondary }]}>
            Price alerts and notifications
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Our Mission</Text>
        <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
          Our mission is to democratize trading by providing powerful tools and insights that were once available only to professional traders. We believe everyone should have access to the financial markets with confidence and knowledge.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Contact Us</Text>
        <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
          Email: support@tradingapp.com{'\n'}
          Website: www.tradingapp.com{'\n'}
          Phone: +91 1800-123-4567
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Disclaimer</Text>
        <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
          Trading in financial markets involves substantial risk of loss. Past performance is not indicative of future results. This app is for informational and educational purposes only and should not be considered as financial advice.
        </Text>

        <Text style={[styles.copyright, { color: theme.textMuted }]}>
          © 2026 Trading App. All rights reserved.
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 55 : 45,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  logoSection: {
    alignItems: 'center',
    marginVertical: 32,
  },
  appIcon: {
    width: 96,
    height: 96,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  copyright: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 32,
  },
});
