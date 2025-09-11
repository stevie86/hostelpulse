#!/usr/bin/env node

/**
 * Hostelpulse Autonomous Deployment Orchestrator
 * Handles staged releases, A/B testing, monitoring, and rollback automation
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync, spawn } = require('child_process');

class DeploymentOrchestrator {
  constructor() {
    this.config = null;
    this.currentDeployment = null;
    this.monitoringInterval = null;
    this.abTestResults = new Map();
  }

  async loadConfig() {
    try {
      const configPath = path.join(__dirname, 'deployment-config.json');
      const configData = await fs.readFile(configPath, 'utf8');
      this.config = JSON.parse(configData);
      console.log('✅ Deployment configuration loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load deployment configuration:', error.message);
      throw error;
    }
  }

  async validateEnvironment() {
    console.log('🔍 Validating deployment environment...');

    // Check required environment variables
    const requiredEnvVars = [
      'VERCEL_TOKEN',
      'VERCEL_PROJECT_ID',
      'VERCEL_ORG_ID'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Check Vercel CLI
    try {
      execSync('vercel --version', { stdio: 'pipe' });
      console.log('✅ Vercel CLI available');
    } catch (error) {
      throw new Error('Vercel CLI not found. Please install it: npm i -g vercel');
    }

    console.log('✅ Environment validation completed');
  }

  async runPreDeploymentChecks() {
    console.log('🔍 Running pre-deployment checks...');

    // Run existing build checks
    try {
      execSync('./scripts/build-check.sh verify', { stdio: 'inherit' });
      console.log('✅ Build verification passed');
    } catch (error) {
      throw new Error('Build verification failed');
    }

    // Run pre-deploy checks
    try {
      execSync('./scripts/pre-deploy-check.sh', { stdio: 'inherit' });
      console.log('✅ Pre-deployment checks passed');
    } catch (error) {
      throw new Error('Pre-deployment checks failed');
    }
  }

  async deployToStage(stage, options = {}) {
    console.log(`🚀 Starting ${stage} deployment...`);

    const stageConfig = this.config.environments[stage];
    if (!stageConfig) {
      throw new Error(`Unknown deployment stage: ${stage}`);
    }

    this.currentDeployment = {
      stage,
      startTime: Date.now(),
      status: 'deploying',
      version: this.generateVersion(),
      trafficPercentage: stageConfig.traffic_percentage,
      options
    };

    try {
      // Build the application
      console.log('📦 Building application...');
      execSync('npm run build', { stdio: 'inherit' });

      // Deploy to Vercel with stage-specific configuration
      const deployCommand = this.buildVercelDeployCommand(stage, stageConfig);
      console.log(`Executing: ${deployCommand}`);

      const deployResult = execSync(deployCommand, { encoding: 'utf8' });
      const deploymentUrl = this.extractDeploymentUrl(deployResult);

      this.currentDeployment.url = deploymentUrl;
      this.currentDeployment.status = 'deployed';

      console.log(`✅ ${stage} deployment completed: ${deploymentUrl}`);

      // Start monitoring if enabled
      if (this.config.monitoring.enabled) {
        await this.startMonitoring(stage, stageConfig);
      }

      // Setup A/B testing if applicable
      if (options.abTest && this.config.ab_testing.enabled) {
        await this.setupABTest(stage, options.abTest);
      }

      return {
        success: true,
        stage,
        url: deploymentUrl,
        version: this.currentDeployment.version
      };

    } catch (error) {
      console.error(`❌ ${stage} deployment failed:`, error.message);
      this.currentDeployment.status = 'failed';
      throw error;
    }
  }

  buildVercelDeployCommand(stage, stageConfig) {
    let command = 'vercel --prod';

    // Add stage-specific flags
    if (stage === 'canary') {
      command += ` --target production --alias ${stage}-${Date.now()}`;
    } else if (stage === 'beta') {
      command += ` --target production --alias beta-${Date.now()}`;
    }

    // Add traffic percentage for canary/beta
    if (stageConfig.traffic_percentage < 100) {
      command += ` --traffic ${stageConfig.traffic_percentage}`;
    }

    return command;
  }

  extractDeploymentUrl(deployOutput) {
    // Extract URL from Vercel deployment output
    const urlMatch = deployOutput.match(/https:\/\/[^\s]+/);
    return urlMatch ? urlMatch[0] : null;
  }

  async startMonitoring(stage, stageConfig) {
    console.log(`📊 Starting monitoring for ${stage}...`);

    this.monitoringInterval = setInterval(async () => {
      try {
        const metrics = await this.collectMetrics(stage);

        // Check against thresholds
        const issues = this.checkThresholds(metrics, stageConfig.promote_threshold);

        if (issues.length > 0) {
          console.warn(`⚠️  Issues detected in ${stage}:`, issues);

          if (stageConfig.rollback_on_failure) {
            await this.triggerRollback(stage, `Threshold breach: ${issues.join(', ')}`);
          }
        }

        // Auto-promote if conditions met
        if (stageConfig.auto_promote && issues.length === 0) {
          const monitoringDuration = Date.now() - this.currentDeployment.startTime;
          if (monitoringDuration >= stageConfig.monitoring_window) {
            await this.promoteToNextStage(stage);
          }
        }

      } catch (error) {
        console.error('❌ Monitoring error:', error.message);
      }
    }, 30000); // Check every 30 seconds
  }

  async collectMetrics(stage) {
    // Collect basic metrics (in a real implementation, this would integrate with monitoring providers)
    const metrics = {
      response_time: Math.random() * 2000 + 500, // Mock data
      error_rate: Math.random() * 0.05,
      success_rate: 0.95 + Math.random() * 0.05,
      throughput: Math.random() * 1000 + 500
    };

    console.log(`📊 ${stage} metrics:`, {
      response_time: `${metrics.response_time.toFixed(0)}ms`,
      error_rate: `${(metrics.error_rate * 100).toFixed(2)}%`,
      success_rate: `${(metrics.success_rate * 100).toFixed(2)}%`,
      throughput: `${metrics.throughput.toFixed(0)} req/min`
    });

    return metrics;
  }

  checkThresholds(metrics, thresholds) {
    const issues = [];

    if (metrics.error_rate > thresholds.error_rate) {
      issues.push(`Error rate ${metrics.error_rate.toFixed(3)} > ${thresholds.error_rate}`);
    }

    if (metrics.response_time > thresholds.response_time) {
      issues.push(`Response time ${metrics.response_time.toFixed(0)}ms > ${thresholds.response_time}ms`);
    }

    if (metrics.success_rate < thresholds.success_rate) {
      issues.push(`Success rate ${(metrics.success_rate * 100).toFixed(2)}% < ${(thresholds.success_rate * 100).toFixed(2)}%`);
    }

    return issues;
  }

  async setupABTest(stage, testConfig) {
    console.log(`🧪 Setting up A/B test for ${stage}...`);

    const testId = `ab_${stage}_${Date.now()}`;

    this.abTestResults.set(testId, {
      id: testId,
      stage,
      config: testConfig,
      startTime: Date.now(),
      metrics: {
        control: { conversions: 0, visitors: 0 },
        variant: { conversions: 0, visitors: 0 }
      }
    });

    // In a real implementation, this would integrate with A/B testing providers
    console.log(`✅ A/B test ${testId} configured`);
  }

  async triggerRollback(stage, reason) {
    console.log(`🔄 Triggering rollback for ${stage}: ${reason}`);

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    try {
      // Rollback to previous deployment
      const rollbackCommand = 'vercel rollback --yes';
      execSync(rollbackCommand, { stdio: 'inherit' });

      this.currentDeployment.status = 'rolled_back';
      console.log(`✅ Rollback completed for ${stage}`);

      // Send notifications
      await this.sendNotification('rollback', {
        stage,
        reason,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      throw error;
    }
  }

  async promoteToNextStage(currentStage) {
    const stages = ['canary', 'beta', 'production'];
    const currentIndex = stages.indexOf(currentStage);

    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];
      console.log(`⬆️  Promoting from ${currentStage} to ${nextStage}...`);

      await this.deployToStage(nextStage);
    } else {
      console.log(`🎉 ${currentStage} is the final stage - deployment complete!`);
    }
  }

  async sendNotification(type, data) {
    if (!this.config.notifications.enabled) return;

    console.log(`📢 Sending ${type} notification...`);

    // In a real implementation, this would send to Slack, email, etc.
    const notification = {
      type,
      timestamp: new Date().toISOString(),
      data
    };

    console.log('Notification:', JSON.stringify(notification, null, 2));
  }

  generateVersion() {
    const now = new Date();
    return `v${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}-${now.getHours()}${now.getMinutes()}`;
  }

  async cleanup() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    console.log('🧹 Cleanup completed');
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const orchestrator = new DeploymentOrchestrator();

  try {
    await orchestrator.loadConfig();
    await orchestrator.validateEnvironment();

    switch (command) {
      case 'canary':
        await orchestrator.runPreDeploymentChecks();
        const canaryResult = await orchestrator.deployToStage('canary', {
          abTest: args.includes('--ab-test')
        });
        console.log('Canary deployment result:', canaryResult);
        break;

      case 'beta':
        await orchestrator.runPreDeploymentChecks();
        const betaResult = await orchestrator.deployToStage('beta');
        console.log('Beta deployment result:', betaResult);
        break;

      case 'production':
        await orchestrator.runPreDeploymentChecks();
        const prodResult = await orchestrator.deployToStage('production');
        console.log('Production deployment result:', prodResult);
        break;

      case 'rollback':
        const stage = args[1] || 'production';
        const reason = args[2] || 'Manual rollback';
        await orchestrator.triggerRollback(stage, reason);
        break;

      case 'status':
        console.log('Current deployment status:', orchestrator.currentDeployment);
        break;

      default:
        console.log('Usage: deploy-orchestrator <command>');
        console.log('Commands:');
        console.log('  canary [--ab-test]    Deploy to canary stage');
        console.log('  beta                   Deploy to beta stage');
        console.log('  production            Deploy to production');
        console.log('  rollback <stage>      Rollback specified stage');
        console.log('  status                Show current deployment status');
        break;
    }

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  } finally {
    await orchestrator.cleanup();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DeploymentOrchestrator;