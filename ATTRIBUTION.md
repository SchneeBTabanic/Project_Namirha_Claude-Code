# Attribution & License Information

## Project License

**Three-Persona GTPS v2.1** is licensed under the
**GNU Affero General Public License v3.0** (AGPL-3.0-or-later).

See [LICENSE](./LICENSE) for the full text.

**Commercial Exception:** Commercial use requires a separate license.
Contact schnee-bashtabanic@proton.me for details.

---

## OpenClaw / pi-mono Attribution (MIT License)

This implementation adapts structured validation and error feedback
patterns from:

- **OpenClaw** — https://github.com/openclaw/openclaw
- **pi-mono** — https://github.com/badlogic/pi-mono

Copyright (c) Peter Steinberger / Mario Zechner

Licensed under the MIT License:
https://github.com/openclaw/openclaw/blob/main/LICENSE

### Specifically Adapted Patterns

| Pattern | OpenClaw Origin | GTPS Usage |
|---------|----------------|------------|
| TypeBox-style schema validation | Tool argument validation via TypeBox + AJV | Executor response metadata validation |
| Dual output (content + details) | Tool results carry both LLM text and structured metadata | Executor returns `userText` + `processMetadata` |
| Validation error feedback loop | Invalid tool calls return errors to LLM for self-correction | Whistleblower feeds alerts back to Executor for retry |
| Pre-execution hook | Extensions can intercept and block tool calls | Whistleblower validates before Proxy receives output |

### MIT + AGPL Compatibility

The MIT License is permissive and fully compatible with the AGPL v3.
The combined work is released under the AGPL v3 (the more restrictive
license governs the combined work). The OpenClaw/pi-mono patterns
remain available under their original MIT License.

For a detailed analysis of what was adapted and why, see
[docs/openclaw_analysis_for_gtps.md](./docs/openclaw_analysis_for_gtps.md).

---

## Philosophical & Intellectual Credits

### Architecture & Sovereignty Framework
- **Schnee Bashtabanic** — Three-Persona concept, GTPS protocol suite,
  Proxy-as-companion architecture, Manichaean sovereignty insight

### Clause 32 v2.0 Development
- **Schnee Bashtabanic** — Original Manichaean insight, sovereignty
  framework, response pattern example phrases
- **Grok (xAI)** — Philosophical synthesis, symmetry/entropy framing
- **Claude (Anthropic)** — Sovereignty revision (Point 6 language),
  integration architecture, code implementation

### Philosophical Foundations
- **Rudolf Steiner** — Manichaean framework, form/life dynamics,
  timing sensitivity, redemption through participation
- **Anthroposophy** — Ill-timed good becoming adversarial form,
  the principle that good redeems by participating

---

## Protocol Licenses

| Document | License |
|----------|---------|
| GTPS v1.4.11 (text protocol) | CC BY-NC-SA 4.0 |
| GTPS-T v1.2 (tri-persona topology) | CC BY-NC-SA 4.0 |
| Clause 32 v2.0 reformulation | CC BY-NC-SA 4.0 |
| Three-Persona GTPS code | AGPL v3 |
