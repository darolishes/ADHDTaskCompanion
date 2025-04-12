/**
 * Kombiniert CSS-Klassennamen (Legacy-Funktion, besser cn aus dem UI-Paket verwenden)
 */
export function cx(...classes: (string | undefined | null | false | 0)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Extrahiert die Initialen aus einem Namen
 */
export function getInitials(name: string): string {
  if (!name) return '';
  
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '';
  
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Kürzt einen Text auf eine maximale Länge
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
}

/**
 * Generiert eine zufällige ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Generiert einen zufälligen Motivationsspruch
 */
export function getRandomQuote(): string {
  const quotes = [
    "Konzentriere dich auf den nächsten Schritt, nicht auf die ganze Treppe.",
    "Erfolg besteht aus kleinen Gewohnheiten, die täglich wiederholt werden.",
    "Jede Minute, die in Organisation investiert wird, spart eine Stunde Arbeit.",
    "Fortschritt ist besser als Perfektion.",
    "Tu heute etwas, wofür dein zukünftiges Ich dir danken wird.",
    "Auch ein kleiner Schritt bringt dich dem Ziel näher.",
    "Achte auf deine Gedanken, sie werden zu Handlungen.",
    "Der wichtigste Schritt ist der erste.",
    "Selbstfürsorge ist keine Selbstsucht.",
    "Jede Reise beginnt mit einem Schritt."
  ];
  
  return quotes[Math.floor(Math.random() * quotes.length)];
}