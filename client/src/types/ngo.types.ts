import type { Badge } from "./badge.types";

export interface NGO {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl?: string;
  website?: string;
  contactEmail: string;
  events?: NgoEvent[];
  branches?: Branch[];
  badges?: Badge[];
}

// Make NgoEvent compatible with the main Event type
export interface NgoEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  tags: string[]; 
  imageUrl?: string;
  maxVolunteers?: number;
  ngo?: {
    id: string;
    name: string;
    logoUrl?: string;
  };
}

export interface Branch {
  id: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface CreateNgoInput {
  name: string;
  description: string;
  contactEmail: string;
}