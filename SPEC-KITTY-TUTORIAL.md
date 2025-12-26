# Spec-Kitty Tutorial: Accelerated Development with Claude Code

## 🎯 Overview

**Spec-Kitty** is a real-time AI development dashboard that transforms how you build software. It combines **structured spec-driven development** with **multi-agent AI orchestration** to deliver **5-10x faster development** with built-in quality gates.

This tutorial shows you how to use **Spec-Kitty with Claude Code** for maximum productivity, while integrating other AI agents (OpenCode, Gemini, Codex) for specialized tasks.

---

## 📋 Prerequisites

### Required Tools

```bash
# Core requirements
pip install spec-kitty-cli          # Spec-Kitty CLI
npm install -g @anthropic/claude-code # Claude Code v2+
npm install -g opencode             # OpenCode (optional but recommended)
npm install -g gemini-cli           # Gemini CLI (optional)
npm install -g codex-cli            # Codex CLI (optional)

# Verify installations
claude --version    # Should show v2.x.x
opencode --version  # Should work
gemini --version    # Should work
codex --version     # Should work
```

### Environment Setup

```bash
# API Keys (set these in your environment)
export OPENCODE_API_KEY="your_opencode_key"
export GEMINI_API_KEY="your_gemini_key"
export CODEX_API_KEY="your_codex_key"
export OPENAI_API_KEY="your_openai_key"
```

---

## 🚀 Quick Start (5 Minutes)

### 1. Initialize Your Project

```bash
# Create new project or cd to existing Next.js project
mkdir my-hostel-app && cd my-hostel-app

# Initialize spec-kitty
spec-kitty init . --ai claude

# Verify setup
spec-kitty verify-setup
```

### 2. Start Claude Code

```bash
claude
```

### 3. Create Your Constitution

In Claude, type:

```
/spec-kitty.constitution

Create principles for a modern SaaS hostel management platform:
- TypeScript strict mode with zero 'any' types
- Next.js App Router with server components
- Database-first approach with Prisma ORM
- Component reusability with DaisyUI
- Comprehensive error handling and logging
- Security-first authentication with NextAuth.js
- Mobile-responsive design patterns
- Performance optimization and monitoring
```

### 4. Start Your First Feature

```
/spec-kitty.specify

Build a guest check-in/check-out system with:
- Real-time guest registration and validation
- Room assignment with availability checking
- Automated billing integration
- Mobile-responsive booking forms
- Check-out with SEF reporting compliance
- Dashboard with occupancy statistics
```

---

## 🎯 The Spec-Kitty Workflow

### Phase 1: Specification 📝

**Tool:** Claude Code (planning & requirements)

**What happens:**

- Creates feature branch (`001-guest-system`)
- Generates isolated worktree (`.worktrees/001-guest-system/`)
- Produces `spec.md` with user stories and acceptance criteria

**Commands:**

```bash
/spec-kitty.specify
[Your detailed feature description]
```

**Best Practices:**

- Be specific about user requirements
- Include technical constraints
- Mention existing infrastructure to leverage
- Define success metrics

---

### Phase 2: Technical Planning 🏗️

**Tool:** Claude Code (architecture & design)

**What happens:**

- Creates `plan.md` with technical approach
- Generates `data-model.md` with database schema
- Produces API contracts in `/contracts/`
- Updates agent context for the feature

**Commands:**

```bash
/spec-kitty.plan

Technical approach:
- Use existing Prisma Guest/Room models
- Extend check-out action with SEF integration
- Create mobile-first booking forms with DaisyUI
- Implement real-time availability with React Server Components
- Add billing calculations using existing service
```

**When to involve other agents:**

- **Gemini:** Research specific technologies or patterns
- **Codex:** Generate detailed API specifications

---

### Phase 3: Task Breakdown 📋

**Tool:** Claude Code (project management)

**What happens:**

- Creates `tasks.md` with work packages
- Generates `tasks/planned/` with detailed prompts
- Sets up kanban board in dashboard
- Assigns tasks to appropriate AI agents

**Commands:**

```bash
/spec-kitty.tasks
```

**Task Structure:**

- **WP01:** Database schema updates
- **WP02:** API endpoints creation
- **WP03:** Frontend components
- **WP04:** Integration testing

---

### Phase 4: Implementation 💻

