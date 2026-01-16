import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const styles = createStyles(theme);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.lastUpdated, { color: theme.textMuted }]}>
          Last Updated: January 16, 2026
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>1. Information We Collect</Text>
        <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
          We collect information you provide directly to us, including your name, email address, phone number, and trading preferences. We also collect information about your device, including IP address, device type, and operating system.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>2. How We Use Your Information</Text>
        <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
          We use the information we collect to provide, maintain, and improve our services, to process your transactions, to send you technical notices and support messages, and to communicate with you about products, services, and events.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>3. Information Sharing</Text>
        <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
          We do not share your personal information with third parties except as described in this policy. We may share information with service providers who perform services on our behalf, with your consent, or as required by law.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>4. Data Security</Text>
        <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
          We take reasonable measures to protect your information from unauthorized access, use, or disclosure. However, no internet or email transmission is ever fully secure or error-free.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>5. Your Rights</Text>
        <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
          You have the right to access, update, or delete your personal information. You may also have the right to restrict or object to certain processing of your information.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>6. Cookies and Tracking</Text>
        <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
          We use cookies and similar tracking technologies to collect information about your browsing activities and to personalize your experience.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>7. Children's Privacy</Text>
        <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
          Our services are not intended for children under 18 years of age. We do not knowingly collect personal information from children.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>8. Changes to This Policy</Text>
        <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
          We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>9. Contact Us</Text>
        <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
          If you have any questions about this privacy policy, please contact us at privacy@tradingapp.com
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
