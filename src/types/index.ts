export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "manager" | "employee";
  avatar?: string;
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
