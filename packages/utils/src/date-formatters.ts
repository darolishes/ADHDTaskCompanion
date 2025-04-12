import { format, formatDistance } from 'date-fns';
import { de } from 'date-fns/locale';

/**
 * Formatiert ein Datum im lesbaren Format
 */
export function formatDate(date: Date | string): string {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd.MM.yyyy');
}

/**
 * Formatiert eine Zeitdauer in Minuten in ein lesbares Format
 */
export function formatTime(minutes: number): string {
  if (!minutes || minutes <= 0) return '0 min';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes} min`;
  } else if (remainingMinutes === 0) {
    return `${hours} h`;
  } else {
    return `${hours} h ${remainingMinutes} min`;
  }
}

/**
 * Formatiert ein Datum relativ zur aktuellen Zeit
 */
export function formatTimeFromNow(date: Date | string): string {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return formatDistance(dateObj, new Date(), { 
    addSuffix: true,
    locale: de
  });
}