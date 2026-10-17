// Contact field checks shared by the app and (later) the website. These are
// basic format checks, not a security boundary; see the "Validation" note in
// docs/plans/2026-10-03-foundation-self-serve-editing.md.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const EMAIL_MAX = 254;

export function isValidEmail(email: string) {
  const trimmed = email.trim();
  return trimmed.length <= EMAIL_MAX && EMAIL_PATTERN.test(trimmed);
}

// US/Canada numbers only for now: 10 digits, with a leading country code 1 dropped.
function phoneDigits(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return (digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits).slice(0, 10);
}

export function isValidPhone(phone: string) {
  return phone.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "").length === 10;
}

// Formats as the user types: 555 → (555) 1 → (555) 123-4567. Punctuation is
// only added once the next group starts, so backspace never gets stuck on it.
export function formatPhone(phone: string) {
  const d = phoneDigits(phone);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}
