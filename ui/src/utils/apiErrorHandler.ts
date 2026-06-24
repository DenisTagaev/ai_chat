import axios from "axios";

export interface ApiErrorResult {
  message: string | null;
}

export const handleApiError = (
  error: unknown,
  fallbackMessage: string,
): ApiErrorResult => {
  if (
    error instanceof Error &&
    (error.name === "CanceledError" || error.name === "AbortError")
  ) {
    return {
      message: null,
    };
  }

  if (axios.isAxiosError(error) && error.response) {
    console.error(`API error: ${error.response.status}`, error.response.data);

    return {
      message: error.response.data?.message ?? fallbackMessage,
    };
  }

  if (error instanceof Error) {
    console.error(error);

    return {
      message: fallbackMessage,
    };
  }

  console.error("Unknown error:", error);

  return {
    message: fallbackMessage,
  };
};
