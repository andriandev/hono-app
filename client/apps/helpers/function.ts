export function formatDateTime(datetimeStr: string): string {
  const timezone: string =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Jakarta";
  const date: Date = new Date(datetimeStr);
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  return new Intl.DateTimeFormat("en-GB", options).format(date);
}

export function parseContentToHTML(text: string): string {
  if (text == "" || !text) {
    return "";
  }

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text
    .split(/\n\s*\n/)
    .map((alinea) => {
      const linkedText = alinea.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer nofollow">${url}</a>`;
      });
      return `<p>${linkedText.trim()}</p>`;
    })
    .join("");
}

export function htmlToTextAreaContent(html: string): string {
  if (html == "" || !html) {
    return "";
  }

  const div = document.createElement("div");
  div.innerHTML = html;

  const paragraphs = Array.from(div.querySelectorAll("p"));
  return paragraphs
    .map((p) => {
      const textWithLinks = Array.from(p.childNodes)
        .map((node) => {
          if (
            node.nodeType === Node.ELEMENT_NODE &&
            (node as HTMLElement).tagName === "A"
          ) {
            return (node as HTMLAnchorElement).href;
          } else {
            return node.textContent ?? "";
          }
        })
        .join("");
      return textWithLinks.trim();
    })
    .join("\n\n");
}
