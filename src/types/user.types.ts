export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  coins: number;
  isVip: boolean;
  createdAt: number;
}
