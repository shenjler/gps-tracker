import { supabase } from '../config/supabase';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  deviceId?: string;
  created_at?: string;
}

export class SupabaseService {
  /**
   * 上传 GPS 位置到 Supabase
   */
  static async uploadLocation(data: LocationData): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('gps_locations')
        .insert({
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: data.accuracy,
          altitude: data.altitude,
          speed: data.speed,
          heading: data.heading,
          device_id: data.deviceId,
        });

      if (error) {
        console.error('Supabase 上传失败:', error.message);
        return false;
      }

      console.log('位置上传成功');
      return true;
    } catch (error) {
      console.error('上传位置时发生错误:', error);
      return false;
    }
  }

  /**
   * 获取最近的位置记录
   */
  static async getRecentLocations(limit = 10): Promise<LocationData[]> {
    try {
      const { data, error } = await supabase
        .from('gps_locations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('获取位置记录失败:', error.message);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('获取位置记录时发生错误:', error);
      return [];
    }
  }

  /**
   * 获取上传统计
   */
  static async getStats(): Promise<{ total: number; today: number }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 获取总数
      const { count: total } = await supabase
        .from('gps_locations')
        .select('*', { count: 'exact', head: true });

      // 获取今日数量
      const { count: todayCount } = await supabase
        .from('gps_locations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      return {
        total: total || 0,
        today: todayCount || 0,
      };
    } catch (error) {
      console.error('获取统计信息失败:', error);
      return { total: 0, today: 0 };
    }
  }
}
