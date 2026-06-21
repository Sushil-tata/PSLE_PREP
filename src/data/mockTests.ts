import type { MockTest } from '../types';

export const mockTests: MockTest[] = [
  {
    id: 'm001',
    title: 'Google Onsite Simulation',
    duration: 90,
    difficulty: 'Hard',
    problems: ['p001', 'p004', 'p009'],
    createdAt: '2024-06-01T00:00:00Z',
    completedAt: '2024-06-01T01:30:00Z',
    score: 67,
  },
  {
    id: 'm002',
    title: 'Facebook Array Blitz',
    duration: 60,
    difficulty: 'Medium',
    problems: ['p001', 'p002', 'p006', 'p015'],
    createdAt: '2024-06-10T00:00:00Z',
    completedAt: '2024-06-10T01:00:00Z',
    score: 75,
  },
  {
    id: 'm003',
    title: 'Amazon Leadership Prep',
    duration: 45,
    difficulty: 'Easy',
    problems: ['p002', 'p003', 'p011'],
    createdAt: '2024-06-15T00:00:00Z',
  },
  {
    id: 'm004',
    title: 'System Design + Coding Mix',
    duration: 120,
    difficulty: 'Hard',
    problems: ['p004', 'p006', 'p010', 'p014'],
    createdAt: '2024-06-18T00:00:00Z',
  },
];
