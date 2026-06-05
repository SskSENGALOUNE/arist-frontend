import { api } from "./api";
import type { BaseApiResponse } from "@/types";
import type {
  BusinessTrip,
  BusinessTripStats,
  DestinationStats,
  ListTopTravelersParams,
  PaginatedTravelers,
  CreateBusinessTripData,
  UpdateBusinessTripData,
  ListBusinessTripsParams,
  PaginatedBusinessTrips,
} from "@/types/business-trip";

interface CreateBusinessTripResponse {
  id: string;
}

export const myBusinessTripService = {
  list: async (
    params?: ListBusinessTripsParams,
  ): Promise<PaginatedBusinessTrips> => {
    const response = await api.get<BaseApiResponse<PaginatedBusinessTrips>>(
      "/me/business-trips",
      { params },
    );
    return response.data.data!;
  },

  getById: async (id: string): Promise<BusinessTrip> => {
    const response = await api.get<BaseApiResponse<BusinessTrip>>(
      `/me/business-trips/${id}`,
    );
    return response.data.data!;
  },

  create: async (
    data: CreateBusinessTripData,
  ): Promise<CreateBusinessTripResponse> => {
    const response = await api.post<
      BaseApiResponse<CreateBusinessTripResponse>
    >("/me/business-trips", data);
    return response.data.data!;
  },

  update: async (
    id: string,
    data: UpdateBusinessTripData,
  ): Promise<BusinessTrip> => {
    const response = await api.patch<BaseApiResponse<BusinessTrip>>(
      `/me/business-trips/${id}`,
      data,
    );
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/me/business-trips/${id}`);
  },
};

export const businessTripService = {
  list: async (
    params?: ListBusinessTripsParams,
  ): Promise<PaginatedBusinessTrips> => {
    const response = await api.get<BaseApiResponse<PaginatedBusinessTrips>>(
      "/business-trips",
      { params },
    );
    return response.data.data!;
  },

  getById: async (id: string): Promise<BusinessTrip> => {
    const response = await api.get<BaseApiResponse<BusinessTrip>>(
      `/business-trips/${id}`,
    );
    return response.data.data!;
  },
};

export const adminBusinessTripService = {
  list: async (
    params?: ListBusinessTripsParams,
  ): Promise<PaginatedBusinessTrips> => {
    const response = await api.get<BaseApiResponse<PaginatedBusinessTrips>>(
      "/admin/business-trips",
      { params },
    );
    return response.data.data!;
  },

  getStats: async (): Promise<BusinessTripStats> => {
    const response = await api.get<BaseApiResponse<BusinessTripStats>>(
      "/admin/business-trips/stats",
    );
    return response.data.data!;
  },

  getDestinationStats: async (): Promise<DestinationStats> => {
    const response = await api.get<BaseApiResponse<DestinationStats>>(
      "/admin/business-trips/destination-stats",
    );
    return response.data.data!;
  },

  getTopTravelers: async (
    params?: ListTopTravelersParams,
  ): Promise<PaginatedTravelers> => {
    const response = await api.get<BaseApiResponse<PaginatedTravelers>>(
      "/admin/business-trips/top-travelers",
      { params },
    );
    return response.data.data!;
  },

  getById: async (id: string): Promise<BusinessTrip> => {
    const response = await api.get<BaseApiResponse<BusinessTrip>>(
      `/admin/business-trips/${id}`,
    );
    return response.data.data!;
  },

  verify: async (id: string): Promise<BusinessTrip> => {
    const response = await api.patch<BaseApiResponse<BusinessTrip>>(
      `/admin/business-trips/${id}/verify`,
    );
    return response.data.data!;
  },

  reject: async (id: string, rejectionReason: string): Promise<BusinessTrip> => {
    const response = await api.patch<BaseApiResponse<BusinessTrip>>(
      `/admin/business-trips/${id}/reject`,
      { rejectionReason },
    );
    return response.data.data!;
  },
};
