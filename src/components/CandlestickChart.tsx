import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import Svg, { Line, Rect, Text as SvgText, Circle, G } from 'react-native-svg';
import { Candle } from '../types';

interface CandlestickChartProps {
  data: Candle[];
  height?: number;
  width?: number;
  theme?: 'light' | 'dark';
  showVolume?: boolean;
  showCrosshair?: boolean;
  onCandlePress?: (candle: Candle, index: number) => void;
}

export default function CandlestickChart(props: CandlestickChartProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const {
    data,
    height = 300,
    width = Dimensions.get('window').width - 32,
    theme = 'dark',
    showVolume = true,
    showCrosshair = true,
    onCandlePress
  } = props;

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height, width }]}> 
        <Text style={[styles.loadingText, { color: theme === 'dark' ? '#FFFFFF' : '#000000' }]}>Loading chart data...</Text>
      </View>
    );
  }

  const volumeHeight = showVolume ? 60 : 0;
  const padding = { top: 50, right: 20, bottom: 40 + volumeHeight, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom - volumeHeight;

  // Calculate price range
  const prices = data.flatMap((c: Candle) => [c.high, c.low]);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const priceRange = maxPrice - minPrice || 1;

  // Calculate volume range
  const volumes = data.map((c: Candle) => c.volume);
  const maxVolume = Math.max(...volumes);
  const volumeRange = maxVolume || 1;

  // Calculate candle width (adaptive based on data length)
  const minCandleWidth = 2;
  const maxCandleWidth = 8;
  const candleSpacing = chartWidth / data.length;
  const candleWidth = Math.max(
    minCandleWidth,
    Math.min(maxCandleWidth, candleSpacing * 0.7)
  );

  const candles = data.map((candle: Candle, index: number) => {
    const x = padding.left + index * candleSpacing + candleSpacing / 2;
    // Price coordinates (inverted Y-axis)
    const highY = padding.top + ((maxPrice - candle.high) / priceRange) * chartHeight;
    const lowY = padding.top + ((maxPrice - candle.low) / priceRange) * chartHeight;
    const openY = padding.top + ((maxPrice - candle.open) / priceRange) * chartHeight;
    const closeY = padding.top + ((maxPrice - candle.close) / priceRange) * chartHeight;
    const isBullish = candle.close >= candle.open;
    const bodyTop = Math.min(openY, closeY);
    const bodyBottom = Math.max(openY, closeY);
    const bodyHeight = Math.max(1, bodyBottom - bodyTop);
    return {
      x,
      highY,
      lowY,
      openY,
      closeY,
      bodyTop,
      bodyHeight,
      isBullish,
      candle,
    };
  });

  // Generate Y-axis labels (more precise)
  const yAxisSteps = 6;
  const yAxisLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) => {
    const price = minPrice + (priceRange / yAxisSteps) * i;
    const y = padding.top + ((maxPrice - price) / priceRange) * chartHeight;
    return { price, y };
  });

  // Calculate volume bars
  const volumeBars = data.map((candle, index) => {
    const x = padding.left + index * candleSpacing + candleSpacing / 2;
    const barHeight = (candle.volume / maxVolume) * volumeHeight;
    const barY = height - padding.bottom - barHeight;
    return { x, barHeight, barY, volume: candle.volume };
  });

  const chartData = {
    candles,
    yAxisLabels,
    volumeBars,
    maxPrice,
    minPrice,
    maxVolume,
    padding,
    chartWidth,
    chartHeight,
    candleWidth,
    candleSpacing,
  };

  if (!data || data.length === 0 || !chartData) {
    return (
      <View style={[styles.container, { height, width }]}>
        <Text style={[styles.loadingText, { color: theme === 'dark' ? '#FFFFFF' : '#000000' }]}>Loading chart data...</Text>
      </View>
    );
  }

  const currentPrice = data[data.length - 1]?.close || 0;
  const priceChange = data.length > 1 ? currentPrice - data[0].close : 0;
  const priceChangePercent = data.length > 1 && data[0].close > 0 
    ? ((priceChange / data[0].close) * 100).toFixed(2) 
    : '0.00';

  const bgColor = theme === 'dark' ? '#0A0A0A' : '#FFFFFF';
  const textColor = theme === 'dark' ? '#FFFFFF' : '#000000';
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)';
  const bullishColor = '#00C853';
  const bearishColor = '#FF5252';
  const volumeColor = theme === 'dark' ? 'rgba(41, 98, 255, 0.3)' : 'rgba(41, 98, 255, 0.2)';

  return (
    <View style={[styles.container, { height, width, backgroundColor: bgColor }]}> 
      {/* Price Info Header */}
      <View style={styles.priceHeader}>
        <View>
          <Text style={[styles.priceLabel, { color: theme === 'dark' ? '#999' : '#666' }]}>Price</Text>
          <Text style={[styles.priceValue, { color: textColor }]}>₹{currentPrice.toFixed(2)}</Text>
        </View>
        <View style={styles.changeContainer}>
          <Text style={[styles.priceLabel, { color: theme === 'dark' ? '#999' : '#666' }]}>Change</Text>
          <Text style={[styles.changeValue, { color: priceChange >= 0 ? bullishColor : bearishColor }]}> {priceChange >= 0 ? '+' : ''}₹{priceChange.toFixed(2)} ({priceChangePercent}%)</Text>
        </View>
      </View>

      {/* Chart */}
      <Svg width={width} height={height - 80} style={{ zIndex: 1 }}>
        {/* Grid Lines (Horizontal) */}
        {chartData.yAxisLabels.map((label, index) => (
          <Line
            key={`grid-h-${index}`}
            x1={chartData.padding.left}
            y1={label.y}
            x2={width - chartData.padding.right}
            y2={label.y}
            stroke={gridColor}
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        ))}
        {/* Grid Lines (Vertical - every 10 candles) */}
        {Array.from({ length: Math.floor(data.length / 10) + 1 }, (_, i) => {
          const x = chartData.padding.left + (i * 10) * chartData.candleSpacing;
          if (x > width - chartData.padding.right) return null;
          return (
            <Line
              key={`grid-v-${i}`}
              x1={x}
              y1={chartData.padding.top}
              x2={x}
              y2={chartData.padding.top + chartData.chartHeight}
              stroke={gridColor}
              strokeWidth="0.5"
              strokeDasharray="2,2"
              opacity={0.5}
            />
          );
        })}
        {/* Y-axis Labels */}
        {chartData.yAxisLabels.map((label, index) => (
          <React.Fragment key={`label-${index}`}>
            <SvgText
              x={chartData.padding.left - 12}
              y={label.y + 4}
              fontSize="11"
              fill={theme === 'dark' ? '#888' : '#666'}
              textAnchor="end"
              fontWeight="500"
            >
              ₹{label.price.toFixed(2)}
            </SvgText>
            {/* Y-axis line */}
            <Line
              x1={chartData.padding.left}
              y1={label.y}
              x2={chartData.padding.left - 4}
              y2={label.y}
              stroke={theme === 'dark' ? '#444' : '#999'}
              strokeWidth="1"
            />
          </React.Fragment>
        ))}
        {/* Volume Bars */}
        {showVolume && chartData.volumeBars.map((bar, index) => (
          <Rect
            key={`volume-${index}`}
            x={bar.x - chartData.candleWidth / 2}
            y={bar.barY}
            width={chartData.candleWidth}
            height={bar.barHeight}
            fill={volumeColor}
            opacity={selectedIndex === index ? 0.6 : 0.3}
          />
        ))}
        {/* Candlesticks */}
        {chartData.candles.map((candle, index) => {
          const isSelected = selectedIndex === index;
          const wickColor = candle.isBullish ? bullishColor : bearishColor;
          const bodyColor = candle.isBullish ? bullishColor : bearishColor;
          return (
            <G key={`candle-${index}`}>
              {/* Wick (High-Low line) - thicker for selected */}
              <Line
                x1={candle.x}
                y1={candle.highY}
                x2={candle.x}
                y2={candle.lowY}
                stroke={isSelected ? textColor : wickColor}
                strokeWidth={isSelected ? 2 : 1.5}
                opacity={isSelected ? 1 : 0.8}
              />
              {/* Body (Open-Close rectangle) */}
              <Rect
                x={candle.x - chartData.candleWidth / 2}
                y={candle.bodyTop}
                width={chartData.candleWidth}
                height={candle.bodyHeight}
                fill={bodyColor}
                stroke={isSelected ? textColor : 'none'}
                strokeWidth={isSelected ? 1 : 0}
                opacity={isSelected ? 1 : 0.9}
              />
              {/* Selected indicator */}
              {isSelected && (
                <Circle
                  cx={candle.x}
                  cy={candle.closeY}
                  r={4}
                  fill={textColor}
                  opacity={0.8}
                />
              )}
            </G>
          );
        })}
        {/* Current Price Line */}
        {chartData.candles.length > 0 && (
          <Line
            x1={chartData.padding.left}
            y1={chartData.candles[chartData.candles.length - 1]?.closeY || height / 2}
            x2={width - chartData.padding.right}
            y2={chartData.candles[chartData.candles.length - 1]?.closeY || height / 2}
            stroke={textColor}
            strokeWidth="1.5"
            strokeDasharray="4,4"
            opacity={0.4}
          />
        )}
        {/* Crosshair (when candle is selected) */}
        {showCrosshair && selectedIndex !== null && chartData.candles[selectedIndex] && (
          <>
            <Line
              x1={chartData.candles[selectedIndex].x}
              y1={chartData.padding.top}
              x2={chartData.candles[selectedIndex].x}
              y2={chartData.padding.top + chartData.chartHeight}
              stroke={textColor}
              strokeWidth="1"
              strokeDasharray="2,2"
              opacity={0.5}
            />
            {/* Price label at crosshair */}
            <Rect
              x={chartData.candles[selectedIndex].x - 30}
              y={chartData.candles[selectedIndex].closeY - 20}
              width={60}
              height={20}
              fill={bgColor}
              stroke={textColor}
              strokeWidth="1"
              rx={4}
            />
            <SvgText
              x={chartData.candles[selectedIndex].x}
              y={chartData.candles[selectedIndex].closeY - 6}
              fontSize="10"
              fill={textColor}
              textAnchor="middle"
              fontWeight="600"
            >
              ₹{chartData.candles[selectedIndex].candle.close.toFixed(2)}
            </SvgText>
          </>
        )}
      </Svg>

      {/* Volume Info */}
      {showVolume && (
        <View style={styles.volumeContainer}>
          <Text style={[styles.volumeLabel, { color: theme === 'dark' ? '#999' : '#666' }]}>Volume: {(data[data.length - 1]?.volume || 0).toLocaleString('en-IN')}</Text>
          {selectedIndex !== null && data[selectedIndex] && (
            <Text style={[styles.volumeLabel, { color: theme === 'dark' ? '#999' : '#666', marginLeft: 16 }]}>Selected: {(data[selectedIndex].volume || 0).toLocaleString('en-IN')}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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

