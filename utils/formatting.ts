// utils/formatting.ts
export const formatCurrency = (amount: number, currency: string = 'FCFA'): string => {
  return `${amount.toLocaleString('fr-FR')} ${currency}`;
};

export const formatDate = (date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  let options: Intl.DateTimeFormatOptions;

  switch (format) {
    case 'short':
      options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      break;
    case 'long':
      options = { day: 'numeric', month: 'long', year: 'numeric' };
      break;
    case 'time':
      options = { hour: '2-digit', minute: '2-digit' };
      break;
    default:
      options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  }

  return dateObj.toLocaleDateString('fr-FR', options);
};

export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
};

export const formatTimeAgo = (date: string | Date): string => {
  const now = new Date();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return 'À l\'instant';
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
  if (diffInSeconds < 2592000) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;

  return formatDate(dateObj, 'short');
};