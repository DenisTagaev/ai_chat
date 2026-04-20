describe("pino-logger", () => {
    const ORIGINAL_ENV: NodeJS.ProcessEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...ORIGINAL_ENV };
    });

    afterAll(() => {
        process.env = ORIGINAL_ENV;
    });

    it("should set logger level to silent in test env", () => {
        process.env.NODE_ENV = "test";

        const { logger } = require("../../utils/logger");

        expect(logger.level).toBe("silent");
    });

    it("should set logger level to debug in development env", () => {
        process.env.NODE_ENV = "development";

        const { logger } = require("../../utils/logger");

        expect(logger.level).toBe("debug");
    });

    it("should set logger level to info in production env", () => {
        process.env.NODE_ENV = "production";

        const { logger } = require("../../utils/logger");

        expect(logger.level).toBe("info");
    });

    it("should not crash in test env without a transport", () => {
        process.env.NODE_ENV = "test";

        expect(() => {
            require("../../utils/logger");
        }).not.toThrow();
    });

    it("should initialize in development with pretty transport", () => {
        process.env.NODE_ENV = "development";

        expect(() => {
            require("../../utils/logger");
        }).not.toThrow();
    });

    it("should initialize in production with logtail transport", () => {
        process.env.NODE_ENV = "production";
        process.env.LOGTAIL_SOURCE_TOKEN = "test-token";

        expect(() => {
            require("../../utils/logger");
        }).not.toThrow();
    });
});