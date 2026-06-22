module.exports = {
  expo: {
    name: 'mero',
    slug: 'mero',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: 'mero',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      bundleIdentifier: 'com.dhguswo555.mero',
      buildNumber: '1',
      supportsTablet: true,
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          '지도에서 현재 위치를 표시하기 위해 위치 정보를 사용합니다.',
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/icon.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: 'com.dhguswo555.mero',
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
    },
    web: {
      output: 'static',
      favicon: './assets/icon.png',
    },
    plugins: [
      'expo-router',
      '@react-native-community/datetimepicker',
      'expo-navigation-bar',
      [
        'expo-splash-screen',
        {
          image: './assets/icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
      'expo-sqlite',
      'expo-secure-store',
      'expo-asset',
      'expo-location',
      [
        'expo-image-picker',
        {
          cameraPermission: '사진을 촬영하여 여행 기록에 추가하기 위해 카메라를 사용합니다.',
          microphonePermission: false,
          photosPermission: '여행 기록에 사진을 추가하기 위해 사진첩에 접근합니다.',
        },
      ],
      [
        '@react-native-google-signin/google-signin',
        {
          iosUrlScheme:
            process.env.GOOGLE_IOS_REVERSED_CLIENT_ID ||
            'com.googleusercontent.apps.89104074447-ec63e3sg97ka1r3kes7tsittkg2lbg8a',
        },
      ],
      [
        'expo-build-properties',
        {
          ios: {
            useModularHeaders: true,
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: '5ba8d587-bc5e-4311-8b9d-103f51be898a',
      },
    },
    owner: 'meroguyee',
  },
};
