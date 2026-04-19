import { ScrollView } from 'react-native';
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
    <ScrollView keyboardShouldPersistTaps="always" scrollEnabled={false}>
      <GooglePlacesTextInput
        apiKey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!}
        languageCode="ko"
        fetchDetails={true}
        placeHolderText="장소 검색"
        style={{
          inputContainer: {
            backgroundColor: 'F5EFE0',
            borderColor: 'rgba(155, 196, 209, 0.25)',
            borderRadius: 8,
          },
          suggestionsContainer: {
            maxHeight: 200,
            zIndex: 100,
            elevation: 100,
          },
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
    </ScrollView>
  );
}
