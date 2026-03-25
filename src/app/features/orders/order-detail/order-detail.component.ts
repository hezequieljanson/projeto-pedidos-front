import { Component, inject, signal, input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, StatusBadgeComponent, CurrencyPipe, DatePipe],
  template: `
    <div class="page-narrow">
      <a routerLink="/orders" class="back-link">← Meus pedidos</a>

      @if (loading()) {
        <div class="skeleton" style="height: 16rem; border-radius: 1rem;"></div>
      } @else if (order()) {
        <div class="order-detail">
          <div class="order-detail__header">
            <div>
              <p class="order-detail__id">Pedido #{{ order()!.id.slice(0, 8).toUpperCase() }}</p>
              <p class="order-detail__date">{{ order()!.created_at | date:'dd/MM/yyyy HH:mm' }}</p>
            </div>
            <app-status-badge [status]="order()!.status" />
          </div>

          <div class="timeline">
            @for (step of statusSteps; track step.key) {
              <div class="timeline__step">
                <div class="timeline__node">
                  <div [class]="'timeline__dot ' + (isCompleted(step.key) ? 'timeline__dot--active' : 'timeline__dot--inactive')">
                    {{ step.icon }}
                  </div>
                  <span class="timeline__label">{{ step.label }}</span>
                </div>
                @if (!$last) {
                  <div [class]="'timeline__line ' + (isCompleted(step.key) ? 'timeline__line--active' : 'timeline__line--inactive')"></div>
                }
              </div>
            }
          </div>

          <h3 class="order-items-title">Itens do pedido</h3>
          <div class="order-items">
            @for (item of order()!.order_items; track item.id) {
              <div class="order-item">
                @if (item.products?.image_url) {
                  <img [src]="item.products!.image_url" [alt]="item.products!.name" class="order-item__img" />
                }
                <div class="order-item__info">
                  <p class="order-item__name">{{ item.products?.name || 'Produto' }}</p>
                  <p class="order-item__qty">{{ item.quantity }}x {{ item.unit_price | currency:'BRL' }}</p>
                </div>
                <p class="order-item__total">{{ item.quantity * item.unit_price | currency:'BRL' }}</p>
              </div>
            }
          </div>

          <div class="order-footer">
            <span>Total</span>
            <span>{{ order()!.total | currency:'BRL' }}</span>
          </div>
        </div>
      }
    </div>
  `,
})
export class OrderDetailComponent implements OnInit {
  id = input.required<string>();
  private orderService = inject(OrderService);

  order = signal<Order | null>(null);
  loading = signal(true);

  readonly statusSteps = [
    { key: 'pending', label: 'Pendente', icon: '1' },
    { key: 'processing', label: 'Processando', icon: '2' },
    { key: 'shipped', label: 'Enviado', icon: '3' },
    { key: 'delivered', label: 'Entregue', icon: '4' },
  ];

  readonly statusOrder = ['pending', 'processing', 'shipped', 'delivered'];

  isCompleted(step: string) {
    const current = this.order()?.status;
    if (current === 'cancelled') return false;
    return this.statusOrder.indexOf(current!) >= this.statusOrder.indexOf(step);
  }

  ngOnInit() {
    this.orderService.getOrder(this.id()).subscribe({
      next: (data) => { this.order.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
