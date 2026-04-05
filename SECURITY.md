# Security Policy

## Supported Versions

Only the latest version published on npm is supported with security fixes. No backport patches are issued for older versions.

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not open a public GitHub issue**. Instead, use [GitHub Security Advisories](https://github.com/Davecelot/skilly-hand/security/advisories/new) to report it privately.

Include as much detail as possible:

- A description of the vulnerability and its potential impact
- Steps to reproduce or a minimal proof-of-concept
- The version of `@skilly-hand/skilly-hand` you are using
- Your environment (OS, Node.js version)

## Response Timeline

This is a solo-maintained project. I will do my best to:

- Acknowledge the report within a few days
- Triage and provide an estimated fix timeline once reviewed
- Publish a patch and disclose the issue publicly after the fix ships

## Out of Scope

The following are not considered security vulnerabilities in this project:

- Content inside skill `.md` files — these are prose instructions for AI agents, not executable code
- Vulnerabilities in third-party dependencies — please report those directly to the upstream package maintainers
- Issues that require physical access to the machine running the CLI

## Please Do Not

- Disclose the vulnerability publicly before a fix has been released
- Open a public GitHub issue to report security concerns
