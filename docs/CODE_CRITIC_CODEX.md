# Code Critic Codex - AI Code Analysis Framework

**Version:** 1.0.0
**Last Updated:** December 24, 2025
**Target:** AI Code Critics & Automated Analysis Tools
**Philosophy:** Operation Bedrock - Zero Tolerance for Technical Debt

## Overview

This codex provides guidelines for AI-powered code critics in the HostelPulse project. AI critics must operate with surgical precision, focusing on objective, measurable code quality metrics while respecting the project's strict standards for type safety, security, and maintainability.

## 1. Critic Operating Principles

### Core Philosophy

- **Zero Tolerance**: No compromises on type safety, security, or established patterns
- **Surgical Precision**: Focus on actionable, specific feedback
- **Context Awareness**: Understand spec-kitty workflow and project architecture
- **Evidence-Based**: All criticism must be supported by code evidence

### Behavioral Guidelines

- **Never Subjective**: Base criticism on objective standards, not personal preferences
- **Actionable Feedback**: Every comment must include a specific fix or improvement path
- **Pattern Recognition**: Identify systemic issues, not just isolated problems
- **Educational Focus**: Explain reasoning to help developers learn

## 2. Automated Analysis Priorities

### 🔴 Critical Violations (Block Merge)

**Type Safety Violations**

- Any usage of `any` type
- Implicit `any` in function parameters
- Missing return type annotations
- Unsafe type assertions (`as any`)

**Security Violations**

- Missing input validation in Server Actions
- Database queries without `propertyId` filtering
- Authentication bypass vulnerabilities
- SQL injection risks

**Architecture Violations**

- Business logic in React components
- Direct database access outside Server Actions
- Improper client/server boundary crossing
- Violation of established data flow patterns

### 🟡 Quality Issues (Require Discussion)

**Performance Issues**

- N+1 query patterns
- Inefficient data structures
- Unnecessary re-renders
- Large bundle size increases

**Maintainability Issues**

- Code duplication > 3 instances
- Functions > 50 lines
- Complex conditional logic
- Missing abstraction opportunities

**Testing Gaps**

- Missing test coverage for business logic
- Untested error paths
- Flaky test patterns
- Missing integration tests

### 🟢 Improvement Suggestions (Optional)

**Code Style Issues**

- Inconsistent naming conventions
- Formatting violations
- Import organization problems
- Comment quality issues

## 3. Analysis Framework

### Phase 1: Static Analysis

```
Input: Code changes, file context, project structure
Process: AST parsing, pattern matching, rule evaluation
Output: Structured violation reports with severity levels
```

### Phase 2: Context Analysis

```
Input: Violation reports, spec-kitty context, git history
Process: False positive filtering, severity adjustment, pattern correlation
Output: Prioritized, contextual feedback
```

### Phase 3: Recommendation Generation

```
Input: Prioritized violations, codebase patterns, best practices
Process: Solution generation, alternative suggestions, educational content
Output: Actionable improvement recommendations
```

## 4. Detection Rules & Patterns

### Type Safety Rules

**Rule: NO_ANY_USAGE**

```
Pattern: \bany\b
Context: Type annotations, function parameters, return types
Severity: CRITICAL
Auto-fix: Suggest proper interface or union type
Evidence: TypeScript strict mode requirements
```

**Rule: MISSING_RETURN_TYPES**

```
Pattern: function\s+\w+\s*\([^)]*\)\s*{[^}]*}
Context: Function declarations without return type annotations
Severity: CRITICAL
Auto-fix: Infer return type from implementation
Evidence: TypeScript strict mode requirements
```

**Rule: UNSAFE_TYPE_ASSERTION**

```
Pattern: \bas\s+(?!boolean|number|string|undefined|null)[^,\s}]
Context: Type assertions to non-primitive types
Severity: HIGH
Auto-fix: Suggest proper type guard or interface
Evidence: Type safety violations
```

### Architecture Rules

**Rule: BUSINESS_LOGIC_IN_COMPONENTS**

```
Pattern: useState|useEffect.*prisma\.|await.*db\.
Context: React component files with database operations
Severity: CRITICAL
Auto-fix: Suggest moving to Server Action
Evidence: Next.js App Router patterns
```

**Rule: MISSING_PROPERTY_FILTER**

```
Pattern: prisma\.\w+\.(findMany|findUnique|updateMany|deleteMany)
Context: Database queries without propertyId filter
Severity: CRITICAL
Auto-fix: Add where: { propertyId } clause
Evidence: Multi-tenancy security requirements
```

**Rule: SERVER_ACTION_VALIDATION_MISSING**

```
Pattern: export\s+async\s+function\s+\w+Action
Context: Server Actions without Zod validation
Severity: HIGH
Auto-fix: Suggest Zod schema integration
Evidence: Input validation requirements
```

### Performance Rules

**Rule: N_PLUS_ONE_QUERY**

```
Pattern: await.*prisma.*findMany.*map.*await.*prisma
Context: Sequential database queries in loops
Severity: HIGH
Auto-fix: Suggest include or batch operations
Evidence: Database performance patterns
```

