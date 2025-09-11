#!/usr/bin/env node

/**
 * Hostelpulse Feature Flag Management System
 * Handles dynamic feature enablement, rollout strategies, and targeting
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class FeatureFlagManager {
  constructor() {
    this.flags = new Map();
    this.userSegments = new Map();
    this.rolloutRules = new Map();
    this.config = null;
  }

  async loadConfig() {
    try {
      const configPath = path.join(__dirname, 'deployment-config.json');
      const configData = await fs.readFile(configPath, 'utf8');
      this.config = JSON.parse(configData).feature_flags;
      console.log('✅ Feature flag configuration loaded');
    } catch (error) {
      console.error('❌ Failed to load feature flag config:', error.message);
      throw error;
    }
  }

  async createFeatureFlag(flagConfig) {
    console.log(`🚩 Creating feature flag: ${flagConfig.key}`);

    const flag = {
      key: flagConfig.key,
      name: flagConfig.name,
      description: flagConfig.description,
      enabled: flagConfig.enabled || false,
      rollout_percentage: flagConfig.rollout_percentage || 0,
      rollout_strategy: flagConfig.rollout_strategy || 'percentage_based',
      target_audience: flagConfig.target_audience || 'all_users',
      conditions: flagConfig.conditions || [],
      variants: flagConfig.variants || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        created_by: flagConfig.created_by || 'system',
        tags: flagConfig.tags || [],
        dependencies: flagConfig.dependencies || []
      }
    };

    this.flags.set(flag.key, flag);

    console.log(`✅ Feature flag ${flag.key} created`);
    return flag;
  }

  async updateFeatureFlag(key, updates) {
    const flag = this.flags.get(key);
    if (!flag) {
      throw new Error(`Feature flag ${key} not found`);
    }

    console.log(`🔄 Updating feature flag: ${key}`);

    // Update flag properties
    Object.assign(flag, updates, {
      updated_at: new Date().toISOString()
    });

    // Validate rollout percentage
    if (flag.rollout_percentage < 0 || flag.rollout_percentage > 100) {
      throw new Error('Rollout percentage must be between 0 and 100');
    }

    console.log(`✅ Feature flag ${key} updated`);
    return flag;
  }

  isFeatureEnabled(key, userContext = {}) {
    const flag = this.flags.get(key);
    if (!flag) {
      console.warn(`Feature flag ${key} not found, defaulting to false`);
      return false;
    }

    if (!flag.enabled) {
      return false;
    }

    // Check rollout strategy
    switch (flag.rollout_strategy) {
      case 'percentage_based':
        return this.checkPercentageRollout(flag, userContext);

      case 'user_segment':
        return this.checkUserSegment(flag, userContext);

      case 'gradual_rollout':
        return this.checkGradualRollout(flag, userContext);

      case 'conditional':
        return this.checkConditions(flag, userContext);

      default:
        return flag.rollout_percentage === 100;
    }
  }

  checkPercentageRollout(flag, userContext) {
    if (flag.rollout_percentage === 100) return true;
    if (flag.rollout_percentage === 0) return false;

    // Use user ID for consistent rollout
    const userId = userContext.userId || userContext.id || 'anonymous';
    const hash = crypto.createHash('md5').update(userId).digest('hex');
    const hashValue = parseInt(hash.substring(0, 8), 16) % 100;

    return hashValue < flag.rollout_percentage;
  }

  checkUserSegment(flag, userContext) {
    const segment = this.userSegments.get(flag.target_audience);
    if (!segment) {
      console.warn(`User segment ${flag.target_audience} not found`);
      return false;
    }

    return segment.evaluate(userContext);
  }

  checkGradualRollout(flag, userContext) {
    // Gradual rollout based on time or other factors
    const now = Date.now();
    const rolloutStart = new Date(flag.created_at).getTime();
    const rolloutDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
    const elapsed = now - rolloutStart;
    const progress = Math.min(elapsed / rolloutDuration, 1);

    const currentPercentage = Math.floor(progress * 100);
    flag.rollout_percentage = currentPercentage;

    return this.checkPercentageRollout(flag, userContext);
  }

  checkConditions(flag, userContext) {
    if (!flag.conditions || flag.conditions.length === 0) {
      return true;
    }

    return flag.conditions.every(condition => {
      return this.evaluateCondition(condition, userContext);
    });
  }

  evaluateCondition(condition, userContext) {
    const { property, operator, value } = condition;

    const userValue = this.getNestedProperty(userContext, property);
    if (userValue === undefined) {
      return false;
    }

    switch (operator) {
      case 'equals':
        return userValue === value;
      case 'not_equals':
        return userValue !== value;
      case 'contains':
        return Array.isArray(userValue) ? userValue.includes(value) : String(userValue).includes(value);
      case 'greater_than':
        return Number(userValue) > Number(value);
      case 'less_than':
        return Number(userValue) < Number(value);
      case 'in':
        return Array.isArray(value) ? value.includes(userValue) : false;
      default:
        console.warn(`Unknown operator: ${operator}`);
        return false;
    }
  }

  getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  getFeatureVariant(key, userContext = {}) {
    const flag = this.flags.get(key);
    if (!flag || !flag.variants) {
      return null;
    }

    if (!this.isFeatureEnabled(key, userContext)) {
      return flag.variants.default || null;
    }

    // Simple A/B variant assignment
    const userId = userContext.userId || userContext.id || 'anonymous';
    const hash = crypto.createHash('md5').update(userId + key).digest('hex');
    const hashValue = parseInt(hash.substring(0, 8), 16) % 100;

    let cumulativePercentage = 0;
    for (const [variantName, variantConfig] of Object.entries(flag.variants)) {
      if (variantName === 'default') continue;

      cumulativePercentage += variantConfig.percentage || 0;
      if (hashValue < cumulativePercentage) {
        return variantName;
      }
    }

    return flag.variants.default || null;
  }

  async createUserSegment(segmentConfig) {
    console.log(`👥 Creating user segment: ${segmentConfig.key}`);

    const segment = {
      key: segmentConfig.key,
      name: segmentConfig.name,
      description: segmentConfig.description,
      conditions: segmentConfig.conditions || [],
      created_at: new Date().toISOString(),
      evaluate: (userContext) => {
        return segment.conditions.every(condition => {
          return this.evaluateCondition(condition, userContext);
        });
      }
    };

    this.userSegments.set(segment.key, segment);

    console.log(`✅ User segment ${segment.key} created`);
    return segment;
  }

  async enableFeature(key, percentage = 100) {
    return this.updateFeatureFlag(key, {
      enabled: true,
      rollout_percentage: percentage
    });
  }

  async disableFeature(key) {
    return this.updateFeatureFlag(key, {
      enabled: false,
      rollout_percentage: 0
    });
  }

  async setRolloutPercentage(key, percentage) {
    return this.updateFeatureFlag(key, {
      rollout_percentage: percentage
    });
  }

  getFeatureFlagStatus(key) {
    const flag = this.flags.get(key);
    if (!flag) {
      return null;
    }

    return {
      key: flag.key,
      name: flag.name,
      enabled: flag.enabled,
      rollout_percentage: flag.rollout_percentage,
      rollout_strategy: flag.rollout_strategy,
      target_audience: flag.target_audience,
      created_at: flag.created_at,
      updated_at: flag.updated_at
    };
  }

  listFeatureFlags() {
    return Array.from(this.flags.values()).map(flag => ({
      key: flag.key,
      name: flag.name,
      enabled: flag.enabled,
      rollout_percentage: flag.rollout_percentage,
      rollout_strategy: flag.rollout_strategy
    }));
  }

  async saveState() {
    const state = {
      flags: Array.from(this.flags.entries()),
      userSegments: Array.from(this.userSegments.entries()),
      rolloutRules: Array.from(this.rolloutRules.entries()),
      lastSaved: new Date().toISOString()
    };

    const statePath = path.join(__dirname, 'feature-flags-state.json');
    await fs.writeFile(statePath, JSON.stringify(state, null, 2));
    console.log('💾 Feature flag state saved');
  }

  async loadState() {
    try {
      const statePath = path.join(__dirname, 'feature-flags-state.json');
      const data = await fs.readFile(statePath, 'utf8');
      const state = JSON.parse(data);

      // Restore flags
      state.flags.forEach(([key, flag]) => {
        this.flags.set(key, flag);
      });

      // Restore user segments
      state.userSegments.forEach(([key, segment]) => {
        this.userSegments.set(key, segment);
      });

      // Restore rollout rules
      state.rolloutRules.forEach(([key, rule]) => {
        this.rolloutRules.set(key, rule);
      });

      console.log('📂 Feature flag state loaded');
    } catch (error) {
      console.log('No previous feature flag state found');
    }
  }

  // Initialize default feature flags
  async initializeDefaults() {
    const defaultFlags = [
      {
        key: 'new_dashboard',
        name: 'New Dashboard',
        description: 'Enhanced dashboard with new analytics',
        enabled: false,
        rollout_percentage: 0
      },
      {
        key: 'enhanced_analytics',
        name: 'Enhanced Analytics',
        description: 'Advanced analytics and reporting features',
        enabled: true,
        rollout_percentage: 100
      },
      {
        key: 'auto_tax_collection',
        name: 'Auto Tax Collection',
        description: 'Automatic Lisbon City Tax collection',
        enabled: true,
        rollout_percentage: 100
      },
      {
        key: 'beta_features',
        name: 'Beta Features',
        description: 'Experimental features for beta users',
        enabled: false,
        rollout_percentage: 0
      }
    ];

    for (const flagConfig of defaultFlags) {
      if (!this.flags.has(flagConfig.key)) {
        await this.createFeatureFlag(flagConfig);
      }
    }

    console.log('✅ Default feature flags initialized');
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const manager = new FeatureFlagManager();

  try {
    await manager.loadConfig();
    await manager.loadState();
    await manager.initializeDefaults();

    switch (command) {
      case 'create':
        const flag = await manager.createFeatureFlag({
          key: args[1],
          name: args[2] || args[1],
          description: args[3] || '',
          enabled: false,
          rollout_percentage: 0
        });
        console.log('Created feature flag:', flag.key);
        break;

      case 'enable':
        const enableKey = args[1];
        const percentage = parseInt(args[2]) || 100;
        await manager.enableFeature(enableKey, percentage);
        console.log(`Enabled feature ${enableKey} for ${percentage}% of users`);
        break;

      case 'disable':
        const disableKey = args[1];
        await manager.disableFeature(disableKey);
        console.log(`Disabled feature ${disableKey}`);
        break;

      case 'status':
        const statusKey = args[1];
        const status = manager.getFeatureFlagStatus(statusKey);
        console.log('Feature flag status:', JSON.stringify(status, null, 2));
        break;

      case 'list':
        const flags = manager.listFeatureFlags();
        console.log('Feature flags:');
        flags.forEach(flag => {
          console.log(`- ${flag.key}: ${flag.name} (${flag.enabled ? 'enabled' : 'disabled'}, ${flag.rollout_percentage}%)`);
        });
        break;

      case 'check':
        const checkKey = args[1];
        const userId = args[2] || 'test-user';
        const isEnabled = manager.isFeatureEnabled(checkKey, { userId });
        console.log(`Feature ${checkKey} for user ${userId}: ${isEnabled ? 'ENABLED' : 'DISABLED'}`);
        break;

      case 'segment':
        const segment = await manager.createUserSegment({
          key: args[1],
          name: args[2] || args[1],
          description: args[3] || '',
          conditions: []
        });
        console.log('Created user segment:', segment.key);
        break;

      default:
        console.log('Usage: feature-flag-manager <command>');
        console.log('Commands:');
        console.log('  create <key> <name> <description>    Create feature flag');
        console.log('  enable <key> [percentage]            Enable feature flag');
        console.log('  disable <key>                        Disable feature flag');
        console.log('  status <key>                         Show feature flag status');
        console.log('  list                                  List all feature flags');
        console.log('  check <key> [user-id]                 Check if feature is enabled for user');
        console.log('  segment <key> <name> <description>    Create user segment');
        break;
    }

    await manager.saveState();

  } catch (error) {
    console.error('❌ Feature flag error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = FeatureFlagManager;