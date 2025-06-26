export interface fares {
    organizationId: string;
    fareCode: string;
    fareName: string;
    fareType: FareType;
    fareAmount: boolean;
    status: Status;
    created_at: string
}

export interface faresCreate {
    fareCode: string;
    fareName: string;
    fareType: FareType;
    fareAmount: boolean
}

export interface faresUpdate {
    fareCode: string;
    fareName: string;
    fareType: FareType;
    fareAmount: boolean
}

export enum FareType {
    DIARIA = 'DIARIA',
    SEMANAL = 'SEMANAL',
    MENSUAL = 'MENSUAL'
}


// distribution schedules
export interface schedules {
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
    scheduleCode: string;
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
