import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { readConfig, dist } from "./config.mjs";
const config = await readConfig();
assert(config.groom.name && config.bride.name, "신랑·신부 이름을 입력하세요.");
assert(config.date.endsWith("+09:00") && Number.isFinite(Date.parse(config.date)), "예식 날짜는 한국 시간(+09:00)으로 입력하세요.");
assert(config.venue.name && config.venue.hall && config.venue.address, "예식장 정보를 확인하세요.");
assert(Number.isFinite(config.venue.latitude) && Number.isFinite(config.venue.longitude), "지도 좌표를 확인하세요.");
assert(config.invitation.length > 0, "초대 문구를 입력하세요.");
for (const src of [config.cover.src, config.cover.originalSrc, config.shareImage, ...config.gallery.flatMap((photo) => [photo.src, photo.thumbnailSrc, photo.originalSrc])].filter(Boolean)) {
  assert(!src.startsWith("/"), "사진 경로 앞에 /를 붙이지 마세요. GitHub 하위 경로에서 깨집니다.");
  if (!src.startsWith("https://")) await access(new URL(src, dist));
}
for (const group of config.accounts) for (const person of [...group.people, ...(group.parents || [])]) assert(person.name && person.bank && person.number, "계좌 정보가 비어 있습니다.");
const html = await readFile(new URL("index.html", dist), "utf8");
await access(new URL("kakao-map.html", dist));
assert(html.includes('href="#location"') && html.includes('id="location"'), "오시는 길 바로가기를 확인하세요.");
console.log("이름·예식일·장소·사진 경로·계좌 설정 검증 완료.");
