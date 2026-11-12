import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  // [Todo] Add env file for backend endpoint
  input: 'http://localhost:8080/openapi.yml',                     
  output: './src/services/apis/notification-apis',
  plugins: [
    '@hey-api/client-axios',
    // `enums: 'javascript'` also emits runtime objects for schema enums
    // (e.g. `NotificationSeverity`), so the UI can list values from the API
    { name: '@hey-api/typescript', enums: 'javascript' },
    '@hey-api/sdk',
  ],
});