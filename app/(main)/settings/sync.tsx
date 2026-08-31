import { SyncListItem } from '@/components/sync/SyncListItem';
import { YCard } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/button/BaseButton';
import BackActionHeader from '@/components/ui/header/BackActionHeader';
import { syncBudgets } from '@/hooks/sync/syncBudgets';
import { syncDocuments } from '@/hooks/sync/syncDocuments';
import { syncExpenses } from '@/hooks/sync/syncExpenses';
import { syncFootprints } from '@/hooks/sync/syncFootprints';
import { syncMemos } from '@/hooks/sync/syncMemos';
import { syncTrips } from '@/hooks/sync/syncTrips';
import { useDomainSync } from '@/hooks/sync/useDomainSync';
import { useDb } from '@/providers/DatabaseProvider';
import { OutboxRepository, outboxKey, type OutboxEntry } from '@/repositories/outbox';
import { CheckCircle, Plane, Trash2 } from '@tamagui/lucide-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import { Text, YStack } from 'tamagui';

const DOMAIN_LABELS: Record<string, string> = {
  trips: '여행',
  memos: '메모',
  footprints: '일지',
  expenses: '경비',
  budgets: '예산',
  documents: '문서',
};

type SyncFn = (db: ReturnType<typeof useDb>) => Promise<void | boolean>;

const DOMAIN_SYNC_FNS: Record<string, SyncFn> = {
  trips: syncTrips,
  memos: syncMemos,
  footprints: syncFootprints,
  expenses: syncExpenses,
  budgets: syncBudgets,
  documents: syncDocuments,
};

interface DomainGroup {
  domain: string;
  entries: OutboxEntry[];
}

export default function SyncStatusScreen() {
  const router = useRouter();
  const db = useDb();
  const qc = useQueryClient();
  const [retrying, setRetrying] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const syncAndInvalidate = useDomainSync(db);

  useFocusEffect(
    useCallback(() => {
      setIsSyncing(true);
      syncAndInvalidate().finally(() => setIsSyncing(false));
    }, [syncAndInvalidate])
  );

  const { data: groups = [], isLoading } = useQuery({
    queryKey: outboxKey,
    queryFn: async (): Promise<DomainGroup[]> => {
      const outbox = new OutboxRepository(db);
      const entries = await outbox.getAll();

      const grouped = entries.reduce<Record<string, OutboxEntry[]>>((acc, entry) => {
        if (!acc[entry.domain]) acc[entry.domain] = [];
        acc[entry.domain].push(entry);
        return acc;
      }, {});

      return Object.entries(grouped).map(([domain, domainEntries]) => ({
        domain,
        entries: domainEntries,
      }));
    },
  });

  const handleRetry = async (entry: OutboxEntry) => {
    const key = `${entry.domain}-${entry.dataId}`;

    setRetrying(key);
    try {
      const syncFn = DOMAIN_SYNC_FNS[entry.domain];
      Toast.show({
        type: 'info',
        text1: '동기화 시도',
        text2: `${DOMAIN_LABELS[entry.domain] ?? entry.domain} 항목을 다시 동기화하는 중입니다...`,
      });
      if (syncFn) await syncFn(db);
      await qc.invalidateQueries({ queryKey: outboxKey });
      await qc.invalidateQueries({ queryKey: [entry.domain] });
    } catch (e) {
      console.error('Failed to retry sync for entry', entry, e);
      Toast.show({
        type: 'error',
        text1: '동기화 실패',
        text2: '항목을 다시 동기화하는 데 실패했습니다. 잠시 후 다시 시도해주세요.',
      });
    } finally {
      setRetrying(null);
    }
  };

  const handleClearAll = async () => {
    try {
      const outbox = new OutboxRepository(db);
      await outbox.clearAll();
      await qc.invalidateQueries({ queryKey: outboxKey });
    } catch (e) {
      console.error('Failed to clear outbox', e);
    }
  };

  const totalCount = groups.reduce((sum, g) => sum + g.entries.length, 0);

  return (
    <YStack flex={1} backgroundColor="$background">
      <BackActionHeader onBack={() => router.back()} label="동기화 현황">
        {__DEV__ && (
          <IconButton onPress={handleClearAll}>
            <Trash2 size={20} color="$foreground" />
          </IconButton>
        )}
      </BackActionHeader>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        {isSyncing || isLoading ? (
          <YStack alignItems="center" paddingTop="$12" gap="$3">
            <Plane size={40} color="$mutedForeground" />
            <Text color="$mutedForeground" textAlign="center">
              동기화하는 중입니다...
            </Text>
          </YStack>
        ) : totalCount === 0 ? (
          <YStack alignItems="center" paddingTop="$12" gap="$3">
            <CheckCircle size={40} color="$mutedForeground" />
            <Text color="$mutedForeground" textAlign="center">
              모든 데이터가 동기화되었습니다.
            </Text>
          </YStack>
        ) : (
          <YStack gap="$5">
            {!isLoading && (
              <Text color="$mutedForeground" fontSize={14}>
                총 {totalCount}개 항목이 동기화를 기다리고 있습니다.
              </Text>
            )}
            {groups.map(({ domain, entries }) => (
              <YStack key={domain} gap="$2">
                <Text color="$mutedForeground" fontSize={13}>
                  {DOMAIN_LABELS[domain] ?? domain}
                </Text>
                <YCard>
                  {entries.map((entry, idx) => (
                    <SyncListItem
                      key={entry.id}
                      entry={entry}
                      isLast={idx === entries.length - 1}
                      isRetrying={retrying === `${entry.domain}-${entry.dataId}`}
                      onRetry={() => handleRetry(entry)}
                    />
                  ))}
                </YCard>
              </YStack>
            ))}
          </YStack>
        )}
      </ScrollView>
    </YStack>
  );
}
