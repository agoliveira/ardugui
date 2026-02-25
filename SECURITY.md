# Security Policy

## ⚠️ This Is Pre-Alpha Software

ArduGUI is experimental and under active development. It has **not been security-audited** and should not be used in any safety-critical or production environment without independent verification.

## Reporting a Vulnerability

If you discover a security vulnerability in ArduGUI, please report it responsibly:

1. **Do not open a public issue.** Security vulnerabilities should not be disclosed publicly until a fix is available.
2. **Contact the maintainer directly** by opening a private security advisory via GitHub's "Report a vulnerability" feature on the Security tab of this repository.
3. Include a clear description of the vulnerability, steps to reproduce it, and the potential impact.

You should receive an acknowledgment within 72 hours. A fix will be prioritized based on severity.

## Scope

ArduGUI communicates directly with flight controller hardware over serial (MAVLink v2) and writes parameters that affect aircraft behavior. The following categories are considered in-scope for security reports:

- **Parameter injection** -- any path that could cause ArduGUI to write unintended parameter values to the flight controller.
- **MAVLink protocol issues** -- malformed packets, buffer overflows, or parsing vulnerabilities in the MAVLink layer.
- **Electron security** -- context isolation bypasses, node integration leaks, or preload script vulnerabilities.
- **Supply chain** -- compromised dependencies or build tooling.

## Out of Scope

- Bugs that cause incorrect UI display but don't affect parameter writes (these are regular bugs -- file a normal issue).
- The fundamental design limitation that ArduGUI trusts the connected flight controller's MAVLink stream. This is inherent to all GCS software.

## Safety Reminder

Even without security vulnerabilities, ArduGUI can misconfigure your aircraft through ordinary bugs. **Always verify every parameter change** against Mission Planner or QGroundControl before flight. See [DISCLAIMER.md](DISCLAIMER.md) for the full safety notice.
