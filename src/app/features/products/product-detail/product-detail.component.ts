import { Component, inject, signal, input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product } from '../../../core/models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyPipe],
  template: `
    <div>
      <a routerLink="/products" class="back-link">← Voltar aos produtos</a>

      @if (loading()) {
        <div class="skeleton" style="height: 24rem; border-radius: 1rem;"></div>
      } @else if (product()) {
        <div class="product-detail">
          <div class="product-detail__layout">
            <div class="product-detail__image">
              @if (product()!.image_url) {
                <img [src]="product()!.image_url" [alt]="product()!.name" />
              } @else {
                <div class="product-detail__placeholder">📦</div>
              }
            </div>
            <div class="product-detail__body">
              <p class="product-detail__category">{{ product()!.category }}</p>
              <h1 class="product-detail__name">{{ product()!.name }}</h1>
              <p class="product-detail__description">
                {{ product()!.description || 'Sem descrição disponível.' }}
              </p>

              <div class="product-detail__price-row">
                <span class="product-detail__price">{{ product()!.price | currency:'BRL' }}</span>
                <span [class]="product()!.stock > 0 ? 'stock-badge stock-badge--in' : 'stock-badge stock-badge--out'">
                  {{ product()!.stock > 0 ? product()!.stock + ' em estoque' : 'Sem estoque' }}
                </span>
              </div>

              <div class="product-detail__actions">
                <button
                  (click)="addToCart()"
                  [disabled]="product()!.stock === 0 || !auth.isAuthenticated()"
                  class="btn--primary-lg"
                >
                  @if (!auth.isAuthenticated()) { Faça login para comprar }
                  @else if (product()!.stock === 0) { Sem estoque }
                  @else { Adicionar ao carrinho }
                </button>
              </div>

              @if (added()) {
                <p class="success-msg">✓ Adicionado ao carrinho!</p>
              }
            </div>
          </div>
        </div>
      } @else {
        <div class="state-empty">Produto não encontrado.</div>
      }
    </div>
  `,
})
export class ProductDetailComponent implements OnInit {
  id = input.required<string>();

  private productService = inject(ProductService);
  private orderService = inject(OrderService);
  auth = inject(AuthService);

  product = signal<Product | null>(null);
  loading = signal(true);
  added = signal(false);

  ngOnInit() {
    this.productService.getProduct(this.id()).subscribe({
      next: (p) => { this.product.set(p); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  addToCart() {
    const p = this.product();
    if (!p) return;
    this.orderService.addToCart(p);
    this.added.set(true);
    setTimeout(() => this.added.set(false), 2000);
  }
}
