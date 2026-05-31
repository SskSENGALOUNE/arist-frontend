export interface Position {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePositionData {
  name: string;
}

export interface UpdatePositionData {
  name?: string;
  isActive?: boolean;
}
