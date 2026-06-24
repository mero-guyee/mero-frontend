import { SyncListItem } from '@/components/sync/SyncListItem';
import { YCard } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/button/BaseButton';
import BackActionHeader from '@/components/ui/header/BackActionHeader';
import { syncBudgets } from '@/hooks/sync/syncBudgets';
import { syncExpenses } from '@/hooks/sync/syncExpenses';
import { syncFootprints } from '@/hooks/sync/syncFootprints';
import { syncMemos } from '@/hooks/sync/syncMemos';
import { syncTrips } from '@/hooks/sync/syncTrips';
import { useDb } from '@/providers/DatabaseProvider';
import { OutboxRepository, type OutboxEntry } from '@/repositories/outbox';
import { CheckCircle, RefreshCw } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { Text, YStack } from 'tamagui';

const DOMAIN_LABELS: Record<string, string> = {
  trips: '여행',
  memos: '메모',
  footprints: '발자국',
  expenses: '경비',
  budgets: '예산',
  documents: '문서',
};

type SyncFn = (db: ReturnType<typeof useDb>) => Promise<void>;

const DOMAIN_SYNC_FNS: Record<string, SyncFn> = {
  trips: syncTrips,
  memos: syncMemos,
  footprints: syncFootprints,
  expenses: syncExpenses,
  budgets: syncBudgets,
};

interface DomainGroup {
  domain: string;
  entries: OutboxEntry[];
}

export default function SyncStatusScreen() {
  const router = useRouter();
  const db = useDb();
  const [groups, setGroups] = useState<DomainGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [retrying, setRetrying] = useState<string | null>(null);

  const loadOutbox = async () => {
    try {
      setIsLoading(true);
      const outbox = new OutboxRepository(db);
      const entries = await outbox.getAll();

      const grouped = entries.reduce<Record<string, OutboxEntry[]>>((acc, entry) => {
        if (!acc[entry.domain]) acc[entry.domain] = [];
        acc[entry.domain].push(entry);
        return acc;
      }, {});

      setGroups(
        Object.entries(grouped).map(([domain, domainEntries]) => ({
          domain,
          entries: domainEntries,
        }))
      );
    } catch (e) {
      console.error('Failed to load outbox entries', e);
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOutbox();
  }, []);

  const handleRetry = async (entry: OutboxEntry) => {
    const key = `${entry.domain}-${entry.dataId}`;
    setRetrying(key);
    try {
      const outbox = new OutboxRepository(db);
      await outbox.resetToReady(entry.domain, entry.dataId);
      const syncFn = DOMAIN_SYNC_FNS[entry.domain];
      if (syncFn) await syncFn(db);
      await loadOutbox();
    } finally {
      setRetrying(null);
    }
  };

  const totalCount = groups.reduce((sum, g) => sum + g.entries.length, 0);

  return (
    <YStack flex={1} backgroundColor="$background">
      <BackActionHeader onBack={() => router.back()} label="동기화 현황">
        <IconButton onPress={loadOutbox} testID="sync-refresh-button">
          <RefreshCw size={20} color="$foreground" />
        </IconButton>
      </BackActionHeader>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        {!isLoading && totalCount === 0 ? (
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
                <YCard borderRadius="$4">
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
