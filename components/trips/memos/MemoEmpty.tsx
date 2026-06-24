import { StickyNote } from '@tamagui/lucide-icons';
import { EmptyState } from '../../ui';

export function MemoEmpty() {
  return (
    <EmptyState
      icon={<StickyNote size={32} color="$mutedForeground" />}
      title="메모가 없어요"
      description="여행 중 생각난 것들을 기록해보세요"
    />
  );
}
