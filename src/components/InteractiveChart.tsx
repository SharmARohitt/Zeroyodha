import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  PanResponder,
  Platform,
  GestureResponderEvent,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Line, Circle, Path, Text as SvgText } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 32;
const CHART_HEIGHT = 300;

const colors = {
  primary: '#00D4FF',
  profit: '#00C853',
  loss: '#FF5252',
  background: '#000000',
  backgroundSecondary: '#0A0A0A',
  card: '#1A1A1A',
  border: '#2A2A2A',
  text: '#FFFFFF',
  textMuted: '#666666',
};

type ChartType = 'LINE' | 'CANDLE' | 'AREA';
type TimeFrame = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
type DrawingTool = 'NONE' | 'LINE' | 'HORIZONTAL' | 'VERTICAL' | 'FIBONACCI';

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
  }[];
}

interface CandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface InteractiveChartProps {
  symbol: string;
  data: ChartData;
  candleData?: CandleData[];
  onTimeFrameChange?: (timeFrame: TimeFrame) => void;
}

interface DrawingLine {
  id: string;
  type: DrawingTool;
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
  color: string;
}

export default function InteractiveChart({
  symbol,
  data,
  candleData,
  onTimeFrameChange,
}: InteractiveChartProps) {
  const [chartType, setChartType] = useState<ChartType>('LINE');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1D');
  const [showIndicators, setShowIndicators] = useState(false);
  const [showDrawingTools, setShowDrawingTools] = useState(false);
  const [activeTool, setActiveTool] = useState<DrawingTool>('NONE');
  const [drawings, setDrawings] = useState<DrawingLine[]>([]);
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  
  const drawingStartRef = useRef<{ x: number; y: number } | null>(null);
  
  const timeFrames: TimeFrame[] = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];
  
  const handleTimeFrameChange = (tf: TimeFrame) => {
    setTimeFrame(tf);
    onTimeFrameChange?.(tf);
  };
  
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 3));
  };
  
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.5));
  };
  
  const handleResetZoom = () => {
    setScale(1);
    setTranslateX(0);
  };
  
  const startDrawing = (x: number, y: number) => {
    if (activeTool === 'NONE') return;
    drawingStartRef.current = { x, y };
  };
  
  const continueDrawing = (x: number, y: number) => {
    if (!drawingStartRef.current || activeTool === 'NONE') return;
    // Update temporary drawing line
  };
  
  const endDrawing = (x: number, y: number) => {
    if (!drawingStartRef.current || activeTool === 'NONE') return;
    
    const newDrawing: DrawingLine = {
      id: Date.now().toString(),
      type: activeTool,
      startX: drawingStartRef.current.x,
      startY: drawingStartRef.current.y,
      endX: x,
      endY: y,
      color: colors.primary,
    };
    
    setDrawings(prev => [...prev, newDrawing]);
    drawingStartRef.current = null;
  };
  
  const clearDrawings = () => {
    setDrawings([]);
  };
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        startDrawing(locationX, locationY);
      },
      onPanResponderMove: (evt, gestureState) => {
        const { locationX, locationY } = evt.nativeEvent;
        continueDrawing(locationX, locationY);
        
        // Handle panning when no tool is active
        if (activeTool === 'NONE') {
          setTranslateX(prev => prev + gestureState.dx);
        }
      },
      onPanResponderRelease: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        endDrawing(locationX, locationY);
      },
    })
  ).current;
  
  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 212, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.6})`,
    style: {
      borderRadius: 12,
    },
    propsForDots: {
      r: '0',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: colors.border,
      strokeWidth: 1,
    },
  };
  
  const renderChart = () => {
    if (chartType === 'LINE' || chartType === 'AREA') {
      return (
        <View style={styles.chartContainer}>
          <LineChart
            data={data}
            width={CHART_WIDTH * scale}
            height={CHART_HEIGHT}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines
            withOuterLines
            withVerticalLines
            withHorizontalLines
            withDots={false}
            withShadow={false}
            fromZero={false}
          />
          {/* Drawing overlay */}
          <Svg
            style={StyleSheet.absoluteFill}
            width={CHART_WIDTH}
            height={CHART_HEIGHT}
            {...panResponder.panHandlers}
          >
            {drawings.map((drawing) => {
              if (drawing.type === 'LINE' && drawing.endX && drawing.endY) {
                return (
                  <Line
                    key={drawing.id}
                    x1={drawing.startX}
                    y1={drawing.startY}
                    x2={drawing.endX}
                    y2={drawing.endY}
                    stroke={drawing.color}
                    strokeWidth={2}
                  />
                );
              }
              if (drawing.type === 'HORIZONTAL') {
                return (
                  <Line
                    key={drawing.id}
                    x1={0}
                    y1={drawing.startY}
                    x2={CHART_WIDTH}
                    y2={drawing.startY}
                    stroke={drawing.color}
                    strokeWidth={2}
                    strokeDasharray="5,5"
                  />
                );
              }
              if (drawing.type === 'VERTICAL') {
                return (
                  <Line
                    key={drawing.id}
                    x1={drawing.startX}
                    y1={0}
                    x2={drawing.startX}
                    y2={CHART_HEIGHT}
                    stroke={drawing.color}
                    strokeWidth={2}
                    strokeDasharray="5,5"
                  />
                );
              }
              return null;
            })}
          </Svg>
        </View>
      );
    }
    
    // Placeholder for candlestick chart
    return (
      <View style={[styles.chartContainer, styles.candleContainer]}>
        <Text style={styles.candleText}>Candlestick Chart</Text>
        <Text style={styles.candleSubtext}>Coming soon with full OHLC data</Text>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      {/* Chart Type Selector */}
      <View style={styles.chartTypeContainer}>
        <TouchableOpacity
          style={[styles.chartTypeButton, chartType === 'LINE' && styles.chartTypeButtonActive]}
          onPress={() => setChartType('LINE')}
        >
          <Ionicons
            name="analytics-outline"
            size={20}
            color={chartType === 'LINE' ? colors.text : colors.textMuted}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chartTypeButton, chartType === 'CANDLE' && styles.chartTypeButtonActive]}
          onPress={() => setChartType('CANDLE')}
        >
          <Ionicons
            name="bar-chart-outline"
            size={20}
            color={chartType === 'CANDLE' ? colors.text : colors.textMuted}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chartTypeButton, chartType === 'AREA' && styles.chartTypeButtonActive]}
          onPress={() => setChartType('AREA')}
        >
          <Ionicons
            name="trending-up-outline"
            size={20}
            color={chartType === 'AREA' ? colors.text : colors.textMuted}
          />
        </TouchableOpacity>
      </View>
      
      {/* Time Frame Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.timeFrameContainer}
        contentContainerStyle={styles.timeFrameContent}
      >
        {timeFrames.map((tf) => (
          <TouchableOpacity
            key={tf}
            style={[styles.timeFrameButton, timeFrame === tf && styles.timeFrameButtonActive]}
            onPress={() => handleTimeFrameChange(tf)}
          >
            <Text
              style={[styles.timeFrameText, timeFrame === tf && styles.timeFrameTextActive]}
            >
              {tf}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Chart */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={scale > 1}
        contentContainerStyle={{ transform: [{ translateX }] }}
      >
        {renderChart()}
      </ScrollView>
      
      {/* Chart Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.controlsLeft}>
          <TouchableOpacity style={styles.controlButton} onPress={handleZoomIn}>
            <Ionicons name="add" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={handleZoomOut}>
            <Ionicons name="remove" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={handleResetZoom}>
            <Ionicons name="refresh" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.controlsRight}>
          <TouchableOpacity
            style={[styles.controlButton, showIndicators && styles.controlButtonActive]}
            onPress={() => setShowIndicators(!showIndicators)}
          >
            <Ionicons name="stats-chart" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, showDrawingTools && styles.controlButtonActive]}
            onPress={() => setShowDrawingTools(!showDrawingTools)}
          >
            <Ionicons name="create-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Drawing Tools */}
      {showDrawingTools && (
        <View style={styles.drawingToolsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.toolButton, activeTool === 'LINE' && styles.toolButtonActive]}
              onPress={() => setActiveTool(activeTool === 'LINE' ? 'NONE' : 'LINE')}
            >
              <Ionicons name="remove-outline" size={20} color={colors.text} />
              <Text style={styles.toolText}>Line</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toolButton, activeTool === 'HORIZONTAL' && styles.toolButtonActive]}
              onPress={() => setActiveTool(activeTool === 'HORIZONTAL' ? 'NONE' : 'HORIZONTAL')}
            >
              <Ionicons name="remove-outline" size={20} color={colors.text} />
              <Text style={styles.toolText}>H-Line</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toolButton, activeTool === 'VERTICAL' && styles.toolButtonActive]}
              onPress={() => setActiveTool(activeTool === 'VERTICAL' ? 'NONE' : 'VERTICAL')}
            >
              <Text style={styles.toolText}>V-Line</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toolButton, activeTool === 'FIBONACCI' && styles.toolButtonActive]}
              onPress={() => setActiveTool(activeTool === 'FIBONACCI' ? 'NONE' : 'FIBONACCI')}
            >
              <Text style={styles.toolText}>Fib</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolButton} onPress={clearDrawings}>
              <Ionicons name="trash-outline" size={20} color={colors.loss} />
              <Text style={[styles.toolText, { color: colors.loss }]}>Clear</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
      
      {/* Indicators Panel */}
      {showIndicators && (
        <View style={styles.indicatorsContainer}>
          <Text style={styles.indicatorsTitle}>Technical Indicators</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={styles.indicatorChip}>
              <Text style={styles.indicatorText}>SMA (20)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.indicatorChip}>
              <Text style={styles.indicatorText}>EMA (50)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.indicatorChip}>
              <Text style={styles.indicatorText}>RSI</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.indicatorChip}>
              <Text style={styles.indicatorText}>MACD</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.indicatorChip}>
              <Text style={styles.indicatorText}>Bollinger</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
      
      {activeTool !== 'NONE' && (
        <View style={styles.toolHint}>
          <Text style={styles.toolHintText}>
            {activeTool === 'LINE' && 'Tap and drag to draw a line'}
            {activeTool === 'HORIZONTAL' && 'Tap to draw a horizontal line'}
            {activeTool === 'VERTICAL' && 'Tap to draw a vertical line'}
            {activeTool === 'FIBONACCI' && 'Tap and drag to draw Fibonacci retracement'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
  },
  chartTypeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  chartTypeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chartTypeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeFrameContainer: {
    marginBottom: 12,
  },
  timeFrameContent: {
    gap: 8,
  },
  timeFrameButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeFrameButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeFrameText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  timeFrameTextActive: {
    color: colors.text,
  },
  chartContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  chart: {
    borderRadius: 12,
  },
  candleContainer: {
    height: CHART_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  candleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  candleSubtext: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  controlsLeft: {
    flexDirection: 'row',
    gap: 8,
  },
  controlsRight: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  controlButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  drawingToolsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
    marginRight: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toolButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toolText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  indicatorsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  indicatorsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  indicatorChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  indicatorText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  toolHint: {
    marginTop: 12,
    padding: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  toolHintText: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },
});
