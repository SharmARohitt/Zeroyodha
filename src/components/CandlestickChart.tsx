import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, PanResponder, Text } from 'react-native';
import Svg, { Rect, Line as SvgLine, Text as SvgText, Circle, G } from 'react-native-svg';
import { Candle } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 32;
const CHART_HEIGHT = 300;
const PADDING_LEFT = 50;
const PADDING_RIGHT = 10;
const PADDING_TOP = 20;
const PADDING_BOTTOM = 20;
const BOTTOM_PADDING = 40;

interface CandlestickChartProps {
  data: Candle[];
}

export default function CandlestickChart({ data }: CandlestickChartProps) {
  const { theme, isDark } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState(0);
  const lastDistance = useRef(0);
  const lastPanX = useRef(0);

  if (data.length === 0) return null;

  const maxPrice = Math.max(...data.map(c => c.high));
  const minPrice = Math.min(...data.map(c => c.low));
  const priceRange = maxPrice - minPrice;
  
  // Candle colors - more appealing
  const candleUpColor = isDark ? '#00E676' : '#00C853';  // Brighter green for dark, standard for light
  const candleDownColor = isDark ? '#FF5252' : '#D32F2F';  // Standard red for dark, darker for light
  const gridColor = isDark ? '#2A2A2A' : '#E0E0E0';
  const textColor = isDark ? '#999' : '#666';
  
  // Apply zoom to candle width
  const chartDrawWidth = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const baseCandleWidth = chartDrawWidth / data.length;
  const candleWidth = baseCandleWidth * zoom;
  const wickWidth = Math.max(1, candleWidth * 0.1);
  const bodyWidth = Math.max(2, candleWidth * 0.6);
  
  // Calculate visible range based on pan offset
  const totalWidth = candleWidth * data.length;
  const maxPanOffset = Math.max(0, totalWidth - chartDrawWidth);
  const clampedPanOffset = Math.max(0, Math.min(panOffset, maxPanOffset));

  // Calculate distance between two touches for pinch zoom
  const getDistance = (touches: any[]) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Pan responder for touch interaction, panning, and zooming
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt, gestureState) => {
      const touches = evt.nativeEvent.touches;
      if (touches.length === 2) {
        // Start pinch zoom
        lastDistance.current = getDistance(touches);
      } else if (touches.length === 1) {
        // Single touch - select candle or start pan
        lastPanX.current = gestureState.x0;
        const touchX = evt.nativeEvent.locationX - PADDING_LEFT + clampedPanOffset;
        const index = Math.floor(touchX / candleWidth);
        if (index >= 0 && index < data.length) {
          setSelectedIndex(index);
        }
      }
    },
    onPanResponderMove: (evt, gestureState) => {
      const touches = evt.nativeEvent.touches;
      
      if (touches.length === 2) {
        // Pinch zoom
        const distance = getDistance(touches);
        if (lastDistance.current > 0) {
          const scale = distance / lastDistance.current;
          const newZoom = Math.max(1, Math.min(5, zoom * scale));
          setZoom(newZoom);
        }
        lastDistance.current = distance;
      } else if (touches.length === 1 && zoom > 1) {
        // Pan when zoomed - move in opposite direction of gesture
        const deltaX = gestureState.dx - (lastPanX.current - gestureState.x0);
        const newPanOffset = clampedPanOffset - deltaX;
        setPanOffset(newPanOffset);
        lastPanX.current = gestureState.x0 + gestureState.dx;
      } else {
        // Update selected candle
        const touchX = evt.nativeEvent.locationX - PADDING_LEFT + clampedPanOffset;
        const index = Math.floor(touchX / candleWidth);
        if (index >= 0 && index < data.length) {
          setSelectedIndex(index);
        }
      }
    },
    onPanResponderRelease: () => {
      lastDistance.current = 0;
      // Keep selection visible for a moment
      setTimeout(() => setSelectedIndex(null), 2000);
    },
  });

  // Format timestamp for display - compact version
  const formatTime = (time: Date) => {
    const date = new Date(time);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    return `${day} ${month} ${hours}:${minutes}`;
  };

  const selectedCandle = selectedIndex !== null ? data[selectedIndex] : null;

  return (
    <View style={createStyles(theme).container}>
      <View {...panResponder.panHandlers}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT + BOTTOM_PADDING}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = PADDING_TOP + (CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM) * ratio;
            const price = maxPrice - priceRange * ratio;
            return (
              <React.Fragment key={i}>
                <SvgLine
                  x1={PADDING_LEFT}
                  y1={y}
                  x2={CHART_WIDTH - PADDING_RIGHT}
                  y2={y}
                  stroke={gridColor}
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
                <SvgText
                  x={PADDING_LEFT - 8}
                  y={y + 4}
                  fill={textColor}
                  fontSize="9"
                  fontWeight="600"
                  textAnchor="end"
                >
                  {price.toFixed(0)}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* Candlesticks with pan offset */}
          <G x={PADDING_LEFT - clampedPanOffset}>
            {data.map((candle, index) => {
              const x = index * candleWidth + candleWidth / 2;
              const isGreen = candle.close >= candle.open;
              const color = isGreen ? candleUpColor : candleDownColor;
              const isSelected = selectedIndex === index;
              
              // Only render visible candles for performance
              const screenX = x - clampedPanOffset + PADDING_LEFT;
              if (screenX < PADDING_LEFT - candleWidth || screenX > CHART_WIDTH - PADDING_RIGHT + candleWidth) {
                return null;
              }
              
              const highY = PADDING_TOP + ((maxPrice - candle.high) / priceRange) * (CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM);
              const lowY = PADDING_TOP + ((maxPrice - candle.low) / priceRange) * (CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM);
              const openY = PADDING_TOP + ((maxPrice - candle.open) / priceRange) * (CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM);
              const closeY = PADDING_TOP + ((maxPrice - candle.close) / priceRange) * (CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM);
              
              const bodyTop = Math.min(openY, closeY);
              const bodyHeight = Math.abs(closeY - openY) || 1;

              // Show time label for every nth candle based on zoom
              const labelInterval = Math.max(1, Math.floor(data.length / (4 * zoom)));
              const showTimeLabel = index % labelInterval === 0;

              return (
                <React.Fragment key={index}>
                  {/* Wick */}
                  <SvgLine
                    x1={x}
                    y1={highY}
                    x2={x}
                    y2={lowY}
                    stroke={isSelected ? theme.primary : color}
                    strokeWidth={isSelected ? wickWidth * 1.5 : wickWidth}
                  />
                  {/* Body */}
                  <Rect
                    x={x - bodyWidth / 2}
                    y={bodyTop}
                    width={bodyWidth}
                    height={bodyHeight}
                    fill={isSelected ? theme.primary : color}
                    opacity={isSelected ? 1 : 0.9}
                  />
                  {/* Selection indicator */}
                  {isSelected && (
                    <>
                      <Circle cx={x} cy={closeY} r={4} fill={theme.primary} />
                      <SvgLine
                        x1={x}
                        y1={PADDING_TOP}
                        x2={x}
                        y2={CHART_HEIGHT - PADDING_BOTTOM}
                        stroke={theme.primary}
                        strokeWidth="1"
                        strokeDasharray="2,2"
                        opacity={0.5}
                      />
                    </>
                  )}
                  {/* Time labels */}
                  {showTimeLabel && (
                    <SvgText
                      x={x}
                      y={CHART_HEIGHT + 15}
                      fill={textColor}
                      fontSize="8"
                      textAnchor="middle"
                    >
                      {formatTime(candle.time)}
                    </SvgText>
                  )}
                </React.Fragment>
              );
            })}
          </G>
        </Svg>
      </View>
      
      {/* Zoom indicator */}
      {zoom > 1 && (
        <View style={createStyles(theme).zoomIndicator}>
          <Text style={createStyles(theme).zoomText}>Zoom: {zoom.toFixed(1)}x</Text>
        </View>
      )}

      {/* Selected candle info */}
      {selectedCandle && (
        <View style={createStyles(theme).tooltip}>
          <View style={createStyles(theme).tooltipRow}>
            <Text style={createStyles(theme).tooltipLabel}>Time:</Text>
            <Text style={createStyles(theme).tooltipValue}>
              {new Date(selectedCandle.time).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <View style={createStyles(theme).tooltipRow}>
            <Text style={createStyles(theme).tooltipLabel}>Open:</Text>
            <Text style={createStyles(theme).tooltipValue}>₹{selectedCandle.open.toFixed(2)}</Text>
          </View>
          <View style={createStyles(theme).tooltipRow}>
            <Text style={createStyles(theme).tooltipLabel}>High:</Text>
            <Text style={[createStyles(theme).tooltipValue, { color: candleUpColor }]}>
              ₹{selectedCandle.high.toFixed(2)}
            </Text>
          </View>
          <View style={createStyles(theme).tooltipRow}>
            <Text style={createStyles(theme).tooltipLabel}>Low:</Text>
            <Text style={[createStyles(theme).tooltipValue, { color: candleDownColor }]}>
              ₹{selectedCandle.low.toFixed(2)}
            </Text>
          </View>
          <View style={createStyles(theme).tooltipRow}>
            <Text style={createStyles(theme).tooltipLabel}>Close:</Text>
            <Text style={createStyles(theme).tooltipValue}>₹{selectedCandle.close.toFixed(2)}</Text>
          </View>
          <View style={createStyles(theme).tooltipRow}>
            <Text style={createStyles(theme).tooltipLabel}>Volume:</Text>
            <Text style={createStyles(theme).tooltipValue}>
              {(selectedCandle.volume / 1000000).toFixed(2)}M
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.surface,
  },
  zoomIndicator: {
    position: 'absolute',
    top: 5,
    right: 10,
    backgroundColor: theme.card,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  zoomText: {
    color: theme.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  tooltip: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  tooltipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tooltipLabel: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  tooltipValue: {
    fontSize: 14,
    color: theme.text,
    fontWeight: 'bold',
  },
});
