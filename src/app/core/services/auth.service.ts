import { Injectable, signal, computed, inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Session } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { Profile } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  private http = inject(HttpClient);

  private _session = signal<Session | null>(null);
  private _profile = signal<Profile | null>(null);
  private _loading = signal(true);

  readonly session = this._session.asReadonly();
  readonly profile = this._profile.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly isAuthenticated = computed(() => !!this._session());
  readonly isAdmin = computed(() => this._profile()?.role === 'admin');

  private subscription: { unsubscribe: () => void } | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    const session = await this.supabase.getSession();
    this._session.set(session);
    if (session) await this.loadProfile();
    this._loading.set(false);

    const { data } = this.supabase.onAuthStateChange(async (session) => {
      this._session.set(session);
      if (session) {
        await this.loadProfile();
      } else {
        this._profile.set(null);
      }
    });
    this.subscription = data.subscription;
  }

  private async loadProfile() {
    try {
      const profile = await firstValueFrom(
        this.http.get<{ profile: Profile }>(`${environment.apiUrl}/api/me`)
      );
      this._profile.set(profile.profile);
    } catch {
      this._profile.set(null);
    }
  }

  async signUp(email: string, password: string, name: string) {
    const { error } = await this.supabase.signUp(email, password, name);
    if (error) throw error;
  }

  async signIn(email: string, password: string) {
    const { error } = await this.supabase.signIn(email, password);
    if (error) throw error;
    await this.router.navigate(['/products']);
  }

  async signOut() {
    await this.supabase.signOut();
    this._session.set(null);
    this._profile.set(null);
    await this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._session()?.access_token ?? null;
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
