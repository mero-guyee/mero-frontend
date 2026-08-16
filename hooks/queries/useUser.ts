import { UserResponse } from '@/api/auth';
import { userApi } from '@/api/user';
import { UserRepository, UserRow } from '@/repositories';
import { computeThumbhash } from '@/utils/thumbhash';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDb } from '../../providers/DatabaseProvider';
import { userKeys } from './queryKeys';

export { userKeys } from './queryKeys';

function rowToUser(row: UserRow): UserResponse & { thumbhash?: string } {
  return {
    id: Number(row.serverId),
    email: row.email,
    nickname: row.nickname,
    profileImage: row.profileImage ?? undefined,
    thumbhash: row.thumbhash ?? undefined,
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
          if (serverUser.nickname === null) return;
          await repo.upsertFromServer(serverUser);
          const freshRow = await repo.getUser();
          if (freshRow) qc.setQueryData(userKeys.me, rowToUser(freshRow));
        } catch {}
      })();

      const cached = await repo.getUser();
      return cached ? rowToUser(cached) : null;
    },
  });
}

export function useUpdateNickname() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (nickname: string) => {
      await userApi.updateNickname({ nickname });
      const repo = new UserRepository(db);
      await repo.updateNickname(nickname);
      return repo.getUser();
    },
    onSuccess: (row) => {
      if (row) qc.setQueryData(userKeys.me, rowToUser(row));
    },
  });
}

export function useUpdateProfileImage() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (uri: string) => {
      const thumbhash = await computeThumbhash(uri);
      const updated = await userApi.uploadProfileImage(uri);
      const repo = new UserRepository(db);
      await repo.upsertFromServer(updated, thumbhash);
      return repo.getUser();
    },
    onSuccess: (row) => {
      if (row) qc.setQueryData(userKeys.me, rowToUser(row));
    },
  });
}

export function useCompleteOnboarding() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (nickname: string) => {
      await userApi.updateNickname({ nickname });
      const repo = new UserRepository(db);
      const freshUser = await userApi.getMe();
      await repo.upsertFromServer({ ...freshUser, nickname });
      return repo.getUser();
    },
    onSuccess: (row) => {
      if (row) qc.setQueryData(userKeys.me, rowToUser(row));
    },
  });
}
