export type Role = "USER" | "TECHNICIAN" | "ADMIN";
export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  role: Role;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  url: string;
  is_primary: boolean;
  order_index: number;
}

export type ObservationStatus = "PENDING" | "VALIDATED" | "REJECTED";

export interface Observation {
  id: string;
  user_id: string;
  species_id: string | null;
  description: string;
  location: {
    latitude: number;
    longitude: number;
  };
  observed_at: string;
  status: ObservationStatus;
  validated_by: string | null;
  validated_at: string | null;
  rejection_reason: string | null;
  technician_notes: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  photos?: Photo[];
  species?: { scientific_name: string; common_name_pt: string };
}
