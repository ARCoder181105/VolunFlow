import type { User } from "./user.types";

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  criteria: string;
}

export interface EarnedBadge {
  id: string;
  awardedAt: string;
  badge: Badge;
  user: User;
}

export interface CreateBadgeInput {
  name: string;
  description: string;
  imageUrl: string;
  criteria: string;
}
