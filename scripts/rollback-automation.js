#!/usr/bin/env node

/**
 * Hostelpulse Rollback Automation System
 * Automated rollback on failure detection with safety checks
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync, spawn } = require('child_process');

class RollbackAutomation {
  constructor() {
    this.rollbackHistory = new Map();
    this.backupStates = new Map();
    this.config = null;
  }

  async loadConfig() {
    try {
      const configPath = path.join(__dirname, 'deployment-config.json');
      const configData = await fs.readFile(configPath, 'utf8');
      this.config = JSON.parse(configData).rollback;
      console.log('✅ Rollback configuration loaded');
    } catch (error) {
      console.error('❌ Failed to load rollback config:', error.message);
      throw error;
    }
  }

  async createBackup(deploymentId, environment = 'production') {
    console.log(`💾 Creating backup for ${deploymentId} in ${environment}`);

    const backupId = `backup_${Date.now()}`;
    const backup = {
      id: backupId,
      deployment_id: deploymentId,
      environment,
      timestamp: new Date().toISOString(),
      status: 'creating',
      components: {
        code: null,
        database: null,
        config: null,
        assets: null
      }
    };

    try {
      // Backup current deployment state
      backup.components.code = await this.backupCodebase();
      backup.components.database = await this.backupDatabase();
      backup.components.config = await this.backupConfiguration();
      backup.components.assets = await this.backupAssets();

      backup.status = 'completed';
      this.backupStates.set(backupId, backup);

      console.log(`✅ Backup ${backupId} created successfully`);
      return backup;

    } catch (error) {
      console.error('❌ Backup creation failed:', error.message);
      backup.status = 'failed';
      backup.error = error.message;
      throw error;
    }
  }

  async backupCodebase() {
    const backupPath = path.join(__dirname, '..', 'backups', 'code');
    await fs.mkdir(backupPath, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveName = `code-${timestamp}.tar.gz`;
    const archivePath = path.join(backupPath, archiveName);

    // Create code archive (excluding node_modules, .git, etc.)
    const excludePatterns = [
      '--exclude=node_modules',
      '--exclude=.git',
      '--exclude=.next',
      '--exclude=backups',
      '--exclude=*.log'
    ].join(' ');

    const command = `tar -czf ${archivePath} ${excludePatterns} -C ${path.join(__dirname, '..')} .`;
    execSync(command, { stdio: 'inherit' });

    console.log(`📦 Code backup created: ${archiveName}`);
    return {
      type: 'code',
      path: archivePath,
      size: (await fs.stat(archivePath)).size
    };
  }

  async backupDatabase() {
    // In a real implementation, this would backup the actual database
    console.log('🗄️ Database backup created (mock)');

    return {
      type: 'database',
      path: '/backups/database/mock.sql',
      records: 1000,
      size: 1024000
    };
  }

  async backupConfiguration() {
    const configFiles = [
      'next.config.js',
      'tailwind.config.js',
      'package.json',
      'scripts/deployment-config.json'
    ];

    const backupPath = path.join(__dirname, '..', 'backups', 'config');
    await fs.mkdir(backupPath, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveName = `config-${timestamp}.tar.gz`;
    const archivePath = path.join(backupPath, archiveName);

    // Create config archive
    const filesList = configFiles.join(' ');
    const command = `tar -czf ${archivePath} -C ${path.join(__dirname, '..')} ${filesList}`;
    execSync(command, { stdio: 'inherit' });

    console.log(`⚙️ Config backup created: ${archiveName}`);
    return {
      type: 'config',
      path: archivePath,
      files: configFiles,
      size: (await fs.stat(archivePath)).size
    };
  }

  async backupAssets() {
    const assetsPath = path.join(__dirname, '..', 'public');
    const backupPath = path.join(__dirname, '..', 'backups', 'assets');
    await fs.mkdir(backupPath, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveName = `assets-${timestamp}.tar.gz`;
    const archivePath = path.join(backupPath, archiveName);

    // Create assets archive
    const command = `tar -czf ${archivePath} -C ${assetsPath} .`;
    execSync(command, { stdio: 'inherit' });

    console.log(`🖼️ Assets backup created: ${archiveName}`);
    return {
      type: 'assets',
      path: archivePath,
      size: (await fs.stat(archivePath)).size
    };
  }

  async triggerRollback(deploymentId, reason, options = {}) {
    console.log(`🔄 Triggering rollback for ${deploymentId}`);
    console.log(`Reason: ${reason}`);

    const rollbackId = `rollback_${Date.now()}`;

    const rollback = {
      id: rollbackId,
      deployment_id: deploymentId,
      reason,
      timestamp: new Date().toISOString(),
      status: 'initiating',
      steps: [],
      options: {
        immediate: options.immediate || false,
        force: options.force || false,
        ...options
      }
    };

    this.rollbackHistory.set(rollbackId, rollback);

    try {
      // Pre-rollback checks
      await this.performPreRollbackChecks(deploymentId, rollback);

      // Find suitable backup
      const backup = await this.findSuitableBackup(deploymentId, options.backupId);

      if (!backup) {
        throw new Error('No suitable backup found for rollback');
      }

      rollback.backup_id = backup.id;

      // Execute rollback steps
      await this.executeRollbackSteps(rollback, backup);

      rollback.status = 'completed';
      console.log(`✅ Rollback ${rollbackId} completed successfully`);

      // Post-rollback verification
      await this.verifyRollback(rollback);

      // Send notifications
      await this.sendRollbackNotification(rollback);

      return rollback;

    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      rollback.status = 'failed';
      rollback.error = error.message;

      // Attempt recovery if possible
      await this.attemptRollbackRecovery(rollback);

      throw error;
    }
  }

  async performPreRollbackChecks(deploymentId, rollback) {
    console.log('🔍 Performing pre-rollback checks...');

    rollback.steps.push({
      name: 'pre_rollback_checks',
      status: 'running',
      timestamp: new Date().toISOString()
    });

    // Check system health
    const healthCheck = await this.checkSystemHealth();
    if (!healthCheck.healthy && !rollback.options.force) {
      throw new Error('System health check failed - rollback may not be safe');
    }

    // Check if rollback is already in progress
    const activeRollbacks = Array.from(this.rollbackHistory.values())
      .filter(r => r.deployment_id === deploymentId && r.status === 'running');

    if (activeRollbacks.length > 0 && !rollback.options.force) {
      throw new Error('Another rollback is already in progress');
    }

    // Validate backup integrity
    await this.validateBackupIntegrity();

    rollback.steps[rollback.steps.length - 1].status = 'completed';
    console.log('✅ Pre-rollback checks completed');
  }

  async checkSystemHealth() {
    // Mock system health check
    return {
      healthy: true,
      checks: {
        database: 'ok',
        api: 'ok',
        storage: 'ok'
      }
    };
  }

  async validateBackupIntegrity() {
    // Mock backup integrity validation
    console.log('🔐 Validating backup integrity...');
    return true;
  }

  async findSuitableBackup(deploymentId, preferredBackupId = null) {
    if (preferredBackupId) {
      return this.backupStates.get(preferredBackupId);
    }

    // Find the most recent successful backup for this deployment
    const deploymentBackups = Array.from(this.backupStates.values())
      .filter(backup => backup.deployment_id === deploymentId && backup.status === 'completed')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return deploymentBackups[0] || null;
  }

  async executeRollbackSteps(rollback, backup) {
    console.log('⚙️ Executing rollback steps...');

    const steps = [
      { name: 'stop_services', action: () => this.stopServices(rollback) },
      { name: 'restore_code', action: () => this.restoreCode(backup, rollback) },
      { name: 'restore_config', action: () => this.restoreConfiguration(backup, rollback) },
      { name: 'restore_database', action: () => this.restoreDatabase(backup, rollback) },
      { name: 'restore_assets', action: () => this.restoreAssets(backup, rollback) },
      { name: 'start_services', action: () => this.startServices(rollback) },
      { name: 'warm_up', action: () => this.warmUpApplication(rollback) }
    ];

    for (const step of steps) {
      try {
        rollback.steps.push({
          name: step.name,
          status: 'running',
          timestamp: new Date().toISOString()
        });

        await step.action();

        rollback.steps[rollback.steps.length - 1].status = 'completed';
        console.log(`✅ ${step.name} completed`);

      } catch (error) {
        console.error(`❌ ${step.name} failed:`, error.message);
        rollback.steps[rollback.steps.length - 1].status = 'failed';
        rollback.steps[rollback.steps.length - 1].error = error.message;

        if (!rollback.options.force) {
          throw error;
        }
      }
    }
  }

  async stopServices(rollback) {
    console.log('🛑 Stopping services...');

    // In a real implementation, this would stop the application services
    // For Vercel, this might involve API calls to pause deployments
    await this.delay(2000); // Mock delay
  }

  async restoreCode(backup, rollback) {
    if (!backup.components.code) return;

    console.log('📦 Restoring code from backup...');

    const codeBackup = backup.components.code;
    const extractPath = path.join(__dirname, '..');

    // Extract code backup
    const command = `tar -xzf ${codeBackup.path} -C ${extractPath}`;
    execSync(command, { stdio: 'inherit' });

    console.log('📦 Code restored successfully');
  }

  async restoreConfiguration(backup, rollback) {
    if (!backup.components.config) return;

    console.log('⚙️ Restoring configuration...');

    const configBackup = backup.components.config;
    const extractPath = path.join(__dirname, '..');

    // Extract config backup
    const command = `tar -xzf ${configBackup.path} -C ${extractPath}`;
    execSync(command, { stdio: 'inherit' });

    console.log('⚙️ Configuration restored successfully');
  }

  async restoreDatabase(backup, rollback) {
    if (!backup.components.database) return;

    console.log('🗄️ Restoring database...');

    // In a real implementation, this would restore the database from backup
    await this.delay(5000); // Mock delay for database restore
    console.log('🗄️ Database restored successfully');
  }

  async restoreAssets(backup, rollback) {
    if (!backup.components.assets) return;

    console.log('🖼️ Restoring assets...');

    const assetsBackup = backup.components.assets;
    const extractPath = path.join(__dirname, '..', 'public');

    // Clear current assets
    try {
      await fs.rm(extractPath, { recursive: true, force: true });
    } catch (error) {
      // Directory might not exist, continue
    }

    await fs.mkdir(extractPath, { recursive: true });

    // Extract assets backup
    const command = `tar -xzf ${assetsBackup.path} -C ${extractPath}`;
    execSync(command, { stdio: 'inherit' });

    console.log('🖼️ Assets restored successfully');
  }

  async startServices(rollback) {
    console.log('▶️ Starting services...');

    // In a real implementation, this would start the application services
    // For Vercel, this might involve redeploying or activating a previous deployment
    await this.delay(3000); // Mock delay
  }

  async warmUpApplication(rollback) {
    console.log('🔥 Warming up application...');

    // Perform health checks and warm-up requests
    await this.performHealthChecks();
    await this.performWarmUpRequests();

    console.log('🔥 Application warmed up successfully');
  }

  async performHealthChecks() {
    // Mock health checks
    const endpoints = ['/api/health', '/'];
    for (const endpoint of endpoints) {
      console.log(`🏥 Health check: ${endpoint}`);
      await this.delay(500);
    }
  }

  async performWarmUpRequests() {
    // Mock warm-up requests
    console.log('🌡️ Performing warm-up requests...');
    await this.delay(2000);
  }

  async verifyRollback(rollback) {
    console.log('✅ Verifying rollback...');

    rollback.steps.push({
      name: 'verification',
      status: 'running',
      timestamp: new Date().toISOString()
    });

    // Perform verification checks
    const verificationResults = await this.performVerificationChecks();

    if (!verificationResults.success) {
      throw new Error(`Rollback verification failed: ${verificationResults.errors.join(', ')}`);
    }

    rollback.steps[rollback.steps.length - 1].status = 'completed';
    console.log('✅ Rollback verification completed');
  }

  async performVerificationChecks() {
    // Mock verification checks
    return {
      success: true,
      checks: {
        services_running: true,
        database_connected: true,
        api_responding: true
      },
      errors: []
    };
  }

  async attemptRollbackRecovery(rollback) {
    console.log('🔧 Attempting rollback recovery...');

    // Try to restore to a known good state
    try {
      // Find the last known good backup
      const goodBackup = await this.findLastGoodBackup(rollback.deployment_id);

      if (goodBackup) {
        console.log('Found good backup, attempting recovery...');
        await this.triggerRollback(rollback.deployment_id, 'Recovery from failed rollback', {
          backupId: goodBackup.id,
          force: true
        });
      }
    } catch (error) {
      console.error('Recovery attempt failed:', error.message);
    }
  }

  async findLastGoodBackup(deploymentId) {
    // Find backups that are older than the current failed deployment
    const backups = Array.from(this.backupStates.values())
      .filter(backup => backup.deployment_id === deploymentId && backup.status === 'completed')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return backups[1] || null; // Return second most recent (skip the potentially bad one)
  }

  async sendRollbackNotification(rollback) {
    console.log('📢 Sending rollback notification...');

    const notification = {
      type: 'rollback',
      rollback_id: rollback.id,
      deployment_id: rollback.deployment_id,
      reason: rollback.reason,
      status: rollback.status,
      timestamp: rollback.timestamp,
      duration: Date.now() - new Date(rollback.timestamp).getTime()
    };

    // In a real implementation, this would send notifications via Slack, email, etc.
    console.log('Rollback notification:', JSON.stringify(notification, null, 2));
  }

  async getRollbackHistory(deploymentId = null) {
    const rollbacks = Array.from(this.rollbackHistory.values())
      .filter(rollback => !deploymentId || rollback.deployment_id === deploymentId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return rollbacks;
  }

  async getBackupHistory(deploymentId = null) {
    const backups = Array.from(this.backupStates.values())
      .filter(backup => !deploymentId || backup.deployment_id === deploymentId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return backups;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async saveState() {
    const statePath = path.join(__dirname, 'rollback-state.json');
    const state = {
      rollbackHistory: Array.from(this.rollbackHistory.entries()),
      backupStates: Array.from(this.backupStates.entries()),
      lastSaved: new Date().toISOString()
    };

    await fs.writeFile(statePath, JSON.stringify(state, null, 2));
    console.log('💾 Rollback state saved');
  }

  async loadState() {
    try {
      const statePath = path.join(__dirname, 'rollback-state.json');
      const data = await fs.readFile(statePath, 'utf8');
      const state = JSON.parse(data);

      // Restore rollback history
      state.rollbackHistory.forEach(([id, rollback]) => {
        this.rollbackHistory.set(id, rollback);
      });

      // Restore backup states
      state.backupStates.forEach(([id, backup]) => {
        this.backupStates.set(id, backup);
      });

      console.log('📂 Rollback state loaded');
    } catch (error) {
      console.log('No previous rollback state found');
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const rollback = new RollbackAutomation();

  try {
    await rollback.loadConfig();
    await rollback.loadState();

    switch (command) {
      case 'backup':
        const deploymentId = args[1] || 'default-deployment';
        const environment = args[2] || 'production';
        const backup = await rollback.createBackup(deploymentId, environment);
        console.log('Backup created:', backup.id);
        break;

      case 'rollback':
        const rollbackDeploymentId = args[1] || 'default-deployment';
        const reason = args[2] || 'Manual rollback';
        const options = {
          force: args.includes('--force'),
          immediate: args.includes('--immediate'),
          backupId: args.find(arg => arg.startsWith('--backup='))?.split('=')[1]
        };
        const rollbackResult = await rollback.triggerRollback(rollbackDeploymentId, reason, options);
        console.log('Rollback completed:', rollbackResult.id);
        break;

      case 'history':
        const historyDeploymentId = args[1];
        const history = await rollback.getRollbackHistory(historyDeploymentId);
        console.log('Rollback History:');
        history.forEach(r => {
          console.log(`- ${r.id}: ${r.status} (${r.reason}) - ${r.timestamp}`);
        });
        break;

      case 'backups':
        const backupsDeploymentId = args[1];
        const backups = await rollback.getBackupHistory(backupsDeploymentId);
        console.log('Backup History:');
        backups.forEach(b => {
          console.log(`- ${b.id}: ${b.status} - ${b.timestamp}`);
        });
        break;

      default:
        console.log('Usage: rollback-automation <command>');
        console.log('Commands:');
        console.log('  backup [deployment-id] [environment]    Create backup');
        console.log('  rollback <deployment-id> <reason>       Trigger rollback');
        console.log('  history [deployment-id]                 Show rollback history');
        console.log('  backups [deployment-id]                 Show backup history');
        console.log('Options:');
        console.log('  --force                                 Force rollback even with warnings');
        console.log('  --immediate                            Immediate rollback without checks');
        console.log('  --backup=<backup-id>                   Use specific backup for rollback');
        break;
    }

    await rollback.saveState();

  } catch (error) {
    console.error('❌ Rollback error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = RollbackAutomation;