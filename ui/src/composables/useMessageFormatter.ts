import DOMPurify from "dompurify";

export function useMessageFormatter() {
  const format = (message: string): string => {
    if (!message.trim()) return "";

    const html: string = message
      .replace(/\n/g, "<br>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(
        /`([^`]+)`/g,
        (_, code) =>
          `<code>${DOMPurify.sanitize(code, { ALLOWED_TAGS: [] })}</code>`,
      )
      .replace(/(?:^|\n)((?:- .*(?:\n|$))+)/g, (block) => {
        const items: string = block
          .trim()
          .split("\n")
          .map((line) => `<li>${line.replace(/^- /, "")}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      });

    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'pre', 'a'],
      ALLOWED_ATTR: ['href', 'target', 'rel']
    });
  };

  return { format };
}
