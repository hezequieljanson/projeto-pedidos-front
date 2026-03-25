import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <h1 class="auth-card__title">Criar conta</h1>

        @if (error()) {
          <div class="alert alert--error">{{ error() }}</div>
        }

        @if (success()) {
          <div class="alert alert--success">
            Conta criada! Verifique seu e-mail para confirmar o cadastro.
          </div>
        }

        <form (ngSubmit)="submit()" class="form__group">
          <div class="form__field">
            <label class="form__label">Nome</label>
            <input
              type="text"
              [(ngModel)]="name"
              name="name"
              required
              class="form__input"
              placeholder="Seu nome"
            />
          </div>
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
              minlength="6"
              class="form__input"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <button type="submit" [disabled]="loading() || success()" class="btn--primary">
            {{ loading() ? 'Cadastrando...' : 'Criar conta' }}
          </button>
        </form>

        <p class="auth-card__footer">
          Já tem conta?
          <a routerLink="/login" class="link">Entrar</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');
  success = signal(false);

  async submit() {
    if (!this.name || !this.email || !this.password) return;
    this.loading.set(true);
    this.error.set('');
    try {
      await this.auth.signUp(this.email, this.password, this.name);
      this.success.set(true);
      setTimeout(() => this.router.navigate(['/login']), 3000);
    } catch (err: any) {
      this.error.set(err.message || 'Erro ao criar conta');
    } finally {
      this.loading.set(false);
    }
  }
}
