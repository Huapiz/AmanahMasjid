import bcrypt from "bcryptjs";

// PIN 6 digit numerik. Kita hash pakai bcrypt; PIN plaintext tidak pernah
// disimpan atau dicatat di log (PRD §10).

const SALT_ROUNDS = 10;

export function pinValid(pin: string): boolean {
  return /^\d{6}$/.test(pin);
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, SALT_ROUNDS);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}
