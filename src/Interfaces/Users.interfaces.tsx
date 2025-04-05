export interface IUser {
  avatar: null | string;
  created_at: string;
  email: string;
  id: number;
  name: string;
  password: string;
  phone: number;
  profile_id: number;
  refresh_token: null | string;
  token: null | string;
  updated_at: string;
  key?: number;
  profile?: Profile;
  role?: null|string;
}

export interface Profile {
  created_at: null | string;
  description: string;
  id: number;
  role: string;
  updated_at: null | string;
}
