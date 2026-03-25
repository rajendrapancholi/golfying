export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  charity_id: string | null;
  charity_percentage: number;
  created_at?: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  plan: "monthly" | "yearly";
  is_active: boolean;
  subscription_amount: number;
  next_renewal_date: string;
  created_at?: string;
};

export type Score = {
  id: string;
  user_id: string;
  score: number; 
  score_date: string;
  created_at?: string;
};

export type Charity = {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  created_at?: string;
};

export type DrawWinner = {
  id: string;
  draw_id: string;
  user_id: string;
  match_type: 3 | 4 | 5;
  prize_amount: number;
  verification_status: "pending" | "approved" | "rejected";
  proof_url?: string;
  created_at?: string;
};