**Rule: MISSING_MEMOIZATION**

```
Pattern: function.*props.*{.*return.*<.*>.*}
Context: Component functions without React.memo
Severity: MEDIUM
Auto-fix: Suggest React.memo wrapper
Evidence: React performance best practices
```

### Code Quality Rules

**Rule: CODE_DUPLICATION**

```
Pattern: Identical code blocks > 10 lines
Context: Multiple files with similar implementations
Severity: MEDIUM
Auto-fix: Suggest shared utility function
Evidence: DRY principle violations
```

**Rule: LARGE_FUNCTION**

```
Pattern: function.*\{[^}]{1000,}
Context: Functions exceeding 50 lines
Severity: LOW
Auto-fix: Suggest function decomposition
Evidence: Maintainability standards
```

## 5. False Positive Management

### Common False Positives

- **Generated Code**: Skip node_modules, .next directories
- **Test Files**: Relax rules for **tests** directories
- **Type Definition Files**: Skip .d.ts files
- **Configuration Files**: Skip config files (eslint.config.cjs, etc.)

### Context-Aware Filtering

- **Worktree Context**: Adjust rules based on spec-kitty phase
- **Legacy Code**: Flag but don't block known legacy patterns
- **Experimental Features**: Allow in feature branches with proper flags

## 6. Output Format Standards

### Violation Report Structure

```json
{
  "violations": [
    {
      "rule": "NO_ANY_USAGE",
      "severity": "CRITICAL",
      "file": "src/components/Example.tsx",
      "line": 15,
      "column": 25,
      "message": "Usage of 'any' type violates type safety requirements",
      "evidence": "TypeScript strict mode requires explicit typing",
      "suggestion": "Replace 'any' with proper interface: 'interface User { id: string; name: string; }'",
      "autoFixable": true,
      "context": {
        "specKittyFeature": "002-booking-management",
        "phase": "implement",
        "relatedFiles": ["src/actions/bookings.ts"]
      }
    }
  ],
  "summary": {
    "critical": 1,
    "high": 0,
    "medium": 0,
    "low": 0,
    "total": 1
  }
}
```

### Human-Readable Format

```
🔴 CRITICAL: Type Safety Violation
File: src/components/Example.tsx:15:25
Issue: Usage of 'any' type
Evidence: TypeScript strict mode requirements
Suggestion: Replace with proper interface

🟡 HIGH: Performance Issue
File: src/actions/bookings.ts:42:10
Issue: Potential N+1 query pattern
Evidence: Sequential database operations in loop
Suggestion: Use include for related data
```

## 7. Integration Points

### Spec-Kitty Integration

- **Feature Context**: Analyze code against active spec requirements
- **Phase Awareness**: Adjust criticism based on implementation vs planning phases
- **Worktree Isolation**: Respect git worktree boundaries

### CI/CD Integration

- **Pre-commit Hooks**: Run critic on staged changes
- **PR Gates**: Block merges on critical violations
- **Automated Fixes**: Apply safe auto-fixes when possible

### Development Workflow

- **IDE Integration**: Real-time feedback in development environment
- **Git Hooks**: Pre-commit analysis and fixes
- **Dashboard Integration**: Visual representation of code quality metrics

## 8. Quality Metrics

### Accuracy Metrics

- **True Positive Rate**: > 95% of flagged issues are valid
- **False Positive Rate**: < 5% of flags are incorrect
- **Auto-fix Success Rate**: > 80% of suggested fixes are correct

### Performance Metrics

- **Analysis Speed**: < 30 seconds for typical PR
- **Memory Usage**: < 500MB for large codebases
- **Scalability**: Handle 1000+ files efficiently

### User Experience Metrics

- **Actionable Feedback**: 100% of reports include specific fixes
- **Educational Value**: All reports explain reasoning
- **Integration Satisfaction**: > 80% developer approval rating

## 9. Continuous Learning

### Feedback Loop

- **Developer Feedback**: Collect feedback on critic accuracy
- **Rule Refinement**: Update rules based on false positives/negatives
- **Pattern Evolution**: Learn from codebase changes and improvements

### Rule Evolution

- **New Pattern Detection**: Identify emerging anti-patterns
- **Standard Updates**: Incorporate new TypeScript/Next.js best practices
- **Project-Specific Rules**: Develop rules specific to HostelPulse architecture

## 10. Emergency Protocols

### System Failures

- **Fallback Mode**: Continue with basic linting if critic fails
- **Manual Override**: Allow human reviewers to override critic decisions
- **Incident Response**: Document and fix critic failures within 24 hours

### Critical Issues

- **Security Vulnerabilities**: Immediate alerts to security team
- **Data Loss Risks**: Block deployment until resolved
- **System Instability**: Automatic rollback to previous critic version

---

**Implementation Note**: This codex serves as the foundation for AI critics. Implementation should prioritize accuracy over speed, and always favor false negatives over false positives in ambiguous cases.
