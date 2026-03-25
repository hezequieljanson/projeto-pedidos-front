import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Product } from '../models';
import { environment } from '../../../environments/environment';

export interface ProductFilters {
  category?: string;
  search?: string;
  price_min?: number;
  price_max?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/products`;

  getProducts(filters: ProductFilters = {}) {
    let params = new HttpParams();
    if (filters.category) params = params.set('category', filters.category);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.price_min != null) params = params.set('price_min', filters.price_min);
    if (filters.price_max != null) params = params.set('price_max', filters.price_max);
    return this.http.get<Product[]>(this.base, { params });
  }

  getProduct(id: string) {
    return this.http.get<Product>(`${this.base}/${id}`);
  }

  createProduct(product: Partial<Product>) {
    return this.http.post<Product>(this.base, product);
  }

  updateProduct(id: string, product: Partial<Product>) {
    return this.http.put<Product>(`${this.base}/${id}`, product);
  }

  deleteProduct(id: string) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
