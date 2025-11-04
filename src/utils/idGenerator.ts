import crypto from "crypto";

export default function generateUserId(email: string): string {
  const hash = crypto
    .createHash("sha1")
    .update(email)
    .digest("hex")
    .slice(0, 10);
  return `usr_${hash}`;
}
