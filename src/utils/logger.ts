import pino from "pino";

const isDevEnv: boolean = process.env.NODE_ENV !== "production";
const isTestEnv: boolean = process.env.NODE_ENV === "test";

function getLogEnv(): string {
    if(isTestEnv) return "silent";
    if(isDevEnv) return "debug";
    return "info";
}

export const logger = pino({
  level: getLogEnv(),
  transport: isDevEnv
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
        },
      }
    : undefined,
});
