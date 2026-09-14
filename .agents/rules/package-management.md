---
trigger: always_on
description: Enforce the use of Bun for all package management commands.
---
# Package Management Rule

This project strictly uses [Bun](https://bun.sh/) as its package manager. When interacting with this project:

- **ALWAYS** use `bun add <package>` instead of `npm install`, `pnpm add`, or `yarn add`.
- **ALWAYS** use `bun remove <package>` for uninstalling packages.
- **ALWAYS** use `bun run <script>` to execute scripts.
- **NEVER** use `npm`, `pnpm`, or `yarn` commands in this workspace.
