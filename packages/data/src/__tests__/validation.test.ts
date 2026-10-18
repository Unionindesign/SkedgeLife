import { formatPhone, isValidEmail, isValidPhone } from "../validation";

describe("formatPhone", () => {
  it.each([
    ["5", "5"],
    ["555", "555"],
    ["5551", "(555) 1"],
    ["5551234", "(555) 123-4"],
    ["5551234567", "(555) 123-4567"],
    ["+1 555 123 4567", "(555) 123-4567"],
    // Backspacing over punctuation never gets stuck.
    ["(555) 123-", "(555) 123"],
    ["(555) ", "555"],
  ])("%s -> %s", (input, expected) => {
    expect(formatPhone(input)).toBe(expected);
  });

  it("stops at 10 digits", () => {
    expect(formatPhone("55512345678")).toBe("(555) 123-4567");
  });
});

describe("isValidPhone", () => {
  it("accepts 10 digits, with or without a leading 1", () => {
    expect(isValidPhone("(555) 123-4567")).toBe(true);
    expect(isValidPhone("+1 555 123 4567")).toBe(true);
  });
  it("rejects anything else", () => {
    expect(isValidPhone("555123456")).toBe(false);
    expect(isValidPhone("55512345678")).toBe(false);
  });
});

describe("isValidEmail", () => {
  it.each([
    ["name@example.com", true],
    ["a@b.co", true],
    ["a@b", false],
    ["a b@c.com", false],
    ["x@y.c", false],
  ])("%s -> %s", (input, expected) => {
    expect(isValidEmail(input)).toBe(expected);
  });
});
