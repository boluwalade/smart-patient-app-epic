// Constants for OAuth configuration
export const BASE_URL = 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4';
export const AUTH_URL = 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize'
export const TOKEN_URL = 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token';
export const CLIENT_ID = 'fc1be575-c18a-4c9e-85f4-99fc1facd279';
export const REDIRECT_URL = 'http://127.0.0.1:5173';
export const RESPONSE_TYPE = 'code';
export const SCOPE = 'openid fhirUser';
export const CV_LOCAL_STORAGE_KEY = 'smart_code_verifier';
export const ACCESS_TOKEN_KEY = 'epic_access_token'