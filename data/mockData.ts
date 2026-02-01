// 원본 App.tsx에서 추출한 Mock 데이터

import { Trip, Diary, Expense, Category, Budget, Note } from '../types';

export const MOCK_TRIPS: Trip[] = [
  {
    id: "1",
    title: "2026 남미 여행",
    coverImage:
      "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800",
    startDate: "2026-03-01",
    endDate: "2026-05-31",
    countries: [
      "페루",
      "볼리비아",
      "칠레",
      "아르헨티나",
      "브라질",
    ],
    status: "ongoing",
  },
  {
    id: "2",
    title: "2025 일본 여행",
    coverImage:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800",
    startDate: "2025-12-20",
    endDate: "2025-12-30",
    countries: ["일본"],
    status: "completed",
  },
];

export const MOCK_DIARIES: Diary[] = [
  {
    id: "1",
    tripId: "1",
    title: "마추픽추 방문",
    date: "2026-03-15",
    time: "14:30",
    location: "마추픽추, 쿠스코",
    country: "페루",
    content:
      "오늘 마추픽추에 왔다. 구름 사이로 보이는 잉카 유적이 정말 환상적이었다. 새벽 4시에 일어나서 버스를 타고 올라왔는데, 일출을 보며 느낀 감동은 말로 표현할 수 없다.",
    photos: [
      "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800",
      "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800",
      "https://images.unsplash.com/photo-1580066350866-c6e0bc1a7e2a?w=800",
    ],
    weather: "맑음",
    temperature: 18,
    tags: ["유적지", "일출", "감동"],
  },
  {
    id: "4",
    tripId: "1",
    title: "쿠스코 구시가지 탐험",
    date: "2026-03-14",
    time: "11:00",
    location: "쿠스코",
    country: "페루",
    content:
      "쿠스코의 아름다운 골목길을 걸었다. 잉카 제국의 수도였던 이곳은 지금도 옛 돌담과 식민지 시대 건축물이 조화를 이루고 있다.\n\n아르마스 광장에서 현지인들과 이야기를 나누고, 알파카 모자를 샀다. 고산병 때문에 조금 힘들었지만 코카차를 마시니 한결 나아졌다.\n\n저녁에는 전통 음식인 쿠이(기니피그)를 먹어봤다. 용기를 내서 도전했는데 의외로 괜찮았다!",
    photos: [
      "https://images.unsplash.com/photo-1645740717221-00651b431a23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDdXNjbyUyMFBlcnUlMjBzdHJlZXRzfGVufDF8fHx8MTc2OTAxMjIxOHww&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1659356413086-b98e1b07f16e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQZXJ1JTIwZm9vZCUyMGNldmljaGV8ZW58MXx8fHwxNzY5MDEyMjE5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    weather: "맑음",
    temperature: 16,
    tags: ["문화", "음식", "거리"],
  },
  {
    id: "5",
    tripId: "1",
    title: "레인보우 마운틴 트레킹",
    date: "2026-03-17",
    time: "07:00",
    location: "비니쿤카",
    country: "페루",
    content:
      "새벽 3시에 일어나서 레인보우 마운틴으로 향했다. 5,200m 고도의 정상까지 3시간 동안 힘든 트레킹이었지만, 도착했을 때 펼쳐진 광경은 정말 장관이었다.\n\n빨강, 노랑, 초록색이 층층이 쌓인 산이 실제로 존재한다는 게 믿기지 않았다. 숨이 차서 자꾸 멈춰야 했지만, 그때마다 보이는 풍경이 너무 아름다워서 힘든 줄 몰랐다.\n\n정상에서 따뜻한 코코아를 마시며 느낀 성취감. 평생 잊지 못할 경험이다.",
    photos: [
      "https://images.unsplash.com/photo-1545330785-15356daae141?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxSYWluYm93JTIwTW91bnRhaW4lMjBQZXJ1fGVufDF8fHx8MTc2OTAxMjIxOHww&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1739519309379-05e5ad1038dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMaW1hJTIwUGVydSUyMG9jZWFufGVufDF8fHx8MTc2OTAxMjIxOXww&ixlib=rb-4.1.0&q=80&w=1080",
    ],
    weather: "맑음",
    temperature: 2,
    tags: ["트레킹", "자연", "모험"],
  },
  {
    id: "2",
    tripId: "1",
    title: "우유니 소금 사막",
    date: "2026-03-16",
    time: "10:00",
    location: "우유니",
    country: "볼리비아",
    content:
      "하늘을 걷는 느낌이다. 끝없이 펼쳐진 하얀 소금 평원에 하늘이 그대로 반사되어, 마치 구름 위를 걷는 것 같았다.",
    photos: [
      "https://images.unsplash.com/photo-1553603227-2358aabe821e?w=800",
    ],
    weather: "맑음",
    temperature: 15,
    tags: ["자연", "사막", "풍경"],
  },
  {
    id: "3",
    tripId: "2",
    title: "도쿄 첫날",
    date: "2025-12-20",
    time: "18:00",
    location: "시부야",
    country: "일본",
    content:
      "드디어 도쿄에 도착했다. 시부야 스크램블 교차로의 인파가 정말 대단하다.",
    photos: [
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
    ],
    weather: "흐림",
    temperature: 8,
    tags: ["도시", "쇼핑"],
  },
];

export const MOCK_EXPENSES: Expense[] = [
  {
    id: "1",
    tripId: "1",
    diaryId: "1",
    date: "2026-03-15",
    category: "activity",
    amount: 50,
    currency: "USD",
    memo: "마추픽추 입장료",
  },
  {
    id: "2",
    tripId: "1",
    diaryId: "1",
    date: "2026-03-15",
    category: "food",
    amount: 30,
    currency: "USD",
    memo: "점심 식사",
  },
  {
    id: "3",
    tripId: "1",
    diaryId: "1",
    date: "2026-03-15",
    category: "transport",
    amount: 20,
    currency: "USD",
    memo: "버스 왕복",
  },
  {
    id: "4",
    tripId: "1",
    diaryId: "2",
    date: "2026-03-16",
    category: "activity",
    amount: 60,
    currency: "USD",
    memo: "우유니 투어",
  },
  {
    id: "5",
    tripId: "1",
    diaryId: "2",
    date: "2026-03-16",
    category: "food",
    amount: 20,
    currency: "USD",
    memo: "저녁 식사",
  },
  {
    id: "6",
    tripId: "1",
    date: "2026-03-14",
    category: "accommodation",
    amount: 60,
    currency: "USD",
    memo: "호스텔 1박",
  },
  {
    id: "7",
    tripId: "1",
    date: "2026-03-14",
    category: "food",
    amount: 25,
    currency: "USD",
    memo: "저녁 식사",
  },
  {
    id: "8",
    tripId: "1",
    date: "2026-03-14",
    category: "cafe",
    amount: 8,
    currency: "USD",
    memo: "커피",
  },
  {
    id: "9",
    tripId: "1",
    date: "2026-03-13",
    category: "transport",
    amount: 45,
    currency: "USD",
    memo: "공항 택시",
  },
  {
    id: "10",
    tripId: "1",
    date: "2026-03-13",
    category: "food",
    amount: 35,
    currency: "USD",
    memo: "환영 만찬",
  },
  {
    id: "11",
    tripId: "1",
    date: "2026-03-17",
    category: "shopping",
    amount: 80,
    currency: "USD",
    memo: "기념품",
  },
  {
    id: "12",
    tripId: "1",
    date: "2026-03-17",
    category: "cafe",
    amount: 12,
    currency: "USD",
    memo: "카페 라떼",
  },
  {
    id: "13",
    tripId: "2",
    date: "2025-12-20",
    category: "food",
    amount: 3500,
    currency: "JPY",
    memo: "라멘",
  },
  {
    id: "14",
    tripId: "2",
    date: "2025-12-20",
    category: "transport",
    amount: 2000,
    currency: "JPY",
    memo: "지하철",
  },
];

export const MOCK_CATEGORIES: Category[] = [
  {
    id: "1",
    name: "식사",
    icon: "restaurant",
    color: "#FF5722",
    isDefault: true,
  },
  {
    id: "2",
    name: "교통",
    icon: "directions_bus",
    color: "#009688",
    isDefault: true,
  },
  {
    id: "3",
    name: "숙박",
    icon: "hotel",
    color: "#673AB7",
    isDefault: true,
  },
  {
    id: "4",
    name: "활동",
    icon: "directions_walk",
    color: "#FF9800",
    isDefault: true,
  },
  {
    id: "5",
    name: "쇼핑",
    icon: "shopping_cart",
    color: "#FFC107",
    isDefault: true,
  },
  {
    id: "6",
    name: "기타",
    icon: "more_horiz",
    color: "#9E9E9E",
    isDefault: true,
  },
];

export const MOCK_BUDGETS: Budget[] = [
  {
    id: "1",
    tripId: "1",
    currency: "USD",
    amount: 5000,
  },
  {
    id: "2",
    tripId: "1",
    currency: "KRW",
    amount: 1000000,
  },
  {
    id: "3",
    tripId: "2",
    currency: "JPY",
    amount: 200000,
  },
];

export const MOCK_NOTES: Note[] = [
  {
    id: "1",
    tripId: "1",
    title: "쿠스코에서 가볼 곳",
    content: "- 산 페드로 시장 (현지 음식 시도해보기)\n- 사크사이와만 유적\n- 코리칸차 (태양의 신전)\n- 아르마스 광장",
    tags: ["쿠스코", "관광"],
    createdAt: "2026-02-28",
    updatedAt: "2026-03-01",
  },
  {
    id: "2",
    tripId: "1",
    title: "준비물 체크리스트",
    content: "☑️ 고산병 약\n☑️ 선크림\n☐ 보조배터리\n☐ 따뜻한 옷 (새벽 트레킹용)\n☐ 물병\n☐ 간식",
    tags: ["준비물", "체크리스트"],
    createdAt: "2026-02-25",
    updatedAt: "2026-03-10",
  },
  {
    id: "3",
    tripId: "1",
    title: "현지인 추천 맛집",
    content: "쿠스코: Chicha por Gaston Acurio\n리마: La Mar Cebichería\n우유니: Minuteman Revolutionary Pizza",
    tags: ["맛집", "음식"],
    createdAt: "2026-03-05",
    updatedAt: "2026-03-05",
  },
  {
    id: "4",
    tripId: "2",
    title: "도쿄 여행 팁",
    content: "- JR패스 구매하기\n- 이치란 라멘 방문 (시부야점)\n- 츠키지 시장 아침 일찍 가기",
    tags: ["도쿄", "팁"],
    createdAt: "2025-12-15",
    updatedAt: "2025-12-18",
  },
];

// 상수들
export const CATEGORY_LABELS: Record<string, string> = {
  food: "식비",
  transport: "교통",
  accommodation: "숙박",
  activity: "관광",
  shopping: "쇼핑",
  cafe: "카페",
  bar: "술집",
  other: "기타",
};

export const CATEGORY_ICONS: Record<string, string> = {
  food: "🍽️",
  transport: "🚌",
  accommodation: "🏨",
  activity: "🎭",
  shopping: "🛍️",
  cafe: "☕",
  bar: "🍺",
  other: "📦",
};

export const CATEGORY_COLORS: Record<string, string> = {
  food: "#FF6384",
  transport: "#36A2EB",
  accommodation: "#FFCE56",
  activity: "#4BC0C0",
  shopping: "#9966FF",
  cafe: "#FFA726",
  bar: "#AB47BC",
  other: "#C9CBCF",
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  KRW: "₩",
  JPY: "¥",
  EUR: "€",
  GBP: "£",
  CNY: "¥",
  THB: "฿",
  VND: "₫",
};

export const CURRENCY_NAMES: Record<string, string> = {
  USD: "미국 달러",
  KRW: "한국 원",
  JPY: "일본 엔",
  EUR: "유로",
  GBP: "영국 파운드",
  CNY: "중국 위안",
  THB: "태국 바트",
  VND: "베트남 동",
};
