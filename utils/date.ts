const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function getWeekday(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return WEEKDAYS[new Date(y, m - 1, d).getDay()];
}

export function formatDateRange(start: string, end: string) {
  const [sy, sm, sd] = start.split('-').map(Number);
  const [ey, em, ed] = end.split('-').map(Number);
  const startLabel = `${sm}월 ${sd}일(${getWeekday(start)})`;
  const endLabel = `${em}월 ${ed}일(${getWeekday(end)})`;

  const currentYear = new Date().getFullYear();
  const yearPrefix = sy === currentYear ? '' : `${sy}년 `;

  if (sy === ey) return `${yearPrefix}${startLabel} — ${endLabel}`;
  return `${yearPrefix}${startLabel} — ${ey}년 ${endLabel}`;
}
