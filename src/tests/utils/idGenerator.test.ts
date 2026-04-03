import generateUserId from "../../utils/idGenerator";

describe("generateUserId", () => {
  it("should generate consistent ID for the same email", () => {
    const id1: string = generateUserId("test@mail.com");
    const id2: string = generateUserId("test@mail.com");

    expect(id1).toBe(id2);
  });

  it("should generate different IDs for different emails", () => {
    const id1: string = generateUserId("a@mail.com");
    const id2: string = generateUserId("b@mail.com");

    expect(id1).not.toBe(id2);
  });

  it("should have correct prefix", () => {
    const id: string = generateUserId("test@mail.com");
    expect(id.startsWith("usr_")).toBe(true);
  });

  it("should have correct length", () => {
    const id: string = generateUserId("test@mail.com");
    expect(id.length).toBe(14);
  });

  it("should contain only hex characters after prefix", () => {
    const hashPart: string = generateUserId("test@mail.com").replace("usr_", "");
    expect(hashPart).toMatch(/^[a-f0-9]{10}$/);
  });

  it("should be case-sensitive (different emails produce different IDs)", () => {
    const lower: string = generateUserId("test@mail.com");
    const upper: string = generateUserId("TEST@mail.com");

    expect(lower).not.toBe(upper);
  });
});
