import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const onboardingSlides = [
  {
    title: 'Welcome to',
    appName: 'Wealth Warrior',
    description: 'Your ultimate financial companion. Master the art of investing with our comprehensive platform designed for both beginners and experienced traders.',
    icon: 'wallet',
    secondaryIcon: 'trending-up',
    tertiaryIcon: 'cash',
    quaternaryIcon: 'stats-chart',
    gradient: ['#2D1B69', '#1A0F3D', '#0A0520'],
    iconColor: '#4A3A8C',
    accentColor: '#7B68EE',
  },
  {
    title: 'Practice Risk-Free',
    description: 'Master trading strategies with paper trading before investing real money. Build confidence without financial risk.',
    icon: 'school',
    secondaryIcon: 'shield-checkmark',
    tertiaryIcon: 'bulb',
    quaternaryIcon: 'trophy',
    gradient: ['#1B4D3E', '#0F2922', '#051510'],
    iconColor: '#2D6A4F',
    accentColor: '#52B788',
  },
  {
    title: 'Real-Time Market Data',
    description: 'Live prices from NSE & BSE. Stay informed with instant market updates and real-time analytics.',
    icon: 'pulse',
    secondaryIcon: 'analytics',
    tertiaryIcon: 'speedometer',
    quaternaryIcon: 'flash',
    gradient: ['#4D1B1B', '#290F0F', '#150505'],
    iconColor: '#6A2D2D',
    accentColor: '#E76F51',
  },
  {
    title: 'Professional Tools',
    description: 'Advanced charts, indicators, and analytics to make informed decisions like a pro trader.',
    icon: 'bar-chart',
    secondaryIcon: 'pie-chart',
    tertiaryIcon: 'calculator',
    quaternaryIcon: 'telescope',
    gradient: ['#1B3A4D', '#0F1F29', '#050F15'],
    iconColor: '#2D5A6A',
    accentColor: '#4A90E2',
  },
  {
    title: 'Start Your Journey',
    description: 'Join thousands of traders building their financial future with confidence and smart strategies.',
    icon: 'rocket',
    secondaryIcon: 'star',
    tertiaryIcon: 'diamond',
    quaternaryIcon: 'flame',
    gradient: ['#4D3A1B', '#291F0F', '#150F05'],
    iconColor: '#6A5A2D',
    accentColor: '#F4A261',
  },
];



export default function OnboardingScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Subtle animations
  const contentTranslateY = useRef(new Animated.Value(30)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Smooth entrance animations
    Animated.parallel([
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        tension: 40,
        friction: 8,
        delay: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < onboardingSlides.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({ x: nextIndex * width, animated: true });
      setCurrentIndex(nextIndex);
      
      // Reset animations for new slide
      contentTranslateY.setValue(30);
      contentOpacity.setValue(0);
      iconScale.setValue(0.8);
      
      Animated.parallel([
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(iconScale, {
          toValue: 1,
          tension: 40,
          friction: 8,
          delay: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      router.replace('/(auth)/register');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/register');
  };

  return (
    <LinearGradient
      colors={['#2D1B69', '#1A0F3D', '#0A0520']}
      style={createStyles(theme).container}
    >
      {/* Header with logo */}
      <View style={createStyles(theme).header}>
        <Image
          source={require('../../assets/images/Wealth.png')}
          style={createStyles(theme).headerLogo}
          resizeMode="contain"
        />
      </View>

      <TouchableOpacity style={createStyles(theme).skipButton} onPress={handleSkip}>
        <View style={createStyles(theme).skipBlur}>
          <Text style={createStyles(theme).skipText}>Skip</Text>
        </View>
      </TouchableOpacity>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      >
        {onboardingSlides.map((slide, index) => (
          <LinearGradient
            key={index}
            colors={slide.gradient as [string, string, string]}
            style={[createStyles(theme).slide, { width }]}
          >
            <Animated.View
              style={[
                createStyles(theme).content,
                {
                  opacity: contentOpacity,
                  transform: [{ translateY: contentTranslateY }],
                },
              ]}
            >
              {/* Central icon with icons on rings - only central icon, no floating icons */}
              <View style={createStyles(theme).iconOrbitContainer}>
                {/* Dashed orbit circles */}
                <View style={[createStyles(theme).orbitCircle1, { borderColor: `${slide.accentColor}40` }]} />
                <View style={[createStyles(theme).orbitCircle2, { borderColor: `${slide.accentColor}30` }]} />
                
                {/* Central icon only */}
                <View style={[createStyles(theme).centralIcon, { borderColor: slide.accentColor }]}>
                  <LinearGradient
                    colors={[slide.iconColor, slide.gradient[0]]}
                    style={createStyles(theme).centralIconGradient}
                  >
                    <Ionicons name={slide.icon as any} size={48} color="#FFFFFF" />
                  </LinearGradient>
                </View>
              </View>

              {/* Title */}
              <View style={createStyles(theme).titleContainer}>
                <Text style={createStyles(theme).title}>{slide.title}</Text>
                {slide.appName && (
                  <View style={createStyles(theme).appNameContainer}>
                    <LinearGradient
                      colors={[slide.accentColor, `${slide.accentColor}DD`]}
                      style={createStyles(theme).appNameGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={createStyles(theme).appName}>{slide.appName}</Text>
                    </LinearGradient>
                  </View>
                )}
              </View>

              {/* Description */}
              <Text style={createStyles(theme).description}>{slide.description}</Text>
            </Animated.View>
          </LinearGradient>
        ))}
      </ScrollView>

      {/* Footer with progress and button */}
      <View style={createStyles(theme).footer}>
        {/* Progress indicator */}
        <View style={createStyles(theme).progressContainer}>
          <View style={createStyles(theme).progressBar}>
            <View style={[
              createStyles(theme).progressFill, 
              { 
                width: `${((currentIndex + 1) / onboardingSlides.length) * 100}%`,
                backgroundColor: onboardingSlides[currentIndex]?.accentColor || '#7B68EE'
              }
            ]} />
          </View>
          <Text style={createStyles(theme).progressText}>
            {currentIndex + 1} of {onboardingSlides.length}
          </Text>
        </View>

        {/* Pagination dots */}
        <View style={createStyles(theme).dots}>
          {onboardingSlides.map((_, index) => (
            <View
              key={index}
              style={[
                createStyles(theme).dot,
                index === currentIndex && createStyles(theme).activeDot,
              ]}
            />
          ))}
        </View>

        {/* Continue button */}
        <TouchableOpacity
          style={createStyles(theme).nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[
              onboardingSlides[currentIndex]?.accentColor || '#7B68EE',
              `${onboardingSlides[currentIndex]?.accentColor || '#7B68EE'}DD`
            ]}
            style={createStyles(theme).nextButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={createStyles(theme).nextButtonText}>
              {currentIndex === onboardingSlides.length - 1 ? 'Get Started' : 'Continue'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 80,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerLogo: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginTop: Platform.OS === 'ios' ? 40 : 20,
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    right: 20,
    zIndex: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  skipBlur: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  content: {
    alignItems: 'center',
    maxWidth: 380,
    paddingTop: 80,
  },
  iconOrbitContainer: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  orbitCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  orbitCircle2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  centralIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 3,
  },
  centralIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  appNameContainer: {
    marginTop: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },
  appNameGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  appName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '400',
    paddingHorizontal: 16,
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: Platform.OS === 'ios' ? 50 : 40,
    paddingTop: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    width: 10,
  },
  nextButton: {
    borderRadius: 28,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#7B68EE',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  nextButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

