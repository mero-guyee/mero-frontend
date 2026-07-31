const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function getWeekday(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return WEEKDAYS[new Date(y, m - 1, d).getDay()];
}

export function formatDateRange(start: string, end: string) {
  const [sy, sm, sd] = start.split('-');
  const [ey, em, ed] = end.split('-');
  const startLabel = `${sm}.${sd}(${getWeekday(start)})`;
  const endLabel = `${em}.${ed}(${getWeekday(end)})`;
  if (sy === ey) return `${sy}.${startLabel} — ${endLabel}`;
  return `${sy}.${startLabel} — ${ey}.${endLabel}`;
}
