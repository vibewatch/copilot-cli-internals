#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import {
  copyFile,
  mkdir,
  mkdtemp,
  open,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import {
  basename,
  dirname,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_OUT_DIR = join(REPO_ROOT, "copilot-cli-pkg");
const SUPPORTED_ARCHES = new Set(["x64", "arm64"]);
const SEA_NOTE_NAME = "NODE_SEA_BLOB";
const SEA_NOTE_NAME_WITH_NUL = Buffer.from(`${SEA_NOTE_NAME}\0`, "utf8");
const SEA_MAGIC = 0x0143da20;
const SEA_FLAGS = {
  DISABLE_EXPERIMENTAL_WARNING: 1 << 0,
  USE_SNAPSHOT: 1 << 1,
  USE_CODE_CACHE: 1 << 2,
  INCLUDE_ASSETS: 1 << 3,
  INCLUDE_EXEC_ARGV: 1 << 4,
};

function usage() {
  return `Download the latest GitHub Copilot CLI Linux binary and unpack the embedded package.

Usage:
  node scripts/extract-copilot-cli-pkg.mjs [options]

Options:
  --arch <x64|arm64>           Linux architecture to download (default: current arch, or x64)
  --version <version|latest>   Platform package version/tag (default: latest)
  --out <dir>                  Output directory for expanded @github/copilot package
                               (default: ./copilot-cli-pkg)
  --keep-binary <path>         Also copy the downloaded platform binary to this path
  --keep-sea-loader <path>     Also write the embedded sea-loader.js to this path
  --keep-package-tgz <path>    Also write the embedded copilot.tgz to this path
  -h, --help                   Show this help

Examples:
  node scripts/extract-copilot-cli-pkg.mjs
  node scripts/extract-copilot-cli-pkg.mjs --arch arm64
  node scripts/extract-copilot-cli-pkg.mjs --version 1.0.48 --out copilot-cli-pkg
`;
}

function inferDefaultArch() {
  return SUPPORTED_ARCHES.has(process.arch) ? process.arch : "x64";
}

function readValue(argv, index, flag) {
  const value = argv[index + 1];
  if (!value || value.startsWith("-")) {
    throw new Error(`Missing value for ${flag}`);
  }
  return value;
}

function parseArgs(argv) {
  const options = {
    arch: inferDefaultArch(),
    version: "latest",
    outDir: DEFAULT_OUT_DIR,
    keepBinary: undefined,
    keepSeaLoader: undefined,
    keepPackageTgz: undefined,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "-h" || arg === "--help") {
      options.help = true;
    } else if (arg === "--arch") {
      options.arch = readValue(argv, i, arg);
      i += 1;
    } else if (arg.startsWith("--arch=")) {
      options.arch = arg.slice("--arch=".length);
    } else if (arg === "--version") {
      options.version = readValue(argv, i, arg);
      i += 1;
    } else if (arg.startsWith("--version=")) {
      options.version = arg.slice("--version=".length);
    } else if (arg === "--out") {
      options.outDir = resolve(readValue(argv, i, arg));
      i += 1;
    } else if (arg.startsWith("--out=")) {
      options.outDir = resolve(arg.slice("--out=".length));
    } else if (arg === "--keep-binary") {
      options.keepBinary = resolve(readValue(argv, i, arg));
      i += 1;
    } else if (arg.startsWith("--keep-binary=")) {
      options.keepBinary = resolve(arg.slice("--keep-binary=".length));
    } else if (arg === "--keep-sea-loader") {
      options.keepSeaLoader = resolve(readValue(argv, i, arg));
      i += 1;
    } else if (arg.startsWith("--keep-sea-loader=")) {
      options.keepSeaLoader = resolve(arg.slice("--keep-sea-loader=".length));
    } else if (arg === "--keep-package-tgz") {
      options.keepPackageTgz = resolve(readValue(argv, i, arg));
      i += 1;
    } else if (arg.startsWith("--keep-package-tgz=")) {
      options.keepPackageTgz = resolve(arg.slice("--keep-package-tgz=".length));
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (!SUPPORTED_ARCHES.has(options.arch)) {
    throw new Error(`Unsupported Linux arch: ${options.arch}`);
  }

  return options;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: REPO_ROOT,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    ...options,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const rendered = [
      `$ ${command} ${args.join(" ")}`,
      result.stdout?.trim(),
      result.stderr?.trim(),
    ]
      .filter(Boolean)
      .join("\n");
    throw new Error(rendered);
  }

  return result;
}

function align4(value) {
  return (value + 3) & ~3;
}

function readUInt32LE(buffer, offset) {
  if (offset + 4 > buffer.length) {
    throw new Error("Unexpected end of buffer while reading uint32");
  }
  return buffer.readUInt32LE(offset);
}

function readUInt8(buffer, offset) {
  if (offset + 1 > buffer.length) {
    throw new Error("Unexpected end of buffer while reading uint8");
  }
  return buffer.readUInt8(offset);
}

function readSizeTLE(buffer, offset) {
  if (offset + 8 > buffer.length) {
    throw new Error("Unexpected end of SEA blob while reading size_t");
  }

  const value = buffer.readBigUInt64LE(offset);
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error(`SEA size_t value is too large: ${value}`);
  }
  return Number(value);
}

