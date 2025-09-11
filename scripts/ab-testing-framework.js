#!/usr/bin/env node

/**
 * Hostelpulse A/B Testing Framework
 * Handles experiment setup, traffic splitting, and result analysis
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class ABTestingFramework {
  constructor() {
    this.experiments = new Map();
    this.results = new Map();
    this.config = null;
  }

  async loadConfig() {
    try {
      const configPath = path.join(__dirname, 'deployment-config.json');
      const configData = await fs.readFile(configPath, 'utf8');
      this.config = JSON.parse(configData).ab_testing;
      console.log('✅ A/B testing configuration loaded');
    } catch (error) {
      console.error('❌ Failed to load A/B testing config:', error.message);
      throw error;
    }
  }

  async createExperiment(experimentConfig) {
    console.log(`🧪 Creating A/B experiment: ${experimentConfig.name}`);

    const experiment = {
      id: this.generateExperimentId(),
      name: experimentConfig.name,
      description: experimentConfig.description,
      status: 'draft',
      variants: experimentConfig.variants || [
        { name: 'control', weight: 50 },
        { name: 'variant', weight: 50 }
      ],
      metrics: experimentConfig.metrics || this.config.metrics,
      target_audience: experimentConfig.target_audience || 'all_users',
      start_date: null,
      end_date: null,
      statistical_significance: this.config.statistical_significance,
      minimum_sample_size: this.config.minimum_sample_size,
      results: {
        variants: {},
        winner: null,
        confidence: 0
      }
    };

    // Initialize variant results
    experiment.variants.forEach(variant => {
      experiment.results.variants[variant.name] = {
        visitors: 0,
        conversions: 0,
        conversion_rate: 0,
        confidence_interval: [0, 0]
      };
    });

    this.experiments.set(experiment.id, experiment);

    console.log(`✅ Experiment ${experiment.id} created`);
    return experiment;
  }

  async startExperiment(experimentId) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    console.log(`🚀 Starting experiment: ${experiment.name}`);

    experiment.status = 'running';
    experiment.start_date = new Date().toISOString();

    // Validate variant weights
    const totalWeight = experiment.variants.reduce((sum, v) => sum + v.weight, 0);
    if (totalWeight !== 100) {
      throw new Error('Variant weights must sum to 100');
    }

    // Setup traffic splitting
    await this.setupTrafficSplitting(experiment);

    console.log(`✅ Experiment ${experimentId} started`);
    return experiment;
  }

  async setupTrafficSplitting(experiment) {
    // In a real implementation, this would configure load balancers, CDNs, or feature flag providers
    console.log(`🔀 Setting up traffic splitting for experiment ${experiment.id}`);

    // Create traffic rules based on user ID or random distribution
    experiment.traffic_rules = {
      method: 'user_id_hash', // or 'random', 'cookie_based', etc.
      variants: experiment.variants.map(variant => ({
        name: variant.name,
        weight: variant.weight,
        range: this.calculateWeightRange(experiment.variants, variant.name)
      }))
    };

    console.log('Traffic rules:', experiment.traffic_rules);
  }

  calculateWeightRange(variants, targetVariant) {
    let cumulativeWeight = 0;
    for (const variant of variants) {
      if (variant.name === targetVariant) {
        return [cumulativeWeight, cumulativeWeight + variant.weight];
      }
      cumulativeWeight += variant.weight;
    }
    return [0, 0];
  }

  assignUserToVariant(experimentId, userId) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'running') {
      return 'control'; // Default fallback
    }

    // Use consistent hashing for user assignment
    const hash = crypto.createHash('md5').update(userId).digest('hex');
    const hashValue = parseInt(hash.substring(0, 8), 16) % 100;

    for (const variant of experiment.variants) {
      const [min, max] = this.calculateWeightRange(experiment.variants, variant.name);
      if (hashValue >= min && hashValue < max) {
        return variant.name;
      }
    }

    return 'control'; // Fallback
  }

  trackEvent(experimentId, userId, eventType, properties = {}) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'running') {
      return;
    }

    const variant = this.assignUserToVariant(experimentId, userId);
    const variantResult = experiment.results.variants[variant];

    // Track visitor
    if (!variantResult.visitors_set) {
      variantResult.visitors_set = new Set();
    }

    if (!variantResult.visitors_set.has(userId)) {
      variantResult.visitors_set.add(userId);
      variantResult.visitors++;
    }

    // Track conversion events
    if (experiment.metrics.includes(eventType)) {
      if (!variantResult.conversions_set) {
        variantResult.conversions_set = new Set();
      }

      if (!variantResult.conversions_set.has(userId)) {
        variantResult.conversions_set.add(userId);
        variantResult.conversions++;
      }
    }

    // Update conversion rate
    variantResult.conversion_rate = variantResult.visitors > 0
      ? variantResult.conversions / variantResult.visitors
      : 0;

    // Calculate confidence interval
    variantResult.confidence_interval = this.calculateConfidenceInterval(
      variantResult.conversions,
      variantResult.visitors
    );
  }

  calculateConfidenceInterval(conversions, visitors, confidence = 0.95) {
    if (visitors === 0) return [0, 0];

    const p = conversions / visitors;
    const z = 1.96; // 95% confidence
    const margin = z * Math.sqrt(p * (1 - p) / visitors);

    return [
      Math.max(0, p - margin),
      Math.min(1, p + margin)
    ];
  }

  async analyzeExperiment(experimentId) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    console.log(`📊 Analyzing experiment: ${experiment.name}`);

    const variants = Object.values(experiment.results.variants);
    const control = variants.find(v => v.name === 'control');

    if (!control || control.visitors < experiment.minimum_sample_size) {
      console.log('⏳ Experiment needs more data');
      return { status: 'insufficient_data' };
    }

    // Check statistical significance
    const significantVariants = variants.filter(variant =>
      variant.visitors >= experiment.minimum_sample_size &&
      this.isStatisticallySignificant(control, variant)
    );

    if (significantVariants.length === 0) {
      console.log('📈 No statistically significant results yet');
      return { status: 'no_significance' };
    }

    // Find winner
    const winner = significantVariants.reduce((best, current) => {
      return current.conversion_rate > best.conversion_rate ? current : best;
    });

    experiment.results.winner = winner.name;
    experiment.results.confidence = this.calculateConfidence(control, winner);

    console.log(`🏆 Winner: ${winner.name} (${(winner.conversion_rate * 100).toFixed(2)}% conversion)`);
    console.log(`📊 Confidence: ${(experiment.results.confidence * 100).toFixed(2)}%`);

    return {
      status: 'completed',
      winner: winner.name,
      confidence: experiment.results.confidence,
      results: experiment.results
    };
  }

  isStatisticallySignificant(control, variant) {
    // Simplified statistical significance test
    const [controlLower, controlUpper] = control.confidence_interval;
    const [variantLower, variantUpper] = variant.confidence_interval;

    // Check if confidence intervals don't overlap
    return variantLower > controlUpper || variantUpper < controlLower;
  }

  calculateConfidence(control, variant) {
    // Simplified confidence calculation
    const controlRate = control.conversion_rate;
    const variantRate = variant.conversion_rate;

    if (variantRate > controlRate) {
      return Math.min(1, (variantRate - controlRate) / controlRate);
    } else {
      return Math.min(1, (controlRate - variantRate) / controlRate);
    }
  }

  async stopExperiment(experimentId) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    console.log(`🛑 Stopping experiment: ${experiment.name}`);

    experiment.status = 'stopped';
    experiment.end_date = new Date().toISOString();

    // Final analysis
    const analysis = await this.analyzeExperiment(experimentId);

    console.log(`✅ Experiment ${experimentId} stopped`);
    return analysis;
  }

  async getExperimentStatus(experimentId) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      return null;
    }

    return {
      id: experiment.id,
      name: experiment.name,
      status: experiment.status,
      start_date: experiment.start_date,
      variants: experiment.variants.map(v => ({
        name: v.name,
        weight: v.weight,
        visitors: experiment.results.variants[v.name]?.visitors || 0,
        conversions: experiment.results.variants[v.name]?.conversions || 0,
        conversion_rate: experiment.results.variants[v.name]?.conversion_rate || 0
      })),
      winner: experiment.results.winner,
      confidence: experiment.results.confidence
    };
  }

  generateExperimentId() {
    return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async saveResults() {
    const resultsPath = path.join(__dirname, 'ab-test-results.json');
    const results = Array.from(this.experiments.entries()).map(([id, experiment]) => ({
      id,
      ...experiment
    }));

    await fs.writeFile(resultsPath, JSON.stringify(results, null, 2));
    console.log('💾 A/B test results saved');
  }

  async loadResults() {
    try {
      const resultsPath = path.join(__dirname, 'ab-test-results.json');
      const data = await fs.readFile(resultsPath, 'utf8');
      const results = JSON.parse(data);

      results.forEach(result => {
        this.experiments.set(result.id, result);
      });

      console.log('📂 A/B test results loaded');
    } catch (error) {
      console.log('No previous A/B test results found');
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const framework = new ABTestingFramework();

  try {
    await framework.loadConfig();
    await framework.loadResults();

    switch (command) {
      case 'create':
        const experiment = await framework.createExperiment({
          name: args[1] || 'New Experiment',
          description: args[2] || 'A/B test experiment',
          variants: [
            { name: 'control', weight: 50 },
            { name: 'variant', weight: 50 }
          ]
        });
        console.log('Created experiment:', experiment.id);
        break;

      case 'start':
        const experimentId = args[1];
        await framework.startExperiment(experimentId);
        console.log(`Started experiment ${experimentId}`);
        break;

      case 'track':
        const expId = args[1];
        const userId = args[2];
        const event = args[3];
        framework.trackEvent(expId, userId, event);
        console.log(`Tracked ${event} for user ${userId} in experiment ${expId}`);
        break;

      case 'analyze':
        const analysisId = args[1];
        const analysis = await framework.analyzeExperiment(analysisId);
        console.log('Analysis result:', analysis);
        break;

      case 'stop':
        const stopId = args[1];
        const result = await framework.stopExperiment(stopId);
        console.log('Experiment stopped:', result);
        break;

      case 'status':
        const statusId = args[1];
        const status = await framework.getExperimentStatus(statusId);
        console.log('Experiment status:', JSON.stringify(status, null, 2));
        break;

      case 'list':
        console.log('Active experiments:');
        for (const [id, exp] of framework.experiments) {
          console.log(`- ${id}: ${exp.name} (${exp.status})`);
        }
        break;

      default:
        console.log('Usage: ab-testing-framework <command>');
        console.log('Commands:');
        console.log('  create <name> <description>    Create new experiment');
        console.log('  start <experiment-id>          Start experiment');
        console.log('  track <exp-id> <user-id> <event> Track user event');
        console.log('  analyze <experiment-id>        Analyze experiment results');
        console.log('  stop <experiment-id>           Stop experiment');
        console.log('  status <experiment-id>         Show experiment status');
        console.log('  list                           List all experiments');
        break;
    }

    await framework.saveResults();

  } catch (error) {
    console.error('❌ A/B testing error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ABTestingFramework;