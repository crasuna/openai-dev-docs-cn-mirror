import { execFile } from "node:child_process";
import { readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export const FETCH_HEADERS = {
  accept: "text/markdown,text/plain,text/html;q=0.9,*/*;q=0.8",
  "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
};

let preferPowerShell = false;

export async function fetchText(url: string): Promise<string> {
  return (await fetchBufferWithRetry(url)).toString("utf8");
}

export async function fetchBufferWithRetry(url: string): Promise<Buffer> {
  if (preferPowerShell) {
    return powershellBuffer(url);
  }

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: FETCH_HEADERS
      });
      if (response.ok) return Buffer.from(await response.arrayBuffer());
      lastError = new Error(`HTTP ${response.status} ${response.statusText}`);
      if (response.status === 403) break;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
  }

  try {
    return await curlBuffer(url);
  } catch (curlError) {
    try {
      const buffer = await powershellBuffer(url);
      preferPowerShell = true;
      return buffer;
    } catch (powershellError) {
      const fetchMessage = lastError instanceof Error ? lastError.message : String(lastError);
      const curlMessage = curlError instanceof Error ? curlError.message : String(curlError);
      const powershellMessage = powershellError instanceof Error ? powershellError.message : String(powershellError);
      throw new Error(
        `fetch failed (${fetchMessage}); curl fallback failed (${curlMessage}); PowerShell fallback failed (${powershellMessage})`
      );
    }
  }
}

async function curlBuffer(url: string): Promise<Buffer> {
  const candidates = process.platform === "win32" ? ["curl.exe", "curl"] : ["curl"];
  let lastError: unknown;
  for (const command of candidates) {
    try {
      const { stdout } = await execFileAsync(
        command,
        [
          "-L",
          "--fail",
          "--silent",
          "--show-error",
          "--connect-timeout",
          "20",
          "--max-time",
          "180",
          "-H",
          `Accept: ${FETCH_HEADERS.accept}`,
          "-H",
          `Accept-Language: ${FETCH_HEADERS["accept-language"]}`,
          "-A",
          FETCH_HEADERS["user-agent"],
          url
        ],
        {
          encoding: "buffer",
          maxBuffer: 256 * 1024 * 1024
        }
      );
      return Buffer.isBuffer(stdout) ? stdout : Buffer.from(stdout);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

async function powershellBuffer(url: string): Promise<Buffer> {
  const outFile = path.join(
    tmpdir(),
    `openai-docs-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}.bin`
  );
  const commands = process.platform === "win32" ? ["powershell.exe", "pwsh.exe"] : ["pwsh"];
  let lastError: unknown;
  for (const command of commands) {
    try {
      await execFileAsync(
        command,
        [
          "-NoProfile",
          "-NonInteractive",
          "-ExecutionPolicy",
          "Bypass",
          "-Command",
          "$ProgressPreference='SilentlyContinue'; Invoke-WebRequest -Uri $env:OPENAI_DOC_URL -OutFile $env:OPENAI_DOC_OUT -UseBasicParsing"
        ],
        {
          env: {
            ...process.env,
            OPENAI_DOC_URL: url,
            OPENAI_DOC_OUT: outFile
          },
          timeout: 180_000,
          maxBuffer: 8 * 1024 * 1024
        }
      );
      const buffer = await readFile(outFile);
      await rm(outFile, { force: true });
      return buffer;
    } catch (error) {
      lastError = error;
      await rm(outFile, { force: true });
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