function readStringView(buffer, cursor) {
  const length = readSizeTLE(buffer, cursor.offset);
  cursor.offset += 8;

  const end = cursor.offset + length;
  if (end > buffer.length) {
    throw new Error(
      `SEA string_view overruns blob: offset=${cursor.offset}, length=${length}`,
    );
  }

  const value = buffer.subarray(cursor.offset, end);
  cursor.offset = end;
  return value;
}

function findSeaBlob(binary) {
  let searchOffset = 0;

  while (true) {
    const marker = binary.indexOf(SEA_NOTE_NAME_WITH_NUL, searchOffset);
    if (marker === -1) {
      break;
    }

    searchOffset = marker + 1;

    const noteHeader = marker - 12;
    if (noteHeader < 0) {
      continue;
    }

    const namesz = readUInt32LE(binary, noteHeader);
    const descsz = readUInt32LE(binary, noteHeader + 4);
    const noteType = readUInt32LE(binary, noteHeader + 8);

    if (namesz !== SEA_NOTE_NAME_WITH_NUL.length || noteType !== 0) {
      continue;
    }

    const descOffset = noteHeader + 12 + align4(namesz);
    const descEnd = descOffset + descsz;
    if (descsz <= 0 || descEnd > binary.length) {
      continue;
    }

    if (readUInt32LE(binary, descOffset) !== SEA_MAGIC) {
      continue;
    }

    return {
      offset: descOffset,
      size: descsz,
      buffer: binary.subarray(descOffset, descEnd),
    };
  }

  throw new Error(`Could not find a valid ${SEA_NOTE_NAME} ELF note`);
}

function parseSeaResource(binaryPath, binary) {
  const seaBlob = findSeaBlob(binary);
  const cursor = { offset: 0 };

  const magic = readUInt32LE(seaBlob.buffer, cursor.offset);
  cursor.offset += 4;
  if (magic !== SEA_MAGIC) {
    throw new Error(`Unexpected SEA magic in ${binaryPath}: 0x${magic.toString(16)}`);
  }

  const flags = readUInt32LE(seaBlob.buffer, cursor.offset);
  cursor.offset += 4;

  const execArgvExtension = readUInt8(seaBlob.buffer, cursor.offset);
  cursor.offset += 1;

  const codePath = readStringView(seaBlob.buffer, cursor).toString("utf8");
  const mainCode = readStringView(seaBlob.buffer, cursor);

  let codeCache;
  if ((flags & SEA_FLAGS.USE_CODE_CACHE) !== 0) {
    codeCache = readStringView(seaBlob.buffer, cursor);
  }

  const assets = new Map();
  if ((flags & SEA_FLAGS.INCLUDE_ASSETS) !== 0) {
    const assetCount = readSizeTLE(seaBlob.buffer, cursor.offset);
    cursor.offset += 8;

    for (let i = 0; i < assetCount; i += 1) {
      const key = readStringView(seaBlob.buffer, cursor).toString("utf8");
      const value = readStringView(seaBlob.buffer, cursor);
      assets.set(key, value);
    }
  }

  const execArgv = [];
  if ((flags & SEA_FLAGS.INCLUDE_EXEC_ARGV) !== 0) {
    const argCount = readSizeTLE(seaBlob.buffer, cursor.offset);
    cursor.offset += 8;

    for (let i = 0; i < argCount; i += 1) {
      execArgv.push(readStringView(seaBlob.buffer, cursor).toString("utf8"));
    }
  }

  if (cursor.offset !== seaBlob.buffer.length) {
    throw new Error(
      `SEA blob parser stopped at ${cursor.offset}, expected ${seaBlob.buffer.length}`,
    );
  }

  return {
    offset: seaBlob.offset,
    size: seaBlob.size,
    flags,
    execArgvExtension,
    codePath,
    mainCode,
    codeCache,
    assets,
    execArgv,
  };
}

