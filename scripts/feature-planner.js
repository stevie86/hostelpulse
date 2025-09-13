#!/usr/bin/env node

/**
 * Feature Planner for Autonomous Workflow Mode
 * Decomposes features into actionable tasks and creates implementation plans
 */

const fs = require('fs').promises;
const path = require('path');

class FeaturePlanner {
  constructor() {
    this.config = null;
    this.projectRoot = path.resolve(__dirname, '..');
    this.planningHistory = [];
  }

  async initialize() {
    try {
      // Load autonomous configuration
      const configPath = path.join(this.projectRoot, '.autonomous-config.json');
      this.config = JSON.parse(await fs.readFile(configPath, 'utf8'));

      console.log('📋 Feature Planner initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Feature Planner:', error.message);
      throw error;
    }
  }

  async planFeature(featureSpec) {
    console.log(`📋 Planning feature: ${featureSpec.name}`);

    const plan = {
      feature: featureSpec,
      tasks: await this.decomposeFeature(featureSpec),
      dependencies: this.analyzeDependencies(featureSpec),
      timeline: this.estimateTimeline(featureSpec),
      risks: this.identifyRisks(featureSpec),
      success_criteria: this.defineSuccessCriteria(featureSpec),
      generated_at: new Date().toISOString()
    };

    // Validate plan
    this.validatePlan(plan);

    this.planningHistory.push(plan);
    return plan;
  }

  async decomposeFeature(featureSpec) {
    const { type, complexity, components } = featureSpec;

    const tasks = [];

    // Base tasks for all features
    tasks.push({
      id: 'analysis',
      title: 'Requirements Analysis',
      description: 'Analyze feature requirements and constraints',
      type: 'analysis',
      priority: 'high',
      estimated_hours: 2,
      dependencies: []
    });

    // Type-specific decomposition
    switch (type) {
      case 'component':
        tasks.push(...this.decomposeComponentFeature(featureSpec));
        break;
      case 'api':
        tasks.push(...this.decomposeApiFeature(featureSpec));
        break;
      case 'page':
        tasks.push(...this.decomposePageFeature(featureSpec));
        break;
      case 'feature':
        tasks.push(...this.decomposeComplexFeature(featureSpec));
        break;
      default:
        tasks.push(...this.decomposeGenericFeature(featureSpec));
    }

    // Add testing tasks
    tasks.push({
      id: 'testing',
      title: 'Unit & Integration Testing',
      description: 'Write and execute comprehensive tests',
      type: 'testing',
      priority: 'high',
      estimated_hours: Math.max(4, complexity * 2),
      dependencies: ['implementation']
    });

    // Add documentation
    tasks.push({
      id: 'documentation',
      title: 'Documentation & Examples',
      description: 'Create documentation and usage examples',
      type: 'documentation',
      priority: 'medium',
      estimated_hours: 2,
      dependencies: ['implementation']
    });

    // Add review task
    tasks.push({
      id: 'review',
      title: 'Code Review & Optimization',
      description: 'Review code quality and optimize performance',
      type: 'review',
      priority: 'medium',
      estimated_hours: 3,
      dependencies: ['testing']
    });

    return tasks;
  }

  decomposeComponentFeature(featureSpec) {
    const tasks = [];
    const { name, complexity } = featureSpec;

    tasks.push({
      id: 'design',
      title: 'Component Design',
      description: `Design ${name} component architecture and API`,
      type: 'design',
      priority: 'high',
      estimated_hours: 3,
      dependencies: ['analysis']
    });

    tasks.push({
      id: 'implementation',
      title: 'Component Implementation',
      description: `Implement ${name} component with full functionality`,
      type: 'implementation',
      priority: 'high',
      estimated_hours: Math.max(4, complexity * 3),
      dependencies: ['design']
    });

    if (complexity > 3) {
      tasks.push({
        id: 'styling',
        title: 'Component Styling',
        description: `Implement responsive styling for ${name}`,
        type: 'styling',
        priority: 'medium',
        estimated_hours: 4,
        dependencies: ['implementation']
      });
    }

    return tasks;
  }

