export function formatPhone(phone: string | null): string {
  if (!phone) return "";
  // Remove all non-digits
  const digits = phone.replace(/\D/g, "");
  // Ensure it starts with +212
  if (digits.startsWith("212")) return `+${digits}`;
  if (digits.startsWith("0")) return `+212${digits.slice(1)}`;
  return `+212${digits}`;
}

export function getWhatsAppLink(phone: string | null): string {
  return `https://wa.me/${formatPhone(phone)}`;
}

export function getCallLink(phone: string | null): string {
  return `tel:${formatPhone(phone)}`;
}