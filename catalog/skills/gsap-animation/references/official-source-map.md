# Official GSAP Source Map

Extracted: 2026-05-03

This skill may only use official GSAP sources. The official GSAP docs page links the official `greensock/gsap-skills` repository as "AI Skills", so that repository is accepted as source material for agent-oriented guidance.

## Primary Sources

| Source | Use |
| --- | --- |
| https://gsap.com/docs/v3/ | Documentation index, GSAP version navigation, core/plugin taxonomy, official AI Skills link |
| https://gsap.com/docs/v3/Installation/ | Package installation, module/script options, plugin registration FAQ, public npm package guidance |
| https://gsap.com/docs/v3/GSAP/ | Core object, tweens, timelines, sequencing, control methods |
| https://gsap.com/docs/v3/GSAP/gsap.context()/ | Context scoping and cleanup with `revert()` |
| https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/ | Responsive conditions, cleanup, and `prefers-reduced-motion` handling |
| https://gsap.com/docs/v3/Plugins/ScrollTrigger/ | ScrollTrigger registration, tween/timeline usage, pin, scrub, snap, callbacks |
| https://gsap.com/resources/React/ | React `useGSAP()`, scope, cleanup, SSR/client guidance, `contextSafe()` |
| https://github.com/greensock/gsap-skills | Official AI skill repository linked from GSAP docs |

## Official AI Skill Sources

| Source | Use |
| --- | --- |
| https://raw.githubusercontent.com/greensock/gsap-skills/main/skills/gsap-core/SKILL.md | Agent-oriented core tween, transform, easing, `matchMedia()`, and recommendation guidance |
| https://raw.githubusercontent.com/greensock/gsap-skills/main/skills/gsap-react/SKILL.md | Agent-oriented React, `useGSAP()`, context, cleanup, SSR, and callback guidance |
| https://raw.githubusercontent.com/greensock/gsap-skills/main/skills/gsap-scrolltrigger/SKILL.md | Agent-oriented ScrollTrigger registration, scroll-linked animation, pin, scrub, and cleanup guidance |
| https://raw.githubusercontent.com/greensock/gsap-skills/main/skills/gsap-performance/SKILL.md | Agent-oriented transform/performance cautions |

## Verification Rule

When a GSAP API or behavior is not represented in these local reference files, check the official docs before generating implementation guidance. If the official docs conflict with a local reference, the official docs page wins and this skill should be updated.
