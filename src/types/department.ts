export interface Department {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentData {
  name: string;
}

export interface UpdateDepartmentData {
  name?: string;
  isActive?: boolean;
}
