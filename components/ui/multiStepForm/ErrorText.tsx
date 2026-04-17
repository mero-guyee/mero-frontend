import { Text } from 'tamagui';

export default function ErrorText({ error }: { error: string | null }) {
  return (
    <Text color="$destructive" fontSize={13} marginTop="$1" h={'$4'}>
      {error ?? ''}
    </Text>
  );
}
