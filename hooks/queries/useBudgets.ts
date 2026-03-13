import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { budgetsApi } from '../../api/budgets';
import { useDb } from '../../providers/DatabaseProvider';
import { BudgetRepository, TripRepository } from '../../repositories';
import { Budget } from '../../types';

export const budgetKeys = {
  all: ['budgets'] as const,
  byTrip: (tripId: string) => ['budgets', 'trip', tripId] as const,
};

export function useBudgetsQuery() {
  const db = useDb();
  return useQuery({
    queryKey: budgetKeys.all,
    queryFn: () => new BudgetRepository(db).getAllBudgets(),
  });
}

export function useBudgetsByTripQuery(tripId: string) {
  const db = useDb();
  return useQuery({
    queryKey: budgetKeys.byTrip(tripId),
    queryFn: async () => {
      const tripRepo = new TripRepository(db);
      const repo = new BudgetRepository(db);
      try {
        const trip = await tripRepo.getTripById(tripId);
        if (trip?.serverId) {
          const serverBudgets = await budgetsApi.getByTrip(parseInt(trip.serverId));
          await Promise.all(serverBudgets.map((b) => repo.upsertFromServer(b, tripId)));
        }
      } catch {
        // offline — use local cache
      }
      return repo.getBudgetsByTripId(tripId);
    },
    enabled: !!tripId,
  });
}

export function useCreateBudget() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Budget, 'id'>) => {
      const tripRepo = new TripRepository(db);
      const repo = new BudgetRepository(db);
      const localBudget = await repo.createBudget(data);
      try {
        const trip = await tripRepo.getTripById(data.tripId);
        if (trip?.serverId) {
          const serverBudget = await budgetsApi.create(parseInt(trip.serverId), {
            clientId: localBudget.id,
            amount: data.amount,
            currency: data.currency as any,
            exchangeRate: data.exchangeRate,
          });
          await repo.setServerId(localBudget.id, String(serverBudget.id));
        }
      } catch {
        // stays pending
      }
      return localBudget;
    },
    onSuccess: (budget) => {
      qc.invalidateQueries({ queryKey: budgetKeys.all });
      qc.invalidateQueries({ queryKey: budgetKeys.byTrip(budget.tripId) });
    },
  });
}

export function useUpdateBudget() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (budget: Budget) => {
      const tripRepo = new TripRepository(db);
      const repo = new BudgetRepository(db);
      const updated = await repo.updateBudget(budget);
      try {
        if (budget.serverId) {
          const trip = await tripRepo.getTripById(budget.tripId);
          if (trip?.serverId) {
            await budgetsApi.update(parseInt(trip.serverId), parseInt(budget.serverId), {
              amount: budget.amount,
              currency: budget.currency as any,
              exchangeRate: budget.exchangeRate,
            });
            await repo.markSynced(budget.id);
          }
        }
      } catch {
        // stays pending
      }
      return updated;
    },
    onSuccess: (_, budget) => {
      qc.invalidateQueries({ queryKey: budgetKeys.all });
      qc.invalidateQueries({ queryKey: budgetKeys.byTrip(budget.tripId) });
    },
  });
}

export function useDeleteBudget() {
  const db = useDb();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, tripId }: { id: string; tripId: string }) => {
      const tripRepo = new TripRepository(db);
      const repo = new BudgetRepository(db);
      const budgetRow = await repo.findById(id);
      await repo.deleteBudget(id);
      try {
        if (budgetRow?.serverId) {
          const trip = await tripRepo.getTripById(tripId);
          if (trip?.serverId) {
            await budgetsApi.delete(parseInt(trip.serverId), parseInt(budgetRow.serverId));
          }
        }
      } catch {
        // stays soft-deleted with pending status
      }
      return tripId;
    },
    onSuccess: (tripId) => {
      qc.invalidateQueries({ queryKey: budgetKeys.all });
      qc.invalidateQueries({ queryKey: budgetKeys.byTrip(tripId) });
    },
  });
}