  decomposeApiFeature(featureSpec) {
    const tasks = [];
    const { name, complexity } = featureSpec;

    tasks.push({
      id: 'api_design',
      title: 'API Design',
      description: `Design ${name} API endpoints and data models`,
      type: 'design',
      priority: 'high',
      estimated_hours: 4,
      dependencies: ['analysis']
    });

    tasks.push({
      id: 'database',
      title: 'Database Schema',
      description: `Design and implement database schema for ${name}`,
      type: 'database',
      priority: 'high',
      estimated_hours: 3,
      dependencies: ['api_design']
    });

    tasks.push({
      id: 'implementation',
      title: 'API Implementation',
      description: `Implement ${name} API endpoints`,
      type: 'implementation',
      priority: 'high',
      estimated_hours: Math.max(6, complexity * 4),
      dependencies: ['database']
    });

    if (complexity > 2) {
      tasks.push({
        id: 'middleware',
        title: 'Middleware & Validation',
        description: `Implement authentication, validation, and middleware`,
        type: 'middleware',
        priority: 'medium',
        estimated_hours: 3,
        dependencies: ['implementation']
      });
    }

    return tasks;
  }

  decomposePageFeature(featureSpec) {
    const tasks = [];
    const { name, complexity } = featureSpec;

    tasks.push({
      id: 'wireframing',
      title: 'Page Wireframing',
      description: `Create wireframes and layout for ${name} page`,
      type: 'design',
      priority: 'high',
      estimated_hours: 4,
      dependencies: ['analysis']
    });

    tasks.push({
      id: 'routing',
      title: 'Routing Setup',
      description: `Configure routing for ${name} page`,
      type: 'infrastructure',
      priority: 'high',
      estimated_hours: 2,
      dependencies: ['wireframing']
    });

    tasks.push({
      id: 'implementation',
      title: 'Page Implementation',
      description: `Implement ${name} page with all components`,
      type: 'implementation',
      priority: 'high',
      estimated_hours: Math.max(8, complexity * 5),
      dependencies: ['routing']
    });

    if (complexity > 3) {
      tasks.push({
        id: 'seo',
        title: 'SEO Optimization',
        description: `Implement SEO optimizations for ${name}`,
        type: 'optimization',
        priority: 'medium',
        estimated_hours: 3,
        dependencies: ['implementation']
      });
    }

    return tasks;
  }

  decomposeComplexFeature(featureSpec) {
    const tasks = [];
    const { name, complexity, components } = featureSpec;

    // Epic-level planning
    tasks.push({
      id: 'epic_planning',
      title: 'Epic Planning',
      description: `Break down ${name} epic into user stories`,
      type: 'planning',
      priority: 'high',
      estimated_hours: 6,
      dependencies: ['analysis']
    });

    // Component breakdown
    if (components && components.length > 0) {
      components.forEach((component, index) => {
        tasks.push({
          id: `component_${index}`,
          title: `Implement ${component.name}`,
          description: `Implement ${component.name} component`,
          type: 'implementation',
          priority: component.priority || 'medium',
          estimated_hours: component.complexity * 3 || 4,
          dependencies: ['epic_planning']
        });
      });
    }

    // Integration tasks
    tasks.push({
      id: 'integration',
      title: 'Feature Integration',
      description: `Integrate all components for ${name}`,
      type: 'integration',
      priority: 'high',
      estimated_hours: Math.max(6, complexity * 2),
      dependencies: components ? components.map((_, i) => `component_${i}`) : ['epic_planning']
    });

    tasks.push({
      id: 'implementation',
      title: 'Feature Implementation',
      description: `Complete implementation of ${name}`,
      type: 'implementation',
      priority: 'high',
      estimated_hours: Math.max(10, complexity * 6),
      dependencies: ['integration']
    });

    return tasks;
  }

  decomposeGenericFeature(featureSpec) {
    const { complexity } = featureSpec;

    return [{
      id: 'implementation',
      title: 'Feature Implementation',
      description: 'Implement the feature according to specifications',
      type: 'implementation',
      priority: 'high',
      estimated_hours: Math.max(4, complexity * 3),
      dependencies: ['analysis']
    }];
  }

  analyzeDependencies(featureSpec) {
    const { type, technologies, integrations } = featureSpec;

    const dependencies = {
      technical: [],
      external: [],
      internal: []
    };

    // Technical dependencies
    if (technologies) {
      dependencies.technical = technologies.map(tech => ({
        name: tech,
        type: 'technology',
        required: true
      }));
    }

    // External integrations
    if (integrations) {
      dependencies.external = integrations.map(integration => ({
        name: integration,
        type: 'integration',
        required: true
      }));
    }

    // Internal dependencies based on type
    switch (type) {
      case 'component':
        dependencies.internal = [
          { name: 'React', type: 'framework', required: true },
          { name: 'Component Library', type: 'library', required: false }
        ];
        break;
      case 'api':
        dependencies.internal = [
          { name: 'Next.js API Routes', type: 'framework', required: true },
          { name: 'Database', type: 'infrastructure', required: true }
        ];
        break;
      case 'page':
        dependencies.internal = [
          { name: 'Next.js Pages', type: 'framework', required: true },
          { name: 'Routing', type: 'infrastructure', required: true }
        ];
        break;
    }

    return dependencies;
  }

