export interface User {
     responsibleUserId: string;
     name: string;
     email: string;
     password: string;
     status: Status;
     createdAt: string;
     updatedAt: string;
}

export interface UserCreate {
     name: string;
     email: string;
     password: string;
}

export interface UserUpdate {
     responsibleUserId: string;
     name: string;
     email: string;
     password: string;
}

// EMUN STATUS GLOBAL
export enum Status{
    ACTIVE ='ACTIVE',
    INACTIVE = 'INACTIVE'
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}