import * as XLSX from 'xlsx';
import type { AdminHealer, AdminSeeker } from './users';

const formatDate = (value: string | null) => {
  if (!value) return '';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
};

export const exportHealersCsv = (rows: AdminHealer[]) => {
  const worksheet = XLSX.utils.json_to_sheet(rows.map((row) => ({
    ID: row.id,
    Name: row.name,
    Email: row.email,
    Subscription: row.subscription,
    Status: row.status,
    TotalEarnedUSD: row.totalEarned,
    JoinedDate: formatDate(row.joinedDate),
    Location: row.location || '',
    Rating: row.rating ?? '',
    ReviewCount: row.reviewCount ?? '',
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Healers');
  XLSX.writeFile(workbook, 'ultrahealers-healers.csv', { bookType: 'csv' });
};

export const exportSeekersCsv = (rows: AdminSeeker[]) => {
  const worksheet = XLSX.utils.json_to_sheet(rows.map((row) => ({
    ID: row.id,
    Name: row.name,
    Email: row.email,
    Status: row.status,
    TotalSpentUSD: row.totalSpent,
    JoinedDate: formatDate(row.joinedDate),
    Location: row.location || '',
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Seekers');
  XLSX.writeFile(workbook, 'ultrahealers-seekers.csv', { bookType: 'csv' });
};