  estimateTimeline(featureSpec) {
    const { complexity, tasks } = featureSpec;

    // Base timeline calculation
    const baseHours = complexity * 8; // 8 hours per complexity point
    const overheadHours = baseHours * 0.2; // 20% overhead
    const totalHours = baseHours + overheadHours;

    // Calculate timeline based on available resources
    const availableHoursPerDay = 6; // Assuming 6 productive hours per day
    const totalDays = Math.ceil(totalHours / availableHoursPerDay);

    return {
      estimated_hours: Math.round(totalHours),
      estimated_days: totalDays,
      milestones: this.defineMilestones(tasks || [], totalDays),
      critical_path: this.identifyCriticalPath(tasks || [])
    };
  }

  defineMilestones(tasks, totalDays) {
    const milestones = [];
    const quarterDay = Math.ceil(totalDays / 4);

    milestones.push({
      name: 'Planning Complete',
      day: quarterDay,
      tasks: tasks.filter(task => task.type === 'analysis' || task.type === 'design')
    });

    milestones.push({
      name: 'Core Implementation Complete',
      day: quarterDay * 2,
      tasks: tasks.filter(task => task.type === 'implementation')
    });

    milestones.push({
      name: 'Testing Complete',
      day: quarterDay * 3,
      tasks: tasks.filter(task => task.type === 'testing')
    });

    milestones.push({
      name: 'Feature Complete',
      day: totalDays,
      tasks: tasks.filter(task => task.type === 'review' || task.type === 'documentation')
    });

    return milestones;
  }

  identifyCriticalPath(tasks) {
    // Simple critical path identification
    const criticalTasks = tasks.filter(task =>
      task.priority === 'high' || task.dependencies.length === 0
    );

    return criticalTasks.map(task => ({
      id: task.id,
      title: task.title,
      estimated_hours: task.estimated_hours
    }));
  }

  identifyRisks(featureSpec) {
    const { complexity, technologies, integrations, type } = featureSpec;

    const risks = [];

    // Complexity risks
    if (complexity > 5) {
      risks.push({
        level: 'high',
        description: 'High complexity may lead to implementation challenges',
        mitigation: 'Break down into smaller, manageable tasks'
      });
    }

    // Technology risks
    if (technologies && technologies.length > 3) {
      risks.push({
        level: 'medium',
        description: 'Multiple technologies increase integration complexity',
        mitigation: 'Ensure proper documentation and testing for each technology'
      });
    }

    // Integration risks
    if (integrations && integrations.length > 0) {
      risks.push({
        level: 'medium',
        description: 'External integrations may have dependencies or limitations',
        mitigation: 'Plan for fallback scenarios and error handling'
      });
    }

    // Type-specific risks
    switch (type) {
      case 'api':
        risks.push({
          level: 'medium',
          description: 'API changes may affect existing integrations',
          mitigation: 'Implement proper versioning and backward compatibility'
        });
        break;
      case 'component':
        risks.push({
          level: 'low',
          description: 'Component styling may vary across browsers',
          mitigation: 'Test across multiple browsers and devices'
        });
        break;
    }

    return risks;
  }

  defineSuccessCriteria(featureSpec) {
    const { type, name } = featureSpec;

    const criteria = {
      functional: [],
      performance: [],
      quality: [],
      user_experience: []
    };

    // Functional criteria
    criteria.functional = [
      `${name} implements all specified requirements`,
      `${name} integrates properly with existing systems`,
      `${name} handles error conditions gracefully`
    ];

    // Performance criteria
    criteria.performance = [
      `${name} loads within acceptable time limits`,
      `${name} performs efficiently under normal load`,
      `${name} does not negatively impact overall application performance`
    ];

    // Quality criteria
    criteria.quality = [
      `${name} passes all automated tests`,
      `${name} meets code quality standards`,
      `${name} includes comprehensive documentation`
    ];

    // User experience criteria
    criteria.user_experience = [
      `${name} provides intuitive user interface`,
      `${name} handles edge cases appropriately`,
      `${name} maintains consistency with application design`
    ];

    return criteria;
  }

