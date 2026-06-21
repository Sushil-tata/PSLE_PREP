import type { RevisionEntry } from '../types';

export const revisionEntries: RevisionEntry[] = [
  {
    id: 'r001',
    problemId: 'p006',
    scheduledDate: '2024-06-22T00:00:00Z',
    completed: false,
    priority: 'High',
  },
  {
    id: 'r002',
    problemId: 'p014',
    scheduledDate: '2024-06-22T00:00:00Z',
    completed: false,
    priority: 'High',
  },
  {
    id: 'r003',
    problemId: 'p005',
    scheduledDate: '2024-06-23T00:00:00Z',
    completed: false,
    priority: 'Medium',
  },
  {
    id: 'r004',
    problemId: 'p007',
    scheduledDate: '2024-06-23T00:00:00Z',
    completed: true,
    priority: 'Medium',
  },
  {
    id: 'r005',
    problemId: 'p009',
    scheduledDate: '2024-06-24T00:00:00Z',
    completed: false,
    priority: 'High',
  },
  {
    id: 'r006',
    problemId: 'p004',
    scheduledDate: '2024-06-25T00:00:00Z',
    completed: false,
    priority: 'Low',
  },
];
