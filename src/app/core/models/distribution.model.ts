export interface fares {
    fareId: string
    organizationId: string;
    fareCode: string;
    fareName: string;
    fareType: FareType;
    fareAmount: number;
    status: Status;
    created_at: string
}

export interface faresCreate {
    fareCode: string;
    fareName: string;
    fareType: FareType;
    fareAmount: number
}

export interface faresUpdate {
    fareCode: string;
    fareName: string;
    fareType: FareType;
    fareAmount: number
}

export enum FareType {
    DIARIA = 'DIARIA',
    SEMANAL = 'SEMANAL',
    MENSUAL = 'MENSUAL'
}


// distribution schedules
export interface schedules {
    scheduleId: string;
    organizationId: string;
    scheduleCode: string;
    zoneId: string;
    scheduleName: string;
    daysOfWeek: DaysOfWeek;
    startTime: boolean;
    endTime: boolean;
    durationHours: number;
    status: Status;
    created_at: string
}

export interface schedulesCreate {
    scheduleName: string;
    daysOfWeek: DaysOfWeek;
    startTime: boolean;
    endTime: boolean;
    durationHours: number
}

export interface schedulesUpdate {
    scheduleCode: string;
    scheduleName: string;
    daysOfWeek: DaysOfWeek;
    startTime: boolean;
    endTime: boolean;
    durationHours: number
}

export enum DaysOfWeek {
    LUNES = 'LUNES',
    MIÉRCOLES = 'MIÉRCOLES',
    VIERNES = 'VIERNES'
}


// distribution routes
export interface routes {
    routeId: string;
    organizationId: string;
    routeCode: string;
    routeName: string;
    zones: Zones[];
    totalEstimatedDuration: number;
    responsibleUserId: string;
    status: Status;
    created_at: string
}

export interface routesCreate {
    routeCode: string;
    routeName: string;
    zones: Zones[];
    totalEstimatedDuration: number;
    responsibleUserId: string;
}

export interface routesUpdate {
    routeCode: string;
    routeName: string;
    zones: Zones[];
    totalEstimatedDuration: number;
    responsibleUserId: string;
}

export interface Zones {
  zoneId?: string; 
  order: number;
  estimatedDuration: number;
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
