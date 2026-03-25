import { Redirect } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { View } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export default function NaverCallbackScreen() {
  Redirect({ href: '/(main)/trips' });
  return <View />;
}
