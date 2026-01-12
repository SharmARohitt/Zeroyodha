import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

// Theme colors
const colors = {
  primary: '#00D4FF', // Blue Neon
  background: '#0A0A0A',
  border: '#1A1A1A',
  inactive: '#666666',
};

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inactive,
        tabBarStyle: {
          backgroundColor: Platform.OS === 'ios' ? 'rgba(10, 10, 10, 0.95)' : colors.background,
          borderTopColor: Platform.OS === 'ios' ? 'rgba(0, 212, 255, 0.3)' : colors.border,
          borderTopWidth: Platform.OS === 'ios' ? 0.5 : 1,
          height: Platform.OS === 'ios' ? 95 : 75,
          paddingBottom: Platform.OS === 'ios' ? 34 : 16,
          paddingTop: Platform.OS === 'ios' ? 8 : 12,
          elevation: 0,
          shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0,
          shadowColor: Platform.OS === 'ios' ? colors.primary : '#000',
          shadowOffset: { width: 0, height: Platform.OS === 'ios' ? -4 : -2 },
          shadowRadius: Platform.OS === 'ios' ? 16 : 8,
          position: 'absolute',
          bottom: 0,
          ...(Platform.OS === 'ios' && {
            backdropFilter: 'blur(20px)',
          }),
        },
        tabBarLabelStyle: {
          fontSize: Platform.OS === 'ios' ? 12 : 11,
          fontWeight: Platform.OS === 'ios' ? '800' : '600',
          marginTop: Platform.OS === 'ios' ? 4 : 2,
          letterSpacing: Platform.OS === 'ios' ? 0.5 : 0,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarItemStyle: {
          paddingVertical: Platform.OS === 'ios' ? 4 : 0,
        },
      }}
    >
      <Tabs.Screen
        name="watchlist"
        options={{
          title: 'Watchlist',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "bookmark" : "bookmark-outline"} 
              size={Platform.OS === 'ios' ? 24 : 22} 
              color={color}
              style={Platform.OS === 'ios' && focused ? { 
                shadowColor: color, 
                shadowOffset: { width: 0, height: 0 }, 
                shadowOpacity: 0.8, 
                shadowRadius: 8 
              } : {}}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "document-text" : "document-text-outline"} 
              size={Platform.OS === 'ios' ? 24 : 22} 
              color={color}
              style={Platform.OS === 'ios' && focused ? { 
                shadowColor: color, 
                shadowOffset: { width: 0, height: 0 }, 
                shadowOpacity: 0.8, 
                shadowRadius: 8 
              } : {}}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portfolio',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "briefcase" : "briefcase-outline"} 
              size={Platform.OS === 'ios' ? 24 : 22} 
              color={color}
              style={Platform.OS === 'ios' && focused ? { 
                shadowColor: color, 
                shadowOffset: { width: 0, height: 0 }, 
                shadowOpacity: 0.8, 
                shadowRadius: 8 
              } : {}}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bids"
        options={{
          title: 'Bids',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "hammer" : "hammer-outline"} 
              size={Platform.OS === 'ios' ? 24 : 22} 
              color={color}
              style={Platform.OS === 'ios' && focused ? { 
                shadowColor: color, 
                shadowOffset: { width: 0, height: 0 }, 
                shadowOpacity: 0.8, 
                shadowRadius: 8 
              } : {}}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              size={Platform.OS === 'ios' ? 24 : 22} 
              color={color}
              style={Platform.OS === 'ios' && focused ? { 
                shadowColor: color, 
                shadowOffset: { width: 0, height: 0 }, 
                shadowOpacity: 0.8, 
                shadowRadius: 8 
              } : {}}
            />
          ),
        }}
      />
    </Tabs>
  );
}

