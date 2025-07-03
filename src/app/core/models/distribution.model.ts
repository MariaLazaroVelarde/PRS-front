export interface fares {
  id: string; 
  organizationId: string;
  fareCode: string;
  fareName: string;
  fareType: FareType;
  fareAmount: number;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
}


export interface faresCreate {
  organizationId: string;    
  fareCode: string;         
  fareName: string;
  fareType: FareType;
  fareAmount: number;
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
  id: string; 
  scheduleCode: string;
  scheduleName: string;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  durationHours: number;
  organizationId: string;
  zoneId: string;
  status: 'ACTIVE' | 'INACTIVE'; // <- IMPORTANTE
}

export interface schedulesCreate {
  scheduleName: string;
  daysOfWeek: string[]; 
  startTime: string;
  endTime: string;
  durationHours: number;
  organizationId: string;
  zoneId: string;
}

export interface schedulesUpdate {
  scheduleCode: string;
  scheduleName: string;
  daysOfWeek: string[]; 
  startTime: string;
  endTime: string;
  durationHours: number;
  organizationId: string;
  zoneId: string;
}


export enum DaysOfWeek {
    LUNES = 'LUNES',
    MIÉRCOLES = 'MIÉRCOLES',
    VIERNES = 'VIERNES'
}

// distribution routes
export interface routes {
    id: string;
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

// Usuario
export interface User {
  name: string;
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  status: 'ACTIVE' | 'INACTIVE';
}


// Programas de distribución

export interface DistributionProgramCreate {
  programCode: string;
  organizationId: string;
  scheduleId: string;
  routeId: string;
  programDate: string; // formato: YYYY-MM-DD
  plannedStartTime: string; // formato: HH:mm
  plannedEndTime: string;
  actualStartTime: string;
  actualEndTime: string;
  responsibleUserId: string;
  observations?: string;
  status: Status;
}

export interface DistributionProgram {
  id: string;
  programCode: string;
  organizationId: string;
  scheduleId: string;
  routeId: string;
  programDate: string;
  plannedStartTime: string;
  plannedEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  responsibleUserId: string;
  observations?: string;
  status: ProgramStatus; 
  created_at: string;
}

export interface DistributionProgramUpdate {
  scheduleId?: string;
  routeId?: string;
  programDate?: string;
  plannedStartTime?: string;
  plannedEndTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  responsibleUserId?: string;
  observations?: string;
  status?: Status;
}

export enum ProgramStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}
