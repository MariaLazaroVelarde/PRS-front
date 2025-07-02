import { organization } from "./organization.model";
import { schedules, routes } from "./distribution.model";

// DISTRIBUTION PROGRAMS
export interface programs {
  id: string, // El ID que viene del backend
  organizationId: string,
  programCode: string,
  scheduleId: string,
  routeId: string,
  programDate: Date,
  plannedStartTime: string,
  plannedEndTime: string,
  actualStartTime: string,
  actualEndTime: string,
  status: StatusPrograms,
  responsibleUserId: string,
  observations: string,
  createdAt: string
}

export interface programsCreate {
  organizationId: string,
  programCode: string,
  scheduleId: string,
  routeId: string,
  programDate: Date,
  plannedStartTime: string,
  plannedEndTime: string,
  actualStartTime: string,
  actualEndTime: string,
  status: StatusPrograms,
  responsibleUserId: string,
  observations: string
}

export interface programsUpdate {
  organizationId: string,
  programCode: string,
  scheduleId: string,
  routeId: string,
  programDate: Date,
  plannedStartTime: string,
  plannedEndTime: string,
  actualStartTime: string,
  actualEndTime: string,
  status: StatusPrograms,
  responsibleUserId: string,
  observations: string
}

export enum StatusPrograms {
  COMPLETED = 'COMPLETED',
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  CANCELLED = 'CANCELLED'
}

export interface DistributionProgramView extends programs {
  schedule?: schedules;
  route?: routes;
  organization?: organization;
}
