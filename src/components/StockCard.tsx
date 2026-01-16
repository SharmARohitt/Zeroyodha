import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Stock } from '../types';
import { LinearGradient } from 'expo-linear-gradient';
import { getStockLogo } from '../utils/stockLogos';
import { benzingaService } from '../services/benzingaService';
import { useTheme } from '../contexts/ThemeContext';

interface StockCardProps {
  stock: Stock;
  onPress: () => void;
}

export default function StockCard({ stock, onPress }: StockCardProps) {
  const { theme } = useTheme();
  const isPositive = stock.change >= 0;
  const changeColor = isPositive ? theme.profit : theme.loss;
  const [logoInfo, setLogoInfo] = useState(getStockLogo(stock.symbol));
  const [isLoading, setIsLoading] = useState(false);

  // Try to fetch real logo from Benzinga if not cached - only once
  useEffect(() => {
    const fetchLogo = async () => {
      // Check if we already have a cached logo
      const cachedLogo = benzingaService.getCachedLogo(stock.symbol);
      if (cachedLogo) {
        setLogoInfo(prev => ({
          ...prev,
          imageUrl: cachedLogo,
        }));
        return;
      }

      // Only fetch if we don't have an image URL and haven't tried yet
      if (!logoInfo.imageUrl && !isLoading) {
        setIsLoading(true);
        try {
          const realLogo = await benzingaService.getStockLogo(stock.symbol);
          if (realLogo) {
            setLogoInfo(prev => ({
              ...prev,
              imageUrl: realLogo,
            }));
          }
        } catch (error) {
          console.warn(`Failed to fetch logo for ${stock.symbol}:`, error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchLogo();
  }, [stock.symbol]); // Only depend on symbol, not logoInfo

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={createStyles(theme).card}>
        <LinearGradient
          colors={[theme.card, theme.surface]}
          style={createStyles(theme).gradient}
        >
          <View style={createStyles(theme).content}>
            <View style={createStyles(theme).leftSection}>
              <View style={[createStyles(theme).logoContainer, { backgroundColor: logoInfo.imageUrl ? '#FFFFFF' : logoInfo.color }]}>
                {logoInfo.imageUrl ? (
                  <Image
                    source={{ uri: logoInfo.imageUrl }}
                    style={createStyles(theme).logoImage}
                    resizeMode="contain"
                    onError={() => {
                      setLogoInfo(prev => ({ ...prev, imageUrl: undefined }));
                      setIsLoading(false);
                    }}
                  />
                ) : (
                  <Text style={createStyles(theme).logoText}>
                    {stock.symbol.substring(0, 2).toUpperCase()}
                  </Text>
                )}
              </View>
              <View style={createStyles(theme).info}>
                <Text style={createStyles(theme).symbol}>{stock.symbol}</Text>
                <View style={createStyles(theme).categoryRow}>
                  <Text style={createStyles(theme).category}>
                    {stock.instrumentType === 'INDEX' ? 'INDICES' : stock.exchange}
                  </Text>
                </View>
                <Text style={createStyles(theme).name} numberOfLines={1}>
                  {stock.name}
                </Text>
              </View>
            </View>

            <View style={createStyles(theme).rightSection}>
              <Text style={createStyles(theme).price}>₹{stock.lastPrice.toFixed(2)}</Text>
              <View style={createStyles(theme).changeContainer}>
                <Text style={[createStyles(theme).change, { color: changeColor }]}>
                  {isPositive ? '+' : ''}
                  {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                </Text>
              </View>
              <Text style={createStyles(theme).volume}>
                Vol: {(stock.volume / 1000).toFixed(0)}K
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  logoImage: {
    width: 40,
    height: 40,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  symbol: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  categoryRow: {
    marginBottom: 4,
  },
  category: {
    fontSize: 10,
    color: theme.textMuted,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  name: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 4,
  },
  changeContainer: {
    marginBottom: 4,
  },
  change: {
    fontSize: 14,
    fontWeight: '600',
  },
  volume: {
    fontSize: 10,
    color: theme.textMuted,
  },
});

