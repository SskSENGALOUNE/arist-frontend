import { api } from "./api";
import type { BaseApiResponse } from "@/types";
import type {
  BusinessTrip,
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
