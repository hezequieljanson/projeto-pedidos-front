import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { Order, OrderStatus } from '../../../core/models';

const STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, StatusBadgeComponent, CurrencyPipe, DatePipe],
  template: `
    <div>
      <div class="admin-header">
        <div>
          <h1 class="admin-header__title">Gerenciar Pedidos</h1>
          <a routerLink="/admin/products" class="admin-header__sub">← Produtos</a>
        </div>
      </div>

      @if (loading()) {
        <div class="skeleton" style="height: 16rem; border-radius: 0.75rem;"></div>
      } @else if (orders().length === 0) {
        <div class="table-container" style="padding: 3rem; text-align: center; color: #6b7280;">
          Nenhum pedido encontrado
        </div>
      } @else {
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Data</th>
                <th class="text-right">Total</th>
                <th class="text-center">Status</th>
                <th class="text-center">Alterar Status</th>
              </tr>
            </thead>
            <tbody>
              @for (order of orders(); track order.id) {
                <tr>
                  <td class="font-mono">
                    <a [routerLink]="['/orders', order.id]" class="btn--link">
                      #{{ order.id.slice(0, 8).toUpperCase() }}
                    </a>
                  </td>
                  <td>{{ order.created_at | date:'dd/MM/yy HH:mm' }}</td>
                  <td class="text-right font-medium">{{ order.total | currency:'BRL' }}</td>
                  <td class="text-center">
                    <app-status-badge [status]="order.status" />
                  </td>
                  <td class="text-center">
                    <select
                      [value]="order.status"
                      (change)="changeStatus(order, $event)"
                      class="form__select"
                    >
                      @for (s of statuses; track s) {
                        <option [value]="s">{{ s }}</option>
                      }
                    </select>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class AdminOrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  orders = signal<Order[]>([]);
  loading = signal(true);
  statuses = STATUSES;

  ngOnInit() {
    this.orderService.getOrders().subscribe({
      next: (data) => { this.orders.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  changeStatus(order: Order, event: Event) {
    const status = (event.target as HTMLSelectElement).value as OrderStatus;
    this.orderService.updateOrderStatus(order.id, status).subscribe({
      next: (updated) => {
        this.orders.update(orders => orders.map(o => o.id === updated.id ? updated : o));
      },
    });
  }
}
