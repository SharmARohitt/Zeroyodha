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
        top: Math.random() * height * 0.6,
      }}
    />
  );
};

export default function LoginScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const login = useAuthStore((state) => state.login);

  // Subtle animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)/watchlist');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={createStyles(theme).container}
    >
      <LinearGradient
        colors={isDark ? ['#0A1929', '#1A237E', '#000000'] : ['#E3F2FD', '#BBDEFB', '#FFFFFF']}
        style={createStyles(theme).gradient}
      >
        {/* Subtle floating orbs */}
        {Array.from({ length: 6 }).map((_, i) => (
          <FloatingOrb
            key={i}
            delay={i * 600}
            size={100 + Math.random() * 150}
            color={isDark ? 'rgba(66, 165, 245, 0.08)' : 'rgba(30, 136, 229, 0.06)'}
          />
        ))}

        <Animated.View
          style={[
            createStyles(theme).content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Logo - stable and professional */}
          <View style={createStyles(theme).logoContainer}>
            <Image
              source={require('../../assets/images/Wealth.png')}
              style={createStyles(theme).logo}
              resizeMode="contain"
            />
          </View>

          <Text style={createStyles(theme).title}>Welcome Back</Text>
          <Text style={createStyles(theme).subtitle}>Sign in to continue trading</Text>

          {/* Card with solid background */}
          <View style={createStyles(theme).card}>
            <View style={createStyles(theme).form}>
              {/* Email input */}
              <View style={createStyles(theme).inputWrapper}>
                <Text style={createStyles(theme).inputLabel}>Email</Text>
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
              </View>

              {/* Password input */}
              <View style={createStyles(theme).inputWrapper}>
                <Text style={createStyles(theme).inputLabel}>Password</Text>
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
              </View>

              {/* Login button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={isDark ? ['#42A5F5', '#1E88E5'] : ['#1E88E5', '#1565C0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={createStyles(theme).button}
                >
                  <Text style={createStyles(theme).buttonText}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Text>
                  {!loading && <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={createStyles(theme).divider}>
                <View style={createStyles(theme).dividerLine} />
                <Text style={createStyles(theme).dividerText}>or</Text>
                <View style={createStyles(theme).dividerLine} />
              </View>

              {/* Social login - Google only */}
              <View style={createStyles(theme).socialContainer}>
                <TouchableOpacity style={createStyles(theme).socialButton}>
                  <Ionicons name="logo-google" size={20} color={theme.text} />
                </TouchableOpacity>
              </View>

              {/* Register link */}
              <TouchableOpacity
                style={createStyles(theme).linkButton}
                onPress={() => router.push('/(auth)/register')}
              >
                <Text style={createStyles(theme).linkText}>
                  Don't have an account?{' '}
                  <Text style={createStyles(theme).linkTextBold}>Create one</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  logoContainer: {
    alignSelf: 'center',
    marginBottom: 24,
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
    gap: 16,
  },
  inputWrapper: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.border,
  },
  inputContainerFocused: {
    borderColor: theme.primary,
    backgroundColor: theme.background,
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    color: theme.text,
    fontSize: 14,
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 12,
  },
  buttonWrapper: {
    marginTop: 6,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 12,
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
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.border,
  },
  dividerText: {
    marginHorizontal: 12,
    color: theme.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
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
