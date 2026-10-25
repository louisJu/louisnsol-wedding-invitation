import { readFile, writeFile } from "node:fs/promises";
import { readConfig, dist } from "./config.mjs";
const config = await readConfig();
const escape = (text) => String(text).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const title = `${config.groom.name} · ${config.bride.name}의 결혼식에 초대합니다`;
const dateText = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "full" }).format(new Date(config.date));
const clockParts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Seoul", hour: "numeric", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(config.date)).map((p) => [p.type, p.value]));
const hour = Number(clockParts.hour), minute = Number(clockParts.minute);
const timeText = `${hour < 12 ? "오전" : "오후"} ${hour % 12 || 12}시${minute ? ` ${minute}분` : ""}`;
const description = config.shareDescription || `${title}. ${dateText} ${timeText}, ${config.venue.name} ${config.venue.hall}.`;
const pageUrl = process.env.PAGE_URL || config.siteUrl;
let html = await readFile(new URL("index.html", dist), "utf8");
html = html.replace(/<title>.*?<\/title>/, `<title>${escape(title)}</title>`);
for (const [attribute, key, value] of [["name", "description", description], ["property", "og:title", title], ["property", "og:description", description], ["property", "og:url", pageUrl]]) {
  html = html.replace(new RegExp(`<meta ${attribute}="${key}" content="[^"]*">`), `<meta ${attribute}="${key}" content="${escape(value)}">`);
}
if (pageUrl) {
  const imagePath = config.shareImage || config.cover.src;
  const imageUrl = new URL(imagePath, pageUrl.endsWith("/") ? pageUrl : pageUrl + "/").href;
  html = html.replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${escape(imageUrl)}">`);
}
html = html.replace(/<noscript>[\s\S]*?<\/noscript>/, `<noscript><p class="noscript">${escape(description)} ${escape(config.venue.address)}. 상세 안내를 보려면 JavaScript를 켜주세요.</p></noscript>`);
await writeFile(new URL("index.html", dist), html);
console.log(pageUrl ? `공유 미리보기 메타데이터 준비 완료: ${pageUrl}` : "메타데이터 준비 완료. 배포 시 공개 URL을 자동으로 설정합니다.");
