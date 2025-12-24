# Code Review Codex - HostelPulse

**Version:** 1.0.0
**Last Updated:** December 24, 2025
**Philosophy:** Operation Bedrock - Stability, Type Safety, Clean Architecture

## Overview

This codex establishes standards for code reviews in the HostelPulse project. All reviews must balance constructive feedback with the project's core philosophy of stability and type safety. Reviews should focus on maintainability, correctness, and adherence to established patterns.

## 1. Review Prerequisites

### Before Starting Review

- [ ] **Spec-Kitty Compliance**: Confirm feature follows active spec-kitty workflow
- [ ] **Test Coverage**: Verify appropriate tests exist (unit + E2E where applicable)
- [ ] **Type Safety**: Ensure zero `any` usage, strict TypeScript compliance
- [ ] **Linting**: All linting rules pass without warnings
- [ ] **Build Success**: Project builds successfully with `mise run -- pnpm build`

### Environment Setup

- [ ] Review on correct Node.js version (20.x via mise)
- [ ] Use `mise run -- pnpm` commands consistently
- [ ] Test locally if changes affect critical paths

## 2. Core Review Categories

### 🔴 Blocking Issues (Must Fix)

- **Type Safety Violations**: Any usage of `any`, implicit `any`, or type assertions
- **Security Issues**: Authentication bypasses, SQL injection risks, XSS vulnerabilities
- **Database Violations**: Missing `propertyId` filtering, unsafe queries
- **Breaking Changes**: API contract changes without migration plans
- **Test Failures**: Any failing tests or reduced coverage

### 🟡 Major Concerns (Should Fix)

- **Architecture Violations**: Server Actions used incorrectly, improper data flow
- **Performance Issues**: N+1 queries, inefficient algorithms, large bundle increases
- **Code Duplication**: Repeated patterns not abstracted into utilities
- **Error Handling**: Missing try/catch, inadequate error messages
- **Accessibility**: Missing ARIA labels, keyboard navigation issues

### 🟢 Minor Improvements (Consider)

- **Code Style**: Formatting inconsistencies, naming improvements
- **Documentation**: Missing JSDoc, unclear variable names
- **Optimization**: Micro-optimizations, bundle size improvements
- **Readability**: Complex expressions that could be simplified

## 3. Technology-Specific Standards

### TypeScript Standards

- [ ] **Strict Mode Compliance**: No implicit any, strict null checks
- [ ] **Interface Definitions**: Proper interface usage over type aliases
- [ ] **Generic Usage**: Appropriate generic constraints and usage
- [ ] **Type Guards**: Proper type narrowing techniques
- [ ] **Utility Types**: Correct usage of `Pick`, `Omit`, `Partial`, etc.

### Next.js 15 Standards

- [ ] **App Router Usage**: Correct route structure and layouts
- [ ] **Server Components**: Appropriate client/server component split
- [ ] **Server Actions**: Proper form handling and validation
- [ ] **Middleware**: Correct authentication and routing logic
- [ ] **API Routes**: RESTful design, proper error responses

### Database Standards (Prisma)

- [ ] **Query Filtering**: All queries filtered by `propertyId`
- [ ] **Relation Loading**: Efficient include/select usage
- [ ] **Transaction Safety**: Proper transaction boundaries
- [ ] **Migration Safety**: Backward-compatible schema changes
- [ ] **Seed Data**: Proper test data seeding

### UI Standards (React + Tailwind)

- [ ] **Component Structure**: Functional components with hooks
- [ ] **State Management**: Appropriate local vs global state usage
- [ ] **Accessibility**: ARIA labels, semantic HTML
- [ ] **Responsive Design**: Mobile-first approach
- [ ] **Performance**: Proper memoization and optimization

## 4. Review Process

### Step 1: Automated Checks

```bash
# Run all quality gates
mise run -- pnpm run lint
mise run -- pnpm run type-check
mise run -- pnpm run test
mise run -- pnpm run test:e2e
mise run -- pnpm run build
```

### Step 2: Manual Code Review

1. **Architecture Review**: Does it follow established patterns?
2. **Security Review**: Any potential vulnerabilities?
3. **Performance Review**: Efficient implementation?
4. **Maintainability Review**: Easy to understand and modify?

### Step 3: Testing Review

- [ ] Unit tests cover business logic
- [ ] Integration tests cover data flow
- [ ] E2E tests cover critical user journeys
- [ ] Error scenarios properly tested

