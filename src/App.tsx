import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, Button, ScrollView, Alert } from 'react-native';
import { LocationCard } from './components/LocationCard';
import { GPSService } from './services/GPS';
import { SupabaseService } from './services/Supabase';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  created_at?: string;
}

export default function App() {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData>();
  const [stats, setStats] = useState({ total: 0, today: 0 });
  const [error, setError] = useState<string>();

  // 加载统计数据
  useEffect(() => {
    loadStats();
  }, []);

  // 检查初始追踪状态
  useEffect(() => {
    checkTrackingStatus();
  }, []);

  const loadStats = async () => {
    const statsData = await SupabaseService.getStats();
    setStats(statsData);
  };

  const checkTrackingStatus = async () => {
    const isActive = GPSService.isTrackingActive();
    setIsTracking(isActive);
  };

  const handleStartTracking = async () => {
    setError(undefined);

    // 检查 GPS 是否启用
    const isEnabled = await GPSService.isGPSEnabled();
    if (!isEnabled) {
      Alert.alert('错误', '请先开启 GPS 定位功能');
      return;
    }

    const success = await GPSService.startTracking();
    if (success) {
      setIsTracking(true);
      setError(undefined);
      // 获取初始位置
      const location = await GPSService.getCurrentLocation();
      if (location) {
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy ?? undefined,
          altitude: location.coords.altitude ?? undefined,
          speed: location.coords.speed ?? undefined,
        });
      }
    } else {
      setError('启动失败，请检查权限设置');
    }
  };

  const handleStopTracking = async () => {
    await GPSService.stopTracking();
    setIsTracking(false);
  };

  const handleRefreshStats = async () => {
    await loadStats();
    // 获取最近的位置
    const recentLocations = await SupabaseService.getRecentLocations(1);
    if (recentLocations.length > 0) {
      setCurrentLocation(recentLocations[0]);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>GPS 追踪器</Text>

        {/* 状态指示器 */}
        <View style={[styles.statusIndicator, { backgroundColor: isTracking ? '#22c55e' : '#ef4444' }]} />

        {/* 追踪控制按钮 */}
        <View style={styles.buttonContainer}>
          {!isTracking ? (
            <Button title="启动追踪" onPress={handleStartTracking} color="#3b82f6" />
          ) : (
            <Button title="停止追踪" onPress={handleStopTracking} color="#ef4444" />
          )}
        </View>

        {/* 错误信息 */}
        {error && <Text style={styles.error}>{error}</Text>}

        {/* 位置卡片 */}
        <LocationCard {...currentLocation} timestamp={currentLocation?.created_at} />

        {/* 统计信息 */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>统计信息</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>今日上传:</Text>
            <Text style={styles.statsValue}>{stats.today}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>总计上传:</Text>
            <Text style={styles.statsValue}>{stats.total}</Text>
          </View>
        </View>

        {/* 刷新按钮 */}
        <View style={styles.buttonContainer}>
          <Button title="刷新数据" onPress={handleRefreshStats} color="#6b7280" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 20,
  },
  statusIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginTop: 10,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  error: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginHorizontal: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111827',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  statsLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  statsValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
});
