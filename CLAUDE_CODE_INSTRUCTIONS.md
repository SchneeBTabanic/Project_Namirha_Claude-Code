# Claude Code Instructions — Project Namirha v2.3

## Context

You are working on Project Namirha v2.3, a three-layer sovereignty architecture
for healthy Human-AI interaction. This is the developer-ready version of the 
project. The original exploration lives at:
  https://github.com/SchneeBTabanic/Project_Namirha (v1.x — do not modify)

The white paper has its own repo:
  https://github.com/SchneeBTabanic/Harmonic_Transformers

This repo (Project_Namirha_Claude-Code) is where the current v2.3 code,
protocol, skill, and vessel live.

The project has two deliverables:
1. **Skill** (Scenario A): A Claude Skill file for browser-only users (no API)
2. **Vessel** (Scenario B): A Python server for local power users with Ollama

## First Steps

1. Clone the repo: `git clone https://github.com/SchneeBTabanic/Project_Namirha_Claude-Code.git`
2. Clear out any old files that conflict with the new structure
3. Copy in the new files from the project-namirha/ folder provided
4. Proceed with the task list below

## Repository Structure

```
project-namirha/
├── skill/golden-thread-protocol/SKILL.md
├── vessel/vessel.py
├── vessel/requirements.txt
├── vessel/README.md
├── protocol/gtps_v1_4_12.json
├── protocol/gtps-t_v1_3.json
├── protocol/GTPS_Clause_32_Reformulation_v2_0.md
├── whitepaper/Harmonic_Transformers_v6.tex
├── whitepaper/Pod_Architecture_Formalization_v1.md
├── frontend/ThreePersonaGTPS_v2_3.jsx
├── frontend/changelog_v2_3.md
├── research/chatgpt_TieredFatigueDetection.tex
├── research/chatgpt_TriadicDynamicalCoupling.tex
├── research/chatgpt_GeometricSupervisoryLayer.tex
├── research/grok_GeometricFatigueModel.py
├── docs/USER_GUIDE.md
```

## Task List (in order)

### Phase 1: Validation & Fixes

1. **Validate vessel.py runs**
   - Check Python syntax (no runtime errors on import)
   - Verify Flask routes are correct
   - Test with mock responses (HAS_OLLAMA=False path)
   - Fix any bugs found
   - Ensure all API endpoints return valid JSON

2. **Validate SKILL.md format**
   - Check YAML frontmatter parses correctly
   - Verify description is under 1024 characters
   - Verify no XML angle brackets in frontmatter
   - Verify name is kebab-case
   - Check that SKILL.md body follows Anthropic best practices

3. **Validate JSON protocols**
   - gtps_v1_4_12.json: verify valid JSON (it has comments that need removing)
   - gtps-t_v1_3.json: verify valid JSON
   - Ensure all clause IDs are sequential and complete

4. **Validate LaTeX**
   - Check Harmonic_Transformers_v6.tex compiles (pdflatex)
   - Fix any compilation errors
   - Verify all equations render

### Phase 2: Generate Missing Files

5. **Create README.md** (root level)
   - Project name, one-paragraph description
   - Two scenarios (Skill vs Vessel) clearly explained
   - Quick start for each scenario
   - Architecture diagram (ASCII art)
   - Links to whitepaper and protocol
   - License (AGPL v3)
   - Credits (Schnee Bashtabanic, ChatGPT, Grok, Claude)

6. **Create vessel/requirements.txt**
   ```
   flask>=3.0
   ollama>=0.3
   numpy>=1.24
   ```

7. **Create vessel/README.md**
   - Focused setup guide for the vessel only
   - Hardware requirements
   - Model recommendations
   - Step-by-step installation
   - Screenshot/description of the UI layout

8. **Create docs/ARCHITECTURE.md**
   - The three-layer architecture explained
   - Layer 1: Temporal (fatigue, recapitulation, pods)
   - Layer 2: Behavioral (three personas, Clause 32)
   - Layer 3: Structural (harmonic encoding — proposed)
   - The Vessel concept (possession, sovereign ledgers, scratchpad)
   - The Skill concept (GTPS as behavioral overlay)
   - Diagrams showing data flow

