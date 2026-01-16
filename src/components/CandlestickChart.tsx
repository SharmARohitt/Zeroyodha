import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, PanResponder, Text } from 'react-native';
import Svg, { Rect, Line as SvgLine, Text as SvgText, Circle } from 'react-native-svg';
import { Candle } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 32;
const CHART_HEIGHT = 300;
const PADDING = 40;

interface CandlestickChartProps {
  data: Candle[];
}

export default function CandlestickChart({ data }: CandlestickChartProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (data.length === 0) return null;

  const maxPrice = Math.max(...data.map(c => c.high));
  const minPrice = Math.min(...data.map(c => c.low));
  const priceRange = maxPrice - minPrice;
  const candleWidth = (CHART_WIDTH - PADDING * 2) / data.length;
  const wickWidth = Math.max(1, candleWidth * 0.1);
  const bodyWidth = Math.max(2, candleWidth * 0.6);

  // Pan responder for touch interaction
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const touchX = evt.nativeEvent.locationX;
      const index = Math.floor((touchX - PADDING) / candleWidth);
      if (index >= 0 && index < data.length) {
        setSelectedIndex(index);
      }
    },
    onPanResponderMove: (evt) => {
      const touchX = evt.nativeEvent.locationX;
      const index = Math.floor((touchX - PADDING) / candleWidth);
      if (index >= 0 && index < data.length) {
        setSelectedIndex(index);
      }
    },
    onPanResponderRelease: () => {
      // Keep selection visible for a moment
      setTimeout(() => setSelectedIndex(null), 2000);
    },
  });

  const selectedCandle = selectedIndex !== null ? data[selectedIndex] : null;

  return (
    <View style={styles.container}>
      <View {...panResponder.panHandlers}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = PADDING + (CHART_HEIGHT - PADDING * 2) * ratio;
            const price = maxPrice - priceRange * ratio;
            return (
              <React.Fragment key={i}>
                <SvgLine
                  x1={PADDING}
                  y1={y}
                  x2={CHART_WIDTH - PADDING}
                  y2={y}
                  stroke="#2A2A2A"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
                <SvgText
                  x={PADDING - 5}
                  y={y + 4}
                  fill="#666"
                  fontSize="10"
                  textAnchor="end"
                >
                  {price.toFixed(0)}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* Candlesticks */}
          {data.map((candle, index) => {
            const x = PADDING + index * candleWidth + candleWidth / 2;
            const isGreen = candle.close >= candle.open;
            const color = isGreen ? '#00C853' : '#FF5252';
            const isSelected = selectedIndex === index;
            
            const highY = PADDING + ((maxPrice - candle.high) / priceRange) * (CHART_HEIGHT - PADDING * 2);
            const lowY = PADDING + ((maxPrice - candle.low) / priceRange) * (CHART_HEIGHT - PADDING * 2);
            const openY = PADDING + ((maxPrice - candle.open) / priceRange) * (CHART_HEIGHT - PADDING * 2);
            const closeY = PADDING + ((maxPrice - candle.close) / priceRange) * (CHART_HEIGHT - PADDING * 2);
            
            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.abs(closeY - openY) || 1;

            return (
              <React.Fragment key={index}>
                {/* Wick */}
                <SvgLine
                  x1={x}
                  y1={highY}
                  x2={x}
                  y2={lowY}
                  stroke={isSelected ? '#00D4FF' : color}
                  strokeWidth={isSelected ? wickWidth * 1.5 : wickWidth}
                />
                {/* Body */}
                <Rect
                  x={x - bodyWidth / 2}
                  y={bodyTop}
                  width={bodyWidth}
                  height={bodyHeight}
                  fill={isSelected ? '#00D4FF' : color}
                  opacity={isSelected ? 1 : 0.9}
                />
                {/* Selection indicator */}
                {isSelected && (
                  <>
                    <Circle cx={x} cy={closeY} r={4} fill="#00D4FF" />
                    <SvgLine
                      x1={x}
                      y1={PADDING}
                      x2={x}
                      y2={CHART_HEIGHT - PADDING}
                      stroke="#00D4FF"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                      opacity={0.5}
                    />
                  </>
                )}
              </React.Fragment>
            );
          })}
        </Svg>
      </View>

      {/* Selected candle info */}
      {selectedCandle && (
        <View style={styles.tooltip}>
          <View style={styles.tooltipRow}>
            <Text style={styles.tooltipLabel}>Open:</Text>
            <Text style={styles.tooltipValue}>₹{selectedCandle.open.toFixed(2)}</Text>
          </View>
          <View style={styles.tooltipRow}>
            <Text style={styles.tooltipLabel}>High:</Text>
            <Text style={[styles.tooltipValue, { color: '#00C853' }]}>
              ₹{selectedCandle.high.toFixed(2)}
            </Text>
          </View>
          <View style={styles.tooltipRow}>
            <Text style={styles.tooltipLabel}>Low:</Text>
            <Text style={[styles.tooltipValue, { color: '#FF5252' }]}>
              ₹{selectedCandle.low.toFixed(2)}
            </Text>
          </View>
          <View style={styles.tooltipRow}>
            <Text style={styles.tooltipLabel}>Close:</Text>
            <Text style={styles.tooltipValue}>₹{selectedCandle.close.toFixed(2)}</Text>
          </View>
          <View style={styles.tooltipRow}>
            <Text style={styles.tooltipLabel}>Volume:</Text>
            <Text style={styles.tooltipValue}>
              {(selectedCandle.volume / 1000000).toFixed(2)}M
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0A0A',
  },
  tooltip: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#00D4FF',
  },
  tooltipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tooltipLabel: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  tooltipValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
