import type { Badge } from "./badge.types";
import type { Event } from "./event.types"; // Import main Event type

export interface NGO {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl?: string;
  website?: string;
  contactEmail: string;
  events?: Event[]; // Use main Event type
  branches?: Branch[];
  badges?: Badge[];
}

// This interface is now consistent with the main Event type
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
  logoUrl?: string; // Made optional
  website?: string; // Added
}

// --- Query Response Types ---

export interface MyNgoData {
  myNgo: NGO;
}

export interface NgoBySlugData {
  getNgoBySlug: NGO;
}

export interface AllNgosData {
  getAllNgos: NGO[];
}