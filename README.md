# Hostelpulse V1.0

A specialized SaaS platform designed to become the central operating system for independent hostel owners, starting with a focus on the Lisbon market.

## 🚀 Mission

Hostelpulse empowers independent hostel entrepreneurs by automating administrative tasks, eliminating revenue loss, and providing tools for business growth.

## ✨ Key Features

- **💰 Automated City Tax Collection**: Simplify collecting Lisbon City Tax from guests who book via platforms that don't automate it
- **📄 Automated 'Factura' Generation**: Generate official Portuguese invoices for business travelers
- **📊 Revenue Optimization**: Eliminate revenue loss from double bookings and manual errors
- **⚡ Administrative Automation**: Streamline operations and reduce time spent on manual tasks
- **📈 Business Growth Tools**: Analytics and insights to help hostels scale sustainably
- **🔗 Multi-Platform Integration**: Works alongside existing systems like Cloudbeds or as a primary solution

## 🛠 Technology Stack

- **Runtime**: Bun for fast JavaScript execution and package management
- **Framework**: Next.js for full-stack React applications
- **Database**: Supabase (PostgreSQL) for scalable data management
- **UI Framework**: Tailwind CSS with Shadcn UI components
- **Payments**: Stripe for secure payment processing
- **Deployment**: Vercel for global CDN and serverless functions
- **Authentication**: Built-in user management and security

## 📁 Project Structure

```
/
├── components/          # Reusable React components and UI elements
├── pages/              # Next.js pages and API routes
├── views/              # Page-specific view components
├── hooks/              # Custom React hooks for state management
├── contexts/           # React context providers for global state
├── utils/              # Utility functions and business logic helpers
├── public/             # Static assets and media files
├── scripts/            # Build automation and deployment scripts
├── docs/               # Project documentation and guides
├── .kilocode/          # Governance framework and memory bank
└── kilocode-export/    # Governance framework source code
```

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 18.0.0+ (for compatibility with Next.js 12)
- **Bun**: Latest version for package management
- **Git**: For version control

### Installation

1. **Install Bun** (if not already installed):
   ```bash
   curl -fsSL https://bun.sh/install | bash
   source ~/.bashrc
   ```

2. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd hostelpulse
   bun install
   ```

3. **Start development server**:
   ```bash
   bun run dev
   ```

4. **Open your browser** and visit `http://localhost:3000`

## 📜 Available Scripts

### Development
```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint
```

### Build Automation
```bash
bun run build:check  # Run build checks (dev/prod/test/verify)
bun run build:dev    # Start development with checks
bun run build:prod   # Build for production with validation
bun run build:test   # Run tests only
bun run build:verify # Build verification with failure handling
bun run predeploy    # Pre-deployment checks
```

### Manual Script Execution
```bash
./scripts/build-check.sh dev     # Development server
./scripts/build-check.sh prod    # Production build
./scripts/build-check.sh test    # Run tests
./scripts/build-check.sh verify  # Build verification
./scripts/pre-deploy-check.sh    # Pre-deployment validation
```

## 🏗 Governance & Documentation

Hostelpulse uses a comprehensive governance framework to ensure consistent development practices and maintainable code.

### Memory Bank System

The Memory Bank is our core knowledge persistence system, located in `.kilocode/rules/memory-bank/`:

- **`brief.md`**: Project foundation and objectives
- **`product.md`**: Product vision and user experience goals
- **`context.md`**: Current work status and next steps
- **`architecture.md`**: System design and technical decisions
- **`tech.md`**: Technology stack and development setup
- **`branding.md`**: Brand guidelines and visual identity

### Documentation Structure

- **`docs/KiloCode-Configuration.md`**: Configuration guidelines and mode usage
- **`docs/KiloCode-General.md`**: General KiloCode framework documentation
- **`docs/process-improvement-analysis.md`**: Process improvement methodologies

### Development Workflow

1. **Memory Bank First**: Always read memory bank files before starting work
2. **Branch Management**: Use feature branches with clear naming conventions
3. **Code Quality**: Automated linting, testing, and build validation
4. **Documentation**: Update memory bank after significant changes

## 🎯 Target Audience

Hostelpulse serves independent hostel owners and managers in Lisbon who:
- Manage 1-2 hostel locations
- Are deeply involved in daily operations
- Are tech-savvy but time-poor
- Frustrated with complex enterprise software like Cloudbeds
- Need affordable, specialized solutions for their niche

## 💡 Our Solution

We provide a lightweight, powerful SaaS platform that serves as either:
- **Primary Solution**: For hostels seeking an affordable alternative to Cloudbeds
- **Profit-Maximization Toolkit**: Works alongside existing systems to add high-value features

### Key Differentiators
- **Lisbon Market Focus**: Deep understanding of local regulations and business practices
- **Revenue Protection**: Automated systems prevent double bookings and revenue loss
- **Administrative Automation**: Streamlines time-consuming manual processes
- **Scalable Architecture**: Grows with hostel business needs

## 🔧 Configuration Files

- **`next.config.js`**: Next.js configuration
- **`tailwind.config.js`**: Tailwind CSS customization
- **`postcss.config.js`**: PostCSS configuration
- **`tsconfig.json`**: TypeScript configuration
- **`.eslintrc.json`**: ESLint rules and plugins
- **`.prettierrc`**: Code formatting rules

## 🚀 Deployment

### Production Build
```bash
bun run build:prod
```

### Pre-deployment Checks
```bash
bun run predeploy
```

### Deployment Requirements
- Must be on `main` branch
- No uncommitted changes
- All tests passing
- Memory bank files present
- Build validation successful

## 🤝 Contributing

1. **Read the Memory Bank**: Start by reading all memory bank files
2. **Follow Governance**: Adhere to established processes and guidelines
3. **Branch Strategy**: Create feature branches from `main`
4. **Code Quality**: Ensure tests pass and code is linted
5. **Documentation**: Update memory bank for significant changes

## 📊 Success Metrics

- **Hostel Partnerships**: 50+ independent hostels in Lisbon onboarded in first year
- **Revenue Impact**: Help hostels increase revenue by 15-25% through automation
- **Time Savings**: Save hostel owners 10+ hours per week on administrative tasks
- **User Adoption**: 80%+ monthly active users among subscribed hostels
- **Platform Reliability**: 99.9% uptime with automated tax collection accuracy
- **Customer Satisfaction**: 4.8+ star rating from hostel owner feedback

## 📄 License

This project is licensed under the terms specified in the LICENSE file.

## 🆘 Support

For questions or support:
- Check the memory bank files for project context
- Review the governance documentation
- Follow established development workflows

---

**Hostelpulse** - Empowering Lisbon's independent hostel owners with automation, revenue protection, and business growth tools.
