import DOMPurify from "dompurify";

export function useMessageFormatter() {
  const format = (message: string): string => {
    if (!message.trim()) return "";

    const html = message
      .replace(/\n/g, "<br>")
      .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
      .replace(/\*(.*?)\*/g, "<i>$1</i>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/(?:^|\n)- (.*?)(?:\n|$)/g, "<li>$1</li>");

    return DOMPurify.sanitize(html);
  };

  return { format };
}
