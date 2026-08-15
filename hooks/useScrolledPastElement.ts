import { useState } from 'react';
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

export function useScrolledPastElement() {
  const [elementBottom, setElementBottom] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);

  const onElementLayout = (e: LayoutChangeEvent) =>
    setElementBottom(e.nativeEvent.layout.y + e.nativeEvent.layout.height);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setScrollY(e.nativeEvent.contentOffset.y);

  const hasScrolledPast = elementBottom !== null && scrollY > elementBottom;

  return { onElementLayout, onScroll, hasScrolledPast };
}
