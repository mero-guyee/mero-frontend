const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function getWeekday(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return WEEKDAYS[new Date(y, m - 1, d).getDay()];
}

export function formatDateLabel(dateStr: string) {
  const [, m, d] = dateStr.split('-').map(Number);
  return `${m}. ${d} (${getWeekday(dateStr)})`;
}

export function getTripDayNumber(tripStartDate: string, dateStr: string) {
  const [sy, sm, sd] = tripStartDate.split('-').map(Number);
  const [y, m, d] = dateStr.split('-').map(Number);
  const start = Date.UTC(sy, sm - 1, sd);
  const current = Date.UTC(y, m - 1, d);
  return Math.round((current - start) / 86400000) + 1;
}

export function formatDateRange(start: string, end: string) {
  const [sy, sm, sd] = start.split('-').map(Number);
  const [ey, em, ed] = end.split('-').map(Number);
  const startLabel = `${sm}월 ${sd}일(${getWeekday(start)})`;
  const endLabel = `${em}월 ${ed}일(${getWeekday(end)})`;

  const yearPrefix = `${sy}년 `;

  if (sy === ey) return `${yearPrefix}${startLabel} — ${endLabel}`;
  return `${yearPrefix}${startLabel} — ${ey}년 ${endLabel}`;
}
