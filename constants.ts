import { Client, Service } from './types';

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Naya Studio',
    email: 'contact@nayastudio.com',
    phone: '08123456789',
    address: 'Jl. Pemuda No. 123, Semarang, Indonesia',
  },
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 's1',
    name: 'TS - Signature Menu Nov',
    rate: 50000,
  },
  {
    id: 's2',
    name: 'TS - Live Music November',
    rate: 50000,
  },
  {
    id: 's3',
    name: 'Creative Direction',
    rate: 1500000,
  },
];
