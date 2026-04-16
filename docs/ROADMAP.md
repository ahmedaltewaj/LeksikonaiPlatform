# Leksikon.ai Roadmap

_Last Updated: 2026-04-11_

## Overview

Leksikon.ai is building an AI-powered solution for Danish SMEs. The roadmap is based on the vision document and MVP scope, organized into quarterly milestones leading to sustainable revenue.

---

## Phase 1: Foundation (Months 1-2)

### Milestone 1.1: Market Research Complete
**Target**: End of Month 1
**Owner**: CMO

**Deliverables**:
- [ ] Danish SME market analysis documented
- [ ] Top 3 customer pain points identified and ranked
- [ ] Competitive landscape analysis complete
- [ ] Brand identity guidelines established
- [ ] Pricing model research completed

**Issues**: LEKAA-3 (market analysis), LEKAA-5 (competitive landscape), LEKAA-6 (brand identity)

---

### Milestone 1.2: Technical Foundation
**Target**: End of Month 2
**Owner**: CTO/Engineer

**Deliverables**:
- [ ] Tech stack decisions documented (docs/TECH-STACK.md)
- [ ] System architecture designed (docs/ARCHITECTURE.md)
- [ ] Design system established (docs/DESIGN-SYSTEM.md)
- [ ] Project repository initialized with structure
- [ ] CI pipeline configured
- [ ] Branch protection and PR workflow enabled

**Issues**: LEKAA-7 (tech stack), LEKAA-4 (architecture), LEKAA-8 (design system), LEKAA-9 (repo), LEKAA-12 (CI), LEKAA-19 (branch protection)

---

## Phase 2: MVP Launch (Months 3-4)

### Milestone 2.1: MVP Development Complete
**Target**: End of Month 3
**Owner**: Engineer

**Deliverables**:
- [ ] User authentication system
- [ ] Email/webhook integration for inquiries
- [ ] Gemini AI integration for response generation
- [ ] Response review and approval interface
- [ ] Basic analytics dashboard
- [ ] Core feature end-to-end functional

**Issues**: LEKAA-11 (implement core feature)

---

### Milestone 2.2: MVP Deployed
**Target**: Mid Month 4
**Owner**: Engineer

**Deliverables**:
- [ ] Production environment configured
- [ ] Application deployed and accessible
- [ ] DNS and TLS configured
- [ ] Basic monitoring and alerting active
- [ ] Smoke test passing
- [ ] User documentation created

**Issues**: LEKAA-13 (deploy), LEKAA-18 (user docs)

---

## Phase 3: Validation (Months 4-6)

### Milestone 3.1: Early Users Onboarded
**Target**: End of Month 5
**Owner**: CEO/CMO

**Deliverables**:
- [ ] 10+ Danish SME users registered
- [ ] User feedback collected and categorized
- [ ] Critical bugs identified and fixed
- [ ] Initial user testimonials obtained

**Issues**: LEKAA-16 (collect feedback), LEKAA-17 (fix critical bugs)

---

### Milestone 3.2: Product-Market Fit
**Target**: End of Month 6
**Owner**: CEO

**Success Metrics**:
- 50+ paying customers
- 80%+ AI response coverage
- 60%+ approval rate without edits
- NPS 40+

**Deliverables**:
- [ ] Product-market fit validated
- [ ] Growth strategy defined
- [ ] Expansion opportunities identified

---

## Phase 4: Growth (Months 7-12)

### Milestone 4.1: Revenue Generation
**Target**: Month 9
**Owner**: CEO

**Goals**:
- €5K MRR
- Sustainable pricing model
- Clear expansion path

---

### Milestone 4.2: Scale Ready
**Target**: Month 12-18
**Owner**: CEO/CTO

**Goals**:
- €10K MRR
- Profitable operation
- Nordic expansion evaluation

---

## Issue Dependency Notes

### Critical Path for MVP
1. Tech stack evaluation (LEKAA-7) must complete before architecture (LEKAA-4)
2. Architecture must complete before core feature implementation (LEKAA-11)
3. Repo initialization (LEKAA-9) should happen in parallel with other prep work

### Parallel Workstreams
- CMO: Market research, brand identity can proceed independently
- Engineer: Project setup, CI, tech stack evaluation can proceed in parallel

---

## Adjustment Process

This roadmap is a living document. Adjustments should be made:
- Monthly review with team
- After each major feedback cycle
- When market conditions change
- Before beginning new phase

To adjust: Create an issue tagged with `roadmap-review` and assign to CEO.