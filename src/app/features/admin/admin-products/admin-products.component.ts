import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, CurrencyPipe],
  template: `
    <div>
      <div class="admin-header">
        <div>
          <h1 class="admin-header__title">Gerenciar Produtos</h1>
          <a routerLink="/admin/orders" class="admin-header__sub">Ver pedidos →</a>
        </div>
        <button (click)="openForm()" class="btn--primary-sm" style="width:auto;">+ Novo produto</button>
      </div>

      @if (showForm()) {
        <div class="modal-overlay">
          <div class="modal">
            <h2 class="modal__title">{{ editing() ? 'Editar' : 'Novo' }} Produto</h2>
            <form (ngSubmit)="saveProduct()" class="form__group">
              <input [(ngModel)]="form.name" name="name" placeholder="Nome *" required class="form__input" />
              <textarea [(ngModel)]="form.description" name="description" placeholder="Descrição" rows="2" class="form__input"></textarea>
              <div class="form__row">
                <input [(ngModel)]="form.price" name="price" type="number" step="0.01" placeholder="Preço *" required class="form__input" />
                <input [(ngModel)]="form.stock" name="stock" type="number" placeholder="Estoque *" required class="form__input" />
              </div>
              <input [(ngModel)]="form.category" name="category" placeholder="Categoria *" required class="form__input" />
              <input [(ngModel)]="form.image_url" name="image_url" placeholder="URL da imagem" class="form__input" />
              @if (formError()) {
                <div class="alert alert--error">{{ formError() }}</div>
              }
              <div class="modal__actions">
                <button type="button" (click)="showForm.set(false)" class="btn--secondary">Cancelar</button>
                <button type="submit" [disabled]="saving()" class="btn--primary" style="flex:1;">
                  {{ saving() ? 'Salvando...' : 'Salvar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      @if (loading()) {
        <div class="skeleton" style="height: 16rem; border-radius: 0.75rem;"></div>
      } @else {
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th class="text-right">Preço</th>
                <th class="text-right">Estoque</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (product of products(); track product.id) {
                <tr>
                  <td class="font-medium">{{ product.name }}</td>
                  <td>{{ product.category }}</td>
                  <td class="text-right">{{ product.price | currency:'BRL' }}</td>
                  <td class="text-right">
                    <span [class]="product.stock > 0 ? 'text--success' : 'text--danger'">
                      {{ product.stock }}
                    </span>
                  </td>
                  <td class="text-right">
                    <button (click)="editProduct(product)" class="btn--link" style="margin-right:0.75rem;">Editar</button>
                    <button (click)="deleteProduct(product.id)" class="btn--link-danger">Excluir</button>
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
export class AdminProductsComponent implements OnInit {
  private productService = inject(ProductService);

  products = signal<Product[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editing = signal<string | null>(null);
  saving = signal(false);
  formError = signal('');

  form = { name: '', description: '', price: 0, stock: 0, category: '', image_url: '' };

  ngOnInit() { this.load(); }

  load() {
    this.productService.getProducts().subscribe({
      next: (data) => { this.products.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openForm() {
    this.form = { name: '', description: '', price: 0, stock: 0, category: '', image_url: '' };
    this.editing.set(null);
    this.formError.set('');
    this.showForm.set(true);
  }

  editProduct(p: Product) {
    this.form = { name: p.name, description: p.description || '', price: p.price, stock: p.stock, category: p.category, image_url: p.image_url || '' };
    this.editing.set(p.id);
    this.formError.set('');
    this.showForm.set(true);
  }

  saveProduct() {
    this.saving.set(true);
    this.formError.set('');
    const obs = this.editing()
      ? this.productService.updateProduct(this.editing()!, this.form)
      : this.productService.createProduct(this.form);

    obs.subscribe({
      next: () => { this.showForm.set(false); this.saving.set(false); this.load(); },
      error: (e) => { this.formError.set(e.error?.message || 'Erro ao salvar'); this.saving.set(false); },
    });
  }

  deleteProduct(id: string) {
    if (!confirm('Confirma exclusão?')) return;
    this.productService.deleteProduct(id).subscribe({ next: () => this.load() });
  }
}
