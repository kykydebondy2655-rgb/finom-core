/**
 * Generates a cryptographically secure random password
 * Meeting requirements: 12+ chars, uppercase, lowercase, digits, special chars
 * Uses crypto.getRandomValues for true cryptographic randomness
 */
export function generateSecurePassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = uppercase + lowercase + digits + special;
  
  // Use crypto for secure random number generation
  const getSecureRandomIndex = (max: number): number => {
    const randomArray = new Uint32Array(1);
    crypto.getRandomValues(randomArray);
    return randomArray[0] % max;
  };
  
  // Ensure at least one of each required character type
  const password: string[] = [
    uppercase[getSecureRandomIndex(uppercase.length)],
    lowercase[getSecureRandomIndex(lowercase.length)],
    digits[getSecureRandomIndex(digits.length)],
    special[getSecureRandomIndex(special.length)]
  ];
  
  // Fill the rest with random characters
  for (let i = password.length; i < length; i++) {
    password.push(allChars[getSecureRandomIndex(allChars.length)]);
  }
  
  // Shuffle the password array using Fisher-Yates with crypto
  for (let i = password.length - 1; i > 0; i--) {
    const j = getSecureRandomIndex(i + 1);
    [password[i], password[j]] = [password[j], password[i]];
  }
  
  return password.join('');
}

/**
 * Generate a more user-friendly temporary password
 * Still secure but easier to type on first login
 */
export function generateTempPassword(): string {
  // Generate a 14-character password
  return generateSecurePassword(14);
}
