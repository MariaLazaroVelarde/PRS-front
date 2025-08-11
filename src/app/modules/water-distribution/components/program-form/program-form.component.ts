import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DistributionProgram } from '../../../../core/models/water-distribution.model';
import { routes as Route, schedules as Schedule } from '../../../../core/models/distribution.model';
import { DistributionService } from '../../../../core/services/distribution.service';
import { UserResponseDTO } from '../../../../core/models/user.model';
import { organization as Organization, zones as Zone, street as Street } from '../../../../core/models/organization.model';
import { OrganizationService } from '../../../../core/services/organization.service';
import Swal from 'sweetalert2';
import { ProgramsService } from '../../../../core/services/water-distribution.service';
import { UserService } from 'app/core/services/user.service';
import { Observable, forkJoin } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';
import { OrganizationContextService } from 'app/core/services/organization-context.service';

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
  isViewMode = false;
  isSubmitting = false;
  programId: string | null = null;

  organizations: Organization[] = [];
  zones: Zone[] = [];
  streets: Street[] = [];
  filteredStreets: Street[] = [];
  selectedZoneId: string | null = null;

  routes: Route[] = [];
  schedules: Schedule[] = [];
  responsible: UserResponseDTO[] = [];
  minDateTime: string = '';

  constructor(
  private fb: FormBuilder,
  private route: ActivatedRoute,
  private router: Router,
  private programsService: ProgramsService,
  private distributionService: DistributionService,
  private userService: UserService,
  private organizationService: OrganizationService,
  private organizationContextService: OrganizationContextService 
)
{
    this.programsForm = this.fb.group({
      programCode: ['', [Validators.required, Validators.maxLength(20)]],
      programDate: ['', Validators.required],
      plannedStartTime: ['', Validators.required],
      plannedEndTime: ['', Validators.required],
      actualStartTime: [''],
      actualEndTime: [''],
      observations: ['', [
        Validators.maxLength(300),
        Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ][A-Za-zÁÉÍÓÚáéíóúÑñ ]*$/)
      ]],
      organizationId: ['', Validators.required],
      zoneId: [''],
      streetId: [[], Validators.required],
      routeId: ['', Validators.required],
      scheduleId: ['', Validators.required],
      responsibleUserId: ['', Validators.required],
      status: ['', Validators.required]
    });
  }

 ngOnInit(): void {
  this.programId = this.route.snapshot.paramMap.get('id');
  const view = this.route.snapshot.data['viewMode'];

  this.minDateTime = this.getTodayDateTime();
  this.isViewMode = !!view;
  this.isEditMode = !!this.programId && !view;

  // Cargar datos iniciales
  this.loadInitialData().subscribe(() => {

    // ✅ Generar código si es nuevo
    if (!this.isEditMode) {
      this.generateProgramCode();
    } else {
      this.loadProgram();
    }

    // Tomar el primer valor del contexto
    this.organizationContextService.organizationContext$
      .pipe(take(1))
      .subscribe((ctx: any) => {
        console.log("📌 Contexto inicial:", ctx);

        if (ctx?.organizationId) {
          this.setOrganization(ctx.organizationId);
        }
      });

    // Escuchar cambios posteriores
    this.organizationContextService.organizationContext$
      .subscribe((ctx: any) => {
        console.log("📌 Contexto cambiado:", ctx);
        if (ctx?.organizationId) {
          this.setOrganization(ctx.organizationId);
        }
      });
  });

  // Cambios de zona → calles
  this.programsForm.get('zoneId')?.valueChanges.subscribe(zoneId => {
    const selectedZone = this.zones.find(z => z.zoneId === zoneId);
    this.streets = (selectedZone?.streets as Street[]) || [];
  });
}

private setOrganization(orgId: string) {
  this.programsForm.patchValue({ organizationId: orgId });
  this.programsForm.get('organizationId')?.disable();

  const selectedOrg = this.organizations.find(o => o.organizationId === orgId);
  this.zones = ((selectedOrg?.zones as unknown) as Zone[]) || [];
}

  private getTodayDateTime(): string {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  } 

private generateProgramCode(): void {
  this.programsService.getAllPrograms().pipe(take(1)).subscribe(programs => {
    // Buscar el mayor número actual
    const maxNumber = programs
      .map((p: any) => parseInt(p.programCode.replace('PRG', ''), 10))
      .filter(n => !isNaN(n) && n <= 20) // Solo contamos hasta el 20
      .reduce((a, b) => Math.max(a, b), 0);

    let nextNumber = maxNumber + 1;

    
    if (nextNumber > 20) {
      nextNumber = 1;
    }

    const code = `PRG${nextNumber.toString().padStart(3, '0')}`;
    this.programsForm.patchValue({ programCode: code });
    this.programsForm.get('programCode')?.disable();
  });
}


  onZoneChange(event: Event): void {
    const zoneId = (event.target as HTMLSelectElement).value;
    this.selectedZoneId = zoneId || null;

    const selectedZone = this.zones.find(z => z.zoneId === zoneId);
    this.filteredStreets = selectedZone?.streets || [];

    this.programsForm.patchValue({ streetId: '' });
  }

  isFormValid(): boolean {
    return this.programsForm.valid;
  }

  getFieldError(fieldName: string): string {
    const field = this.programsForm.get(fieldName);
    if (!field || !field.errors) return '';
    if (field.errors['required']) return 'Este campo es requerido';
    if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
    if (field.errors['pattern']) return 'Formato inválido';
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

    const request$ = this.isEditMode
      ? this.programsService.updateProgram(this.programId!, formData)
      : this.programsService.createProgram(formData);

    request$.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: this.isEditMode ? 'Programa actualizado' : 'Programa creado',
          text: this.isEditMode
            ? 'El programa de distribución se actualizó correctamente.'
            : 'El programa de distribución se creó correctamente.',
        }).then(() => {
          this.router.navigate(['/admin/programs']);
        });
      },
      error: (error) => {
        console.error('❌ Error al guardar programa:', error);
        this.isSubmitting = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al guardar el programa.'
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/programs']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => control.markAsTouched());
  }

  private prepareFormData(): any {
    const raw = this.programsForm.value;

    let formattedDate = raw.programDate;
    if (formattedDate && formattedDate.includes('T')) {
      formattedDate = formattedDate.split('T')[0];
    }

    let streets = raw.streetId;
    if (!Array.isArray(streets)) {
      streets = streets ? [streets] : [];
    }

    return {
      ...raw,
      programDate: formattedDate,
      streetId: streets
    };
  }

  private loadProgram(): void {
    this.programsService.getProgramById(this.programId!).subscribe({
      next: (program) => {
        this.programsForm.patchValue(program);
        if (program.zoneId) {
          this.filteredStreets = this.streets.filter(s => s.zoneId === program.zoneId);
          this.selectedZoneId = program.zoneId;
        }
        if (this.isViewMode) this.programsForm.disable();
      },
      error: (err) => console.error('Error al cargar programa:', err)
    });
  }

 private loadInitialData(): Observable<any> {
  return forkJoin({
    orgs: this.organizationService.getAllOrganization(),
    routes: this.distributionService.getAllR(),
    schedules: this.distributionService.getAll(),
    users: this.userService.getAllUsers()
  }).pipe(
    tap(({ orgs, routes, schedules, users }) => {
      this.organizations = orgs;
      this.routes = routes;
      this.schedules = schedules;
      this.responsible = users;
    })
  );
}

}
