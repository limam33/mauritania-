export type UserRole = 'admin' | 'marketer' | 'buyer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  phone?: string;
  whatsapp?: string;
  createdAt?: any;
}

export type PropertyType = 'land' | 'house' | 'apartment' | 'commercial';
export type PropertyCategory = 'sale' | 'rent';

export interface Property {
  id: string;
  title: string;
  description?: string;
  price: number;
  type: PropertyType;
  category: PropertyCategory;
  location?: string;
  neighborhood?: string;
  images?: string[];
  ownerId: string;
  isVerified?: boolean;
  features?: string[];
  createdAt?: any;
  updatedAt?: any;
}

export interface Commission {
  id: string;
  propertyId: string;
  marketerId: string;
  amount: number;
  status: 'pending' | 'paid';
  createdAt?: any;
}
