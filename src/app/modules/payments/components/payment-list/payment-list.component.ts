import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaymentService } from '../../../../core/services/payment.service';
import { Payment } from '../../../../core/models/payment.model';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './payment-list.component.html',
  styleUrl: './payment-list.component.css'
})
export class PaymentListComponent implements OnInit {
  payments: Payment[] = [];
  filteredPayments: Payment[] = [];
  searchTerm: string = '';
  selectedStatus: string = 'todos';
  loading: boolean = false;

  showAlert: boolean = false;
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' = 'success';

  constructor(
    private paymentService: PaymentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.loading = true;
    this.paymentService.getAllPayments().subscribe({
      next: (payments) => {
        this.payments = payments;
        this.filteredPayments = [...payments];
        //this.extractSectors();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading payments:', error);
        this.showAlertMessage('Error al cargar pagos', 'error');
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    const selected = this.selectedStatus.toLowerCase();
    this.filteredPayments = this.payments.filter(payment => {
      const matchesSearch = this.searchTerm === '' ||
        payment.organizationId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        payment.paymentDate.toLocaleDateString().includes(this.searchTerm.toLowerCase()) ||
        payment.userId.toLowerCase().includes(this.searchTerm.toLowerCase());

      const status = payment.paymentStatus.toLowerCase();

      const matchesStatus = selected === 'todos' || selected === status;

      return matchesSearch && matchesStatus;
    });
  }

  addNewPayment(): void {
    this.router.navigate(['/admin/payments/new']);
  }

  editPayment(paymentId: string): void {
    this.router.navigate(['/admin/payments/edit', paymentId]);
  }

  detailPayment(paymentId: string): void {
    this.router.navigate(['admin/payments/detail', paymentId]);
  }

  /*
    deletePayment(payment: Payment): void {
      if (confirm(`¿Estás seguro de que deseas eliminar a ${this.getFullUser(payment)}?`)) {
        this.paymentService.deletePayment(payment.paymentId).subscribe({
          next: () => {
            //Actualizar el estado del pago localmente
            const paymentIndex = this.payments.findIndex(p => payment.paymentId === payment.paymentId);
            if (paymentIndex !== -1) {
              this.payments[paymentIndex].status = Status.INACTIVE;
            }

            // Cambiar automaticamente al filtro de inactivos
            this.selectedStatus = 'inactivo';
            this.applyFilters();

            this.showAlertMessage(`Pago ${this.getFullUser(payment)} eliminado correctamente`, 'success');
          },
          error: (error) => {
            console.error('Error deleting payment:', error);
            this.showAlertMessage('Error al eliminar pago', 'error');
          }
        });
      }
    }

    restorePayment(payment: Payment): void {
      if (confirm(`¿Deseas restaurar a ${this.getFullUser(payment)}?`)) {
        this.paymentService.restorePayment(payment.paymentId).subscribe({
          next: (updatePayment) => {
            const paymentIndex = this.payments.findIndex(p => p.paymentId === payment.paymentId);

            this.applyFilters();
            this.showAlertMessage(`Pago de ${this.getFullUser(updatePayment)} restaurado correctamente`, 'success');
          },
          error: (error) => {
            console.error('Error restoring payment:', error);
            this.showAlertMessage('Error al restaurar pago', 'error');
          }
        });
      }
    }
  */

  private showAlertMessage(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }

  getFullUser(payment: Payment): string {
    return `${payment.userId}`;
  }

  getPaymentStatusLabel(status: string): string {
    switch (status) {
      case 'PAGADO':
        return 'Pagado';
      case 'PENDIENTE':
        return 'Pendiente';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  }

  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'PAGADO':
        return 'bg-green-100 text-green-800';
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  trackByPaymentsId(index: number, payment: Payment): string {
    return payment.paymentId;
  }

  getCompletoPaymentsCount(): number {
    return this.payments.filter(payment => payment.paymentStatus === 'PAGADO').length;
  }

  getPendientePaymentsCount(): number {
    return this.payments.filter(payment => payment.paymentStatus === 'PENDIENTE').length;
  }

  getCanceladoPaymentsCount(): number {
    return this.payments.filter(payment => payment.paymentStatus === 'CANCELADO').length;
  }
}
