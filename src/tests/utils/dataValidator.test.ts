import { validateAndNormalizeData } from "../../utils/dataValidator";

describe("validateAndNormalizeData", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });
  // -----------------------------
  // NAME VALIDATION
  // -----------------------------
  it("should fail if name is empty", () => {
    const result:
      | {
          email: string;
        }
      | {
          error: string;
        } = validateAndNormalizeData("", "test@mail.com");

    expect(result).toEqual({ error: "Invalid name format." });
  });

  it("should fail if name is too short", () => {
    const result:
      | {
          email: string;
        }
      | {
          error: string;
        } = validateAndNormalizeData("A", "test@mail.com");

    expect(result).toEqual({ error: "Invalid name format." });
  });

  it("should fail if name is too long", () => {
    const longName: string = "A".repeat(51);

    const result:
      | {
          email: string;
        }
      | {
          error: string;
        } = validateAndNormalizeData(longName, "test@mail.com");

    expect(result).toEqual({ error: "Invalid name format." });
  });

  it.each(["John_Doe", "John@Doe", "John#123", "John🙂"])(
    "should fail for unsupported characters in name: %s",
    (invalidName) => {
      const result:
        | {
            email: string;
          }
        | {
            error: string;
          } = validateAndNormalizeData(invalidName, "test@mail.com");

      expect(result).toEqual({
        error: "Name contains unsupported characters.",
      });
    },
  );

  it("should fail if name contains forbidden characters", () => {
    const result:
      | {
          email: string;
        }
      | {
          error: string;
        } = validateAndNormalizeData(">Test<", "test@mail.com");

    expect(result).toEqual({ error: "Invalid characters in name." });
  });

  it("should accept valid name with accents and punctuation", () => {
    const result:
      | {
          email: string;
        }
      | {
          error: string;
        } = validateAndNormalizeData("Jean-Luc O'Neil", "test@mail.com");

    expect(result).toEqual({
      email: expect.any(String),
    });
  });

  // -----------------------------
  // EMAIL VALIDATION
  // -----------------------------
  it("should fail if email is invalid", () => {
    const result:
      | {
          email: string;
        }
      | {
          error: string;
        } = validateAndNormalizeData("Test", "invalid-email");

    expect(result).toEqual({
      error: "Invalid email address.",
    });
  });

  it("should normalize email correctly", () => {
    const result:
      | {
          email: string;
        }
      | {
          error: string;
        } = validateAndNormalizeData("Test", "TEST@MAIL.COM");

    expect(result).toEqual({
      email: "test@mail.com",
    });
  });

  it("should fail if normalizeEmail returns false", () => {
    jest.spyOn(require("validator"), "normalizeEmail").mockReturnValue(false);

    const result:
      | {
          email: string;
        }
      | {
          error: string;
        } = validateAndNormalizeData("Test", "test@mail.com");

    expect(result).toEqual({
      error: "Invalid email format.",
    });

  });

  it("should return normalized email for valid input", () => {
    const result:
      | {
          email: string;
        }
      | {
          error: string;
        } = validateAndNormalizeData("Test", "Test@Mail.com");

    expect(result).toEqual({
      email: "test@mail.com",
    });
  });
});