### Step 4: Documentation Review

- [ ] Code is self-documenting with clear naming
- [ ] Complex logic has explanatory comments
- [ ] API changes documented
- [ ] Migration guides provided if needed

## 5. Review Comments Guidelines

### Comment Structure

````
[Category] Brief description

Detailed explanation if needed.

Suggestion:
```typescript
// Suggested code
````

Evidence: [link to documentation/pattern/spec]

```

### Comment Categories
- **BUG**: Logic errors, crashes, data corruption
- **SECURITY**: Authentication, authorization, data exposure
- **PERFORMANCE**: Slow queries, memory leaks, bundle bloat
- **ARCHITECTURE**: Design violations, coupling issues
- **MAINTAINABILITY**: Complex code, poor naming, duplication
- **TESTING**: Missing coverage, flaky tests
- **STYLE**: Formatting, conventions, consistency

### Comment Tone
- **Constructive**: Focus on code improvement, not criticism
- **Specific**: Reference exact lines and provide alternatives
- **Educational**: Explain why the change matters
- **Collaborative**: Suggest rather than demand

## 6. Approval Criteria

### Minimum Requirements for Approval
- [ ] All blocking issues resolved
- [ ] Type safety maintained (zero `any` usage)
- [ ] Tests pass and coverage maintained
- [ ] Build succeeds
- [ ] Security review passed
- [ ] Architecture patterns followed

### Quality Gates
- [ ] **Type Check**: `mise run -- pnpm run type-check` passes
- [ ] **Linting**: `mise run -- pnpm run lint` passes
- [ ] **Testing**: `mise run -- pnpm run test:all` passes
- [ ] **Build**: `mise run -- pnpm run build` succeeds

## 7. Common Issues & Solutions

### Type Safety Issues
**Problem**: Using `any` or type assertions
**Solution**: Define proper interfaces, use generics, implement type guards

### Database Issues
**Problem**: Missing property filtering
**Solution**: Always include `where: { propertyId }` in queries

### Performance Issues
**Problem**: N+1 queries
**Solution**: Use `include` for relations, implement proper indexing

### Architecture Issues
**Problem**: Business logic in components
**Solution**: Extract to Server Actions, implement proper separation

## 8. Review Checklist Template

Use this template for comprehensive reviews:

### Architecture & Design
- [ ] Follows spec-kitty specifications
- [ ] Server/client component split appropriate
- [ ] State management strategy correct
- [ ] Error boundaries implemented

### Code Quality
- [ ] TypeScript strict compliance
- [ ] No console.log in production code
- [ ] Proper error handling
- [ ] Code duplication minimized

### Security
- [ ] Input validation implemented
- [ ] Authentication checks present
- [ ] SQL injection prevention
- [ ] XSS protection measures

### Performance
- [ ] Efficient database queries
- [ ] Proper memoization
- [ ] Bundle size impact assessed
- [ ] Runtime performance considerations

### Testing
- [ ] Unit test coverage adequate
- [ ] Integration tests present
- [ ] E2E tests for critical flows
- [ ] Error scenarios covered

### Documentation
- [ ] Code is self-documenting
- [ ] Complex logic explained
- [ ] API documentation updated
- [ ] Migration notes provided

## 9. Escalation Guidelines

### When to Escalate
- **Security Vulnerabilities**: Immediate escalation required
- **Data Loss Risks**: Escalation to engineering lead
- **Architecture Violations**: Discussion with tech lead
- **Performance Degradation**: Performance team involvement

### Escalation Process
1. Document the concern in review comments
2. Tag appropriate team members
3. Schedule architecture review if needed
4. Involve product owner for business impact assessment

## 10. Continuous Improvement

### Review Metrics
- **Review Turnaround Time**: Target < 24 hours for urgent changes
- **Defect Detection Rate**: Track bugs found in review vs post-merge
- **Review Coverage**: Percentage of code reviewed
- **Team Satisfaction**: Regular feedback collection

### Process Improvements
- **Retrospectives**: Monthly review of process effectiveness
- **Training**: Regular sessions on common issues
- **Automation**: Increase automated checks coverage
- **Templates**: Refine review templates based on feedback

---

**Remember**: Code reviews are about improving code quality and team learning. Focus on the code, not the author. Every review should leave the codebase better than before.
```
