const hasNumber = (str: string) => /\d/.test(str);

export function validateCountries(countries: string[]): string | null {
  if (countries.length === 0) return '나라를 하나 이상 선택해주세요.';
  if (countries.some(hasNumber)) return '나라 이름에 숫자가 포함될 수 없습니다.';
  return null;
}

export function validateStartDate(startDate: string): string | null {
  if (!startDate) return '출발일을 선택해주세요.';
  return null;
}

export function validateEndDate(endDate: string, startDate: string): string | null {
  if (!endDate) return '귀환일을 선택해주세요.';
  if (startDate && endDate < startDate) return '귀환일은 출발일 이후여야 합니다.';
  return null;
}

export function validateTitle(title: string): string | null {
  if (!title.trim()) return '여행 제목을 입력해주세요.';
  return null;
}
