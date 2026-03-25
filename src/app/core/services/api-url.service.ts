import { environment } from '../../../environments/environment';

function normalizeApiUrl(url: string) {
  return url.replace(/\/+$/, '').replace(/\/api$/i, '');
}

export const apiBase = `${normalizeApiUrl(environment.apiUrl)}/api`;
