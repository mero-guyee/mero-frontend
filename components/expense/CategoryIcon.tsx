import { Bus, Car, Hotel, Package, ShoppingBag, Theater, Utensils, Wallet } from '@tamagui/lucide-icons';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  car: Car,
  bus: Bus,
  utensils: Utensils,
  hotel: Hotel,
  theater: Theater,
  shopping_bag: ShoppingBag,
  wallet: Wallet,
  package: Package,
};

export function CategoryIcon({
  name,
  size = 20,
  color = '$foreground',
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  const Icon = ICON_MAP[name] ?? Package;
  return <Icon size={size} color={color} />;
}
