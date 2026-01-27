import type { HttpMethod, BodyType, KeyValue } from '@/types';

export const HTTP_METHODS: HttpMethod[] = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
];

export const BODY_TYPES: { value: BodyType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'form-data', label: 'Form Data' },
  { value: 'x-www-form-urlencoded', label: 'x-www-form-urlencoded' },
  { value: 'raw', label: 'Raw' },
  { value: 'binary', label: 'Binary' },
];

export const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'text-green-500',
  POST: 'text-yellow-500',
  PUT: 'text-blue-500',
  PATCH: 'text-purple-500',
  DELETE: 'text-red-500',
  HEAD: 'text-gray-500',
  OPTIONS: 'text-gray-500',
};

export const STATUS_COLORS = {
  success: 'text-green-500 bg-green-500/10', // 2xx
  redirect: 'text-yellow-500 bg-yellow-500/10', // 3xx
  clientError: 'text-orange-500 bg-orange-500/10', // 4xx
  serverError: 'text-red-500 bg-red-500/10', // 5xx
};

export function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return STATUS_COLORS.success;
  if (status >= 300 && status < 400) return STATUS_COLORS.redirect;
  if (status >= 400 && status < 500) return STATUS_COLORS.clientError;
  return STATUS_COLORS.serverError;
}

export const DEFAULT_HEADERS: KeyValue[] = [
  { key: 'User-Agent', value: 'PingIT/1.0', enabled: true },
  { key: 'Accept', value: '*/*', enabled: true },
  { key: 'Accept-Encoding', value: 'gzip, deflate, br', enabled: true },
  { key: 'Connection', value: 'keep-alive', enabled: true },
];

export const EMPTY_KEY_VALUE: KeyValue = {
  key: '',
  value: '',
  enabled: true,
};

// Max tabs to keep in memory
export const MAX_TABS_IN_MEMORY = 24;
