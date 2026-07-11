import ExpenseForm from '@/components/expense/ExpenseForm';
import { useLocalSearchParams } from 'expo-router';

export default function ExpenseNewScreen() {
  const { tripId, footprintId } = useLocalSearchParams<{ tripId?: string; footprintId?: string }>();
  return <ExpenseForm mode="new" tripId={tripId} footprintId={footprintId} />;
}
