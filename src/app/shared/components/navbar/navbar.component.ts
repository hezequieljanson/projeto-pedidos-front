import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="navbar__container">
        <a routerLink="/" class="navbar__brand">ShopCloud</a>

        <div class="navbar__links">
          <a routerLink="/products" routerLinkActive="is-active" class="navbar__link">
            Produtos
          </a>

          @if (auth.isAuthenticated()) {
            <a routerLink="/cart" class="navbar__link">
              Carrinho
              @if (cartCount() > 0) {
                <span class="navbar__badge">{{ cartCount() }}</span>
              }
            </a>
            <a routerLink="/orders" routerLinkActive="is-active" class="navbar__link">
              Pedidos
            </a>
            @if (auth.isAdmin()) {
              <a routerLink="/admin" routerLinkActive="is-active" class="navbar__link">
                Admin
              </a>
            }
            <button (click)="signOut()" class="btn--nav">Sair</button>
          } @else {
            <a routerLink="/login" routerLinkActive="is-active" class="navbar__link">
              Entrar
            </a>
            <a routerLink="/register" class="btn--nav-outline">Cadastrar</a>
          }
        </div>
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  auth = inject(AuthService);
  private orders = inject(OrderService);

  cartCount() {
    return this.orders.cartCount();
  }

  signOut() {
    this.auth.signOut();
  }
}
