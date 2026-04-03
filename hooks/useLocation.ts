import * as Location from 'expo-location';

export default function useLocation() {
  const [locationPermissionsInfo] = Location.useForegroundPermissions();

  return {
    status: locationPermissionsInfo ? locationPermissionsInfo.status : null,
  };
}
