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
import { useAuthStore } from '../../src/store/useAuthStore';

const { width } = Dimensions.get('window');

const onboardingSlides = [
  {
    title: 'Welcome to',
    appName: 'Wealth Warrior',
    description: 'Your ultimate financial companion. Master the art of investing with our comprehensive platform designed for both beginners and experienced traders.',
    icon: 'logo', // Special case - will use logo image
    gradient: ['#2D1B69', '#1A0F3D', '#0A0520'],
    iconColor: '#4A3A8C',
    accentColor: '#7B68EE',
    showLogo: true,
  },
  {
    title: 'Practice Risk-Free',
    description: 'Master trading strategies with paper trading before investing real money. Build confidence without financial risk.',
    icon: 'school',
    gradient: ['#1B4D3E', '#0F2922', '#051510'],
    iconColor: '#2D6A4F',
    accentColor: '#52B788',
    showLogo: false,
  },
  {
    title: 'Real-Time Market Data',
    description: 'Live prices from NSE & BSE. Stay informed with instant market updates and real-time analytics.',
    icon: 'pulse',
    gradient: ['#4D1B1B', '#290F0F', '#150505'],
    iconColor: '#6A2D2D',
    accentColor: '#E76F51',
    showLogo: false,
  },
  {
    title: 'Professional Tools',
    description: 'Advanced charts, indicators, and analytics to make informed decisions like a pro trader.',
    icon: 'bar-chart',
    gradient: ['#1B3A4D', '#0F1F29', '#050F15'],
    iconColor: '#2D5A6A',
    accentColor: '#4A90E2',
    showLogo: false,
  },
  {
    title: 'Start Your Journey',
    description: 'Join thousands of traders building their financial future with confidence and smart strategies.',
    icon: 'rocket',
    gradient: ['#4D3A1B', '#291F0F', '#150F05'],
    iconColor: '#6A5A2D',
    accentColor: '#F4A261',
    showLogo: false,
  },
];



export default function OnboardingScreen() {
  const router = useRouter();
  const { setHasSeenOnboarding } = useAuthStore();
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
      // Mark onboarding as seen before navigating
      setHasSeenOnboarding(true);
      router.replace('/(auth)/register');
    }
  };

  const handleSkip = () => {
    // Mark onboarding as seen before navigating
    setHasSeenOnboarding(true);
    router.replace('/(auth)/register');
  };

  return (
    <LinearGradient
      colors={['#2D1B69', '#1A0F3D', '#0A0520']}
      style={styles.container}
    >
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <View style={styles.skipBlur}>
          <Text style={styles.skipText}>Skip</Text>
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
            style={[styles.slide, { width }]}
          >
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: contentOpacity,
                  transform: [{ translateY: contentTranslateY }],
                },
              ]}
            >
              {/* Central icon with rings - only one icon in center */}
              <View style={styles.iconOrbitContainer}>
                {/* Dashed orbit circles */}
                <View style={[styles.orbitCircle1, { borderColor: `${slide.accentColor}40` }]} />
                <View style={[styles.orbitCircle2, { borderColor: `${slide.accentColor}30` }]} />
                
                {/* Central icon - use logo for first slide, icon for others */}
                <View style={[styles.centralIcon, { borderColor: slide.accentColor }]}>
                  {slide.icon === 'logo' ? (
                    <Image
                      source={require('../../assets/images/Wealth.png')}
                      style={styles.centralLogoImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <LinearGradient
                      colors={[slide.iconColor, slide.gradient[0]]}
                      style={styles.centralIconGradient}
                    >
                      <Ionicons name={slide.icon as any} size={48} color="#FFFFFF" />
                    </LinearGradient>
                  )}
                </View>
              </View>

              {/* Title */}
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{slide.title}</Text>
                {slide.appName && (
                  <View style={styles.appNameContainer}>
                    <LinearGradient
                      colors={[slide.accentColor, `${slide.accentColor}DD`]}
                      style={styles.appNameGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.appName}>{slide.appName}</Text>
                    </LinearGradient>
                  </View>
                )}
              </View>

              {/* Description */}
              <Text style={styles.description}>{slide.description}</Text>
            </Animated.View>
          </LinearGradient>
        ))}
      </ScrollView>

      {/* Footer with progress and button */}
      <View style={styles.footer}>
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill, 
              { 
                width: `${((currentIndex + 1) / onboardingSlides.length) * 100}%`,
                backgroundColor: onboardingSlides[currentIndex]?.accentColor || '#7B68EE'
              }
            ]} />
          </View>
          <Text style={styles.progressText}>
            {currentIndex + 1} of {onboardingSlides.length}
          </Text>
        </View>

        {/* Pagination dots */}
        <View style={styles.dots}>
          {onboardingSlides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>

        {/* Continue button */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[
              onboardingSlides[currentIndex]?.accentColor || '#7B68EE',
              `${onboardingSlides[currentIndex]?.accentColor || '#7B68EE'}DD`
            ]}
            style={styles.nextButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex === onboardingSlides.length - 1 ? 'Get Started' : 'Continue'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  content: {
    alignItems: 'center',
    maxWidth: 380,
    paddingTop: 20,
  },
  iconOrbitContainer: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  orbitCircle1: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  orbitCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  centralIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 3,
  },
  centralIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centralLogoImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
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
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 22,
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

