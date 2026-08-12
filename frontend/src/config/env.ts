// Centralized Environment & AWS Configuration

export const ENV = {
  AWS_REGION: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  COGNITO_USER_POOL_ID: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'us-east-1_rYRuOFH4g',
  COGNITO_CLIENT_ID: import.meta.env.VITE_COGNITO_CLIENT_ID || '1bq21hg193purcarvv759to3k',
  COGNITO_AUTHORITY: import.meta.env.VITE_COGNITO_AUTHORITY || 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_rYRuOFH4g',
  COGNITO_DOMAIN: import.meta.env.VITE_COGNITO_DOMAIN || 'https://us-east-1ryruofh4g.auth.us-east-1.amazoncognito.com',
  COGNITO_REDIRECT_URI: import.meta.env.VITE_COGNITO_REDIRECT_URI || 'http://localhost:5173/auth/callback',
  COGNITO_LOGOUT_URI: import.meta.env.VITE_COGNITO_LOGOUT_URI || 'http://localhost:5173/',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://857hwv0wg2.execute-api.us-east-1.amazonaws.com',
};

export const FALLBACK_CONTACT = {
  name: 'AWS Student Builder Group',
  role: 'Official Campus Chapter Leadership',
  email: 'aws-student-builders@amazon.com',
  phone: 'AWS Builder Support',
  message: 'I could not find that in the official club documents. Please reach out to the AWS Student Builder Group team for assistance.'
};
