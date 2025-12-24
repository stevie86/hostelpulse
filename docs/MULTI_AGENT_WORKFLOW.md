# Multi-Agent Workflow with Spec-Kitty

**Version:** 1.0.0
**Last Updated:** December 24, 2025
**Framework:** Spec-Kitty v0.9.4
**Agents:** Gemini, Claude, opencode, and AI coding assistants

## Overview

Spec-Kitty enables coordinated multi-agent development where different AI agents can work on separate features simultaneously, then merge their work safely. This document outlines protocols for agent coordination, handoff procedures, conflict resolution, and quality assurance in multi-agent environments.

## 1. Agent Roles & Responsibilities

### Primary Agent Types

- **Gemini**: Strategic planning, architecture, complex logic implementation
- **Claude**: Code review, refactoring, documentation, safety checks
- **opencode**: CLI operations, testing, deployment, infrastructure
- **Specialized Agents**: UI/UX, security, performance, accessibility

### Agent Capabilities Matrix

| Agent    | Planning | Implementation | Review | Testing | Deployment |
| -------- | -------- | -------------- | ------ | ------- | ---------- |
| Gemini   | ⭐⭐⭐   | ⭐⭐⭐         | ⭐⭐   | ⭐      | ❌         |
| Claude   | ⭐⭐     | ⭐⭐⭐         | ⭐⭐⭐ | ⭐⭐    | ❌         |
| opencode | ⭐       | ⭐⭐⭐         | ⭐⭐⭐ | ⭐⭐⭐  | ⭐⭐⭐     |

## 2. Multi-Agent Coordination Protocol

### Phase 1: Feature Planning & Assignment

#### Step 1: Mission Definition

```bash
# Create mission with multiple features
./.venv-speckitty/bin/spec-kitty research --topic "HostelPulse MVP Features"
```

#### Step 2: Feature Decomposition

Break down the mission into independent features:

```
Mission: HostelPulse MVP
├── Feature 001: Room Management (Gemini)
├── Feature 002: Booking Management (Claude)
├── Feature 003: Guest Management (opencode)
├── Feature 004: CSV Import/Export (Gemini)
└── Feature 005: Realtime Dashboard (Claude)
```

#### Step 3: Agent Assignment

Assign features based on agent strengths:

- **Complex Logic**: Gemini (availability algorithms, booking conflicts)
- **UI/UX Polish**: Claude (responsive design, accessibility)
- **Infrastructure**: opencode (testing, deployment, CI/CD)
- **Integration**: Rotate agents for cross-pollination

### Phase 2: Parallel Development

#### Worktree Isolation

Each agent works in dedicated worktrees:

```bash
# Agent 1 (Gemini) - Room Management
mise run -- pnpm run spec -- specify "Room Management"
cd .worktrees/001-room-management/

# Agent 2 (Claude) - Booking Management
mise run -- pnpm run spec -- specify "Booking Management"
cd .worktrees/002-booking-management/
```

#### Independent Execution

Agents follow their individual protocols:

- **Gemini**: Uses GEMINI_AGENT_PROTOCOL.md
- **Claude**: Uses CODE_REVIEW_CODEX.md standards
- **opencode**: Uses AGENTS.md guidelines

#### Coordination Points

Regular sync meetings at phase boundaries:

- **Planning Complete**: All agents share their task breakdowns
- **Implementation Midway**: Cross-review in-progress work
- **Pre-Merge**: Final integration testing

### Phase 3: Integration & Quality Assurance

#### Step 1: Individual Acceptance

Each agent accepts their own feature:

```bash
# Agent 1 accepts their feature
./.venv-speckitty/bin/spec-kitty accept --feature 001-room-management

# Agent 2 accepts their feature
./.venv-speckitty/bin/spec-kitty accept --feature 002-booking-management
```

#### Step 2: Cross-Agent Review

Agents review each other's work:

- **Code Review**: Claude reviews Gemini's implementation
- **Architecture Review**: Gemini reviews Claude's design decisions
- **Integration Testing**: opencode verifies end-to-end functionality

#### Step 3: Sequential Merging

Merge features in dependency order:

```bash
# Merge foundation features first
./.venv-speckitty/bin/spec-kitty merge --feature 001-room-management
./.venv-speckitty/bin/spec-kitty merge --feature 003-guest-management

# Then dependent features
./.venv-speckitty/bin/spec-kitty merge --feature 002-booking-management
./.venv-speckitty/bin/spec-kitty merge --feature 005-realtime-dashboard
```

## 3. Conflict Resolution Protocols

### Type 1: Code Conflicts

**Detection**: Git merge conflicts during integration
**Resolution**:

1. Identify conflicting agents
2. Joint review of conflicting code
3. Architectural decision by senior agent (Gemini)
4. Implement agreed solution
5. Cross-agent testing

### Type 2: Design Conflicts

**Detection**: Incompatible architectural decisions
**Resolution**:

1. Constitution reference (see .kittify/memory/constitution.md)
2. Operation Bedrock principles application
3. Agent consensus or human arbitration
4. Documentation of resolution

### Type 3: Testing Conflicts

**Detection**: Integration tests fail due to interdependencies
**Resolution**:

1. Identify root cause feature
2. Responsible agent fixes the issue
3. All agents re-run integration tests
4. Update test expectations if needed

