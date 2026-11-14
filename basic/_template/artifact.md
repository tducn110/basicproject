# System Design Template Distillation Contract

## Reference

- Retained reference: `/home/pro/.codex/plugins/cache/openai-curated-remote/openai-templates/0.1.1/skills/artifact-template-system-design/assets/reference.docx`
- SHA-256: `13504f6c221a42c1726460a9e865e563355539ff97d702d6c9b2267b4b261d76`
- Render evidence: `/tmp/basic-project-template.JrsEck/reference-render/page-1.png` through `page-7.png`
- Page count: 7
- Section count: 1
- Content controls: none

## Page and visual system

- Letter portrait, 8.50 by 11.00 inches.
- Margins: 0.70 inches left/right/top and 0.62 inches bottom.
- First-page header/footer behavior differs from subsequent pages; recurring footer is retained but renamed for the weekly report series.
- Typeface: Helvetica Neue family. The template uses a large muted blue system-name line, a dark navy large title, navy numbered headings, navy table headers with white text, pale blue key columns, and light blue/gray body-row treatment.
- The template has a title and metadata page, abstract/goals/background, architecture/components, request lifecycle/contracts, consistency/limitations/readiness, alternatives/open questions, and final decision/milestones.

## Editable slot mapping for weekly reports

| Template area | Weekly research-report use |
| --- | --- |
| Cover | Project name, weekly report title, status, author, snapshot date, scope |
| Abstract | Research question, bounded conclusion, evidence scope |
| Goals and Non-Goals | Evidence goals and explicit exclusions |
| Background | Rule/algorithm or architecture problem statement |
| Architecture figure | A generated weekly diagram; Mermaid source is preserved in `../diagrams/` |
| Core components table | Verified source-owner mapping |
| Request lifecycle | Research method or runtime transaction flow |
| Data contracts table | Inputs, outputs, source locations, and limits |
| Consistency table | Traceability and reproducibility cases |
| Readiness | Verification status and evidence gaps |
| Alternatives | Design/research alternatives and trade-offs |
| Open questions | Evidence gaps that require a future decision or experiment |
| Decision and next steps | Recommendation and measurable next milestones |

## Preservation gates

- Preserve the source document page geometry, styles, table grid, header/footer system, typeface, and image position.
- Replace template placeholder text with report content; no bracketed template text may remain.
- Replace only the existing diagram media resource with a generated weekly diagram of the same physical anchor.
- Retain a recognizable source-derived design system rather than applying generic academic formatting.
- Render every final report, inspect every page, and compare visual differences against the reference only as a scope check; content changes are expected.

