import { toast } from "@/components/shared/toast";

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
  if (!text.trim()) return "";

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const linkedText = text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer nofollow">${url}</a>`;
  });

  return linkedText.trim().replace(/\n/g, "<br>");
}

export function htmlToTextAreaContent(html: string): string {
  if (!html.trim()) return "";

  const div = document.createElement("div");
  div.innerHTML = html;

  div.querySelectorAll("br").forEach((br) => {
    br.replaceWith("\n");
  });

  return div.innerText.trim();
}

export function copyToClipboard(text: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      toast({
        message: `Copy ${text}`,
        type: `info`,
      });
    })
    .catch((err) => {
      toast({
        message: `Failed ${err?.message}`,
        type: `error`,
      });
    });
}
