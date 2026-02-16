# Contributing to Project Namirha

Project Namirha is an open project under AGPL v3. Contributions are welcome in four areas: code, protocol, mathematics, and documentation.

## Before Contributing

Read `docs/ARCHITECTURE.md` to understand the three-layer sovereignty architecture. The project has philosophical commitments that shape technical decisions — please respect them.

**Key principles that guide contributions:**

- Sovereignty means the human stays inside the process. Don't add features that automate away human agency.
- Proxy is a companion, not a filter. It does not repost Executor output.
- Three separate API calls per turn (in the React frontend) are intentional, not inefficient.
- The ~30% token overhead from GTPS obligations is by design (regenerative function).
- Crystallization is not failure; premature crystallization is failure.

## Code Contributions

### Python (Vessel)

- Follow PEP 8 style
- The vessel is intentionally a single file (`vessel.py`). Don't split it into a package unless there's a strong reason.
- Test both the Ollama path (`HAS_OLLAMA=True`) and the mock path (`HAS_OLLAMA=False`)
- All API endpoints must return valid JSON
- Don't auto-inject content between LLM inhabitants — the scratchpad is human-curated

### JavaScript/React (Frontend)

- Follow standard JS style
- The React component (`ThreePersonaGTPS_v2_3.jsx`) is intentionally a single file
- Don't add external state management — React state is sufficient for this architecture
- Preserve the three-column layout (Executor / Whistleblower / Proxy)
- The Proxy column is the primary conversation; Executor and Whistleblower are reference panels

### General Code Guidelines

- Don't add dependencies without justification
- Error handling should be transparent (surface errors to user, don't swallow them)
- No praise, emotional simulation, or relational investment language in system prompts (Clause 32 Point 7)

## Protocol Contributions

The GTPS protocol (JSON files in `protocol/`) evolves through a deliberate process.

### Proposing New Clauses

1. Open an issue describing the sovereignty problem the clause addresses
2. Explain the philosophical grounding (which existing principles does it connect to?)
3. Specify how the clause maps to the three personas (Executor/Whistleblower/Proxy behavior)
4. Provide example patterns (how would the clause manifest in conversation?)
5. Identify integration with existing clauses

### Modifying Existing Clauses

- Clause 32 Point 6 has exact required language about sovereignty. Do not alter it.
- Changes to clauses must preserve backward compatibility with the GTPS-T topology
- Protocol changes should be reflected in both `gtps_v1_4_12.json` and `gtps-t_v1_3.json`

### Protocol File Format

- JSON files must be valid JSON (no JavaScript-style comments)
- Clause IDs are sequential integers (1-37 currently)
- Each clause must have at minimum: `id`, `title`, `description`

## Mathematical Contributions

The whitepaper and research papers use LaTeX.

### Format

- Use standard LaTeX with `amsmath`, `amssymb`
- Compile with `pdflatex`
- Define all variables on first use
- Include honest gap analysis — distinguish what's implemented from what's proposed

### Research Papers

Research contributions from different AI systems (ChatGPT, Grok) go in `research/` with naming convention: `{source}_{TopicName}.tex`

### Whitepaper

The main whitepaper (`whitepaper/Harmonic_Transformers_v6.tex`) is the canonical mathematical reference. Changes should be significant (new formalizations, corrected proofs, empirical results).

## Documentation

- User-facing docs go in `docs/`
- Keep philosophical content intact — the Steiner/Bohm/Fraser grounding is integral, not decorative
- Don't sanitize philosophical language into generic tech-speak
- Technical accuracy matters but so does communicating the *why*, not just the *how*

## Testing

### Vessel

```bash
# Syntax check
python -c "import ast; ast.parse(open('vessel/vessel.py').read())"

# JSON validation
python -m json.tool protocol/gtps_v1_4_12.json > /dev/null
python -m json.tool protocol/gtps-t_v1_3.json > /dev/null
```

### LaTeX

```bash
# Compile whitepaper
cd /tmp && pdflatex /path/to/whitepaper/Harmonic_Transformers_v6.tex

# Compile research papers
cd /tmp && pdflatex /path/to/research/chatgpt_TieredFatigueDetection.tex
```

### SKILL.md

- YAML frontmatter must parse correctly
- Description must be under 1024 characters
- No XML angle brackets in frontmatter
- Name must be kebab-case

## Submitting

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run the validations above
5. Submit a pull request with a clear description of what changed and why

## License

By contributing, you agree that your contributions will be licensed under:
- AGPL v3 for code
- CC BY-NC-SA 4.0 for protocol and documentation

## Contact

Schnee Bashtabanic — schnee-bashtabanic@proton.me