async function assertElf(filePath) {
  const handle = await open(filePath, "r");
  try {
    const magic = Buffer.alloc(4);
    const { bytesRead } = await handle.read(magic, 0, magic.length, 0);
    if (
      bytesRead !== 4 ||
      magic[0] !== 0x7f ||
      magic[1] !== 0x45 ||
      magic[2] !== 0x4c ||
      magic[3] !== 0x46
    ) {
      throw new Error(`${filePath} is not an ELF binary`);
    }
  } finally {
    await handle.close();
  }
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function packageNameForArch(arch) {
  return `@github/copilot-linux-${arch}`;
}

async function packPlatformPackage(arch, version, tempDir) {
  const packageName = packageNameForArch(arch);
  const spec = `${packageName}@${version}`;

  console.log(`Packing ${spec} ...`);

  const result = run("npm", [
    "pack",
    spec,
    "--pack-destination",
    tempDir,
    "--json",
  ]);

  let info;
  try {
    const parsed = JSON.parse(result.stdout.trim());
    info = Array.isArray(parsed) ? parsed[0] : parsed;
  } catch (error) {
    throw new Error(
      `Failed to parse npm pack output for ${spec}: ${error.message}\n${result.stdout}`,
    );
  }

  const filename = info.filename ?? basename(info.path ?? "");
  if (!filename) {
    throw new Error(`npm pack did not report a tarball filename for ${spec}`);
  }

  const tarball = resolve(tempDir, filename);
  await stat(tarball);

  return {
    packageName,
    requestedSpec: spec,
    resolvedVersion: info.version ?? version,
    tarball,
    filename,
    integrity: info.integrity,
    shasum: info.shasum,
  };
}

async function extractPlatformBinary(packageInfo, tempDir) {
  const extractDir = join(tempDir, "platform-package");
  await mkdir(extractDir, { recursive: true });

  run("tar", [
    "-xzf",
    packageInfo.tarball,
    "-C",
    extractDir,
    "package/copilot",
    "package/package.json",
  ]);

  const binaryPath = join(extractDir, "package", "copilot");
  const packageJsonPath = join(extractDir, "package", "package.json");

  await assertElf(binaryPath);

  return {
    binaryPath,
    packageJson: await readJson(packageJsonPath),
  };
}

function tarEntries(tarball) {
  return run("tar", ["-tzf", tarball]).stdout
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function assertSafePackageTar(entries) {
  if (entries.length === 0) {
    throw new Error("Embedded copilot.tgz is empty");
  }

  for (const entry of entries) {
    const normalized = entry.replaceAll("\\", "/");
    const parts = normalized.split("/").filter(Boolean);

    if (
      normalized.startsWith("/") ||
      /^[A-Za-z]:\//.test(normalized) ||
      parts.includes("..")
    ) {
      throw new Error(`Refusing unsafe tar entry: ${entry}`);
    }

    if (!normalized.startsWith("package/")) {
      throw new Error(`Expected npm tar entry to start with package/: ${entry}`);
    }
  }
}

async function unpackCopilotPackage(packageTgzPath, outDir) {
  const entries = tarEntries(packageTgzPath);
  assertSafePackageTar(entries);

  const outParent = dirname(outDir);
  const outBase = basename(outDir);
  await mkdir(outParent, { recursive: true });

  const staging = await mkdtemp(join(outParent, `.${outBase}.extract-`));

  try {
    run("tar", [
      "-xzf",
      packageTgzPath,
      "-C",
      staging,
      "--strip-components=1",
    ]);

    const packageJson = await readJson(join(staging, "package.json"));
    if (packageJson.name !== "@github/copilot") {
      throw new Error(
        `Embedded package is ${packageJson.name ?? "unknown"}, expected @github/copilot`,
      );
    }

    await rm(outDir, { recursive: true, force: true });
    await rename(staging, outDir);
    return packageJson;
  } catch (error) {
    await rm(staging, { recursive: true, force: true }).catch(() => {});
    throw error;
  }
}

async function hashFile(filePath) {
  return new Promise((resolveHash, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);

    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolveHash(hash.digest("hex")));
  });
}

