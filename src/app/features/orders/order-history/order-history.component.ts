import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-order-history',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, StatusBadgeComponent, CurrencyPipe, DatePipe],
  template: `
    <div>
      <h1 class="page-header__title">Meus Pedidos</h1>

      @if (loading()) {
        <div class="order-list">
          @for (i of [1,2,3]; track i) {
            <div class="skeleton" style="height: 6rem; border-radius: 0.75rem;"></div>
          }
        </div>
      } @else if (orders().length === 0) {
        <div class="empty-state">
          <p class="empty-state__icon">📋</p>
          <p class="empty-state__text">Você ainda não fez nenhum pedido</p>
          <a routerLink="/products" class="btn--primary-sm" style="display:inline-flex; width:auto; padding: 0.625rem 1.5rem;">
            Ver produtos
          </a>
        </div>
      } @else {
        <div class="order-list">
          @for (order of orders(); track order.id) {
            <a [routerLink]="['/orders', order.id]" class="order-card">
              <div class="order-card__layout">
                <div>
                  <p class="order-card__id">#{{ order.id.slice(0, 8).toUpperCase() }}</p>
                  <p class="order-card__total">{{ order.total | currency:'BRL' }}</p>
                  <p class="order-card__date">{{ order.created_at | date:'dd/MM/yyyy HH:mm' }}</p>
                </div>
                <div class="order-card__meta">
                  <span class="order-card__count">{{ order.order_items?.length || 0 }} item(s)</span>
                  <app-status-badge [status]="order.status" />
                  <span class="order-card__arrow">→</span>
                </div>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
})
export class OrderHistoryComponent implements OnInit {
  private orderService = inject(OrderService);
  orders = signal<Order[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.orderService.getOrders().subscribe({
      next: (data) => { this.orders.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
