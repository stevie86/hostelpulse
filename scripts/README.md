# Hostelpulse Autonomous Deployment System

A comprehensive deployment system for Hostelpulse that provides staged releases, A/B testing, monitoring, rollback automation, traffic management, and feature flags.

## Overview

The Hostelpulse Autonomous Deployment System enables:

- **Staged Releases**: Canary → Beta → Production deployment pipeline
- **A/B Testing**: Automated experiment setup and analysis
- **Monitoring**: Real-time performance and error monitoring
- **Rollback Automation**: Automatic rollback on failure detection
- **Traffic Management**: Gradual traffic shifting between versions
- **Feature Flags**: Dynamic feature enablement/disablement

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Deployment     │    │   A/B Testing   │    │   Monitoring    │
│  Orchestrator   │    │   Framework     │    │   System        │
│                 │    │                 │    │                 │
│ • Canary Deploy │    │ • Experiment    │    │ • Metrics       │
│ • Beta Deploy   │    │ • Traffic Split │    │ • Alerts        │
│ • Prod Deploy   │    │ • Analysis      │    │ • Reports       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Traffic        │
                    │  Management     │
                    │                 │
                    │ • Load Balance  │
                    │ • Gradual Shift │
                    │ • Health Checks │
                    └─────────────────┘
                             │
                    ┌─────────────────┐
                    │  Feature Flags  │
                    │                 │
                    │ • Rollout Rules │
                    │ • User Segments │
                    │ • Targeting     │
                    └─────────────────┘
                             │
                    ┌─────────────────┐
                    │  Rollback       │
                    │  Automation     │
                    │                 │
                    │ • Auto Backup   │
                    │ • Quick Restore │
                    │ • Recovery      │
                    └─────────────────┘
```

## Quick Start

### Prerequisites

```bash
# Install dependencies
npm install

# Set environment variables
export VERCEL_TOKEN=your_vercel_token
export VERCEL_PROJECT_ID=your_project_id
export VERCEL_ORG_ID=your_org_id
```

### Basic Deployment

```bash
# Deploy to canary (5% traffic)
npm run deploy:canary

# Deploy to beta (25% traffic)
npm run deploy:beta

# Deploy to production (100% traffic)
npm run deploy:production
```

### A/B Testing

```bash
# Create experiment
npm run ab:create "New Dashboard Test" "Testing new dashboard design"

# Start experiment
npm run ab:start exp_123456789

# Check experiment status
npm run ab:status exp_123456789

# Analyze results
npm run ab:analyze exp_123456789

# Stop experiment
npm run ab:stop exp_123456789
```

### Feature Flags

```bash
# Create feature flag
npm run feature:create new_dashboard "New Dashboard" "Enhanced dashboard features"

# Enable feature for 25% of users
npm run feature:enable new_dashboard 25

# Check if feature is enabled for user
npm run feature:check new_dashboard user123

# Disable feature
npm run feature:disable new_dashboard
```

### Monitoring

```bash
# Start monitoring
npm run monitor:start deployment-123 production

# Check monitoring status
npm run monitor:status deployment-123

# View active alerts
npm run monitor:alerts deployment-123

# Generate monitoring report
npm run monitor:report deployment-123
```

### Traffic Management

```bash
# Setup traffic distribution
npm run traffic:setup deployment-123 '[{"id":"v1.0","url":"https://app-v1.vercel.app","weight":80},{"id":"v1.1","url":"https://app-v1.1.vercel.app","weight":20}]'

# Update traffic weights
npm run traffic:update deployment-123 '[{"version_id":"v1.1","weight":50}]'

# Gradual traffic shift
npm run traffic:shift deployment-123 v1.1 300000

# Setup canary deployment
npm run traffic:canary deployment-123 '{"id":"v1.2","url":"https://app-v1.2.vercel.app"}' 10

# Promote canary to production
npm run traffic:promote deployment-123 v1.2
```

### Rollback

```bash
# Create backup
npm run rollback:backup deployment-123 production

# Trigger rollback
npm run rollback:trigger deployment-123 "High error rate detected"

# View rollback history
npm run rollback:history deployment-123

