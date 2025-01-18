export function formatDate(date: string | Date | null): string {
  if (!date) return 'N/A';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(d);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
}

export function isValidDate(date: string | Date | null): boolean {
  if (!date) return false;
  
  try {
    const d = new Date(date);
    return !isNaN(d.getTime());
  } catch {
    return false;
  }
}