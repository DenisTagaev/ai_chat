import { SerializedError } from "./interfaces";

const serializeCause = (cause: unknown): string | undefined => {
  if (cause === undefined) {
    return undefined;
  }

  if (typeof cause === "string") {
    return cause;
  }

  if (cause instanceof Error) {
    return `${cause.name}: ${cause.message}`;
  }

  try {
    return JSON.stringify(cause);
  } catch {
    return String(cause);
  }
};

export const serializeError = (error: unknown): SerializedError => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: serializeCause(error.cause),
    };
  }

  if (typeof error === "string") {
    return {
      name: "Error",
      message: error,
    };
  }

  return {
    name: "UnknownError",
    message: "An unknown error occurred",
    cause: serializeCause(error),
  };
};
