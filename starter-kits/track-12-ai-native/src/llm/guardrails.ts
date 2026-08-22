const BLOCKED_PATTERNS = [
  /\b(drop\s+table|delete\s+from|truncate)\b/i,
  /\b(password|secret|api[_-]?key)\s*[:=]/i,
];

const PII_PATTERNS = [
  /\b\d{3}-\d{2}-\d{4}\b/,  // SSN
  /\b\d{16}\b/,              // Credit card
  /\b[\w.-]+@[\w.-]+\.\w+\b/, // Email
];

export function validateOutput(output: string): { valid: boolean; violations: string[] } {
  const violations: string[] = [];
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(output)) violations.push(`Blocked pattern detected: ${pattern.source}`);
  }
  for (const pattern of PII_PATTERNS) {
    if (pattern.test(output)) violations.push(`PII detected: ${pattern.source}`);
  }
  return { valid: violations.length === 0, violations };
}
