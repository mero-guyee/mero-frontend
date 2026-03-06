import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

const TASK_NAME = 'mero-background-location';

// 현재 추적 중인 tripId (백그라운드 태스크에서 접근용)
let _currentTripId: string | null = null;

// 백그라운드 태스크 등록 (앱 최상단에서 호출되기 전에 정의되어야 함)
TaskManager.defineTask(TASK_NAME, async ({ data, error }) => {
  if (error || !data) return;

  // Location tracking placeholder — repository integration pending
});

export const LocationService = {
  async requestPermissions(): Promise<boolean> {
    const { status: fg } = await Location.requestForegroundPermissionsAsync();
    if (fg !== 'granted') return false;

    const { status: bg } = await Location.requestBackgroundPermissionsAsync();
    return bg === 'granted';
  },

  async startTracking(tripId: string): Promise<boolean> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return false;

    _currentTripId = tripId;

    const isRunning = await Location.hasStartedLocationUpdatesAsync(TASK_NAME).catch(() => false);
    if (isRunning) return true;

    await Location.startLocationUpdatesAsync(TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: 60_000,       // 1분마다
      distanceInterval: 50,        // 또는 50m 이동 시
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Mero',
        notificationBody: '위치를 기록하고 있습니다.',
        notificationColor: '#4A90E2',
      },
    });

    return true;
  },

  async stopTracking(): Promise<void> {
    _currentTripId = null;
    const isRunning = await Location.hasStartedLocationUpdatesAsync(TASK_NAME).catch(() => false);
    if (isRunning) {
      await Location.stopLocationUpdatesAsync(TASK_NAME);
    }
  },

  async isTracking(): Promise<boolean> {
    return Location.hasStartedLocationUpdatesAsync(TASK_NAME).catch(() => false);
  },

  // 현재 위치를 즉시 1회 기록 — repository integration pending
  async recordCurrentLocation(_tripId: string, _footprintId?: string): Promise<void> {
    // placeholder
  },
};
