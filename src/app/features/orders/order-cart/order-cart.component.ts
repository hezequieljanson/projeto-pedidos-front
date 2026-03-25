import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-order-cart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyPipe],
  template: `
    <div class="page-narrow">
      <h1 class="page-header__title">Meu Carrinho</h1>

      @if (cart().length === 0) {
        <div class="empty-state">
          <p class="empty-state__icon">🛒</p>
          <p class="empty-state__text">Seu carrinho está vazio</p>
          <a routerLink="/products" class="btn--primary-sm" style="display:inline-flex; width:auto; padding: 0.625rem 1.5rem;">
            Ver produtos
          </a>
        </div>
      } @else {
        <div class="cart-items">
          @for (item of cart(); track item.product.id) {
            <div class="cart-item">
              @if (item.product.image_url) {
                <img [src]="item.product.image_url" [alt]="item.product.name" class="cart-item__img" />
              } @else {
                <div class="cart-item__placeholder">📦</div>
              }
              <div class="cart-item__info">
                <p class="cart-item__name">{{ item.product.name }}</p>
                <p class="cart-item__price">{{ item.product.price | currency:'BRL' }}</p>
              </div>
              <div class="qty-ctrl">
                <button
                  (click)="orderService.updateCartQuantity(item.product.id, item.quantity - 1)"
                  class="btn--icon"
                >-</button>
                <span class="qty-value">{{ item.quantity }}</span>
                <button
                  (click)="orderService.updateCartQuantity(item.product.id, item.quantity + 1)"
                  [disabled]="item.quantity >= item.product.stock"
                  class="btn--icon"
                >+</button>
              </div>
              <p class="cart-item__total">{{ item.product.price * item.quantity | currency:'BRL' }}</p>
              <button
                (click)="orderService.removeFromCart(item.product.id)"
                class="cart-item__remove"
              >✕</button>
            </div>
          }
        </div>

        <div class="cart-summary">
          <div class="cart-summary__total">
            <span>Total</span>
            <span>{{ orderService.cartTotal() | currency:'BRL' }}</span>
          </div>

          @if (error()) {
            <div class="alert alert--error">{{ error() }}</div>
          }

          <button (click)="checkout()" [disabled]="loading()" class="btn--primary">
            {{ loading() ? 'Finalizando...' : 'Finalizar pedido' }}
          </button>
        </div>
      }
    </div>
  `,
})
export class OrderCartComponent {
  orderService = inject(OrderService);
  private router = inject(Router);

  cart = this.orderService.cart;
  loading = signal(false);
  error = signal('');

  async checkout() {
    const items = this.cart().map(i => ({ product_id: i.product.id, quantity: i.quantity }));
    this.loading.set(true);
    this.error.set('');
    this.orderService.createOrder(items).subscribe({
      next: (order) => {
        this.orderService.clearCart();
        this.router.navigate(['/orders', order.id]);
      },
      error: (e) => {
        this.error.set(e.error?.message || 'Erro ao finalizar pedido');
        this.loading.set(false);
      },
    });
  }
}
