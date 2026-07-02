import { Car, Hotel, Package, ShoppingBag, Theater, Utensils, Wallet } from '@tamagui/lucide-icons';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  교통: Car,
  식비: Utensils,
  숙박: Hotel,
  액티비티: Theater,
  쇼핑: ShoppingBag,
  기타: Wallet,
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
