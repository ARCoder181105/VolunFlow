export interface Event {
  id: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
  location: string;
  imageUrl?: string;
  maxVolunteers?: number;
  ngo?: {
    id: string;
    name: string;
    logoUrl?: string;
  };
  signups?: Array<{
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

export interface CreateEventInput {
  title: string;
  description: string;
  date: string;
  location: string;
  tags?: string[];
  imageUrl?: string;
  maxVolunteers?: number;
}