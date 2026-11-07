import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { realpath, readFile, stat } from "node:fs/promises";
import path from "node:path";

const run = promisify(execFile);

export async function GET(request: Request) {
  const requested = new URL(request.url).searchParams.get("directory") || process.cwd();
  if (requested.length > 1024 || requested.includes("\0")) return Response.json({ error: "Invalid directory path" }, { status: 400 });
  let cwd: string;
  try {
    cwd = await realpath(path.resolve(requested));
    if (!(await stat(cwd)).isDirectory()) throw new Error("Not a directory");
  } catch { return Response.json({ error: "Directory does not exist or is not accessible" }, { status: 400 }); }

  const git = { available: false, branch: "Not available", status: [] as string[], commits: [] as string[], diff: "Unavailable" };
  try {
    const opts = { cwd, windowsHide: true, timeout: 8000, maxBuffer: 1024 * 1024 };
    const [branch, status, log, diff] = await Promise.all([
      run("git", ["branch", "--show-current"], opts), run("git", ["status", "--short"], opts),
      run("git", ["log", "-5", "--oneline"], opts), run("git", ["diff", "--stat", "HEAD"], opts),
    ]);
    Object.assign(git, { available: true, branch: branch.stdout.trim() || "Detached HEAD", status: status.stdout.trim().split(/\r?\n/).filter(Boolean), commits: log.stdout.trim().split(/\r?\n/).filter(Boolean), diff: diff.stdout.trim() || "No tracked changes" });
  } catch { /* Git may be unavailable; report that as evidence. */ }
  let project: Record<string, unknown> = {};
  try { const pkg = JSON.parse(await readFile(path.join(cwd, "package.json"), "utf8")); project = { name: pkg.name, scripts: pkg.scripts ?? {}, dependencies: Object.keys(pkg.dependencies ?? {}), devDependencies: Object.keys(pkg.devDependencies ?? {}) }; }
  catch { project = { error: "package.json not found or invalid" }; }
  let readme = "README.md not found";
  try { readme = (await readFile(path.join(cwd, "README.md"), "utf8")).slice(0, 6000); } catch { /* surfaced in response */ }
  return Response.json({ success: true, scannedAt: new Date().toISOString(), directory: cwd, git, project, readme });
}
