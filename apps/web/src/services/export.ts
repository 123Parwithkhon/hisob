import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export interface ExportTransaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  date: string;
  category?: { name: string };
  currency?: string;
  place?: string;
  comment?: string;
}

export interface ExportOptions {
  transactions: ExportTransaction[];
  filename?: string;
  includeStats?: boolean;
}

export function exportToExcel({ transactions, filename, includeStats = true }: ExportOptions) {
  // Форматируем данные для экспорта
  const formattedData = transactions.map((t) => ({
  'Дата': format(new Date(t.date), 'dd.MM.yyyy'),
  'Тип': t.type === 'INCOME' ? 'Доход' : 'Расход',
  'Сумма': t.amount,
  'Валюта': t.currency || 'PLN', // <-- Добавь fallback
  'Категория': t.category?.name || 'Без категории',
  'Место': t.place || '',
  'Комментарий': t.comment || '',
  }));

  // Создаём workbook
  const wb = XLSX.utils.book_new();

  // Лист с транзакциями
  const ws = XLSX.utils.json_to_sheet(formattedData);
  
  // Настройка ширины колонок
  ws['!cols'] = [
    { wch: 12 }, // Дата
    { wch: 10 }, // Тип
    { wch: 12 }, // Сумма
    { wch: 8 },  // Валюта
    { wch: 20 }, // Категория
    { wch: 20 }, // Место
    { wch: 30 }, // Комментарий
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Транзакции');

  // Если нужна статистика
  if (includeStats && transactions.length > 0) {
    const totalIncome = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    const statsData = [
      { 'Показатель': 'Общий доход', 'Значение': totalIncome },
      { 'Показатель': 'Общий расход', 'Значение': totalExpense },
      { 'Показатель': 'Баланс', 'Значение': balance },
      { 'Показатель': 'Количество операций', 'Значение': transactions.length },
      { 'Показатель': 'Средний доход', 'Значение': totalIncome / transactions.filter((t) => t.type === 'INCOME').length || 0 },
      { 'Показатель': 'Средний расход', 'Значение': totalExpense / transactions.filter((t) => t.type === 'EXPENSE').length || 0 },
    ];

    const statsWs = XLSX.utils.json_to_sheet(statsData);
    statsWs['!cols'] = [{ wch: 25 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, statsWs, 'Статистика');
  }

  // Генерируем имя файла
  const fileName = filename || `hisob-export-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;

  // Скачиваем файл
  XLSX.writeFile(wb, fileName);
}

export function exportMonthReport(transactions: ExportTransaction[], year: number, month: number) {
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const filename = `hisob-report-${year}-${monthNames[month]}.xlsx`;
  exportToExcel({ transactions, filename, includeStats: true });
}