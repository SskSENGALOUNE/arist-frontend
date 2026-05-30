export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface CreateBannerData {
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateBannerData = Partial<CreateBannerData>;

export interface ListBannersParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedBanners {
  items: Banner[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