## 4. Communication Protocols

### Agent-to-Agent Communication

**Channels**:

- **Spec Files**: Document decisions in kitty-specs/
- **Activity Logs**: Record all significant actions
- **Acceptance Commits**: Formalize completion status
- **Integration Tests**: Validate cross-feature compatibility

**Handoff Format**:

```yaml
handoff:
  from_agent: 'Gemini'
  to_agent: 'Claude'
  feature: 'booking-management'
  status: 'implementation_complete'
  deliverables:
    - 'Server Actions: createBooking, updateBooking'
    - 'Components: BookingForm, BookingList'
    - 'Tests: booking.integration.test.ts'
  dependencies:
    - 'Room Management feature (for room availability)'
  notes:
    - 'Booking conflicts handled via database constraints'
    - 'Real-time updates use polling every 30 seconds'
```

### Human-Agent Communication

**Status Updates**:

- Daily progress summaries
- Blockers and dependencies
- Quality metrics (test coverage, performance)
- Timeline adjustments

**Escalation Paths**:

- Technical blockers → Engineering lead
- Design disagreements → Product owner
- Timeline concerns → Project manager

## 5. Quality Assurance Framework

### Automated Checks

**Per-Agent**:

```bash
# Individual agent quality gates
mise run -- pnpm run lint
mise run -- pnpm run type-check
mise run -- pnpm run test -- --testPathPattern="feature-name"
```

**Integration**:

```bash
# Cross-agent integration tests
mise run -- pnpm run test:e2e
mise run -- pnpm run build
```

### Manual Reviews

**Peer Review Matrix**:

- Gemini ↔ Claude: Architecture and implementation
- Claude ↔ opencode: Code quality and testing
- opencode ↔ Gemini: Infrastructure and deployment

**Review Checklist**:

- [ ] Constitution compliance (.kittify/memory/constitution.md)
- [ ] Operation Bedrock principles
- [ ] Type safety (zero `any` usage)
- [ ] Test coverage > 80%
- [ ] Performance benchmarks met
- [ ] Accessibility standards (WCAG AA)
- [ ] Security review passed

## 6. Performance Optimization

### Parallel Processing

- **Feature Independence**: Maximize parallel development
- **Dependency Mapping**: Identify and sequence dependent features
- **Resource Allocation**: Balance agent workloads

### Bottleneck Prevention

- **Regular Syncs**: Daily standup equivalent for agents
- **Early Detection**: Automated monitoring of development velocity
- **Contingency Planning**: Backup agents for critical path features

### Metrics Tracking

```yaml
performance_metrics:
  features_completed: 5/5
  average_cycle_time: 2.3 days
  defect_density: 0.02 defects/feature
  test_coverage: 87%
  merge_conflicts: 1 minor
  rollbacks: 0
```

## 7. Agent Learning & Improvement

### Feedback Loops

**Post-Feature Reviews**:

- What worked well in multi-agent collaboration
- Areas for improved coordination
- Tooling or process enhancements
- Knowledge sharing opportunities

**Continuous Learning**:

- Agent capabilities evolution
- Process documentation updates
- Tool integration improvements
- Best practices refinement

### Knowledge Base

**Shared Artifacts**:

- Constitution updates based on experience
- Agent protocol refinements
- Tool configuration improvements
- Troubleshooting guides

## 8. Emergency Protocols

### Agent Failure Scenarios

**Single Agent Failure**:

1. Assess impact on timeline
2. Reassign work to backup agent
3. Update dependency mapping
4. Communicate to stakeholders

**Multi-Agent Conflicts**:

1. Pause all development
2. Human arbitration required
3. Document resolution for future reference
4. Resume with clear new protocols

**System-Wide Issues**:

1. Halt all spec-kitty operations
2. Manual git operations if needed
3. Full system diagnosis
4. Controlled restart with safeguards

## 9. Success Metrics

### Process Metrics

- **Feature Throughput**: Features completed per week
- **Quality Score**: Defect rates, test coverage, performance
- **Coordination Efficiency**: Time spent on conflicts vs development
- **Agent Utilization**: Balanced workload across agents

### Outcome Metrics

- **Code Quality**: Type safety, maintainability, performance
- **Delivery Speed**: Time from spec to production
- **Reliability**: Deployment success rate, runtime stability
- **Scalability**: Ability to onboard new agents and features

## 10. Tool Integration

### Spec-Kitty Extensions

**Multi-Agent Commands**:

```bash
# Agent coordination
./.venv-speckitty/bin/spec-kitty coordinate --agents gemini,claude,opencode

# Conflict detection
./.venv-speckitty/bin/spec-kitty conflicts --features 001,002,003

# Integration testing
./.venv-speckitty/bin/spec-kitty integrate --mode full
```

### External Tools

**Communication Platforms**:

- GitHub Issues for agent coordination
- Discord/Slack for real-time communication
- Shared documentation in docs/ directory

**Monitoring**:

- Automated test dashboards
- Performance monitoring
- Error tracking and alerting

---

**Key Principle**: Multi-agent development succeeds when agents respect each other's expertise, communicate clearly, and maintain the integrity of the shared codebase. The constitution serves as the ultimate arbiter for all decisions.

**Implementation Note**: Start with 2 agents on independent features, then scale to 3+ agents as coordination processes mature.
