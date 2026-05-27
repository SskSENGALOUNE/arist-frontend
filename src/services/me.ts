import { api } from "./api";
import type {
  BaseApiResponse,
  Country,
  EducationLevel,
  Gender,
  GraduatedFrom,
  LanguageLevel,
} from "@/types";
import type { EmployeeUser } from "./employee";

export interface UpdateProfileData {
  photoUrl?: string;
  gender?: Gender;
  educationLevel?: EducationLevel;
  institutionName?: string;
  graduatedFrom?: GraduatedFrom;
  graduatedCountry?: Country;
  fieldOfStudy?: string;
  englishLevel?: LanguageLevel;
  vietnameseLevel?: LanguageLevel;
  chineseLevel?: LanguageLevel;
  otherLanguages?: string;
  passportExpiry?: string;
}

export const meService = {
  updateProfile: async (data: UpdateProfileData): Promise<EmployeeUser> => {
    const response = await api.patch<BaseApiResponse<EmployeeUser>>(
      "/me/profile",
      data,
    );
    return response.data.data!;
  },
};
