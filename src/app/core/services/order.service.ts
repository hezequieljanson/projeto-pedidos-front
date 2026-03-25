import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Order, CartItem, Product } from '../models';
import { apiBase } from './api-url.service';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private base = `${apiBase}/orders`;

  // Cart state
  private _cart = signal<CartItem[]>([]);
  readonly cart = this._cart.asReadonly();

  addToCart(product: Product, quantity = 1) {
    this._cart.update((items) => {
      const existing = items.find((i) => i.product.id === product.id);
      if (existing) {
        return items.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
            : i
        );
      }
      return [...items, { product, quantity }];
    });
  }

  removeFromCart(productId: string) {
    this._cart.update((items) => items.filter((i) => i.product.id !== productId));
  }

  updateCartQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    this._cart.update((items) =>
      items.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
  }

  clearCart() {
    this._cart.set([]);
  }

  cartTotal() {
    return this._cart().reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  }

  cartCount() {
    return this._cart().reduce((sum, i) => sum + i.quantity, 0);
  }

  // API
  getOrders() {
    return this.http.get<Order[]>(this.base);
  }

  getOrder(id: string) {
    return this.http.get<Order>(`${this.base}/${id}`);
  }

  createOrder(items: { product_id: string; quantity: number }[]) {
    return this.http.post<Order>(this.base, { items });
  }

  updateOrderStatus(id: string, status: string) {
    return this.http.patch<Order>(`${this.base}/${id}/status`, { status });
  }
}
