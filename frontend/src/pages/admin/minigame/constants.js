export const TAB_OPTIONS = [
  { id: "dashboard", label: "Dashboard", icon: "fa-chart-pie" },
  { id: "games", label: "Game CMS", icon: "fa-list" },
  { id: "rewards", label: "Rewards", icon: "fa-gift" },
  { id: "analytics", label: "Analytics", icon: "fa-chart-line" },
  { id: "sessions", label: "Play Sessions", icon: "fa-clock-rotate-left" },
  { id: "activity", label: "Activity Logs", icon: "fa-timeline" },
];

export const GAME_TYPES = [
  { value: "ALL", label: "Tat ca" },
  { value: "MEMORY_MATCH", label: "Memory Match" },
  { value: "LUCKY_SPIN", label: "Lucky Spin" },
];

export const STATUS_OPTIONS = [
  { value: "ALL", label: "Tat ca" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export const BOOLEAN_FILTER_OPTIONS = [
  { value: "ALL", label: "Tat ca" },
  { value: "true", label: "Bat" },
  { value: "false", label: "Tat" },
];

export const REWARD_TYPE_OPTIONS = [
  { value: "ALL", label: "Tat ca" },
  { value: "POINT", label: "Point" },
  { value: "VOUCHER", label: "Voucher" },
];

export const ADMIN_COLOR_SET = ["#E56A16", "#18864B", "#4A2618", "#D64545", "#7D55D3", "#D8A409"];

export const EMPTY_GAME_FORM = {
  name: "",
  slug: "",
  code: "",
  type: "MEMORY_MATCH",
  thumbnailUrl: "",
  bannerUrl: "",
  shortDescription: "",
  description: "",
  rules: "",
  dailyPlayLimit: 0,
  status: "ACTIVE",
  visible: true,
  featured: false,
  version: "v1.0.0",
};

export const EMPTY_REWARD_FORM = {
  rewardName: "",
  rewardType: "POINT",
  pointValue: 10,
  voucherId: "",
  probability: 0,
  totalQuantity: 0,
  remainingQuantity: 0,
  status: "ACTIVE",
};
