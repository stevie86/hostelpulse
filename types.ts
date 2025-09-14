export type SingleNavItem = { title: string; href: string; outlined?: boolean };

export type NavItems = SingleNavItem[];

export type SingleArticle = {
  slug: string;
  content: string;
  meta: {
    title: string;
    description: string;
    date: string;
    tags: string;
    imageUrl: string;
  };
};

export type NonNullableChildren<T> = { [P in keyof T]: Required<NonNullable<T[P]>> };

export type NonNullableChildrenDeep<T> = {
  [P in keyof T]-?: NonNullableChildrenDeep<NonNullable<T[P]>>;
};

// HostelPulse types
export interface Guest {
  id: string
  created_at: string
  name: string
  email: string
  phone?: string
  notes?: string
  owner_id: string
}

export interface Room {
  id: string
  created_at: string
  name: string
  type: 'private' | 'dorm'
  max_capacity: number
  owner_id: string
  beds?: Bed[]
}

export interface Bed {
  id: string
  created_at: string
  room_id: string
  name: string
  owner_id: string
}

export interface Booking {
  id: string
  created_at: string
  guest_id: string
  room_id?: string
  bed_id?: string
  check_in: string
  check_out: string
  status: 'confirmed' | 'pending' | 'cancelled'
  notes?: string
  owner_id: string
  guests?: Guest
  rooms?: Room
  beds?: Bed
}
