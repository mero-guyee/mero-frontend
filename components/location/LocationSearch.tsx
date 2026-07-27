import { ScrollView } from 'react-native';
import GooglePlacesTextInput from 'react-native-google-places-textinput';
import MapView from 'react-native-maps';
import { useTheme } from 'tamagui';

export default function LocationSearch({
  mapRef,
  setSelected,
}: {
  mapRef: React.RefObject<MapView | null>;
  setSelected: (coord: { latitude: number; longitude: number; placeName?: string }) => void;
}) {
  const theme = useTheme();

  return (
    <ScrollView keyboardShouldPersistTaps="always" scrollEnabled={false}>
      <GooglePlacesTextInput
        apiKey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!}
        languageCode="ko"
        fetchDetails={true}
        placeHolderText="장소 검색"
        style={{
          inputContainer: {
            backgroundColor: theme.card.val,
            borderColor: theme.border.val,
            borderRadius: 8,
          },
          input: {
            height: 44,
            color: theme.foreground.val,
          },
          suggestionsContainer: {
            backgroundColor: theme.card.val,
            maxHeight: 200,
            zIndex: 100,
            elevation: 100,
          },
          suggestionItem: {
            backgroundColor: theme.card.val,
          },
          suggestionText: {
            main: { color: theme.foreground.val },
            secondary: { color: theme.mutedForeground.val },
          },
          placeholder: {
            color: theme.placeholderForeground.val,
          },
          loadingIndicator: {
            color: theme.placeholderForeground.val,
          },
        }}
        onPlaceSelect={(place) => {
          const lat = place.details?.location.latitude;
          const lng = place.details?.location.longitude;
          const placeName = place.structuredFormat.mainText.text;

          mapRef.current?.animateToRegion({
            latitude: lat!,
            longitude: lng!,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });

          setSelected({ latitude: lat!, longitude: lng!, placeName });
        }}
      />
    </ScrollView>
  );
}