function formatBytes(bytes) {
  const units = ["B", "KiB", "MiB", "GiB"];
  let value = bytes;
  let unit = 0;

  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }

  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function relativePath(filePath) {
  const rel = relative(process.cwd(), filePath);
  return rel && !rel.startsWith("..") && !rel.startsWith(sep) ? rel : filePath;
}

async function ensureParentDir(filePath) {
  await mkdir(dirname(filePath), { recursive: true });
}

async function maybeWriteFile(filePath, content) {
  if (!filePath) {
    return;
  }

  await ensureParentDir(filePath);
  await writeFile(filePath, content);
}

async function maybeCopyFile(source, destination) {
  if (!destination) {
    return;
  }

  await ensureParentDir(destination);
  await copyFile(source, destination);
}

function assertSafeOutDir(outDir) {
  const resolved = resolve(outDir);
  const parsedRoot = resolve(sep);

  if (resolved === parsedRoot) {
    throw new Error("Refusing to extract into filesystem root");
  }

  if (resolved === REPO_ROOT) {
    throw new Error("Refusing to replace the repository root");
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    console.log(usage());
    return;
  }

  assertSafeOutDir(options.outDir);

  const tempDir = await mkdtemp(join(tmpdir(), "copilot-cli-unpack-"));

  try {
    const packageInfo = await packPlatformPackage(
      options.arch,
      options.version,
      tempDir,
    );
    const platform = await extractPlatformBinary(packageInfo, tempDir);
    const binary = await readFile(platform.binaryPath);
    const sea = parseSeaResource(platform.binaryPath, binary);
    const copilotTgz = sea.assets.get("copilot.tgz");

    if (!copilotTgz) {
      const keys = [...sea.assets.keys()].join(", ") || "<none>";
      throw new Error(`Embedded copilot.tgz asset not found. Asset keys: ${keys}`);
    }

    const copilotTgzPath = join(tempDir, "copilot.tgz");
    await writeFile(copilotTgzPath, copilotTgz);

    await maybeCopyFile(platform.binaryPath, options.keepBinary);
    await maybeWriteFile(options.keepSeaLoader, sea.mainCode);
    await maybeWriteFile(options.keepPackageTgz, copilotTgz);

    const packageJson = await unpackCopilotPackage(copilotTgzPath, options.outDir);

    const [binaryStat, tgzStat] = await Promise.all([
      stat(platform.binaryPath),
      stat(copilotTgzPath),
    ]);
    const [binarySha256, tgzSha256] = await Promise.all([
      hashFile(platform.binaryPath),
      hashFile(copilotTgzPath),
    ]);

    console.log("");
    console.log(`Downloaded: ${packageInfo.packageName}@${packageInfo.resolvedVersion}`);
    console.log(`Platform binary: ${formatBytes(binaryStat.size)}, sha256=${binarySha256}`);
    console.log(
      `SEA: ${formatBytes(sea.size)} at 0x${sea.offset.toString(16)}, main=${sea.codePath} (${formatBytes(sea.mainCode.length)})`,
    );
    console.log(`Asset: copilot.tgz ${formatBytes(tgzStat.size)}, sha256=${tgzSha256}`);
    console.log(`Extracted package: ${packageJson.name}@${packageJson.version}`);
    console.log(`Output: ${relativePath(options.outDir)}`);

    if (options.keepBinary) {
      console.log(`Kept binary: ${relativePath(options.keepBinary)}`);
    }
    if (options.keepSeaLoader) {
      console.log(`Kept sea loader: ${relativePath(options.keepSeaLoader)}`);
    }
    if (options.keepPackageTgz) {
      console.log(`Kept package tgz: ${relativePath(options.keepPackageTgz)}`);
    }
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(`extract-copilot-cli-pkg: ${error.message}`);
  console.error(`\n${usage()}`);
  process.exit(1);
});
