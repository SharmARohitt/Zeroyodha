import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { LineChart, CandlestickChart } from 'react-native-chart-kit';
import { Candle } from '../types';

interface KLineChartProps {
  data: Candle[];
  height?: number;
  theme?: 'light' | 'dark';
  showVolume?: boolean;
}

export default function KLineChart({ 
  data, 
  height = 300, 
  theme = 'dark',
  showVolume = true 
}: KLineChartProps) {
  const screenWidth = Dimensions.get('window').width;

  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: [{ data: [] }],
      };
    }

    // Prepare candlestick data
    const candles = data.map((candle, index) => ({
      x: index,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume,
    }));

    // Prepare line chart data (closing prices)
    const closingPrices = data.map(candle => candle.close);
    const labels = data.map((_, index) => {
      if (index === 0 || index === data.length - 1 || index % Math.floor(data.length / 5) === 0) {
        return new Date(data[index].time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      }
      return '';
    });

    return {
      labels,
      datasets: [
        {
          data: closingPrices,
          color: (opacity = 1) => theme === 'dark' ? `rgba(41, 98, 255, ${opacity})` : `rgba(0, 0, 255, ${opacity})`,
          strokeWidth: 2,
        },
      ],
      candles,
    };
  }, [data, theme]);

  const chartConfig = {
    backgroundColor: theme === 'dark' ? '#000000' : '#FFFFFF',
    backgroundGradientFrom: theme === 'dark' ? '#0A0A0A' : '#F5F5F5',
    backgroundGradientTo: theme === 'dark' ? '#1A1A1A' : '#FFFFFF',
    decimalPlaces: 2,
    color: (opacity = 1) => theme === 'dark' ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => theme === 'dark' ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: theme === 'dark' ? '#2962FF' : '#0000FF',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      strokeWidth: 1,
    },
  };

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={[styles.loadingText, { color: theme === 'dark' ? '#FFFFFF' : '#000000' }]}>
          Loading chart data...
        </Text>
      </View>
    );
  }

  // Calculate price range for display
  const prices = data.map(c => [c.high, c.low]).flat();
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  const currentPrice = data[data.length - 1]?.close || 0;
  const priceChange = data.length > 1 ? currentPrice - data[0].close : 0;
  const priceChangePercent = data.length > 1 && data[0].close > 0 
    ? ((priceChange / data[0].close) * 100).toFixed(2) 
    : '0.00';

  return (
    <View style={[styles.container, { height }]}>
      {/* Price Info Header */}
      <View style={styles.priceHeader}>
        <View>
          <Text style={[styles.priceLabel, { color: theme === 'dark' ? '#999' : '#666' }]}>Price</Text>
          <Text style={[styles.priceValue, { color: theme === 'dark' ? '#FFFFFF' : '#000000' }]}>
            ₹{currentPrice.toFixed(2)}
          </Text>
        </View>
        <View style={styles.changeContainer}>
          <Text style={[styles.priceLabel, { color: theme === 'dark' ? '#999' : '#666' }]}>Change</Text>
          <Text style={[
            styles.changeValue,
            { color: priceChange >= 0 ? '#00C853' : '#FF5252' }
          ]}>
            {priceChange >= 0 ? '+' : ''}₹{priceChange.toFixed(2)} ({priceChangePercent}%)
          </Text>
        </View>
      </View>

      {/* Main Chart */}
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={screenWidth - 32}
          height={height - 100}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={true}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          withDots={false}
          withShadow={false}
        />
      </View>

      {/* Volume Indicator */}
      {showVolume && (
        <View style={styles.volumeContainer}>
          <Text style={[styles.volumeLabel, { color: theme === 'dark' ? '#999' : '#666' }]}>
            Volume: {(data[data.length - 1]?.volume || 0).toLocaleString('en-IN')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0A0A',
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  changeContainer: {
    alignItems: 'flex-end',
  },
  changeValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  volumeContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  volumeLabel: {
    fontSize: 12,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 14,
  },
});

