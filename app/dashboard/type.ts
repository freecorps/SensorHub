export type Sensor = {
  api_key: string;
  created_at: string | null;
  id: string;
  is_public: boolean | null;
  name: string;
  password_hash: string;
  updated_at: string | null;
  user_id: string;
};

export type Group = {
  created_at: string | null;
  id: string;
  name: string;
  updated_at: string | null;
  user_id: string;
};
