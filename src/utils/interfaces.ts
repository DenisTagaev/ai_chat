export interface StreamUser {
    id: string | false;
    email: string
    name: string;
    role?: string;
}

export interface GeminiMessage {
  role: "user" | "model";
  content: string;
}

export interface GeminiFormattedText extends Pick<GeminiMessage, "role">{
    parts: {
        text: string;
    }[];
}