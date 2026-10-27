# 🏦 DORA / MaRisk  Calculator

**An interactive decision tree for classifying external and intra-group services under European financial services regulation.**

🔗 **[Live tool → jelenatm1108.github.io/reg-outsourcing-calculator](https://jelenatm1108.github.io/reg-outsourcing-calculator/)**

---

## What is this?

Classifying an outsourcing or ICT arrangement under European financial services regulation requires navigating three overlapping frameworks simultaneously — and most of the people initiating these arrangements (procurement specialists, business owners, project managers) don't live in risk management every day.

This tool is a **pre-risk assessment shortcut**: answer a series of guided questions, and the calculator outputs the correct regulatory classification with applicable obligations, flags, and a structured checklist — no risk background required.

**This tool does not constitute legal, regulatory, or compliance advice. Always consult your legal and compliance team before making outsourcing decisions**!!!

---

## Regulatory coverage

| Framework | Scope |
|---|---|
| **MaRisk AT 9** | Outsourcing requirements for German institutions |
| **DORA EU 2022/2554** | ICT third-party risk — Arts. 28, 30, 31 |
| **EBA/GL/2019/02** | EBA outsourcing guidelines |
| **§ 25b KWG** | German Banking Act outsourcing provision |
| **ITS 2024/2956** | Register of Information technical standards |

---

## How it works

The decision tree asks a sequence of guided questions covering:

1. **ICT involvement** — does the arrangement involve software, cloud, data centres, networks, or IT-based processing?
2. **Outsourcing test** — would the institution normally perform this activity itself?
3. **Materiality** — could an outage or poor quality materially harm the institution?
4. **Criticality** — does the service support a critical or important function (CIF) under EBA GL?
5. **Arrangement type** — external provider or intra-group?
6. **Special flags** — is the provider a potential CTPP? Is the provider outside the EU? Does the intra-group provider sub-outsource to an external vendor?

Each answer routes the user through the tree until a classification is reached. The hints at each step explain what each question means in plain language — no regulatory knowledge required.

**Dynamic flags** are applied on top of the classification result where relevant:

- ⚡ **CTPP flag** — triggered if the provider is a major cloud or potential Critical Third-Party Provider under DORA Art. 31
- ⛓ **Sub-outsourcing flag** — triggered if an intra-group provider sub-contracts to an external vendor; surfaces the full chain of obligations
- 🌐 **Non-EU provider flag** — triggered if the provider is located outside the EU; surfaces DORA Art. 28(4)(g) additional contractual requirements

---

## Classification output

The tool determines:

- **Materiality** — material vs non-material outsourcing
- **Criticality** — critical or important function (CIF) vs non-critical
- **ICT scope** — pure ICT service, outsourcing + ICT, or outsourcing only
- **Arrangement type** — external vs intra-group

And maps the result to one of **9 classifications**, each with:
- Applicable regulatory framework references
- BaFin notification requirements
- Exit plan obligations
- Key implications in plain language
- An owner-tagged checklist (LEGAL / RISK / OPS)

---

## The 9 classifications

| Class | Description | BaFin | Exit Plan |
|---|---|---|---|
| **Class 1** | Material Outsourcing — External | ✅ Required | Yes |
| **Class 2** | Non-Material Outsourcing — non-Critical | Not required | No |
| **Class 3** | ICT Service — External (pure ICT, not outsourcing) | Not required | No |
| **Class 4** | Material Outsourcing — ICT, Critical Function | ✅ Required | Yes |
| **Class 5** | Material Outsourcing — ICT, non-Critical Function | ✅ Required | Yes |
| **Class 6** | Non-Material ICT Service — non-Critical (Outsourcing + ICT) | Not required | No |
| **IG1** | Intra-Group — Material Outsourcing | ✅ Required | No* |
| **IG2** | Intra-Group — Material Outsourcing, ICT, Critical Function | ✅ Required | Yes** |
| **IG3** | Intra-Group — Material Outsourcing, ICT, non-Critical | ✅ Required | No* |

\* MaRisk AT 9.6 intra-group exemption applies.  
\*\* DORA Art. 28(8) exit obligation applies — MaRisk intra-group exemption does **not** override DORA for Critical Function ICT arrangements.

Two **out-of-scope exit nodes** cover arrangements outside the outsourcing definition:
- **Outside outsourcing scope** — no system access, no regulated function delivered
- **Outside outsourcing scope — data access** — system or data access exists but no regulated function; GDPR obligations flagged

---

## Who is it for?

- **Procurement specialists** starting a vendor conversation
- **Business owners** scoping an outsourcing arrangement
- **Project managers** who need a quick regulatory read before escalating to risk
- **Risk & compliance teams** who want a consistent first-pass classification from the business

---

## Status

> ⚠️ **Work in progress.** The classification logic is grounded in current regulatory frameworks but this tool is not a substitute for legal or regulatory advice. Always validate outputs with your compliance or risk team.

Feedback, issues, and pull requests welcome.

---

## Changelog

### v2.0.0
- Reduced from 17 internal result nodes to 9 classifications + 2 exit nodes
- Sub-outsourcing converted from separate result nodes to a dynamic flag (⛓) — surfaces full chain of obligations inside any material classification result
- CIF vs non-Critical distinction handled dynamically within merged classes — no longer separate result nodes
- Intra-group detection converted to state flag — simplifies IG classification routing
- Added Class 6: Non-Material ICT Service — non-Critical (Outsourcing + ICT) as distinct classification
- IG1 now covers both Critical and non-Critical non-ICT intra-group arrangements with dynamic CIF implications
- Non-EU provider flag added for ICT CIF external arrangements (DORA Art. 28(4)(g))

### v1.0.0
- Initial release with 12-class structure
- Interactive decision tree covering MaRisk AT 9, DORA, EBA GL, § 25b KWG
- BaFin notification logic with two-step notification process
- Reassessment flow with materiality change detection

---

## Built by

[Jelena Tanovic Milosavljevic] https://www.linkedin.com/in/jelena-tanovic-milosavljevic/ — Outsourcing Manager| Vibe coded with curiosity and caffeine.
