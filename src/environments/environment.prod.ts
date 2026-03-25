export const environment = {
  production: true,
  apiUrl: '',      // Substituído via fileReplacement + CI/CD (VITE_API_URL no Vercel)
  supabaseUrl: '', // Substituído via fileReplacement + CI/CD
  supabaseAnonKey: '',
};