  validatePlan(plan) {
    const errors = [];

    // Validate required fields
    if (!plan.feature.name) {
      errors.push('Feature name is required');
    }

    if (!plan.tasks || plan.tasks.length === 0) {
      errors.push('Plan must include tasks');
    }

    // Validate task dependencies
    const taskIds = plan.tasks.map(task => task.id);
    for (const task of plan.tasks) {
      for (const dep of task.dependencies) {
        if (!taskIds.includes(dep)) {
          errors.push(`Task ${task.id} has invalid dependency: ${dep}`);
        }
      }
    }

    // Validate timeline
    if (plan.timeline.estimated_days < 1) {
      errors.push('Timeline must be at least 1 day');
    }

    if (errors.length > 0) {
      throw new Error(`Plan validation failed: ${errors.join(', ')}`);
    }

    return true;
  }

  async savePlan(plan) {
    const planPath = path.join(this.projectRoot, 'feature-plans', `${plan.feature.name.toLowerCase().replace(/\s+/g, '-')}-plan.json`);

    await fs.mkdir(path.dirname(planPath), { recursive: true });
    await fs.writeFile(planPath, JSON.stringify(plan, null, 2), 'utf8');

    console.log(`📋 Feature plan saved: ${planPath}`);
    return planPath;
  }

  async generateImplementationGuide(plan) {
    const guide = {
      feature: plan.feature.name,
      overview: `Implementation guide for ${plan.feature.name}`,
      prerequisites: plan.dependencies,
      steps: plan.tasks.map(task => ({
        step: task.id,
        title: task.title,
        description: task.description,
        estimated_time: `${task.estimated_hours} hours`,
        dependencies: task.dependencies
      })),
      timeline: plan.timeline,
      risks_and_mitigations: plan.risks,
      success_criteria: plan.success_criteria
    };

    const guidePath = path.join(this.projectRoot, 'feature-plans', `${plan.feature.name.toLowerCase().replace(/\s+/g, '-')}-guide.md`);

    let guideContent = `# ${guide.feature} - Implementation Guide\n\n`;
    guideContent += `## Overview\n${guide.overview}\n\n`;

    guideContent += `## Prerequisites\n`;
    Object.entries(guide.prerequisites).forEach(([category, deps]) => {
      guideContent += `### ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;
      deps.forEach(dep => {
        guideContent += `- ${dep.name} (${dep.type})\n`;
      });
      guideContent += '\n';
    });

    guideContent += `## Implementation Steps\n`;
    guide.steps.forEach((step, index) => {
      guideContent += `${index + 1}. **${step.title}** (${step.estimated_time})\n`;
      guideContent += `   - ${step.description}\n`;
      if (step.dependencies.length > 0) {
        guideContent += `   - Dependencies: ${step.dependencies.join(', ')}\n`;
      }
      guideContent += '\n';
    });

    guideContent += `## Timeline\n`;
    guideContent += `- Estimated Hours: ${guide.timeline.estimated_hours}\n`;
    guideContent += `- Estimated Days: ${guide.timeline.estimated_days}\n\n`;

    guideContent += `## Risks and Mitigations\n`;
    guide.risks_and_mitigations.forEach(risk => {
      guideContent += `- **${risk.level.toUpperCase()}**: ${risk.description}\n`;
      guideContent += `  - Mitigation: ${risk.mitigation}\n\n`;
    });

    guideContent += `## Success Criteria\n`;
    Object.entries(guide.success_criteria).forEach(([category, criteria]) => {
      guideContent += `### ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;
      criteria.forEach(criterion => {
        guideContent += `- ${criterion}\n`;
      });
      guideContent += '\n';
    });

    await fs.writeFile(guidePath, guideContent, 'utf8');
    console.log(`📖 Implementation guide generated: ${guidePath}`);

    return guidePath;
  }
}

// CLI Interface
async function main() {
  const planner = new FeaturePlanner();

  try {
    await planner.initialize();

    const args = process.argv.slice(2);
    if (args.length === 0) {
      console.log('Usage: node feature-planner.js <feature-spec.json>');
      process.exit(1);
    }

    const specPath = args[0];
    const featureSpec = JSON.parse(await fs.readFile(specPath, 'utf8'));

    const plan = await planner.planFeature(featureSpec);

    // Save plan and generate guide
    await planner.savePlan(plan);
    await planner.generateImplementationGuide(plan);

    console.log('✅ Feature planning completed successfully!');
    console.log(`📊 Plan Summary:
- Tasks: ${plan.tasks.length}
- Estimated Hours: ${plan.timeline.estimated_hours}
- Estimated Days: ${plan.timeline.estimated_days}
- Risks Identified: ${plan.risks.length}
    `);

  } catch (error) {
    console.error('❌ Feature planning failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = FeaturePlanner;