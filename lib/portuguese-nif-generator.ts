/**
 * Portuguese NIF (Número de Identificação Fiscal) Generator
 * Generates valid 9-digit Portuguese tax identification numbers
 */

/**
 * Generate a random Portuguese NIF (9 digits)
 * Uses simplified generation for testing/development purposes
 */
export function generatePortugueseNIF(): string {
  // Generate first 8 digits randomly
  let nif = '';
  for (let i = 0; i < 8; i++) {
    nif += Math.floor(Math.random() * 10).toString();
  }

  // Calculate check digit (simplified algorithm)
  const digits = nif.split('').map(Number);
  const weights = [9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;

  for (let i = 0; i < 8; i++) {
    sum += digits[i] * weights[i];
  }

  const remainder = sum % 11;
  const checkDigit = remainder < 2 ? 0 : 11 - remainder;

  return nif + checkDigit.toString();
}

/**
 * Generate multiple Portuguese NIFs
 */
export function generatePortugueseNIFs(count: number): string[] {
  const nifs: string[] = [];
  for (let i = 0; i < count; i++) {
    nifs.push(generatePortugueseNIF());
  }
  return nifs;
}

/**
 * Validate Portuguese NIF format (9 digits)
 */
export function isValidNIFFormat(nif: string): boolean {
  // Basic format validation
  return /^\d{9}$/.test(nif);
}

/**
 * Example usage:
 * const nif = generatePortugueseNIF(); // "123456789"
 * const nifs = generatePortugueseNIFs(5); // ["111111111", "222222222", ...]
 */
