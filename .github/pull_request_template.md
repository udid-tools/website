## Summary

<!-- What problem does this change solve, and why is this design appropriate? -->

## Change type

- [ ] Bug fix
- [ ] Feature
- [ ] Content or metadata
- [ ] Refactor with no intended visible behavior change
- [ ] Dependency or build tooling
- [ ] Security hardening

## User-visible behavior

- [ ] The current public content, layout, and interaction contract remains intact or the intentional change is described below.
- [ ] Responsive behavior, keyboard access, reduced motion, and major browsers were considered.

## Security and privacy review

- [ ] No secrets, result tokens, profile payloads, or device identifiers are logged, tracked, committed, or included in fixtures.
- [ ] New untrusted-input paths have negative and resource-limit tests.
- [ ] New dependencies are justified below and have no unreviewed install scripts.
- [ ] Release and deployment changes still deploy the attested `.vercel/output` artifact without rebuilding.

### Dependency justification

<!-- Purpose, alternatives, license, maintenance/security posture, lifecycle scripts, and transitive impact. Write "None" otherwise. -->

## Verification

- [ ] `npm run verify`
- [ ] Relevant routes were checked with synthetic data only.
