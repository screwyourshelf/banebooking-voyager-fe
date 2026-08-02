export type DevelopmentProfile = "admin" | "utvidet" | "medlem";

export type AuthenticatedUser = {
  id: string;
  email: string | null;
  name: string | null;
  source: "supabase" | "development";
  developmentProfile?: DevelopmentProfile;
};

export type DevelopmentLoginResponse = {
  accessToken: string;
  expiresAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    developmentProfile: DevelopmentProfile;
  };
};
