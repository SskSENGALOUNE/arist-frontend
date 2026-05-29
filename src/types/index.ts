export type Gender = "MALE" | "FEMALE";
export type LanguageLevel =
  | "NONE"
  | "BASIC"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "NATIVE";
export type EducationLevel =
  | "HIGH_SCHOOL"
  | "VOCATIONAL"
  | "DIPLOMA"
  | "BACHELOR"
  | "MASTER"
  | "PHD";
export type GraduatedFrom = "DOMESTIC" | "ABROAD";
export type Country =
  | "LAOS"
  | "THAILAND"
  | "VIETNAM"
  | "CHINA"
  | "CAMBODIA"
  | "MYANMAR"
  | "MALAYSIA"
  | "SINGAPORE"
  | "JAPAN"
  | "SOUTH_KOREA"
  | "USA"
  | "UK"
  | "AUSTRALIA"
  | "FRANCE"
  | "GERMANY"
  | "RUSSIA"
  | "CANADA"
  | "OTHER";

export interface User {
  id: string;
  username: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE";
  firstName: string;
  lastName: string;
  mustChangePassword: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  user: User;
}

export interface BaseApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: "active" | "inactive" | "on_leave";
  hireDate: string;
  salary: number;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  newHiresThisMonth: number;
  departmentBreakdown: { department: string; count: number }[];
  monthlyHires: { month: string; count: number }[];
}
