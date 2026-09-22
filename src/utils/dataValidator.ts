import contains from "validator/es/lib/contains";
import isEmail from "validator/es/lib/isEmail";
import matches from "validator/es/lib/matches";
import normalizeEmail from "validator/es/lib/normalizeEmail";

export function validateAndNormalizeData(
  name: string,
  email: string,
): { email: string } | { error: string } {
  if (
    !name ||
    typeof name !== "string" ||
    name.trim().length < 2 ||
    name.length > 50
  ) {
    return { error: "Invalid name format." };
  }

  const normalizedName: string = name.trim();

  if (
    contains(normalizedName, "<") ||
    contains(normalizedName, ">") ||
    contains(normalizedName, "{") ||
    contains(normalizedName, "}")
  ) {
    return { error: "Invalid characters in name." };
  }

  if (!matches(normalizedName, /^[a-zA-ZÀ-ÿ0-9\s.'-]+$/u)) {
    return { error: "Name contains unsupported characters." };
  }

  if (!email || typeof email !== "string" || !isEmail(email)) {
    return { error: "Invalid email address." };
  }

  const normalizedEmail: string | false = normalizeEmail(email);

  if (!normalizedEmail) {
    return { error: "Invalid email format." };
  }

  return { email: normalizedEmail };
}