9. **Create docs/CONTRIBUTING.md**
   - How to contribute
   - Code style (Python: PEP 8, JS: standard)
   - Protocol contributions (how to propose new clauses)
   - Mathematical contributions (LaTeX format)
   - Testing expectations

10. **Create LICENSE**
    - Full AGPL v3 text
    - With commercial exception notice (contact schnee-bashtabanic@proton.me)
    - OpenClaw/pi-mono MIT attribution note

### Phase 3: Polish & Integration

11. **Restore rhythm/breathing signature naming**
    - In vessel.py's FatigueDetector class, rename or annotate the `_cc` method:
      add a comment: "# CC (Curvature Collapse) = Rhythm component. Measures
      # whether the conversation's breathing pattern has flattened.
      # See white paper Section 6.1 (Rhythm-Signature Gap)."
    - Add an explicit `rhythm` key alongside `cc` in the fatigue components
      output, so the UI can display "Rhythm" instead of just "CC"
    - In the vessel UI's fatigue display, show "Rhythm" not "CC" to the user
    - This is conceptually important: rhythm names what the human experiences,
      curvature collapse names what the geometry shows. Both should be visible.

12. **Clean up gtps_v1_4_12.json**
    - Remove JavaScript-style comments (// ...) which are invalid JSON
    - Ensure all 37 clauses are present with full content
    - Clauses 1-31 and 33-36 can be found in the original gtps_v1_4_11.json
      which should be in the uploads or available in the repo
    - Clause 32 full content is in GTPS_Clause_32_Reformulation_v2_0.md
    - Clause 37 full content is already in the file

13. **Update whitepaper (if time permits)**
    - Ensure v6 compiles cleanly
    - Add a paragraph in the conclusion about the Vessel architecture
    - Add the Skill concept to the "Implementation Pathways" section

14. **Create .gitignore**
    ```
    __pycache__/
    *.pyc
    vessel_data/
    session_ledger/
    *.aux
    *.log
    *.pdf
    .env
    node_modules/
    ```

### Phase 4: Final Review

15. **Run all validations one more time**
    - Python: `python -c "import vessel"` (no errors)
    - JSON: `python -m json.tool protocol/gtps_v1_4_12.json`
    - LaTeX: `pdflatex whitepaper/Harmonic_Transformers_v6.tex`
    - YAML: Check SKILL.md frontmatter

16. **Git commit and push**
    - Commit with meaningful message:
      "v2.3: GTPS v1.4.12, Vessel v2, Claude Skill, Harmonic Transformers v6"
    - Push to: https://github.com/SchneeBTabanic/Project_Namirha_Claude-Code
    - Also update the Harmonic_Transformers repo with the v6 white paper:
      https://github.com/SchneeBTabanic/Harmonic_Transformers

## Important Notes

- The GTPS JSON files currently have JavaScript-style comments (// ...) that
  make them invalid JSON. These MUST be removed or converted to valid JSON.
  The content of those comments should be preserved in description fields.

- vessel.py uses `from ollama import Client` which may not be installed.
  The code handles this gracefully (HAS_OLLAMA=False fallback). Test both paths.

- The ThreePersonaGTPS_v2_3.jsx is a React component that requires a build
  environment. It's included as reference, not as a runnable artifact.
  Document this in the frontend/README or as a note.

- The research/*.tex files are standalone LaTeX documents from ChatGPT.
  They should compile independently. Verify.

- The Vessel concept (possession, sovereign ledgers, scratchpad) is the
  novel architectural contribution. Make sure ARCHITECTURE.md explains this
  clearly — it's what distinguishes this project from other multi-agent systems.

## Philosophical Reminders

This is not just a software project. The code implements a philosophical
framework about human sovereignty in AI interaction. Key principles:

- Sovereignty: the right to remain inside the process
- Crystallization is not failure; premature crystallization is failure
- The LLM inhabits the vessel; it doesn't own it
- The human controls timing, selection, and recapitulation
- Diversity of models is a feature, not a workaround

When writing documentation, respect these principles. Don't sanitize the
philosophical content into generic tech-speak. The Steiner/Bohm/Fraser
grounding is integral, not decorative.

## Author

Schnee Bashtabanic (schnee-bashtabanic@proton.me)
Mathematical contributions: ChatGPT (OpenAI), Grok (xAI)
Integration architecture: Claude (Anthropic)
All synthesis and sovereign will: Schnee Bashtabanic
