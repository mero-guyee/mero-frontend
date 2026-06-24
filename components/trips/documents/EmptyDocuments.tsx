import { FolderOpen } from '@tamagui/lucide-icons';
import { EmptyState } from '../../ui';

export default function EmptyDocuments() {
  return (
    <EmptyState
      icon={<FolderOpen size={32} color="$mutedForeground" />}
      title="저장된 서류가 없어요"
      description="항공권, 예약 확인서 등을 보관해보세요"
    />
  );
}
