import type { Country } from "./index";

export type TripType = "DOMESTIC" | "INTERNATIONAL";

export type TripStatus = "DRAFT" | "PENDING" | "VERIFIED" | "REJECTED";

export type LaoProvince =
  | "VIENTIANE_CAPITAL"
  | "PHONGSALI"
  | "LUANG_NAMTHA"
  | "OUDOMXAI"
  | "BOKEO"
  | "LUANG_PRABANG"
  | "HUAPHANH"
  | "XAYABOULI"
  | "XIANGKHOUANG"
  | "VIENTIANE"
  | "BORIKHAMXAI"
  | "KHAMMOUANE"
  | "SAVANNAKHET"
  | "SALAVAN"
  | "SEKONG"
  | "CHAMPASAK"
  | "ATTAPEU"
  | "XAISOMBOUN";

export interface BusinessTripUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface BusinessTrip {
  id: string;
  title: string;
  tripType: TripType;
  destinationProvince: LaoProvince | null;
  destinationCountry: Country | null;
  departureDate: string;
  returnDate: string;
  status: TripStatus;
  submittedAt: string | null;
  verifiedAt: string | null;
  verifiedById: string | null;
  rejectionReason: string | null;
  userId: string;
  user?: BusinessTripUser;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBusinessTripData {
  title: string;
  tripType: TripType;
  destinationProvince?: LaoProvince | null;
  destinationCountry?: Country | null;
  departureDate: string;
  returnDate: string;
}

export interface UpdateBusinessTripData {
  title?: string;
  tripType?: TripType;
  destinationProvince?: LaoProvince | null;
  destinationCountry?: Country | null;
  departureDate?: string;
  returnDate?: string;
}

export interface ListBusinessTripsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedBusinessTrips {
  items: BusinessTrip[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const LAO_PROVINCES: LaoProvince[] = [
  "VIENTIANE_CAPITAL",
  "PHONGSALI",
  "LUANG_NAMTHA",
  "OUDOMXAI",
  "BOKEO",
  "LUANG_PRABANG",
  "HUAPHANH",
  "XAYABOULI",
  "XIANGKHOUANG",
  "VIENTIANE",
  "BORIKHAMXAI",
  "KHAMMOUANE",
  "SAVANNAKHET",
  "SALAVAN",
  "SEKONG",
  "CHAMPASAK",
  "ATTAPEU",
  "XAISOMBOUN",
];

export const COUNTRIES: Country[] = [
  "LAOS",
  "THAILAND",
  "VIETNAM",
  "CHINA",
  "CAMBODIA",
  "MYANMAR",
  "MALAYSIA",
  "SINGAPORE",
  "JAPAN",
  "SOUTH_KOREA",
  "USA",
  "UK",
  "AUSTRALIA",
  "FRANCE",
  "GERMANY",
  "RUSSIA",
  "CANADA",
  "OTHER",
];
