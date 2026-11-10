// Format number as Kenyan Shillings: KSh 35,000
export function formatKSh(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'KSh 0';
  }
  return 'KSh ' + Math.round(amount).toLocaleString('en-KE');
}

// Format date and time
export function formatDateTime(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Generate unique receipt number
export function generateReceiptNumber(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `ACE-REC-${year}-${randomNum}`;
}

// Generate product code based on category
export function generateProductCode(category: string, currentCount: number): string {
  const prefixes: Record<string, string> = {
    Chains: 'AC-CHN',
    Necklaces: 'AC-NCK',
    Rings: 'AC-RNG',
    Bracelets: 'AC-BRC',
    Earrings: 'AC-ERR',
    Pendants: 'AC-PND',
    Bangles: 'AC-BNG',
    Gold: 'AC-GLD',
    Silver: 'AC-SLV',
  };
  const prefix = prefixes[category] || 'AC-JWL';
  const num = (currentCount + 1).toString().padStart(3, '0');
  return `${prefix}-${num}`;
}

