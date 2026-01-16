import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Stock } from '../types';
import { LinearGradient } from 'expo-linear-gradient';
import { getStockLogo } from '../utils/stockLogos';
import { benzingaService } from '../services/benzingaService';

interface StockCardProps {
  stock: Stock;
  onPress: () => void;
}

export default function StockCard({ stock, onPress }: StockCardProps) {
  const isPositive = stock.change >= 0;
  const changeColor = isPositive ? '#00C853' : '#FF5252';
  const [logoInfo, setLogoInfo] = useState(getStockLogo(stock.symbol));

  // Try to fetch real logo from Benzinga if not cached
  useEffect(() => {
    const fetchLogo = async () => {
      if (!logoInfo.imageUrl) {
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
        }
      }
    };

    fetchLogo();
  }, [stock.symbol, logoInfo.imageUrl]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={styles.card}>
        <LinearGradient
          colors={['#1A1A1A', '#0A0A0A']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.leftSection}>
              <View style={[styles.logoContainer, { backgroundColor: logoInfo.imageUrl ? '#FFFFFF' : logoInfo.color }]}>
                {logoInfo.imageUrl ? (
                  <Image
                    source={{ uri: logoInfo.imageUrl }}
                    style={styles.logoImage}
                    resizeMode="contain"
                    onError={() => {
                      // If image fails to load, fallback to text
                      setLogoInfo(prev => ({ ...prev, imageUrl: undefined }));
                    }}
                  />
                ) : (
                  <Text style={styles.logoText}>
                    {stock.symbol.substring(0, 2).toUpperCase()}
                  </Text>
                )}
              </View>
              <View style={styles.info}>
                <Text style={styles.symbol}>{stock.symbol}</Text>
                <View style={styles.categoryRow}>
                  <Text style={styles.category}>
                    {stock.instrumentType === 'INDEX' ? 'INDICES' : stock.exchange}
                  </Text>
                </View>
                <Text style={styles.name} numberOfLines={1}>
                  {stock.name}
                </Text>
              </View>
            </View>

            <View style={styles.rightSection}>
              <Text style={styles.price}>₹{stock.lastPrice.toFixed(2)}</Text>
              <View style={styles.changeContainer}>
                <Text style={[styles.change, { color: changeColor }]}>
                  {isPositive ? '+' : ''}
                  {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                </Text>
              </View>
              <Text style={styles.volume}>
                Vol: {(stock.volume / 1000).toFixed(0)}K
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#2962FF',
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  categoryRow: {
    marginBottom: 4,
  },
  category: {
    fontSize: 10,
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  name: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    color: '#666',
  },
});