# View backup history
npm run rollback:backups deployment-123
```

## Configuration

The system is configured via `scripts/deployment-config.json`:

```json
{
  "environments": {
    "canary": {
      "traffic_percentage": 5,
      "auto_promote": true,
      "promote_threshold": {
        "error_rate": 0.01,
        "response_time": 2000,
        "success_rate": 0.99
      }
    },
    "beta": {
      "traffic_percentage": 25,
      "auto_promote": false
    },
    "production": {
      "traffic_percentage": 100
    }
  },
  "monitoring": {
    "alerts": {
      "error_rate_threshold": 0.05,
      "response_time_threshold": 3000
    }
  }
}
```

## Components

### 1. Deployment Orchestrator (`deploy-orchestrator.js`)

**Purpose**: Manages the entire deployment pipeline

**Features**:
- Staged deployments (canary → beta → production)
- Automatic promotion based on metrics
- Integration with monitoring system
- Deployment status tracking

**Usage**:
```bash
node scripts/deploy-orchestrator.js canary
node scripts/deploy-orchestrator.js beta
node scripts/deploy-orchestrator.js production
```

### 2. A/B Testing Framework (`ab-testing-framework.js`)

**Purpose**: Run experiments to validate feature changes

**Features**:
- Automated traffic splitting
- Statistical significance testing
- Real-time metrics collection
- Experiment result analysis

**Usage**:
```bash
node scripts/ab-testing-framework.js create "Test Name" "Description"
node scripts/ab-testing-framework.js start experiment_id
node scripts/ab-testing-framework.js analyze experiment_id
```

### 3. Feature Flag Manager (`feature-flag-manager.js`)

**Purpose**: Control feature rollout and targeting

**Features**:
- Percentage-based rollouts
- User segmentation
- Gradual feature rollout
- Real-time flag management

**Usage**:
```bash
node scripts/feature-flag-manager.js create flag_key "Name" "Description"
node scripts/feature-flag-manager.js enable flag_key 50
node scripts/feature-flag-manager.js check flag_key user_id
```

### 4. Monitoring System (`monitoring-system.js`)

**Purpose**: Track performance and detect issues

**Features**:
- Real-time metrics collection
- Automated alerting
- Performance reporting
- Health checks

**Usage**:
```bash
node scripts/monitoring-system.js start deployment_id environment
node scripts/monitoring-system.js status deployment_id
node scripts/monitoring-system.js report deployment_id
```

### 5. Traffic Manager (`traffic-manager.js`)

**Purpose**: Control traffic distribution between versions

**Features**:
- Load balancing algorithms
- Gradual traffic shifting
- Canary deployments
- Health-based routing

**Usage**:
```bash
node scripts/traffic-manager.js setup deployment_id versions_json
node scripts/traffic-manager.js shift deployment_id version_id duration
node scripts/traffic-manager.js canary deployment_id version_json percentage
```

### 6. Rollback Automation (`rollback-automation.js`)

**Purpose**: Automated rollback on failure detection

**Features**:
- Automatic backups
- Quick restoration
- Recovery procedures
- Rollback history

**Usage**:
```bash
node scripts/rollback-automation.js backup deployment_id environment
node scripts/rollback-automation.js rollback deployment_id reason
node scripts/rollback-automation.js history deployment_id
```

## Deployment Pipeline

### 1. Canary Deployment

```bash
npm run deploy:canary
```

- Deploys to 5% of traffic
- Monitors for 5 minutes
- Auto-promotes to beta if metrics are good
- Rolls back automatically on failures

### 2. Beta Deployment

```bash
npm run deploy:beta
```

- Deploys to 25% of traffic
- Extended monitoring period (15 minutes)
- Manual promotion to production
- Rollback on critical issues

### 3. Production Deployment

```bash
npm run deploy:production
```

- Full production deployment
- Continuous monitoring
- Automatic rollback on failures
- Performance optimization

## Monitoring & Alerts

### Metrics Collected

- **Performance**: Response time, throughput, error rate
- **Business**: Conversion rate, user engagement
- **Infrastructure**: CPU usage, memory usage, disk I/O
- **Custom**: Application-specific metrics

### Alert Types

- **Critical**: Immediate action required (error rate > 10%)
- **High**: Urgent attention needed (response time > 5s)
- **Medium**: Monitor closely (CPU usage > 80%)
- **Low**: Informational (minor issues)

### Notification Channels

- Slack notifications
- Email alerts
- PagerDuty integration
- Dashboard updates

## Best Practices

### Deployment

1. **Always run pre-deployment checks**
   ```bash
   npm run predeploy
   ```

2. **Start with canary deployments**
   ```bash
   npm run deploy:canary
   ```

3. **Monitor metrics during rollout**
   ```bash
   npm run monitor:status
   ```

4. **Gradual traffic shifting**
   ```bash
   npm run traffic:shift deployment_id new_version 600000
   ```

### A/B Testing

1. **Define clear success metrics**
2. **Ensure adequate sample size**
3. **Run tests for sufficient duration**
4. **Analyze statistical significance**

### Feature Flags

1. **Use descriptive flag names**
2. **Set appropriate rollout percentages**
3. **Monitor feature usage**
4. **Clean up unused flags**

### Rollback

1. **Regular backup creation**
2. **Test rollback procedures**
3. **Document rollback reasons**
4. **Monitor rollback success**

## Troubleshooting

### Common Issues

**Deployment fails**
```bash
# Check build logs
npm run build:check

# Verify environment
npm run build:verify
```

**High error rates**
```bash
# Check monitoring
npm run monitor:status

# View alerts
npm run monitor:alerts
```

**Traffic not shifting**
```bash
# Check traffic distribution
npm run traffic:stats

# Verify routing rules
npm run traffic:health
```

**Feature flags not working**
```bash
# Check flag status
npm run feature:status flag_key

# Verify user context
npm run feature:check flag_key user_id
```

## API Reference

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VERCEL_TOKEN` | Vercel API token | Yes |
| `VERCEL_PROJECT_ID` | Vercel project ID | Yes |
| `VERCEL_ORG_ID` | Vercel organization ID | Yes |
| `SLACK_WEBHOOK_URL` | Slack webhook for notifications | No |

### Configuration Files

- `scripts/deployment-config.json` - Main configuration
- `scripts/ab-test-results.json` - A/B test results
- `scripts/feature-flags-state.json` - Feature flag state
- `scripts/monitoring-metrics.json` - Monitoring data
- `scripts/rollback-state.json` - Rollback state
- `scripts/traffic-manager-state.json` - Traffic management state

## Security

- All scripts validate input parameters
- Sensitive data is encrypted at rest
- API calls use secure HTTPS connections
- Access controls based on deployment environment
- Audit logging for all operations

## Contributing

1. Follow the established patterns
2. Add comprehensive error handling
3. Include detailed logging
4. Update documentation
5. Test thoroughly before deployment

## License

This deployment system is part of Hostelpulse and follows the same license terms.