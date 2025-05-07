import { toast } from "@/components/shared/toast";

type EpisodeData = Record<string, Record<string, string[]>>;

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
        message: "Copy to clipboard",
        type: "info",
      });
    })
    .catch((err) => {
      toast({
        message: `Failed ${err?.message}`,
        type: "error",
      });
    });
}

export function parseLinks(html: string) {
  const result: Record<string, Record<string, string[]>> = {};
  const dom = new DOMParser().parseFromString(html, "text/html");
  const blocks = dom.querySelectorAll(".adikdown");

  blocks.forEach((block) => {
    const episodeTitle =
      block.querySelector(".adik-title")?.textContent?.trim() ||
      "Unknown Episode";
    const qualities: Record<string, string[]> = {};

    block.querySelectorAll("ul > li").forEach((li) => {
      const strong = li.querySelector("strong");
      if (!strong) return;

      const quality = strong.textContent?.trim() || "Unknown";
      const links: string[] = [];

      li.querySelectorAll("a")?.forEach((a) => {
        const href = a.getAttribute("href");
        if (href) links.push(href);
      });

      qualities[quality] = links;
    });

    result[episodeTitle] = qualities;
  });

  return result;
}

export function getLinksByQuality(
  data: EpisodeData,
  quality: string = "ALL",
): Record<string, Record<string, string[]>> {
  const result: Record<string, Record<string, string[]>> = {};

  for (const [episode, qualities] of Object.entries(data)) {
    if (quality === "ALL") {
      result[episode] = qualities;
    } else if (qualities[quality]) {
      result[episode] = {
        [quality]: qualities[quality],
      };
    }
  }

  return result;
}

export function formatQualityResult(
  data: Record<string, Record<string, string[]>>,
): string {
  let output = "";

  for (const [episode, qualities] of Object.entries(data)) {
    output += `${episode}`;
    for (const [quality, links] of Object.entries(qualities)) {
      output += `\n${quality}\n`;
      for (const link of links) {
        output += `${link}\n`;
      }
    }
    output += `\n`;
  }

  return output.trim();
}

export function getAvailableQualities(data: EpisodeData): string[] {
  const qualitiesSet = new Set<string>();

  for (const qualities of Object.values(data)) {
    for (const quality of Object.keys(qualities)) {
      qualitiesSet.add(quality);
    }
  }

  qualitiesSet.add("ALL");

  return Array.from(qualitiesSet);
}
