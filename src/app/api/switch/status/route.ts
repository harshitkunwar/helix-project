import { NextResponse } from "next/server";

const timeoutMs = 3000;
const apiBase = (process.env.SWITCH_API_URL ?? "http://127.0.0.1:55541").replace(/\/$/, "");
const helixAgentName = process.env.SWITCH_AGENT_NAME ?? "helix";

type SwitchAgent = {
  name?: unknown;
  controller_state?: unknown;
  definition?: { provider?: unknown };
  status?: { process?: unknown } | null;
};

function response(
  status: "connected" | "disconnected" | "unknown",
  apiReachable: boolean,
  controller: "online" | "inactive" | "unknown",
  message: string,
) {
  return NextResponse.json(
    { status, apiReachable, controller, message, checkedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(request: Request) {
  let health: Response;
  try {
    health = await fetch(`${apiBase}/health/ready`, {
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    return response(
      "disconnected",
      false,
      "unknown",
      timedOut ? "Switch did not respond before the status check timed out." : "Switch API is unreachable.",
    );
  }

  let healthBody: { status?: unknown };
  try {
    healthBody = await health.json();
  } catch {
    return response("unknown", true, "unknown", "Switch responded, but its readiness response was invalid.");
  }
  if (!health.ok || healthBody.status !== "ready") {
    return response("unknown", true, "unknown", "Switch API is reachable, but the server is not ready.");
  }

  const authCookie = request.headers.get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("switch_auth="));
  if (!authCookie) {
    return response(
      "unknown",
      true,
      "unknown",
      "Switch is ready. Sign in to Switch on this hostname to verify the HELIX controller.",
    );
  }

  let agentsResponse: Response;
  try {
    agentsResponse = await fetch(`${apiBase}/management/agents`, {
      cache: "no-store",
      headers: { cookie: authCookie },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    return response(
      "unknown",
      true,
      "unknown",
      timedOut ? "Switch is ready, but controller verification timed out." : "Switch is ready, but controller status could not be checked.",
    );
  }

  if (agentsResponse.status === 401 || agentsResponse.status === 403) {
    return response("unknown", true, "unknown", "Switch is ready, but this browser is not authenticated for controller status.");
  }
  if (!agentsResponse.ok) {
    return response("unknown", true, "unknown", "Switch is ready, but its controller status endpoint returned an error.");
  }

  let agents: SwitchAgent[];
  try {
    const body: unknown = await agentsResponse.json();
    if (!Array.isArray(body)) throw new Error("Invalid agent list");
    agents = body as SwitchAgent[];
  } catch {
    return response("unknown", true, "unknown", "Switch is ready, but its controller status response was invalid.");
  }

  const helix = agents.find((agent) => agent.name === helixAgentName);
  if (!helix) {
    return response("unknown", true, "unknown", "Switch is ready, but the HELIX managed agent was not found for this account.");
  }

  const controllerOnline = helix.controller_state === "online";
  const codexAgentRunning = helix.definition?.provider === "codex" && helix.status?.process === "running";
  if (controllerOnline && codexAgentRunning) {
    return response("connected", true, "online", "Switch is ready and the HELIX Codex controller is online with its agent running.");
  }

  return response(
    "unknown",
    true,
    controllerOnline ? "unknown" : "inactive",
    controllerOnline
      ? "Switch is ready, but the HELIX Codex agent is not confirmed running."
      : `Switch is ready, but the HELIX controller is ${typeof helix.controller_state === "string" ? helix.controller_state : "unknown"}.`,
  );
}
