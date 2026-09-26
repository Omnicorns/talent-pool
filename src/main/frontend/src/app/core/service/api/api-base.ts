const baseHref = document.querySelector('base')?.getAttribute('href') || '/';
export const APP_BASE = baseHref.replace(/\/$/, '');
export const API_BASE = APP_BASE + '/api';
