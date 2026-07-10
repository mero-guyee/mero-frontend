import { UserResponse } from '@/api/auth';
import { userApi } from '@/api/user';
import { UserRepository, UserRow } from '@/repositories';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDb } from '../../providers/DatabaseProvider';
import { userKeys } from './queryKeys';

export { userKeys } from './queryKeys';

function rowToUser(row: UserRow): UserResponse {
  return {
    id: Number(row.serverId),
    email: row.email,
    nickname: row.nickname,
    profileImage: row.profileImage ?? undefined,
    createdAt: row.createdAt,
  };
}

export function useUserQuery() {
  const db = useDb();
  const qc = useQueryClient();
  return useQuery({
    queryKey: userKeys.me,
    queryFn: async () => {
      const repo = new UserRepository(db);

      (async () => {
        try {
          const serverUser = await userApi.getMe();
          await repo.upsertFromServer(serverUser);
          qc.setQueryData(userKeys.me, serverUser);
        } catch {}
      })();

      const cached = await repo.getUser();
      return cached ? rowToUser(cached) : null;
    },
  });
}
