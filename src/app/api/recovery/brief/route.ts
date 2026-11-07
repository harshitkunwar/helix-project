import { GET as scan } from "../route";

export async function GET(request: Request) {
  const result = await scan(request);
  const data = await result.json();
  if (!result.ok) return Response.json(data, { status: result.status });
  const blockers: string[] = [];
  const assumptions: string[] = [];
  const actions: string[] = [];
  if (!data.git.available) blockers.push("Git inspection failed; confirm this is a readable Git working tree.");
  if (data.project.error) blockers.push(data.project.error);
  if (data.readme === "README.md not found") blockers.push("README.md could not be read.");
  if (data.git.status.length) actions.push("Review the reported modified and untracked paths before editing.");
  if (!data.readme || data.readme === "README.md not found") assumptions.push("Project purpose and setup instructions are unknown from README evidence.");
  if (data.git.commits.length < 5) assumptions.push("The repository returned fewer than five commits; this does not establish the complete project history.");
  actions.push("Confirm the intended task and constraints with the human in Switch.");
  actions.push("Run only the project's documented checks and record their actual exit status.");
  return Response.json({ success: true, generatedAt: new Date().toISOString(), projectDirectory: data.directory,
    summary: { project: data.project.name ?? "Unknown project", branch: data.git.branch, changedItems: data.git.status.length, recentCommitCount: data.git.commits.length, gitAvailable: data.git.available },
    verifiedEvidence: [`Scanned directory: ${data.directory}`, `Git branch: ${data.git.branch}`, `Git status contains ${data.git.status.length} entries.`, `Recent history returned ${data.git.commits.length} commits.`, `Diff summary: ${data.git.diff}`, data.project.name ? `package.json name: ${data.project.name}` : "package.json missing or invalid", data.readme === "README.md not found" ? "README.md missing" : `README.md readable (${data.readme.length} characters inspected).`],
    changedFiles: data.git.status, recentCommits: data.git.commits, diffStat: data.git.diff, readme: data.readme, package: data.project,
    blockers, assumptions, recommendedNextActions: actions, approvalRequired: true,
    safety: "Read-only inspection. No files were modified and no browser-supplied command was executed." });
}
