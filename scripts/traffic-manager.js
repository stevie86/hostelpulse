#!/usr/bin/env node

/**
 * Hostelpulse Traffic Management System
 * Handles gradual traffic shifting, load balancing, and routing rules
 */

const fs = require('fs').promises;
const path = require('path');

class TrafficManager {
  constructor() {
    this.routingRules = new Map();
    this.trafficDistribution = new Map();
    this.loadBalancers = new Map();
    this.config = null;
  }

  async loadConfig() {
    try {
      const configPath = path.join(__dirname, 'deployment-config.json');
      const configData = await fs.readFile(configPath, 'utf8');
      this.config = JSON.parse(configData).traffic_management;
      console.log('✅ Traffic management configuration loaded');
    } catch (error) {
      console.error('❌ Failed to load traffic management config:', error.message);
      throw error;
    }
  }

  async setupTrafficDistribution(deploymentId, versions) {
    console.log(`🚦 Setting up traffic distribution for ${deploymentId}`);

    const distribution = {
      deployment_id: deploymentId,
      versions: versions.map(version => ({
        version_id: version.id,
        url: version.url,
        weight: version.weight || 0,
        current_traffic: 0,
        target_traffic: version.weight || 0,
        status: 'active'
      })),
      total_weight: versions.reduce((sum, v) => sum + (v.weight || 0), 0),
      strategy: this.config.load_balancing.algorithm,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Validate weights
    if (distribution.total_weight !== 100) {
      console.warn(`⚠️ Total weight is ${distribution.total_weight}%, adjusting to 100%`);
      this.normalizeWeights(distribution);
    }

    this.trafficDistribution.set(deploymentId, distribution);

    // Setup routing rules
    await this.setupRoutingRules(distribution);

    console.log(`✅ Traffic distribution configured for ${deploymentId}`);
    return distribution;
  }

  normalizeWeights(distribution) {
    const factor = 100 / distribution.total_weight;
    distribution.versions.forEach(version => {
      version.weight = Math.round(version.weight * factor);
      version.target_traffic = version.weight;
    });
    distribution.total_weight = 100;
  }

  async setupRoutingRules(distribution) {
    console.log('📋 Setting up routing rules...');

    const rules = {
      deployment_id: distribution.deployment_id,
      rules: [],
      strategy: this.config.routing_rules,
      created_at: new Date().toISOString()
    };

    // Create percentage-based routing rules
    let cumulativeWeight = 0;
    distribution.versions.forEach((version, index) => {
      const rule = {
        id: `rule_${index + 1}`,
        version_id: version.version_id,
        weight_range: [cumulativeWeight, cumulativeWeight + version.weight],
        conditions: [],
        actions: [{
          type: 'route',
          target: version.url
        }]
      };

      cumulativeWeight += version.weight;
      rules.rules.push(rule);
    });

    this.routingRules.set(distribution.deployment_id, rules);

    console.log(`✅ Routing rules configured (${rules.rules.length} rules)`);
  }

  routeRequest(deploymentId, userContext = {}) {
    const distribution = this.trafficDistribution.get(deploymentId);
    if (!distribution) {
      throw new Error(`No traffic distribution found for ${deploymentId}`);
    }

    // Apply routing strategy
    switch (this.config.load_balancing.algorithm) {
      case 'round_robin':
        return this.routeRoundRobin(distribution, userContext);

      case 'weighted_round_robin':
        return this.routeWeightedRoundRobin(distribution, userContext);

      case 'ip_hash':
        return this.routeIPHash(distribution, userContext);

      case 'least_connections':
        return this.routeLeastConnections(distribution, userContext);

      default:
        return this.routePercentageBased(distribution, userContext);
    }
  }

  routePercentageBased(distribution, userContext) {
    // Use user ID or random number for consistent routing
    const userId = userContext.userId || userContext.id || Math.random().toString();
    const hash = this.hashString(userId);
    const percentage = (hash % 100) + 1; // 1-100

    let cumulativeWeight = 0;
    for (const version of distribution.versions) {
      cumulativeWeight += version.weight;
      if (percentage <= cumulativeWeight) {
        version.current_traffic += 1;
        return {
          version_id: version.version_id,
          url: version.url,
          rule_type: 'percentage_based'
        };
      }
    }

    // Fallback to first version
    const fallbackVersion = distribution.versions[0];
    fallbackVersion.current_traffic += 1;
    return {
      version_id: fallbackVersion.version_id,
      url: fallbackVersion.url,
      rule_type: 'fallback'
    };
  }

  routeRoundRobin(distribution, userContext) {
    // Simple round-robin implementation
    const totalRequests = distribution.versions.reduce((sum, v) => sum + v.current_traffic, 0);
    const targetIndex = totalRequests % distribution.versions.length;
    const targetVersion = distribution.versions[targetIndex];

    targetVersion.current_traffic += 1;
    return {
      version_id: targetVersion.version_id,
      url: targetVersion.url,
      rule_type: 'round_robin'
    };
  }

  routeWeightedRoundRobin(distribution, userContext) {
    // Weighted round-robin implementation
    let totalWeight = 0;
    let selectedVersion = null;

    for (const version of distribution.versions) {
      totalWeight += version.weight;
      if (Math.random() * totalWeight < version.weight) {
        selectedVersion = version;
      }
    }

    if (selectedVersion) {
      selectedVersion.current_traffic += 1;
      return {
        version_id: selectedVersion.version_id,
        url: selectedVersion.url,
        rule_type: 'weighted_round_robin'
      };
    }

    // Fallback
    return this.routeRoundRobin(distribution, userContext);
  }

  routeIPHash(distribution, userContext) {
    const ip = userContext.ip || userContext.clientIP || '127.0.0.1';
    const hash = this.hashString(ip);
    const index = hash % distribution.versions.length;
    const targetVersion = distribution.versions[index];

    targetVersion.current_traffic += 1;
    return {
      version_id: targetVersion.version_id,
      url: targetVersion.url,
      rule_type: 'ip_hash'
    };
  }

  routeLeastConnections(distribution, userContext) {
    // Find version with least connections
    let minConnections = Infinity;
    let targetVersion = null;

    for (const version of distribution.versions) {
      if (version.current_traffic < minConnections) {
        minConnections = version.current_traffic;
        targetVersion = version;
      }
    }

    if (targetVersion) {
      targetVersion.current_traffic += 1;
      return {
        version_id: targetVersion.version_id,
        url: targetVersion.url,
        rule_type: 'least_connections'
      };
    }

    // Fallback
    return this.routeRoundRobin(distribution, userContext);
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  async updateTrafficWeights(deploymentId, versionUpdates) {
    console.log(`🔄 Updating traffic weights for ${deploymentId}`);

    const distribution = this.trafficDistribution.get(deploymentId);
    if (!distribution) {
      throw new Error(`No traffic distribution found for ${deploymentId}`);
    }

    // Update version weights
    for (const update of versionUpdates) {
      const version = distribution.versions.find(v => v.version_id === update.version_id);
      if (version) {
        version.weight = update.weight;
        version.target_traffic = update.weight;
      }
    }

    // Recalculate total weight
    distribution.total_weight = distribution.versions.reduce((sum, v) => sum + v.weight, 0);

    // Normalize if necessary
    if (distribution.total_weight !== 100) {
      this.normalizeWeights(distribution);
    }

    distribution.updated_at = new Date().toISOString();

    // Update routing rules
    await this.setupRoutingRules(distribution);

    console.log(`✅ Traffic weights updated for ${deploymentId}`);
    return distribution;
  }

  async gradualTrafficShift(deploymentId, targetVersionId, duration = 300000) { // 5 minutes default
    console.log(`🔄 Starting gradual traffic shift for ${deploymentId}`);

    const distribution = this.trafficDistribution.get(deploymentId);
    if (!distribution) {
      throw new Error(`No traffic distribution found for ${deploymentId}`);
    }

    const targetVersion = distribution.versions.find(v => v.version_id === targetVersionId);
    if (!targetVersion) {
      throw new Error(`Target version ${targetVersionId} not found`);
    }

    const shift = {
      id: `shift_${Date.now()}`,
      deployment_id: deploymentId,
      target_version_id: targetVersionId,
      start_time: new Date().toISOString(),
      duration,
      initial_weights: distribution.versions.map(v => ({ version_id: v.version_id, weight: v.weight })),
      status: 'in_progress'
    };

    // Calculate shift steps (every 30 seconds)
    const steps = Math.floor(duration / 30000);
    const weightIncrement = 100 / steps;

    for (let step = 1; step <= steps; step++) {
      const progress = step / steps;
      const newWeight = Math.min(100, Math.round(weightIncrement * step));

      // Update weights gradually
      const updates = distribution.versions.map(version => ({
        version_id: version.version_id,
        weight: version.version_id === targetVersionId ? newWeight : Math.max(0, version.weight - Math.round(weightIncrement / (distribution.versions.length - 1)))
      }));

      await this.updateTrafficWeights(deploymentId, updates);

      console.log(`📊 Traffic shift progress: ${Math.round(progress * 100)}% (${newWeight}% to ${targetVersionId})`);

      // Wait for next step
      if (step < steps) {
        await this.delay(30000);
      }
    }

    shift.end_time = new Date().toISOString();
    shift.status = 'completed';
    shift.final_weights = distribution.versions.map(v => ({ version_id: v.version_id, weight: v.weight }));

    console.log(`✅ Gradual traffic shift completed for ${deploymentId}`);
    return shift;
  }

  async canaryDeployment(deploymentId, canaryVersion, canaryPercentage = 5) {
    console.log(`🐦 Setting up canary deployment for ${deploymentId}`);

    const distribution = this.trafficDistribution.get(deploymentId);
    if (!distribution) {
      throw new Error(`No traffic distribution found for ${deploymentId}`);
    }

    // Add canary version
    const canary = {
      version_id: canaryVersion.id,
      url: canaryVersion.url,
      weight: canaryPercentage,
      current_traffic: 0,
      target_traffic: canaryPercentage,
      status: 'canary'
    };

    // Adjust existing versions
    const remainingPercentage = 100 - canaryPercentage;
    const adjustmentFactor = remainingPercentage / (distribution.total_weight - canaryPercentage);

    distribution.versions.forEach(version => {
      version.weight = Math.round(version.weight * adjustmentFactor);
      version.target_traffic = version.weight;
    });

    distribution.versions.push(canary);
    distribution.total_weight = 100;
    distribution.updated_at = new Date().toISOString();

    // Update routing rules
    await this.setupRoutingRules(distribution);

    console.log(`✅ Canary deployment configured (${canaryPercentage}% traffic to ${canaryVersion.id})`);
    return distribution;
  }

  async promoteCanary(deploymentId, canaryVersionId) {
    console.log(`⬆️ Promoting canary ${canaryVersionId} for ${deploymentId}`);

    const distribution = this.trafficDistribution.get(deploymentId);
    if (!distribution) {
      throw new Error(`No traffic distribution found for ${deploymentId}`);
    }

    const canaryVersion = distribution.versions.find(v => v.version_id === canaryVersionId && v.status === 'canary');
    if (!canaryVersion) {
      throw new Error(`Canary version ${canaryVersionId} not found`);
    }

    // Gradually shift all traffic to canary version
    await this.gradualTrafficShift(deploymentId, canaryVersionId, 600000); // 10 minutes

    // Update version status
    canaryVersion.status = 'production';
    distribution.updated_at = new Date().toISOString();

    console.log(`✅ Canary ${canaryVersionId} promoted to production`);
    return distribution;
  }

  async getTrafficStats(deploymentId) {
    const distribution = this.trafficDistribution.get(deploymentId);
    if (!distribution) {
      return null;
    }

    const totalTraffic = distribution.versions.reduce((sum, v) => sum + v.current_traffic, 0);

    return {
      deployment_id: deploymentId,
      total_traffic: totalTraffic,
      versions: distribution.versions.map(version => ({
        version_id: version.version_id,
        weight: version.weight,
        current_traffic: version.current_traffic,
        traffic_percentage: totalTraffic > 0 ? (version.current_traffic / totalTraffic * 100).toFixed(2) : 0,
        status: version.status
      })),
      strategy: distribution.strategy,
      last_updated: distribution.updated_at
    };
  }

  async healthCheck(deploymentId) {
    const distribution = this.trafficDistribution.get(deploymentId);
    if (!distribution) {
      return { healthy: false, error: 'No traffic distribution found' };
    }

    const healthResults = {
      healthy: true,
      checks: [],
      timestamp: new Date().toISOString()
    };

    // Check each version
    for (const version of distribution.versions) {
      try {
        const health = await this.checkVersionHealth(version);
        healthResults.checks.push({
          version_id: version.version_id,
          healthy: health.healthy,
          response_time: health.response_time,
          status_code: health.status_code
        });

        if (!health.healthy) {
          healthResults.healthy = false;
        }
      } catch (error) {
        healthResults.checks.push({
          version_id: version.version_id,
          healthy: false,
          error: error.message
        });
        healthResults.healthy = false;
      }
    }

    return healthResults;
  }

  async checkVersionHealth(version) {
    // Mock health check (in real implementation, this would make HTTP requests)
    return {
      healthy: Math.random() > 0.1, // 90% success rate
      response_time: Math.random() * 1000 + 200,
      status_code: Math.random() > 0.1 ? 200 : 500
    };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async saveState() {
    const statePath = path.join(__dirname, 'traffic-manager-state.json');
    const state = {
      routingRules: Array.from(this.routingRules.entries()),
      trafficDistribution: Array.from(this.trafficDistribution.entries()),
      loadBalancers: Array.from(this.loadBalancers.entries()),
      lastSaved: new Date().toISOString()
    };

    await fs.writeFile(statePath, JSON.stringify(state, null, 2));
    console.log('💾 Traffic manager state saved');
  }

  async loadState() {
    try {
      const statePath = path.join(__dirname, 'traffic-manager-state.json');
      const data = await fs.readFile(statePath, 'utf8');
      const state = JSON.parse(data);

      // Restore routing rules
      state.routingRules.forEach(([id, rules]) => {
        this.routingRules.set(id, rules);
      });

      // Restore traffic distribution
      state.trafficDistribution.forEach(([id, distribution]) => {
        this.trafficDistribution.set(id, distribution);
      });

      // Restore load balancers
      state.loadBalancers.forEach(([id, balancer]) => {
        this.loadBalancers.set(id, balancer);
      });

      console.log('📂 Traffic manager state loaded');
    } catch (error) {
      console.log('No previous traffic manager state found');
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const trafficManager = new TrafficManager();

  try {
    await trafficManager.loadConfig();
    await trafficManager.loadState();

    switch (command) {
      case 'setup':
        const deploymentId = args[1];
        const versionsJson = args[2];
        const versions = JSON.parse(versionsJson);
        const distribution = await trafficManager.setupTrafficDistribution(deploymentId, versions);
        console.log('Traffic distribution setup:', distribution.deployment_id);
        break;

      case 'route':
        const routeDeploymentId = args[1];
        const userId = args[2] || 'test-user';
        const route = trafficManager.routeRequest(routeDeploymentId, { userId });
        console.log('Route result:', route);
        break;

      case 'update':
        const updateDeploymentId = args[1];
        const updatesJson = args[2];
        const updates = JSON.parse(updatesJson);
        await trafficManager.updateTrafficWeights(updateDeploymentId, updates);
        console.log('Traffic weights updated');
        break;

      case 'shift':
        const shiftDeploymentId = args[1];
        const targetVersionId = args[2];
        const duration = parseInt(args[3]) || 300000;
        const shift = await trafficManager.gradualTrafficShift(shiftDeploymentId, targetVersionId, duration);
        console.log('Traffic shift completed:', shift.id);
        break;

      case 'canary':
        const canaryDeploymentId = args[1];
        const canaryVersionJson = args[2];
        const canaryVersion = JSON.parse(canaryVersionJson);
        const canaryPercentage = parseInt(args[3]) || 5;
        await trafficManager.canaryDeployment(canaryDeploymentId, canaryVersion, canaryPercentage);
        console.log('Canary deployment configured');
        break;

      case 'promote':
        const promoteDeploymentId = args[1];
        const canaryVersionId = args[2];
        await trafficManager.promoteCanary(promoteDeploymentId, canaryVersionId);
        console.log('Canary promoted to production');
        break;

      case 'stats':
        const statsDeploymentId = args[1];
        const stats = await trafficManager.getTrafficStats(statsDeploymentId);
        console.log('Traffic stats:', JSON.stringify(stats, null, 2));
        break;

      case 'health':
        const healthDeploymentId = args[1];
        const health = await trafficManager.healthCheck(healthDeploymentId);
        console.log('Health check:', JSON.stringify(health, null, 2));
        break;

      default:
        console.log('Usage: traffic-manager <command>');
        console.log('Commands:');
        console.log('  setup <deployment-id> <versions-json>    Setup traffic distribution');
        console.log('  route <deployment-id> [user-id]          Route a request');
        console.log('  update <deployment-id> <updates-json>    Update traffic weights');
        console.log('  shift <deployment-id> <version-id> [duration]  Gradual traffic shift');
        console.log('  canary <deployment-id> <version-json> [percentage]  Setup canary');
        console.log('  promote <deployment-id> <canary-version-id>  Promote canary');
        console.log('  stats <deployment-id>                     Show traffic stats');
        console.log('  health <deployment-id>                    Health check');
        break;
    }

    await trafficManager.saveState();

  } catch (error) {
    console.error('❌ Traffic management error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = TrafficManager;