**Tool:** OpenCode (primary coding)

**What happens:**

- Executes tasks from planned → doing → review → done
- Updates dashboard in real-time
- Follows TDD approach with automated testing
- Maintains code quality with linting and type checking

**Workflow:**

```bash
# In Claude (after tasks are created)
/spec-kitty.implement

# Claude shows worktree path:
cd .worktrees/001-guest-system

# Switch to OpenCode for actual coding
opencode
```

**OpenCode excels at:**

- Complex refactoring and code changes
- Following detailed task specifications
- Maintaining code consistency
- Performance optimizations

---

### Phase 5: Quality Assurance ✅

**Tool:** Claude Code (review & testing)

**Commands:**

```bash
# Code review
/spec-kitty.review

# Acceptance testing
/spec-kitty.accept

# Merge to main
/spec-kitty.merge --push
```

---

## 🤖 AI Agent Roles & Integration

### 🎭 Claude Code (Project Manager & Architect)

**Role:** Strategic planning and coordination
**Strengths:**

- Excellent at requirements analysis
- Strong architectural planning
- Great at breaking down complex features
- Reliable task management

**When to use:**

- Feature specification
- Technical planning
- Task breakdown
- Code review and acceptance

**Commands:**

```bash
# All /spec-kitty.* commands work in Claude
/spec-kitty.specify    # Start features
/spec-kitty.plan       # Technical design
/spec-kitty.tasks      # Task breakdown
/spec-kitty.review     # Code review
/spec-kitty.accept     # Quality gates
```

---

### 🚀 OpenCode (Primary Developer)

**Role:** High-performance implementation
**Strengths:**

- Superior coding speed and accuracy
- Excellent at complex refactoring
- Strong debugging capabilities
- Handles large codebases efficiently

**When to use:**

- Actual code implementation
- Bug fixing and debugging
- Performance optimizations
- Following detailed task specifications

**Workflow Integration:**

```bash
# Plan with Claude
claude
/spec-kitty.specify [feature]
/spec-kitty.plan [approach]
/spec-kitty.tasks

# Implement with OpenCode
cd .worktrees/XXX-feature
opencode
# Follow tasks.md instructions
```

---

### 🔬 Gemini (Research & Analysis)

**Role:** Investigation and knowledge gathering
**Strengths:**

- Deep research capabilities
- Excellent at technical analysis
- Strong documentation skills
- Good at exploring alternatives

**When to use:**

- Researching new technologies
- Analyzing complex problems
- Documentation and analysis
- Exploring architectural alternatives

**Integration:**

```bash
# Use during planning phase
/spec-kitty.research

Investigate React Server Components for real-time booking updates
Analyze Portuguese SEF compliance requirements
Research mobile-first booking form patterns
```

---

### 🛠️ Codex (Code Generation & Documentation)

**Role:** Technical implementation support
**Strengths:**

- Strong code generation
- API specification creation
- Technical documentation
- Boilerplate code creation

**When to use:**

- Generating API contracts
- Creating technical specifications
- Writing documentation
- Generating boilerplate code

---

## 📊 Real-Time Dashboard Usage

### Dashboard Features

- **Live Kanban Board:** Visual task progression
- **Agent Tracking:** See which AI is working on what
- **Progress Metrics:** Completion percentages
- **Quality Gates:** Automated testing status

### Accessing Dashboard

```bash
# Auto-starts with spec-kitty init
# Access at: http://127.0.0.1:9237

# Manual control
spec-kitty dashboard     # Open/start dashboard
spec-kitty dashboard --port 4000  # Custom port
spec-kitty dashboard --kill       # Stop dashboard
```

### Reading Dashboard Data

- **00000** = No active features (fix: start a feature)
- **Real numbers** = Active development progress
- **Color coding:** 🔴 Blocked, 🟡 In progress, 🟢 Completed

---

## 🎯 Advanced Workflow Patterns

### Multi-Feature Parallel Development

```bash
# Start multiple features simultaneously
/spec-kitty.specify [Feature 1]
cd .worktrees/001-feature-1
/spec-kitty.plan [approach]

# Back to main, start another
/spec-kitty.specify [Feature 2]
cd .worktrees/002-feature-2
/spec-kitty.plan [approach]

# Dashboard shows both features progressing
```

