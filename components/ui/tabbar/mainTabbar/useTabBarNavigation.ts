import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { StackActions } from '@react-navigation/native';

function shouldHideTabBar(state: BottomTabBarProps['state']): boolean {
  const currentRoute = state.routes[state.index];
  const nestedRoute = currentRoute.state?.routes[currentRoute.state?.index ?? 0];

  if (currentRoute.name === 'trips') return true;
  if (currentRoute.name === 'settings') return true;
  if (currentRoute.name === 'footprint' && nestedRoute?.name === 'new') return true;
  if (currentRoute.name === 'expense' && nestedRoute?.name === 'edit') return true;
  if (
    currentRoute.name === 'backpack' &&
    (nestedRoute?.name === 'edit' || nestedRoute?.name === 'memo-form')
  )
    return true;

  return false;
}

export function useTabBarNavigation({ state, navigation }: BottomTabBarProps) {
  const hideTabBar = shouldHideTabBar(state);

  function popToTopLeavingRoute() {
    const leavingRoute = state.routes[state.index];
    if (leavingRoute.state?.key) {
      navigation.dispatch({
        ...StackActions.popToTop(),
        target: leavingRoute.state.key,
      });
    }
  }

  function goToIndexOfDestinationRoute(route: (typeof state.routes)[number]) {
    navigation.navigate(route.name, { screen: 'index' });
  }

  function navigateToTab(route: (typeof state.routes)[number], isFocused: boolean) {
    const ogPressEvent = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });
    const isClickedAnotherTab = !isFocused && !ogPressEvent.defaultPrevented;

    if (isClickedAnotherTab) {
      popToTopLeavingRoute();
    }
    goToIndexOfDestinationRoute(route);
  }

  return { hideTabBar, navigateToTab };
}
