import ExpenseForm from '@/components/expense/ExpenseForm';
import { useLocalSearchParams } from 'expo-router';

export default function ExpenseNewScreen() {
  const { tripId, footprintId, date, location } = useLocalSearchParams<{
    tripId?: string;
    footprintId?: string;
    date?: string;
    location?: string;
  }>();
  return (
    <ExpenseForm mode="new" tripId={tripId} footprintId={footprintId} date={date} location={location} />
  );
}
