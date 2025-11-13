export interface UpdateUserInput {
  name?: string;
  avatarUrl?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: 'VOLUNTEER' | 'NGO_ADMIN' | 'SUPER_ADMIN';
  adminOfNgoId?: string;
}

export interface UserProfile extends User {
  signups: Array<{
    id: string;
    status: string;
    event: {
      id: string;
      title: string;
      date: string;
      location: string;
    };
  }>;
  earnedBadges: Array<{
    id: string;
    awardedAt: string;
    badge: {
      id: string;
      name: string;
      description: string;
      imageUrl: string;
    };
  }>;
}

// --- Query Response Types ---

export interface MeData {
  me: User | null;
}

export interface MyProfileData {
  myProfile: UserProfile;
}