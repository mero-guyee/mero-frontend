import * as SystemUI from 'expo-system-ui';

export const setNavigationColorByPath = (path: string, theme: 'light' | 'dark') => {
  if (path.includes('trips')) {
    SystemUI.setBackgroundColorAsync(theme === 'dark' ? '#161A1C' : '#EDF6F9');
  } else {
    SystemUI.setBackgroundColorAsync(theme === 'dark' ? '#1A1714' : '#FFFBF0');
  }
};
