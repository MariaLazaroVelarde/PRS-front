import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DistributionProgram } from '../../../../core/models/water-distribution.model';
import { routes as Route, schedules as Schedule } from '../../../../core/models/distribution.model';
import { DistributionService } from '../../../../core/services/distribution.service';
import { UserResponseDTO } from '../../../../core/models/user.model';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
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
  showModal = false;
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

  if (!this.isEditMode) {
  // ✅ Establecer fecha/hora actual en hora de Perú
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const peruTime = new Date(utc - (5 * 60 * 60000)); // UTC-5
  const formattedPeruTime = peruTime.toISOString().slice(0, 16);
  this.programsForm.patchValue({ programDate: formattedPeruTime });
  this.programsForm.get('programDate')?.disable();

  // ✅ Generar código
  this.generateProgramCode();

  // ✅ Tomar organización del contexto
  this.organizationContextService.organizationContext$
    .pipe(take(1))
    .subscribe((ctx: any) => {
      console.log("📌 Contexto inicial:", ctx);
      if (ctx?.organizationId) {
        this.setOrganization(ctx.organizationId);
      }
    });

     // 🔹 Validación: plannedEndTime > plannedStartTime
  this.programsForm.get('plannedEndTime')?.valueChanges.subscribe(endTime => {
    this.validateTime('plannedStartTime', 'plannedEndTime');
  });

  // 🔹 Validación: actualEndTime > actualStartTime
  this.programsForm.get('actualEndTime')?.valueChanges.subscribe(endTime => {
    this.validateTime('actualStartTime', 'actualEndTime');
  });

  this.organizationContextService.organizationContext$
    .subscribe((ctx: any) => {
      console.log("📌 Contexto cambiado:", ctx);
      if (ctx?.organizationId) {
        this.setOrganization(ctx.organizationId);
      }
    });

} else {
  // ✅ En edición, solo cargamos los datos del programa
  this.loadProgram();
}

  });

  // Cambios de zona → calles
  this.programsForm.get('zoneId')?.valueChanges.subscribe(zoneId => {
    const selectedZone = this.zones.find(z => z.zoneId === zoneId);
    this.streets = (selectedZone?.streets as Street[]) || [];
  });
}
private validateTime(startControlName: string, endControlName: string): void {
  const startValue = this.programsForm.get(startControlName)?.value;
  const endValue = this.programsForm.get(endControlName)?.value;

  if (startValue && endValue) {
    const startMinutes = this.toMinutes(startValue);
    const endMinutes = this.toMinutes(endValue);

    if (endMinutes <= startMinutes) {
      this.programsForm.get(endControlName)?.setErrors({ timeInvalid: true });
    } else {
      this.programsForm.get(endControlName)?.setErrors(null);
    }
  }
}

private toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

private setOrganization(orgId: string) {
  const orgControl = this.programsForm.get('organizationId');
  orgControl?.patchValue(orgId, { emitEvent: false });
  orgControl?.disable({ emitEvent: false });

  const selectedOrg = this.organizations.find(o => o.organizationId === orgId);

  // Solo asigna si realmente es un array de zonas
  this.zones = Array.isArray(selectedOrg?.zones)
    ? selectedOrg?.zones as Zone[]
    : [];
}


  private getTodayDateTime(): string {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  } 

  
private generateProgramCode(): void {
  this.programsService.getAllPrograms().pipe(take(1)).subscribe(programs => {
    const usedNumbers = programs
      .map((p: any) => {
        const num = parseInt(p.programCode.replace('PRG', ''), 10);
        return isNaN(num) ? 0 : num;
      })
      .filter(n => n >= 1 && n <= 20);

    let nextNumber = 1;
    if (usedNumbers.length > 0) {
      const maxNumber = Math.max(...usedNumbers);
      nextNumber = maxNumber >= 20 ? 1 : maxNumber + 1;
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
  const raw = this.programsForm.getRawValue(); // Incluye controles deshabilitados

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
      // Asegurar fecha
      if (program.programDate) {
        program.programDate = program.programDate;
      }

      // Formatear horas
      const formatTime = (timeStr: string | null | undefined) =>
        timeStr ? timeStr.substring(0, 5) : '';

      program.plannedStartTime = formatTime(program.plannedStartTime);
      program.plannedEndTime   = formatTime(program.plannedEndTime);
      program.actualStartTime  = formatTime(program.actualStartTime);
      program.actualEndTime    = formatTime(program.actualEndTime);

      // Adaptar streetId si viene como array
      if (Array.isArray(program.streetId)) {
        program.streetId = program.streetId[0] || '';
      }

      // Cargar al formulario
      this.programsForm.patchValue(program);

      // Cargar zonas y calles
      if (program.organizationId) {
        this.setOrganization(program.organizationId);
      }
      if (program.zoneId) {
        this.filteredStreets = this.zones.find(z => z.zoneId === program.zoneId)?.streets || [];
        this.selectedZoneId = program.zoneId;
      }

      // Desactivar formulario en modo vista
      if (this.isViewMode) {
        this.programsForm.disable();
      } else {
        this.programsForm.enable();
      }
    },
    error: (err) => console.error('Error al cargar programa:', err)
  });
}


openProgramModal(programId: string, viewMode: boolean = false): void {
  this.programId = programId;
  this.isViewMode = viewMode;
  this.loadProgram();
  this.showModal = true; // 👈 bandera para mostrar modal
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
