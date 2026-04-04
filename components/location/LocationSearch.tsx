import { Text, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView from 'react-native-maps';

export default function LocationSearch({
  mapRef,
  setSelected,
}: {
  mapRef: React.RefObject<MapView | null>;
  setSelected: (coord: { latitude: number; longitude: number }) => void;
}) {
  return (
    <GooglePlacesAutocomplete
      listViewDisplayed="auto"
      styles={{
        container: {
          position: 'absolute',
          top: 16,
          width: '90%',
          alignSelf: 'center',
          zIndex: 1,

          listView: {
            maxHeight: 200, // 이 값이 없으면 리스트가 무한 늘어나서 스크롤이 안 생김
          },
        },
        textInput: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12 },
      }}
      placeholder="장소 검색"
      query={{
        key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!,
        language: ['ko', 'en'],
      }}
      onPress={(_, details = null) => {
        const lat = details?.geometry?.location.lat;
        const lng = details?.geometry?.location.lng;

        mapRef.current?.animateToRegion({
          latitude: lat!,
          longitude: lng!,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });

        setSelected({ latitude: lat!, longitude: lng! });
      }}
      fetchDetails={true}
      renderRow={(rowData) => (
        <View style={{ padding: 12 }}>
          <Text>{rowData.structured_formatting.main_text}</Text>
          <Text style={{ color: '#666', fontSize: 12 }}>
            {rowData.structured_formatting.secondary_text}
          </Text>
        </View>
      )}
    />
  );
}
