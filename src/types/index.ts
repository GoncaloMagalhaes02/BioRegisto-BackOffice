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
  description: string;
  suggested_species: string | null;
  species_id: string | null;
  observed_at: string;
  status: ObservationStatus;
  is_public: boolean;
  rejection_reason: string | null;
  technician_notes: string | null;
  validated_at: string | null;
  validated_by: string | null;
  created_at: string;
  updated_at: string;
  // PostGIS extraído
  latitude: number | null;
  longitude: number | null;
  // Join profiles
  username: string | null;
  full_name: string | null;
  photos: Photo[];
  // Join species
  scientific_name: string | null;
  common_name_pt: string | null;
  kingdom: string | null;
}

export interface ObservationWithPhoto extends Observation {
  photo_url: string | null;
}
