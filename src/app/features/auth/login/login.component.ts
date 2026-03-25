import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <h1 class="auth-card__title">Entrar</h1>

        @if (error()) {
          <div class="alert alert--error">{{ error() }}</div>
        }

        <form (ngSubmit)="submit()" class="form__group">
          <div class="form__field">
            <label class="form__label">E-mail</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              class="form__input"
              placeholder="seu@email.com"
            />
          </div>
          <div class="form__field">
            <label class="form__label">Senha</label>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              required
              class="form__input"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" [disabled]="loading()" class="btn--primary">
            {{ loading() ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <p class="auth-card__footer">
          Não tem conta?
          <a routerLink="/register" class="link">Cadastre-se</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  async submit() {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set('');
    try {
      await this.auth.signIn(this.email, this.password);
    } catch (err: any) {
      this.error.set(err.message || 'Erro ao fazer login');
    } finally {
      this.loading.set(false);
    }
  }
}
