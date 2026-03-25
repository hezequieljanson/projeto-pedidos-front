import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private platformId = inject(PLATFORM_ID);
  private _client: SupabaseClient | null = null;

  get client(): SupabaseClient {
    if (!this._client) {
      this._client = createClient(environment.supabaseUrl, environment.supabaseAnonKey, {
        auth: {
          persistSession: isPlatformBrowser(this.platformId),
          detectSessionInUrl: isPlatformBrowser(this.platformId),
        },
      });
    }
    return this._client;
  }

  async getSession(): Promise<Session | null> {
    if (!isPlatformBrowser(this.platformId)) return null;
    const { data } = await this.client.auth.getSession();
    return data.session;
  }

  async getUser(): Promise<User | null> {
    const session = await this.getSession();
    return session?.user ?? null;
  }

  async signUp(email: string, password: string, name: string) {
    return this.client.auth.signUp({ email, password, options: { data: { name } } });
  }

  async signIn(email: string, password: string) {
    return this.client.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return this.client.auth.signOut();
  }

  onAuthStateChange(callback: (session: Session | null) => void) {
    if (!isPlatformBrowser(this.platformId)) return { data: { subscription: { unsubscribe: () => {} } } };
    return this.client.auth.onAuthStateChange((_, session) => callback(session));
  }
}
