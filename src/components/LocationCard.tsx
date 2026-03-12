import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export interface LocationCardProps {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  timestamp?: string;
}

export function LocationCard({ latitude, longitude, accuracy, altitude, speed, timestamp }: LocationCardProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleTimeString('zh-CN');
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>当前位置</Text>

      <View style={styles.row}>
        <Text style={styles.label}>纬度:</Text>
        <Text style={styles.value}>{latitude?.toFixed(6) ?? '--'}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>经度:</Text>
        <Text style={styles.value}>{longitude?.toFixed(6) ?? '--'}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>精度:</Text>
        <Text style={styles.value}>{accuracy ? `${accuracy.toFixed(0)}m` : '--'}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>海拔:</Text>
        <Text style={styles.value}>{altitude ? `${altitude.toFixed(0)}m` : '--'}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>速度:</Text>
        <Text style={styles.value}>{speed ? `${(speed * 3.6).toFixed(1)} km/h` : '--'}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>时间:</Text>
        <Text style={styles.value}>{formatDate(timestamp)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
});
