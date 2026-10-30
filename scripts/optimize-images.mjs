import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { constants, copyFile, mkdir, mkdtemp, rename, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { readConfig, dist } from "./config.mjs";

// Run locally when photographs change. Deployments serve the committed files.
const run = promisify(execFile);
const config = await readConfig();
const originalsOnly = process.argv.includes("--originals");
const temp = await mkdtemp(path.join(tmpdir(), "wedding-images-"));
const photos = [config.cover, ...config.gallery];
const localPath = (src) => {
  assert(src?.startsWith("assets/") && !src.includes(".."), `로컬 assets 경로가 필요합니다: ${src}`);
  return fileURLToPath(new URL(src, dist));
};
// Hash decoded RGB bytes, normalizing grayscale/RGB channel storage.
const signature = (file) => new Promise((resolve, reject) => {
  const child = spawn("magick", [file, "-depth", "8", "RGB:-"]);
  const hash = createHash("sha256");
  let errors = "";
  child.stdout.on("data", (chunk) => hash.update(chunk));
  child.stderr.on("data", (chunk) => { errors += chunk; });
  child.on("error", reject);
  child.on("close", (code) => code === 0 ? resolve(hash.digest("hex")) : reject(new Error(errors)));
});
const bytes = async (file) => (await stat(file)).size;
const mib = (size) => (size / 1024 / 1024).toFixed(2);
let before = 0, after = 0;

async function resize(source, destination, bounds) {
  await mkdir(path.dirname(destination), { recursive: true });
  await run("magick", [source, "-auto-orient", "-resize", `${bounds}>`, "-depth", "8",
    "+profile", "exif", "+profile", "xmp", "+profile", "iptc", "+profile", "8bim",
    "-define", "png:preserve-iCCP=true", "-define", "png:color-type=2",
    "-define", "png:exclude-chunk=date,time", destination]);
}

async function webp(source, target, bounds) {
  const resized = path.join(temp, "resized.png");
  const encoded = path.join(temp, "encoded.webp");
  await resize(source, resized, bounds);
  await run("cwebp", ["-quiet", "-lossless", "-q", "80", "-m", "4", "-metadata", "icc", resized, "-o", encoded]);
  // Lossless means pixel-identical to the resized image, not the full-resolution original.
  assert.equal(await signature(encoded), await signature(resized), `WebP 픽셀 검증 실패: ${target}`);
  const destination = localPath(target);
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(encoded, destination);
  console.log(`${target}: ${mib(await bytes(destination))} MiB (무손실 WebP 검증 완료)`);
  return bytes(destination);
}

try {
  for (const photo of photos) {
    const source = localPath(photo.originalSrc);
    const originalSize = await bytes(source);
    before += originalSize;
    if (originalsOnly) {
      assert(/\.jpe?g$/i.test(source), `JPEG 원본만 지원합니다: ${source}`);
      const optimized = path.join(temp, "optimized.jpg");
      await run("jpegtran", ["-copy", "all", "-optimize", "-outfile", optimized, source]);
      const optimizedSize = await bytes(optimized);
      if (optimizedSize < originalSize) {
        assert.equal(await signature(optimized), await signature(source), `JPEG 픽셀 검증 실패: ${source}`);
        // Preserve a byte-for-byte local backup as well as the original Git version.
        const backup = fileURLToPath(new URL(`../.preview/originals/${photo.originalSrc}`, dist));
        await mkdir(path.dirname(backup), { recursive: true });
        await copyFile(source, backup, constants.COPYFILE_EXCL).catch((error) => { if (error.code !== "EEXIST") throw error; });
        await copyFile(optimized, `${source}.tmp`);
        await rename(`${source}.tmp`, source);
      }
      after += await bytes(source);
      console.log(`${photo.originalSrc}: ${mib(originalSize)} → ${mib(await bytes(source))} MiB (해상도·픽셀·메타데이터 유지)`);
    } else {
      after += await webp(source, photo.src, "1800x1800");
      if (photo.thumbnailSrc) after += await webp(source, photo.thumbnailSrc, "720x720");
    }
  }
  if (!originalsOnly) {
    const share = localPath(config.shareImage);
    assert(share.endsWith(".png"), "공유 이미지는 무손실 PNG 경로를 사용하세요.");
    await resize(localPath(config.cover.originalSrc), share, "600x900");
    console.log(`${config.shareImage}: ${mib(await bytes(share))} MiB (공유용 PNG)`);
  }
  console.log(`합계: ${mib(before)} → ${mib(after)} MiB${originalsOnly ? " (JPEG 원본)" : " (표지·확대 사진·썸네일, 원본 별도 보관)"}`);
} catch (error) {
  if (error.code === "ENOENT" && error.syscall?.startsWith("spawn")) {
    console.error("이미지 생성에는 ImageMagick과 cwebp, 원본 최적화에는 jpegtran이 필요합니다. README의 설치 방법을 확인하세요.");
  }
  throw error;
} finally {
  await rm(temp, { recursive: true, force: true });
}
