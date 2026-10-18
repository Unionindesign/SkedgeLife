import { describe, expect, it } from "@jest/globals";
import { errorMessage } from "../errors";

describe("errorMessage", () => {
  // Supabase errors are plain objects, not Error instances.
  it("reads the message from Supabase-style error objects", () => {
    expect(errorMessage({ message: "Row level security violation", code: "42501" })).toBe(
      "Row level security violation",
    );
  });

  it("handles real Errors and anything else", () => {
    expect(errorMessage(new Error("Network down"))).toBe("Network down");
    expect(errorMessage("plain string")).toBe("plain string");
    expect(errorMessage({ message: "" })).toBe("[object Object]");
  });
});
