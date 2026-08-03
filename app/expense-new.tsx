import ExpenseForm from '@/components/expense/ExpenseForm';
import { useLocalSearchParams } from 'expo-router';

export default function ExpenseNewScreen() {
  const { tripId, footprintId, date } = useLocalSearchParams<{
    tripId?: string;
    footprintId?: string;
    date?: string;
  }>();
  return <ExpenseForm mode="new" tripId={tripId} footprintId={footprintId} date={date} />;
}
