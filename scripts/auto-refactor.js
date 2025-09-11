#!/usr/bin/env node

/**
 * Auto Refactor for Autonomous Workflow Mode
 * Analyzes and refactors code for improved maintainability and performance
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class AutoRefactor {
  constructor() {
    this.config = null;
    this.projectRoot = path.resolve(__dirname, '..');
    this.analysisResults = {};
    this.refactorHistory = [];
  }

  async initialize() {
    try {
      // Load autonomous configuration
      const configPath = path.join(this.projectRoot, '.autonomous-config.json');
      this.config = JSON.parse(await fs.readFile(configPath, 'utf8'));

      console.log('🔄 Auto Refactor initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Auto Refactor:', error.message);
      throw error;
    }
  }

  async analyzeCodebase() {
    console.log('🔍 Analyzing codebase for refactoring opportunities...');

    const analysis = {
      components: await this.analyzeComponents(),
      hooks: await this.analyzeHooks(),
      apis: await this.analyzeAPIs(),
      utils: await this.analyzeUtils(),
      overall: {}
    };

    // Calculate overall metrics
    analysis.overall = this.calculateOverallMetrics(analysis);

    this.analysisResults = analysis;
    return analysis;
  }

  async analyzeComponents() {
    const componentsDir = path.join(this.projectRoot, 'components');
    const results = [];

    try {
      const files = await fs.readdir(componentsDir);
      const componentFiles = files.filter(file => file.endsWith('.tsx') || file.endsWith('.jsx'));

      for (const file of componentFiles) {
        const filePath = path.join(componentsDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const analysis = this.analyzeComponent(content, file);

        results.push({
          file,
          path: filePath,
          ...analysis
        });
      }
    } catch (error) {
      console.warn('⚠️  Could not analyze components:', error.message);
    }

    return results;
  }

  analyzeComponent(content, filename) {
    const lines = content.split('\n');
    const analysis = {
      lines: lines.length,
      complexity: 0,
      propsCount: 0,
      stateVariables: 0,
      effectsCount: 0,
      issues: [],
      suggestions: []
    };

    // Analyze complexity
    analysis.complexity = this.calculateComplexity(content);

    // Count props
    const propsMatch = content.match(/\{([^}]+)\}/);
    if (propsMatch) {
      analysis.propsCount = propsMatch[1].split(',').length;
    }

    // Count state variables
    const stateMatches = content.match(/useState/g);
    analysis.stateVariables = stateMatches ? stateMatches.length : 0;

    // Count effects
    const effectMatches = content.match(/useEffect/g);
    analysis.effectsCount = effectMatches ? effectMatches.length : 0;

    // Identify issues and suggestions
    analysis.issues = this.identifyIssues(content, filename);
    analysis.suggestions = this.generateSuggestions(analysis);

    return analysis;
  }

  async analyzeHooks() {
    const hooksDir = path.join(this.projectRoot, 'hooks');
    const results = [];

    try {
      const files = await fs.readdir(hooksDir);
      const hookFiles = files.filter(file => file.endsWith('.ts') || file.endsWith('.js'));

      for (const file of hookFiles) {
        const filePath = path.join(hooksDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const analysis = this.analyzeHook(content, file);

        results.push({
          file,
          path: filePath,
          ...analysis
        });
      }
    } catch (error) {
      console.warn('⚠️  Could not analyze hooks:', error.message);
    }

    return results;
  }

  analyzeHook(content, filename) {
    const analysis = {
      lines: content.split('\n').length,
      complexity: this.calculateComplexity(content),
      dependencies: 0,
      customHooks: 0,
      issues: [],
      suggestions: []
    };

    // Count dependencies
    const depMatches = content.match(/use[A-Z]\w+/g);
    analysis.dependencies = depMatches ? depMatches.length : 0;

    // Count custom hooks
    const customHookMatches = content.match(/use\w+/g);
    analysis.customHooks = customHookMatches ? customHookMatches.length : 0;

    analysis.issues = this.identifyIssues(content, filename);
    analysis.suggestions = this.generateSuggestions(analysis);

    return analysis;
  }

  async analyzeAPIs() {
    const apiDir = path.join(this.projectRoot, 'pages', 'api');
    const results = [];

    try {
      const files = await fs.readdir(apiDir);
      const apiFiles = files.filter(file => file.endsWith('.ts') || file.endsWith('.js'));

      for (const file of apiFiles) {
        const filePath = path.join(apiDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const analysis = this.analyzeAPI(content, file);

        results.push({
          file,
          path: filePath,
          ...analysis
        });
      }
    } catch (error) {
      console.warn('⚠️  Could not analyze APIs:', error.message);
    }

    return results;
  }

  analyzeAPI(content, filename) {
    const analysis = {
      lines: content.split('\n').length,
      complexity: this.calculateComplexity(content),
      methods: [],
      errorHandling: false,
      validation: false,
      issues: [],
      suggestions: []
    };

    // Identify HTTP methods
    const methodMatches = content.match(/(GET|POST|PUT|DELETE|PATCH)/g);
    analysis.methods = methodMatches || [];

    // Check for error handling
    analysis.errorHandling = /try\s*\{[\s\S]*\}\s*catch/.test(content);

    // Check for validation
    analysis.validation = /validation|validate/.test(content);

    analysis.issues = this.identifyIssues(content, filename);
    analysis.suggestions = this.generateSuggestions(analysis);

    return analysis;
  }

  async analyzeUtils() {
    const utilsDir = path.join(this.projectRoot, 'utils');
    const results = [];

    try {
      const files = await fs.readdir(utilsDir);
      const utilFiles = files.filter(file => file.endsWith('.ts') || file.endsWith('.js'));

      for (const file of utilFiles) {
        const filePath = path.join(utilsDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const analysis = this.analyzeUtil(content, file);

        results.push({
          file,
          path: filePath,
          ...analysis
        });
      }
    } catch (error) {
      console.warn('⚠️  Could not analyze utils:', error.message);
    }

    return results;
  }

  analyzeUtil(content, filename) {
    const analysis = {
      lines: content.split('\n').length,
      complexity: this.calculateComplexity(content),
      functions: 0,
      exports: 0,
      issues: [],
      suggestions: []
    };

    // Count functions
    const functionMatches = content.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g);
    analysis.functions = functionMatches ? functionMatches.length : 0;

    // Count exports
    const exportMatches = content.match(/export/g);
    analysis.exports = exportMatches ? exportMatches.length : 0;

    analysis.issues = this.identifyIssues(content, filename);
    analysis.suggestions = this.generateSuggestions(analysis);

    return analysis;
  }

  calculateComplexity(content) {
    let complexity = 1; // Base complexity

    // Count control structures
    const controlStructures = [
      /if\s*\(/g,
      /else\s*\{/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /switch\s*\(/g,
      /\?\s*[^:]*\s*:/g, // Ternary operators
      /&&/g, // Logical AND
      /\|\|/g // Logical OR
    ];

    controlStructures.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  calculateOverallMetrics(analysis) {
    const metrics = {
      totalFiles: 0,
      averageComplexity: 0,
      totalIssues: 0,
      totalSuggestions: 0,
      healthScore: 100
    };

    // Calculate totals
    Object.values(analysis).forEach(category => {
      if (Array.isArray(category)) {
        metrics.totalFiles += category.length;
        category.forEach(item => {
          metrics.averageComplexity += item.complexity || 0;
          metrics.totalIssues += item.issues?.length || 0;
          metrics.totalSuggestions += item.suggestions?.length || 0;
        });
      }
    });

    // Calculate averages
    if (metrics.totalFiles > 0) {
      metrics.averageComplexity = Math.round(metrics.averageComplexity / metrics.totalFiles);
    }

    // Calculate health score
    metrics.healthScore = Math.max(0, 100 - (metrics.totalIssues * 5) - (metrics.averageComplexity - 10));

    return metrics;
  }

  identifyIssues(content, filename) {
    const issues = [];

    // Long functions
    const lines = content.split('\n');
    if (lines.length > 50) {
      issues.push('Function is too long (>50 lines)');
    }

    // High complexity
    const complexity = this.calculateComplexity(content);
    if (complexity > 15) {
      issues.push(`High complexity (${complexity})`);
    }

    // Missing error handling
    if (!/try\s*\{[\s\S]*\}\s*catch/.test(content) && /async|await|fetch|api/.test(content)) {
      issues.push('Missing error handling');
    }

    // Unused imports (basic check)
    const imports = content.match(/import\s+.*from\s+['"]([^'"]+)['"]/g) || [];
    const usedImports = new Set();

    imports.forEach(imp => {
      const match = imp.match(/import\s+\{([^}]+)\}/);
      if (match) {
        const importedItems = match[1].split(',').map(item => item.trim().split(' ')[0]);
        importedItems.forEach(item => usedImports.add(item));
      }
    });

    // This is a simplified check - real implementation would need AST parsing
    issues.push('Consider reviewing unused imports');

    return issues;
  }

  generateSuggestions(analysis) {
    const suggestions = [];

    if (analysis.complexity > 10) {
      suggestions.push('Consider breaking down into smaller functions');
    }

    if (analysis.lines > 30) {
      suggestions.push('Consider extracting components or utilities');
    }

    if (analysis.propsCount > 5) {
      suggestions.push('Consider using object destructuring for props');
    }

    if (analysis.stateVariables > 3) {
      suggestions.push('Consider using useReducer for complex state');
    }

    if (analysis.effectsCount > 2) {
      suggestions.push('Consider consolidating useEffect hooks');
    }

    return suggestions;
  }

  async applyRefactoring(filePath, refactoring) {
    try {
      console.log(`🔄 Applying refactoring to ${filePath}`);

      const content = await fs.readFile(filePath, 'utf8');
      let newContent = content;

      // Apply refactoring based on type
      switch (refactoring.type) {
        case 'extract_function':
          newContent = this.extractFunction(content, refactoring);
          break;
        case 'simplify_condition':
          newContent = this.simplifyCondition(content, refactoring);
          break;
        case 'add_error_handling':
          newContent = this.addErrorHandling(content, refactoring);
          break;
        case 'optimize_imports':
          newContent = this.optimizeImports(content, refactoring);
          break;
        default:
          throw new Error(`Unknown refactoring type: ${refactoring.type}`);
      }

      // Backup original file
      const backupPath = `${filePath}.backup`;
      await fs.writeFile(backupPath, content, 'utf8');

      // Write refactored content
      await fs.writeFile(filePath, newContent, 'utf8');

      // Format and lint
      await this.formatAndLint(filePath);

      console.log(`✅ Refactoring applied to ${filePath}`);
      return { success: true, backupPath };

    } catch (error) {
      console.error(`❌ Failed to apply refactoring to ${filePath}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  extractFunction(content, refactoring) {
    const { startLine, endLine, functionName } = refactoring;
    const lines = content.split('\n');

    const extractedLines = lines.slice(startLine - 1, endLine);
    const extractedCode = extractedLines.join('\n');

    const functionCode = `const ${functionName} = () => {\n${extractedLines.map(line => `  ${line}`).join('\n')}\n};\n`;

    // Replace extracted code with function call
    lines.splice(startLine - 1, extractedLines.length, `${functionName}();`);

    // Add function definition at the beginning
    lines.unshift(functionCode);

    return lines.join('\n');
  }

  simplifyCondition(content, refactoring) {
    // This would implement condition simplification logic
    return content; // Placeholder
  }

  addErrorHandling(content, refactoring) {
    // This would implement error handling addition logic
    return content; // Placeholder
  }

  optimizeImports(content, refactoring) {
    // This would implement import optimization logic
    return content; // Placeholder
  }

  async formatAndLint(filePath) {
    try {
      execSync(`npx prettier --write ${filePath}`, { stdio: 'inherit' });
      execSync(`npx eslint ${filePath} --fix`, { stdio: 'inherit' });
    } catch (error) {
      console.warn(`⚠️  Formatting/linting failed for ${filePath}:`, error.message);
    }
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      analysis: this.analysisResults,
      recommendations: this.generateRecommendations(),
      summary: {
        totalFiles: this.analysisResults.overall?.totalFiles || 0,
        healthScore: this.analysisResults.overall?.healthScore || 0,
        criticalIssues: this.analysisResults.overall?.totalIssues || 0
      }
    };

    const reportPath = path.join(this.projectRoot, 'refactor-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');

    console.log(`📊 Refactor report generated: ${reportPath}`);
    return report;
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.analysisResults.overall?.healthScore < 70) {
      recommendations.push({
        priority: 'high',
        action: 'Address critical issues and high complexity functions',
        impact: 'Significant improvement in maintainability'
      });
    }

    if (this.analysisResults.overall?.averageComplexity > 12) {
      recommendations.push({
        priority: 'medium',
        action: 'Break down complex functions into smaller, focused functions',
        impact: 'Improved readability and testability'
      });
    }

    if (this.analysisResults.overall?.totalIssues > 10) {
      recommendations.push({
        priority: 'medium',
        action: 'Review and fix identified code quality issues',
        impact: 'Reduced technical debt'
      });
    }

    return recommendations;
  }
}

// CLI Interface
async function main() {
  const refactor = new AutoRefactor();

  try {
    await refactor.initialize();

    const args = process.argv.slice(2);
    const command = args[0] || 'analyze';

    switch (command) {
      case 'analyze':
        const analysis = await refactor.analyzeCodebase();
        console.log('📊 Analysis complete:', JSON.stringify(analysis.overall, null, 2));
        break;

      case 'report':
        await refactor.analyzeCodebase();
        await refactor.generateReport();
        break;

      case 'refactor':
        if (args.length < 2) {
          console.log('Usage: node auto-refactor.js refactor <file-path> <refactoring-type>');
          process.exit(1);
        }
        const filePath = args[1];
        const refactoringType = args[2];
        const result = await refactor.applyRefactoring(filePath, { type: refactoringType });
        console.log(result.success ? '✅ Refactoring applied' : '❌ Refactoring failed');
        break;

      default:
        console.log('Usage: node auto-refactor.js [analyze|report|refactor]');
        process.exit(1);
    }

  } catch (error) {
    console.error('❌ Auto refactor failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = AutoRefactor;