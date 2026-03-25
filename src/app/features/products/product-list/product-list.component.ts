import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { ProductService, ProductFilters } from '../../../core/services/product.service';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product } from '../../../core/models';

const CATEGORIES = ['Todos', 'Eletrônicos', 'Áudio', 'Periféricos', 'Monitores', 'Móveis', 'Armazenamento'];

@Component({
  selector: 'app-product-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, CurrencyPipe],
  template: `
    <div>
      <div class="page-header">
        <h1 class="page-header__title">Produtos</h1>
        <p class="page-header__subtitle">Encontre os melhores produtos de tecnologia</p>
      </div>

      <!-- Filters -->
      <div class="filters">
        <div class="filters__field">
          <label class="form__label--xs">Buscar</label>
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearchChange()"
            placeholder="Nome do produto..."
            class="form__input"
          />
        </div>
        <div class="filters__field--sm">
          <label class="form__label--xs">Categoria</label>
          <select
            [(ngModel)]="selectedCategory"
            (ngModelChange)="applyFilters()"
            class="form__select"
          >
            @for (cat of categories; track cat) {
              <option [value]="cat">{{ cat }}</option>
            }
          </select>
        </div>
        <div class="filters__field--sm">
          <label class="form__label--xs">Preço mín.</label>
          <input
            type="number"
            [(ngModel)]="priceMin"
            (ngModelChange)="applyFilters()"
            placeholder="0"
            min="0"
            class="form__input--sm"
          />
        </div>
        <div class="filters__field--sm">
          <label class="form__label--xs">Preço máx.</label>
          <input
            type="number"
            [(ngModel)]="priceMax"
            (ngModelChange)="applyFilters()"
            placeholder="9999"
            min="0"
            class="form__input--sm"
          />
        </div>
      </div>

      @if (loading()) {
        <div class="product-grid">
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <div class="skeleton skeleton--card"></div>
          }
        </div>
      } @else if (error()) {
        <div class="state-error">{{ error() }}</div>
      } @else if (products().length === 0) {
        <div class="state-empty">Nenhum produto encontrado</div>
      } @else {
        <div class="product-grid">
          @for (product of products(); track product.id) {
            <div class="product-card">
              <a [routerLink]="['/products', product.id]" class="block">
                <div class="product-card__image">
                  @if (product.image_url) {
                    <img [src]="product.image_url" [alt]="product.name" />
                  } @else {
                    <div class="product-card__placeholder">📦</div>
                  }
                </div>
                <div class="product-card__body">
                  <p class="product-card__category">{{ product.category }}</p>
                  <h3 class="product-card__name">{{ product.name }}</h3>
                  <div class="product-card__meta">
                    <span class="product-card__price">{{ product.price | currency:'BRL' }}</span>
                    <span class="product-card__stock">{{ product.stock }} em estoque</span>
                  </div>
                </div>
              </a>
              <div class="product-card__actions">
                <button
                  (click)="addToCart(product)"
                  [disabled]="product.stock === 0"
                  class="btn--primary-sm"
                >
                  {{ product.stock === 0 ? 'Sem estoque' : 'Adicionar ao carrinho' }}
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class ProductListComponent {
  private productService = inject(ProductService);
  private orderService = inject(OrderService);
  auth = inject(AuthService);

  categories = CATEGORIES;
  searchTerm = '';
  selectedCategory = 'Todos';
  priceMin: number | null = null;
  priceMax: number | null = null;

  products = signal<Product[]>([]);
  loading = signal(true);
  error = signal('');

  private searchTimeout: any;

  constructor() {
    this.applyFilters();
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.applyFilters(), 400);
  }

  applyFilters() {
    this.loading.set(true);
    this.error.set('');
    const filters: ProductFilters = {};
    if (this.searchTerm) filters.search = this.searchTerm;
    if (this.selectedCategory !== 'Todos') filters.category = this.selectedCategory;
    if (this.priceMin != null) filters.price_min = this.priceMin;
    if (this.priceMax != null) filters.price_max = this.priceMax;

    this.productService.getProducts(filters).subscribe({
      next: (data) => { this.products.set(data); this.loading.set(false); },
      error: (e) => { this.error.set('Erro ao carregar produtos'); this.loading.set(false); },
    });
  }

  addToCart(product: Product) {
    if (!this.auth.isAuthenticated()) return;
    this.orderService.addToCart(product);
  }
}
