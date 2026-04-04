import GooglePlacesTextInput from 'react-native-google-places-textinput';
import MapView from 'react-native-maps';

export default function LocationSearch({
  mapRef,
  setSelected,
}: {
  mapRef: React.RefObject<MapView | null>;
  setSelected: (coord: { latitude: number; longitude: number }) => void;
}) {
  return (
    <GooglePlacesTextInput
      apiKey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!}
      languageCode="ko"
      fetchDetails={true}
      placeHolderText="장소 검색"
      style={{
        container: {
          position: 'absolute',
          top: 16,
          width: '90%',
          alignSelf: 'center',
          zIndex: 1,
        },
        inputContainer: {
          backgroundColor: 'F5EFE0',
          borderColor: 'rgba(155, 196, 209, 0.25)',
          borderRadius: 8,
        },
        suggestionsContainer: { maxHeight: 200 },
      }}
      onPlaceSelect={(place) => {
        const lat = place.details?.location.latitude;
        const lng = place.details?.location.longitude;

        mapRef.current?.animateToRegion({
          latitude: lat!,
          longitude: lng!,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });

        setSelected({ latitude: lat!, longitude: lng! });
      }}
    />
  );
}
