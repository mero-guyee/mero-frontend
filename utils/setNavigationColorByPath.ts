import * as SystemUI from 'expo-system-ui';

export const setNavigationColorByPath = (path: string) => {
  if (path.includes('trips')) {
    SystemUI.setBackgroundColorAsync('#EDF6F9');
  } else {
    SystemUI.setBackgroundColorAsync('#FFFBF0');
  }
};
