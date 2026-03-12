import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SupabaseService, LocationData } from './Supabase';

const LOCATION_TASK_NAME = 'gps-tracker';
const DEVICE_ID_KEY = 'device_id';

interface TaskData {
  locations?: Location.LocationObject[];
}

/**
 * 后台 GPS 任务
 */
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('后台定位任务错误:', error.message);
    return;
  }

  const taskData = data as TaskData;
  if (taskData && taskData.locations) {
    const locations = taskData.locations;
    for (const location of locations) {
      await uploadLocationData(location);
    }
  }
});

/**
 * 上传位置数据
 */
async function uploadLocationData(location: Location.LocationObject): Promise<void> {
  const coords = location.coords;
  const deviceId = await getDeviceId();
  const locationData: LocationData = {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy ?? undefined,
    altitude: coords.altitude ?? undefined,
    speed: coords.speed ?? undefined,
    heading: coords.heading ?? undefined,
    deviceId: deviceId,
  };

  await SupabaseService.uploadLocation(locationData);
}

/**
 * 获取设备 ID
 */
async function getDeviceId(): Promise<string> {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = Math.random().toString(36).substring(2, 15);
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error('获取设备ID失败:', error);
    return 'unknown';
  }
}

export class GPSService {
  private static isTracking = false;

  /**
   * 请求位置权限
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== 'granted') {
        console.warn('前台位置权限被拒绝');
        return false;
      }

      // Android 需要额外请求后台权限
      if (Platform.OS === 'android') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          console.warn('后台位置权限被拒绝');
        }
      }

      return true;
    } catch (error) {
      console.error('请求权限失败:', error);
      return false;
    }
  }

  /**
   * 检查 GPS 是否启用
   */
  static async isGPSEnabled(): Promise<boolean> {
    return await Location.hasServicesEnabledAsync();
  }

  /**
   * 获取当前位置 (一次性)
   */
  static async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      return location;
    } catch (error) {
      console.error('获取当前位置失败:', error);
      return null;
    }
  }

  /**
   * 启动后台位置追踪
   */
  static async startTracking(): Promise<boolean> {
    try {
      if (this.isTracking) {
        console.log('定位已在运行中');
        return true;
      }

      // 检查权限
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('位置权限未授予');
      }

      // 检查 GPS 是否启用
      const isEnabled = await this.isGPSEnabled();
      if (!isEnabled) {
        throw new Error('GPS 未启用');
      }

      // 检查并注册后台任务
      const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);

      if (!isRegistered) {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 60000, // 60秒
          distanceInterval: 10, // 移动10米
          deferredUpdatesInterval: 60000,
          deferredUpdatesDistance: 10,
          foregroundService: {
            notificationTitle: 'GPS 追踪器',
            notificationBody: '正在记录您的位置...',
            notificationColor: '#3b82f6',
          },
        });
      }

      this.isTracking = true;
      console.log('GPS 追踪已启动');
      return true;
    } catch (error) {
      console.error('启动 GPS 追踪失败:', error);
      return false;
    }
  }

  /**
   * 停止后台位置追踪
   */
  static async stopTracking(): Promise<void> {
    try {
      if (!this.isTracking) {
        return;
      }

      const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
      if (isRegistered) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }

      this.isTracking = false;
      console.log('GPS 追踪已停止');
    } catch (error) {
      console.error('停止 GPS 追踪失败:', error);
    }
  }

  /**
   * 检查是否正在追踪
   */
  static isTrackingActive(): boolean {
    return this.isTracking;
  }
}
