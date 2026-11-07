HELIX — Project Recovery & Handoff Agent

HELIX is an AI-powered project recovery and handoff prototype built around Switch and OpenAI Codex.

The Problem

Developers lose valuable time when returning to unfinished projects because code changes, Git history, documentation, dependencies, and previous decisions are scattered across different tools.

The Solution

HELIX inspects a project's repository and generates an evidence-based recovery brief.

It helps developers:

- Inspect Git history and working-tree changes.
- Review project structure and documentation.
- Identify blockers and unfinished work.
- Separate verified evidence from assumptions.
- Recommend the next actions.
- Prepare project handoff summaries.

Human approval is required before project modifications.

Technology Stack

- Next.js
- React
- TypeScript
- Switch
- OpenAI Codex
- Git

Getting Started

Prerequisites

- Node.js
- npm
- Git

Installation

Clone the repository:

git clone YOUR_GITHUB_REPOSITORY_URL
cd helix-project

Install dependencies:

npm install

Start the development server:

npm run dev

Open http://localhost:3001

Production Build

npm run build
npm run start
npm run start -- -p 3001

Switch Integration

HELIX uses Switch as its agent coordination layer and OpenAI Codex as its coding agent.

A dedicated HELIX Control Room is used to trigger repository inspection and coordinate agent work.

The current prototype demonstrates local agent execution and repository inspection. Some room context and message-posting operations remain under verification.

Project Status

This is a hackathon prototype demonstrating evidence-based project recovery and AI-assisted developer handoffs.

Safety

HELIX is designed around human approval before project modifications.

Never commit API keys, credentials, passwords, or local environment files.