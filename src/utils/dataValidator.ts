import validator from "validator";

export function validateAndNormalizeData(
  name: string,
  email: string,
): { email: string }  | { error: string } {
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
    validator.contains(normalizedName, "<") ||
    validator.contains(normalizedName, ">") ||
    validator.contains(normalizedName, "{") ||
    validator.contains(normalizedName, "}")
  ) {
    return { error: "Invalid characters in name." };
  }

  if (!validator.matches(normalizedName, /^[a-zA-ZÀ-ÿ0-9\s.'-]+$/u)) {
    return { error: "Name contains unsupported characters." };
  }

  if (!email || typeof email !== "string" || !validator.isEmail(email)) {
    return { error: "Invalid email address." };
  }

  const normalizedEmail: string | false = validator.normalizeEmail(email);

  if (!normalizedEmail) {
    return { error: "Invalid email format." };
  }

  return { email: normalizedEmail };
}