### Research-Driven Development

```bash
/spec-kitty.specify [feature]
/spec-kitty.research [technical investigation]
/spec-kitty.plan [informed approach]
/spec-kitty.tasks
```

### Agent Handover Pattern

```
Claude → Planning & Task Creation
↓
OpenCode → Implementation & Coding
↓
Gemini → Analysis & Optimization
↓
Claude → Review & Acceptance
```

---

## 🔧 Troubleshooting

### "00000" Dashboard Issue

**Problem:** Dashboard shows zeros instead of task counts
**Solution:**

```bash
# Start a feature to activate dashboard
/spec-kitty.specify [your feature description]
# Dashboard will now show real numbers
```

### Slash Commands Not Working

**Problem:** Claude doesn't recognize `/spec-kitty.*` commands
**Solution:**

```bash
# Ensure .claude/commands/ directory exists
ls -la .claude/commands/

# Reinitialize if missing
rm -rf .claude
spec-kitty init . --ai claude
```

### OpenCode Integration Issues

**Problem:** OpenCode doesn't see spec-kitty context
**Solution:**

```bash
# Always start OpenCode from feature worktree
cd .worktrees/XXX-feature
opencode

# Read tasks.md for detailed instructions
cat tasks.md
```

### Worktree Conflicts

**Problem:** Multiple worktrees causing confusion
**Solution:**

```bash
# List all worktrees
git worktree list

# Remove old/unused worktrees
git worktree remove .worktrees/old-feature

# Clean up
git branch -D old-feature-branch
```

---

## 📈 Performance Optimization

### Speed Multipliers

| **Traditional** | **Spec-Kitty**      | **Improvement** |
| --------------- | ------------------- | --------------- |
| Manual planning | `/spec-kitty.plan`  | **4x faster**   |
| Ad-hoc tasks    | `/spec-kitty.tasks` | **6x faster**   |
| Debug cycles    | TDD automation      | **5x faster**   |
| Code review     | Automated gates     | **3x faster**   |
| Integration     | Parallel agents     | **10x faster**  |

### Quality Improvements

- **Automated testing** prevents regressions
- **Type safety** enforced throughout
- **Constitution compliance** ensures consistency
- **Multi-agent validation** catches issues early

---

## 🎖️ Best Practices

### Project Structure

```
your-project/
├── .kittify/           # Spec-kitty configuration
├── .worktrees/         # Active feature development
├── kitty-specs/        # Feature specifications
├── .claude/           # Claude command files
├── .opencode/         # OpenCode integration (manual)
└── app/               # Your Next.js application
```

### Constitution Guidelines

- Define technology stack preferences
- Set code quality standards
- Establish architectural patterns
- Include performance requirements

### Feature Specifications

- Be specific about user requirements
- Include acceptance criteria
- Mention existing infrastructure
- Define success metrics

### Agent Selection

- **Claude:** Planning, architecture, review
- **OpenCode:** Complex implementation, debugging
- **Gemini:** Research, analysis, documentation
- **Codex:** API specs, boilerplate generation

---

## 🚀 Getting Started Checklist

- [ ] Install all required tools (claude, opencode, gemini, codex)
- [ ] Set API keys in environment
- [ ] Initialize project with `spec-kitty init`
- [ ] Create constitution with `/spec-kitty.constitution`
- [ ] Start first feature with `/spec-kitty.specify`
- [ ] Use dashboard for progress tracking
- [ ] Follow complete workflow for each feature

---

## 📚 Additional Resources

- **Spec-Kitty Docs:** [Official Documentation](https://github.com/Priivacy-ai/spec-kitty)
- **Claude Code:** [Anthropic Claude](https://docs.anthropic.com/claude/docs/desktop)
- **OpenCode:** [OpenCode Documentation](https://opencode.ai)
- **Dashboard:** Access at `http://127.0.0.1:9237`

---

## 🎯 Success Metrics

**After using Spec-Kitty, you should see:**

- ✅ **5-10x faster** feature development
- ✅ **Real-time visibility** into development progress
- ✅ **Automated quality gates** preventing issues
- ✅ **Multi-agent collaboration** for complex tasks
- ✅ **Production-ready code** from day one

**Happy coding with Spec-Kitty!** 🏗️⚡🎖️
