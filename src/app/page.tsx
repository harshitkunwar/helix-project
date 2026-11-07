"use client";

import Link from "next/link";

import { useEffect, useState } from "react";

type SwitchStatus = {
  status: "connected" | "disconnected" | "unknown";
  message: string;
};

export default function Home() {
  const [switchStatus, setSwitchStatus] = useState<SwitchStatus>({
    status: "unknown",
    message: "Checking the Switch server and HELIX controller…",
  });

  useEffect(() => {
    let active = true;
    const checkStatus = async () => {
      try {
        const result = await fetch("/api/switch/status", {
          cache: "no-store",
          signal: AbortSignal.timeout(7000),
        });
        const body = (await result.json()) as SwitchStatus;
        if (active) setSwitchStatus(body);
      } catch {
        if (active) {
          setSwitchStatus({
            status: "disconnected",
            message: "HELIX could not retrieve the live Switch status.",
          });
        }
      }
    };

    void checkStatus();
    const interval = window.setInterval(() => void checkStatus(), 30_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const statusLabel = {
    connected: "Switch Connected",
    disconnected: "Switch Disconnected",
    unknown: "Switch Status Unknown",
  }[switchStatus.status];

  return (
    <main className="shell">
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #090d18; color: #eef2ff; font-family: Arial, sans-serif; }
        .shell { min-height: 100vh; display: flex; background: radial-gradient(ellipse at 75% 0%, #20204b 0%, #0b1020 42%, #090d18 100%); }
        .sidebar { width: 245px; padding: 30px 20px; border-right: 1px solid #252b40; background: #0c1120; flex-shrink: 0; }
        .brand { font-size: 25px; font-weight: 800; letter-spacing: 4px; }
        .brand span { color: #8985ff; }
        .tag { color: #78829d; font-size: 11px; letter-spacing: 2px; margin-top: 7px; }
        .navtitle { color: #66718d; font-size: 10px; letter-spacing: 2px; margin: 48px 10px 14px; }
        .nav { display: block; padding: 13px 14px; margin: 5px 0; color: #929db7; text-decoration: none; border-radius: 9px; font-size: 14px; }
        .nav.active { color: white; background: #25254c; border: 1px solid #414078; }
        .sidebarfoot { margin-top: 70px; border: 1px solid #293149; border-radius: 12px; padding: 15px; color: #8994ae; font-size: 12px; line-height: 1.7; }
        .main { flex: 1; min-width: 0; padding: 30px 4%; max-width: 1500px; margin: auto; width: 100%; }
        .top { display: flex; justify-content: space-between; align-items: center; gap: 15px; border-bottom: 1px solid #252b40; padding-bottom: 22px; }
        .muted { color: #8b96b0; font-size: 13px; }
        .status { border: 1px solid #594d32; color: #e9c879; background: #292315; border-radius: 30px; padding: 9px 14px; font-size: 12px; }
        .status.connected { border-color: #245b45; color: #8de0b5; background: #10281f; }
        .status.disconnected { border-color: #683744; color: #ff9cab; background: #2b151c; }
        .status-message { color: #8b96b0; font-size: 11px; line-height: 1.5; max-width: 340px; margin-top: 7px; }
        .hero { padding: 48px 0 34px; }
        .eyebrow { color: #9994ff; font-size: 11px; letter-spacing: 2px; font-weight: bold; }
        h1 { font-size: clamp(32px, 4vw, 49px); letter-spacing: -1.8px; margin: 13px 0; }
        .desc { color: #9ba6bf; max-width: 650px; line-height: 1.8; font-size: 15px; }
        .btn { display: inline-block; margin-top: 22px; padding: 14px 22px; border-radius: 9px; background: linear-gradient(110deg,#7772f4,#5552c9); color: white; text-decoration: none; font-weight: bold; box-shadow: 0 8px 30px #5552c944; }
        .grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 16px; margin: 18px 0 28px; }
        .card { background: #121a2b; border: 1px solid #29334b; border-radius: 14px; padding: 21px; }
        .cardlabel { color: #929db6; font-size: 12px; }
        .cardvalue { font-size: 20px; font-weight: 700; margin-top: 15px; }
        .small { color: #8591aa; font-size: 12px; margin-top: 8px; }
        .sectiontitle { font-size: 17px; margin: 28px 0 15px; }
        .steps { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 12px; }
        .step { padding: 18px; border: 1px solid #29334b; background: #111827; border-radius: 12px; }
        .num { color: #9994ff; font-size: 12px; }
        .step strong { display: block; margin-top: 12px; font-size: 14px; }
        .step p { color: #8995ae; font-size: 12px; line-height: 1.6; }
        .bottom { margin-top: 25px; padding: 17px 20px; border: 1px solid #29334b; border-radius: 12px; color: #9ba6bf; font-size: 12px; }
        @media(max-width:850px) { .sidebar { width: 180px; } .grid { grid-template-columns: 1fr 1fr; } .steps { grid-template-columns: 1fr 1fr; } }
        @media(max-width:600px) { .sidebar { display:none; } .main { padding: 22px 17px; } .grid,.steps { grid-template-columns: 1fr; } .hero { padding-top: 35px; } }
      `}</style>

      <aside className="sidebar">
        <div className="brand">HELI<span>X</span></div>
        <div className="tag">PROJECT INTELLIGENCE</div>
        <div className="navtitle">WORKSPACE</div>
        <Link className="nav active" href="/">◈ &nbsp; Overview</Link>
        <Link className="nav" href="/recovery">⌁ &nbsp; Recovery</Link>
        <div className="nav">◷ &nbsp; Activity</div>
        <div className="nav">⚙ &nbsp; Settings</div>
        <div className="sidebarfoot">
          <strong style={{color:"#dce2f4"}}>HELIX AGENT</strong><br/>
          Project Recovery &amp; Handoff<br/>
          <span style={{color: switchStatus.status === "connected" ? "#8de0b5" : switchStatus.status === "disconnected" ? "#ff9cab" : "#e9c879"}}>● {statusLabel}</span>
        </div>
      </aside>

      <section className="main">
        <header className="top">
          <div><div className="muted">WORKSPACE / OVERVIEW</div><strong style={{display:"block",marginTop:7}}>Project Command Center</strong></div>
          <div aria-live="polite">
            <div className={`status ${switchStatus.status}`} title={switchStatus.message}>● {statusLabel}</div>
            <div className="status-message">{switchStatus.message}</div>
          </div>
        </header>

        <section className="hero">
          <div className="eyebrow">AI-POWERED PROJECT RECOVERY</div>
          <h1>Pick up where<br/>you left off.</h1>
          <p className="desc">Recover lost project context, understand your repository state, identify blockers and create a clear handoff for your next development session.</p>
          <Link className="btn" href="/recovery">Start Project Recovery &nbsp; →</Link>
        </section>

        <div className="grid">
          <div className="card"><div className="cardlabel">PROJECT STATUS</div><div className="cardvalue">Ready to inspect</div><div className="small">Run a repository recovery scan</div></div>
          <div className="card"><div className="cardlabel">RECOVERY ENGINE</div><div className="cardvalue">Evidence-based</div><div className="small">Git history · Files · Project context</div></div>
          <div className="card"><div className="cardlabel">HUMAN APPROVAL</div><div className="cardvalue">Required</div><div className="small">No file changes authorized by default</div></div>
        </div>

        <h2 className="sectiontitle">Your recovery workflow</h2>
        <div className="steps">
          <div className="step"><div className="num">01 / INSPECT</div><strong>Scan repository</strong><p>Read Git state and project files.</p></div>
          <div className="step"><div className="num">02 / ANALYZE</div><strong>Recover context</strong><p>Separate evidence, blockers and assumptions.</p></div>
          <div className="step"><div className="num">03 / APPROVE</div><strong>Human decision</strong><p>Review proposed next actions before changes.</p></div>
          <div className="step"><div className="num">04 / HANDOFF</div><strong>Resume work</strong><p>Prepare a structured project handoff.</p></div>
        </div>

        <h2 className="sectiontitle">Get started</h2>
        <div className="card" style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:18,flexWrap:"wrap"}}>
          <div><strong>Recover your unfinished project</strong><p className="small">Generate a recovery brief from your local repository.</p></div>
          <Link className="btn" href="/recovery" style={{margin:0}}>Open Recovery →</Link>
        </div>
        <div className="bottom">HELIX · Project Recovery &amp; Handoff Agent · {switchStatus.message}</div>
      </section>
    </main>
  );
}
