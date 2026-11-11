import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  // [Todo] Add env file for backend endpoint
  input: 'http://localhost:8080/openapi.yml',                     
  output: './src/services/apis/notification-apis',
  plugins: ['@hey-api/client-axios', '@hey-api/typescript', '@hey-api/sdk'],
});