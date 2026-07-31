import { StickyNote } from '@tamagui/lucide-icons';
import { EmptyState } from '../../ui';

export function MemoEmpty() {
  return (
    <EmptyState
      icon={<StickyNote size={32} color="$mutedForeground" />}
      title="메모가 없어요"
      description="잊지 말아야 할 것들을 메모해보세요"
    />
  );
}
