import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DistributionProgram } from '../../../../core/models/water-distribution.model';
import { routes as Route, schedules as Schedule } from '../../../../core/models/distribution.model';
import { ProgramsService } from '../../../../core/services/water-distribution.service';
import { DistributionService } from '../../../../core/services/distribution.service';
import { User as ResponsibleUser } from '../../../../core/models/user.model';
import { UserService } from '../../../../core/services/user.service';
import { organization as Organization } from '../../../../core/models/organization.model';
import { OrganizationService } from '../../../../core/services/organization.service';

@Component({
  selector: 'app-program-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './program-form.component.html',
  styleUrls: ['./program-form.component.css']
})
export class ProgramFormComponent implements OnInit {
  programsForm: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  programId: string | null = null;
  organizations: Organization[] = [];
  routes: Route[] = [];
  schedules: Schedule[] = [];
  responsible: ResponsibleUser[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private programsService: ProgramsService,
    private distributionService: DistributionService,
    private userService: UserService,
    private organizationService: OrganizationService
  ) {
    this.programsForm = this.fb.group({
      programCode: ['', [Validators.required, Validators.maxLength(20)]],
      programDate: ['', Validators.required],
      plannedStartTime: ['', Validators.required],
      plannedEndTime: ['', Validators.required],
      actualStartTime: [''],
      actualEndTime: [''],
      organizationId: ['', Validators.required],
      routeId: ['', Validators.required],
      scheduleId: ['', Validators.required],
      responsibleUserId: ['', Validators.required],
      status: ['', Validators.required],
      observations: ['', Validators.maxLength(300)]
    });
  }

  ngOnInit(): void {
    this.programId = this.route.snapshot.paramMap.get('id');
    this.loadInitialData();

    if (this.programId) {
      this.isEditMode = true;
      this.loadProgram();
    }
  }

  isFormValid(): boolean {
    return this.programsForm.valid;
  }

  getFieldError(fieldName: string): string {
    const field = this.programsForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Este campo es requerido';
    if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;

    return 'Campo inválido';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.programsForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  onSubmit(): void {
    if (this.programsForm.invalid) {
      this.markFormGroupTouched(this.programsForm);
      return;
    }

    this.isSubmitting = true;
    const formData: DistributionProgram = this.prepareFormData();

    const request = this.isEditMode
      ? this.programsService.updateProgram(this.programId!, formData)
      : this.programsService.createProgram(formData);

    request.subscribe({
      next: () => {
        this.router.navigate(['/admin/programs']);
      },
      error: (error) => {
        console.error('Error al guardar programa:', error);
        this.isSubmitting = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/programs']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  private prepareFormData(): DistributionProgram {
    const form = this.programsForm.value;

    return {
      id: this.programId ?? '', // usa ID si estás en modo edición
      programCode: form.programCode,
      programDate: new Date(form.programDate).toISOString(),
      plannedStartTime: new Date(form.plannedStartTime).toISOString(),
      plannedEndTime: new Date(form.plannedEndTime).toISOString(),
      actualStartTime: form.actualStartTime ? new Date(form.actualStartTime).toISOString() : null,
      actualEndTime: form.actualEndTime ? new Date(form.actualEndTime).toISOString() : null,
      organizationId: form.organizationId,
      routeId: form.routeId || null,
      scheduleId: form.scheduleId || null,
      responsibleUserId: form.responsibleUserId || null,
      status: form.status,
      observations: form.observations
    };
  }

  private loadProgram(): void {
    this.programsService.getProgramById(this.programId!).subscribe({
      next: (program) => {
        this.programsForm.patchValue({
          programCode: program.programCode,
          programDate: this.formatDate(program.programDate),
          plannedStartTime: this.formatDate(program.plannedStartTime),
          plannedEndTime: this.formatDate(program.plannedEndTime),
          actualStartTime: program.actualStartTime ? this.formatDate(program.actualStartTime) : '',
          actualEndTime: program.actualEndTime ? this.formatDate(program.actualEndTime) : '',
          organizationId: program.organizationId,
          routeId: program.routeId,
          scheduleId: program.scheduleId,
          responsibleUserId: program.responsibleUserId,
          status: program.status,
          observations: program.observations
        });
      },
      error: (error) => {
        console.error('Error al cargar programa:', error);
      }
    });
  }

  private formatDate(dateString: string): string {
    return new Date(dateString).toISOString().slice(0, 16);
  }

  private loadInitialData(): void {
    this.organizationService.getAllO().subscribe({
      next: (orgs) => this.organizations = orgs,
      error: (err) => console.error('Error cargando organizaciones:', err)
    });

    this.distributionService.getAllR().subscribe({
      next: (routes) => this.routes = routes,
      error: (err) => console.error('Error cargando rutas:', err)
    });

    this.distributionService.getAll().subscribe({
      next: (schedules) => this.schedules = schedules,
      error: (err) => console.error('Error cargando horarios:', err)
    });

    this.userService.getAll().subscribe({
      next: (res) => this.responsible = res,
      error: (err) => console.error('Error cargando responsables:', err)
    });
  }
}
