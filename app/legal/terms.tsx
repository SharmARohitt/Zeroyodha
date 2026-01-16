import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function TermsOfServiceScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const styles = createStyles(theme);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Terms of Service</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.lastUpdated, { color: theme.textMuted }]}>
          Last Updated: January 16, 2026
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>1. Acceptance of Terms</Text>
        <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
          By accessing and using this trading application, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our services.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>2. Trading Risks</Text>
        <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
          Trading stocks, derivatives, and other financial instruments involves substantial risk of loss. You should carefully consider whether trading is suitable for you in light of your circumstances, knowledge, and financial resources.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>3. Account Registration</Text>
        <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
          You must register for an account to use certain features of our service. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>4. User Responsibilities</Text>
        <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
          You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>5. Paper Trading Mode</Text>
        <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
          Our paper trading feature is for educational and practice purposes only. It uses simulated funds and does not involve real money or actual market transactions.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>6. Market Data</Text>
        <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
          Market data provided through our service may be delayed and is for informational purposes only. We do not guarantee the accuracy, completeness, or timeliness of any market data.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>7. Prohibited Activities</Text>
        <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
          You agree not to use our service for any unlawful purpose, to manipulate markets, to engage in fraudulent activities, or to violate any applicable laws or regulations.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>8. Limitation of Liability</Text>
        <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
          We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>9. Termination</Text>
        <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
          We reserve the right to terminate or suspend your account and access to our services at our sole discretion, without notice, for conduct that we believe violates these terms or is harmful to other users.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>10. Changes to Terms</Text>
        <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
          We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new terms on this page.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>11. Contact Information</Text>
        <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
          For questions about these terms, please contact us at legal@tradingapp.com
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
  lastUpdated: {
    fontSize: 12,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
});
