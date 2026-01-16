import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

// Subtle floating orb
const FloatingOrb = ({ delay, size, color }: { delay: number; size: number; color: string }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -40,
            duration: 4000,
            delay: delay,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.12,
            duration: 2000,
            delay: delay,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.04,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        transform: [{ translateY }],
        opacity,
        left: Math.random() * width,
        top: Math.random() * height * 0.7,
      }}
    />
  );
};

export default function RegisterScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const register = useAuthStore((state) => state.register);

  // Subtle animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const strengthBarWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Calculate password strength
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 10) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) strength += 25;
    
    setPasswordStrength(strength);
    Animated.timing(strengthBarWidth, {
      toValue: strength,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [password]);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, displayName || undefined);
      Alert.alert(
        'Welcome!',
        'Your account has been created successfully.',
        [
          {
            text: 'Start Trading',
            onPress: () => router.replace('/(tabs)/watchlist'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return '#F44336';
    if (passwordStrength <= 50) return '#FF9800';
    if (passwordStrength <= 75) return '#FFC107';
    return '#4CAF50';
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 25) return 'Weak';
    if (passwordStrength <= 50) return 'Fair';
    if (passwordStrength <= 75) return 'Good';
    return 'Strong';
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={createStyles(theme).container}
    >
      <LinearGradient
        colors={isDark ? ['#1A237E', '#0D47A1', '#000000'] : ['#BBDEFB', '#90CAF9', '#FFFFFF']}
        style={createStyles(theme).gradient}
      >
        {/* Subtle floating orbs */}
        {Array.from({ length: 7 }).map((_, i) => (
          <FloatingOrb
            key={i}
            delay={i * 500}
            size={90 + Math.random() * 140}
            color={isDark ? 'rgba(66, 165, 245, 0.08)' : 'rgba(30, 136, 229, 0.06)'}
          />
        ))}

        <ScrollView
          contentContainerStyle={createStyles(theme).scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              createStyles(theme).content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Logo */}
            <View style={createStyles(theme).logoContainer}>
              <Image
                source={require('../../assets/images/Wealth.png')}
                style={createStyles(theme).logo}
                resizeMode="contain"
              />
            </View>

            <Text style={createStyles(theme).title}>Create Account</Text>
            <Text style={createStyles(theme).subtitle}>Start your trading journey today</Text>

            {/* Card with solid background */}
            <View style={createStyles(theme).card}>
              <View style={createStyles(theme).form}>
                {/* Name input */}
                <View style={[
                  createStyles(theme).inputContainer,
                  nameFocused && createStyles(theme).inputContainerFocused
                ]}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={nameFocused ? theme.primary : theme.textSecondary}
                    style={createStyles(theme).inputIcon}
                  />
                  <TextInput
                    style={createStyles(theme).input}
                    placeholder="Full Name (Optional)"
                    placeholderTextColor={theme.textMuted}
                    value={displayName}
                    onChangeText={setDisplayName}
                    autoCapitalize="words"
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                  />
                </View>

                {/* Email input */}
                <View style={[
                  createStyles(theme).inputContainer,
                  emailFocused && createStyles(theme).inputContainerFocused
                ]}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={emailFocused ? theme.primary : theme.textSecondary}
                    style={createStyles(theme).inputIcon}
                  />
                  <TextInput
                    style={createStyles(theme).input}
                    placeholder="Email"
                    placeholderTextColor={theme.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                </View>

                {/* Password input with strength indicator */}
                <View>
                  <View style={[
                    createStyles(theme).inputContainer,
                    passwordFocused && createStyles(theme).inputContainerFocused
                  ]}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={passwordFocused ? theme.primary : theme.textSecondary}
                      style={createStyles(theme).inputIcon}
                    />
                    <TextInput
                      style={createStyles(theme).input}
                      placeholder="Password"
                      placeholderTextColor={theme.textMuted}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={createStyles(theme).eyeIcon}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={theme.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Password strength bar */}
                  {password.length > 0 && (
                    <View style={createStyles(theme).strengthContainer}>
                      <View style={createStyles(theme).strengthBar}>
                        <Animated.View
                          style={[
                            createStyles(theme).strengthBarFill,
                            {
                              width: strengthBarWidth.interpolate({
                                inputRange: [0, 100],
                                outputRange: ['0%', '100%'],
                              }),
                              backgroundColor: getStrengthColor(),
                            },
                          ]}
                        />
                      </View>
                      <Text style={[createStyles(theme).strengthText, { color: getStrengthColor() }]}>
                        {getStrengthText()}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Confirm password input */}
                <View style={[
                  createStyles(theme).inputContainer,
                  confirmPasswordFocused && createStyles(theme).inputContainerFocused
                ]}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color={confirmPasswordFocused ? theme.primary : theme.textSecondary}
                    style={createStyles(theme).inputIcon}
                  />
                  <TextInput
                    style={createStyles(theme).input}
                    placeholder="Confirm Password"
                    placeholderTextColor={theme.textMuted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    onFocus={() => setConfirmPasswordFocused(true)}
                    onBlur={() => setConfirmPasswordFocused(false)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={createStyles(theme).eyeIcon}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={theme.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                {/* Register button */}
                <TouchableOpacity
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.9}
                  style={{ marginTop: 8 }}
                >
                  <LinearGradient
                    colors={isDark ? ['#42A5F5', '#1E88E5'] : ['#1E88E5', '#1565C0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={createStyles(theme).button}
                  >
                    <Text style={createStyles(theme).buttonText}>
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </Text>
                    {!loading && <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Terms */}
                <Text style={createStyles(theme).termsText}>
                  By creating an account, you agree to our{' '}
                  <Text style={createStyles(theme).termsLink}>Terms</Text>
                  {' '}and{' '}
                  <Text style={createStyles(theme).termsLink}>Privacy Policy</Text>
                </Text>

                {/* Login link */}
                <TouchableOpacity
                  style={createStyles(theme).linkButton}
                  onPress={() => router.push('/(auth)/login')}
                >
                  <Text style={createStyles(theme).linkText}>
                    Already have an account?{' '}
                    <Text style={createStyles(theme).linkTextBold}>Sign In</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: Platform.OS === 'ios' ? 60 : 40,
  },
  content: {
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignSelf: 'center',
    marginBottom: 34,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 13,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
    fontWeight: '400',
  },
  card: {
    borderRadius: 24,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  form: {
    padding: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputContainerFocused: {
    borderColor: theme.primary,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  inputIcon: {
    marginLeft: 14,
  },
  input: {
    flex: 1,
    padding: 14,
    color: theme.text,
    fontSize: 15,
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 14,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  strengthBar: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  strengthText: {
    fontSize: 11,
    fontWeight: '700',
    width: 50,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    ...Platform.select({
      ios: {
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  termsText: {
    textAlign: 'center',
    color: theme.textMuted,
    fontSize: 11,
    marginTop: 18,
    marginBottom: 18,
    lineHeight: 16,
  },
  termsLink: {
    color: theme.primary,
    fontWeight: '600',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 18,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    color: theme.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  linkTextBold: {
    color: theme.primary,
    fontWeight: '700',
  },
});
