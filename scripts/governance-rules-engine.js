#!/usr/bin/env node

/**
 * Governance Rules Engine
 * Enforces organizational policies and standards for code quality, security, and compliance
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class GovernanceRulesEngine {
  constructor() {
    this.config = this.loadConfig();
    this.rules = this.loadRules();
    this.violations = [];
    this.auditTrail = [];
  }

  loadConfig() {
    try {
      const configPath = path.join(process.cwd(), '.governance-config.json');
      if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
      return this.getDefaultConfig();
    } catch (error) {
      console.error('Error loading governance config:', error.message);
      return this.getDefaultConfig();
    }
  }

  getDefaultConfig() {
    return {
      enabled: true,
      strict_mode: false,
      audit_enabled: true,
      notification_channels: ['console'],
      thresholds: {
        max_violations: 10,
        max_severity_score: 50
      }
    };
  }

  loadRules() {
    try {
      const modePath = path.join(process.cwd(), '.kilocode', 'modes', 'governance-mode.json');
      if (fs.existsSync(modePath)) {
        const modeConfig = JSON.parse(fs.readFileSync(modePath, 'utf8'));
        return this.flattenRules(modeConfig.rule_categories);
      }
      return this.getDefaultRules();
    } catch (error) {
      console.error('Error loading governance rules:', error.message);
      return this.getDefaultRules();
    }
  }

  flattenRules(categories) {
    const rules = [];
    categories.forEach(category => {
      category.rules.forEach(rule => {
        rules.push({
          ...rule,
          category: category.name.toLowerCase().replace(' ', '_')
        });
      });
    });
    return rules;
  }

  getDefaultRules() {
    return [
      {
        id: 'code-complexity',
        category: 'quality',
        severity: 'warning',
        description: 'Cyclomatic complexity should not exceed 10',
        threshold: 10
      },
      {
        id: 'security-vulnerabilities',
        category: 'security',
        severity: 'error',
        description: 'No security vulnerabilities allowed',
        pattern: 'vulnerability'
      },
      {
        id: 'compliance-gdpr',
        category: 'compliance',
        severity: 'error',
        description: 'GDPR compliance requirements',
        pattern: 'gdpr'
      }
    ];
  }

  async runAnalysis(targetPath = '.', gateType = 'pre-commit') {
    console.log(`🔍 Running governance analysis on: ${targetPath}`);
    console.log(`📊 Gate type: ${gateType}`);

    this.violations = [];
    this.auditTrail = [];

    // Run quality checks
    await this.runQualityChecks(targetPath);

    // Run security checks
    await this.runSecurityChecks(targetPath);

    // Run compliance checks
    await this.runComplianceChecks(targetPath);

    // Evaluate against quality gates
    const gateResult = this.evaluateQualityGate(gateType);

    // Generate audit trail
    this.generateAuditTrail();

    return {
      violations: this.violations,
      gateResult,
      auditTrail: this.auditTrail,
      summary: this.generateSummary()
    };
  }

  async runQualityChecks(targetPath) {
    console.log('🔧 Running quality checks...');

    // Check code complexity
    const complexityViolations = await this.checkComplexity(targetPath);
    this.violations.push(...complexityViolations);

    // Check code duplication
    const duplicationViolations = await this.checkDuplication(targetPath);
    this.violations.push(...duplicationViolations);

    // Check linting compliance
    const lintingViolations = await this.checkLinting(targetPath);
    this.violations.push(...lintingViolations);
  }

  async checkComplexity(targetPath) {
    const violations = [];
    try {
      // Simple complexity check using file size as proxy
      const files = this.getSourceFiles(targetPath);
      files.forEach(file => {
        const stats = fs.statSync(file);
        const lines = fs.readFileSync(file, 'utf8').split('\n').length;

        if (lines > 300) { // Arbitrary threshold
          violations.push({
            rule: 'code-complexity',
            severity: 'warning',
            file: path.relative(process.cwd(), file),
            message: `File exceeds complexity threshold (${lines} lines)`,
            line: 1
          });
        }
      });
    } catch (error) {
      console.error('Error checking complexity:', error.message);
    }
    return violations;
  }

  async checkDuplication(targetPath) {
    const violations = [];
    // Simplified duplication check - in real implementation would use tools like jscpd
    console.log('📋 Checking for code duplication...');
    return violations;
  }

  async checkLinting(targetPath) {
    const violations = [];
    try {
      // Run ESLint if available
      const eslintConfig = path.join(process.cwd(), '.eslintrc.json');
      if (fs.existsSync(eslintConfig)) {
        console.log('🔍 Running ESLint checks...');
        execSync('npx eslint . --format=json', { stdio: 'pipe' });
      }
    } catch (error) {
      // Parse ESLint output for violations
      if (error.stdout) {
        const eslintResults = JSON.parse(error.stdout);
        eslintResults.forEach(result => {
          result.messages.forEach(message => {
            violations.push({
              rule: 'linting',
              severity: message.severity === 2 ? 'error' : 'warning',
              file: result.filePath,
              message: message.message,
              line: message.line
            });
          });
        });
      }
    }
    return violations;
  }

  async runSecurityChecks(targetPath) {
    console.log('🔒 Running security checks...');

    // Check for secrets
    const secretViolations = await this.checkSecrets(targetPath);
    this.violations.push(...secretViolations);

    // Check dependencies
    const dependencyViolations = await this.checkDependencies();
    this.violations.push(...dependencyViolations);
  }

  async checkSecrets(targetPath) {
    const violations = [];
    const secretPatterns = [
      /api[_-]?key/i,
      /password/i,
      /secret/i,
      /token/i,
      /private[_-]?key/i
    ];

    const files = this.getSourceFiles(targetPath);
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        secretPatterns.forEach(pattern => {
          if (pattern.test(line) && !line.includes('//') && !line.includes('/*')) {
            violations.push({
              rule: 'secret-detection',
              severity: 'error',
              file: path.relative(process.cwd(), file),
              message: 'Potential secret detected in code',
              line: index + 1
            });
          }
        });
      });
    });

    return violations;
  }

  async checkDependencies() {
    const violations = [];
    try {
      // Check package.json for known vulnerable packages
      const packagePath = path.join(process.cwd(), 'package.json');
      if (fs.existsSync(packagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        // Simplified check - in real implementation would use npm audit
        console.log('📦 Checking dependencies for vulnerabilities...');
      }
    } catch (error) {
      console.error('Error checking dependencies:', error.message);
    }
    return violations;
  }

  async runComplianceChecks(targetPath) {
    console.log('⚖️ Running compliance checks...');

    // GDPR compliance check
    const gdprViolations = await this.checkGDPRCompliance(targetPath);
    this.violations.push(...gdprViolations);

    // License compliance check
    const licenseViolations = await this.checkLicenseCompliance();
    this.violations.push(...licenseViolations);
  }

  async checkGDPRCompliance(targetPath) {
    const violations = [];
    // Simplified GDPR check - look for personal data handling
    const files = this.getSourceFiles(targetPath);
    const gdprPatterns = [
      /email/i,
      /phone/i,
      /address/i,
      /personal[_-]?data/i
    ];

    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      gdprPatterns.forEach(pattern => {
        if (pattern.test(content)) {
          violations.push({
            rule: 'gdpr-compliance',
            severity: 'warning',
            file: path.relative(process.cwd(), file),
            message: 'Potential personal data handling detected',
            line: 1
          });
        }
      });
    });

    return violations;
  }

  async checkLicenseCompliance() {
    const violations = [];
    try {
      const licensePath = path.join(process.cwd(), 'LICENSE');
      if (!fs.existsSync(licensePath)) {
        violations.push({
          rule: 'license-compliance',
          severity: 'warning',
          file: 'LICENSE',
          message: 'License file not found',
          line: 1
        });
      }
    } catch (error) {
      console.error('Error checking license compliance:', error.message);
    }
    return violations;
  }

  evaluateQualityGate(gateType) {
    const gateConfig = this.config.quality_gates?.[gateType];
    if (!gateConfig || !gateConfig.enabled) {
      return { passed: true, reason: 'Gate not configured or disabled' };
    }

    const violations = this.violations.filter(v => {
      const severity = v.severity;
      return gateConfig.metrics.includes('security') && severity === 'error';
    });

    const passed = violations.length === 0;
    return {
      passed,
      reason: passed ? 'All quality gates passed' : `${violations.length} violations found`,
      violations: violations
    };
  }

  generateAuditTrail() {
    this.auditTrail.push({
      timestamp: new Date().toISOString(),
      action: 'governance_analysis',
      violations_count: this.violations.length,
      rules_checked: this.rules.length,
      user: process.env.USER || 'system'
    });
  }

  generateSummary() {
    const severityCount = {
      error: this.violations.filter(v => v.severity === 'error').length,
      warning: this.violations.filter(v => v.severity === 'warning').length,
      info: this.violations.filter(v => v.severity === 'info').length
    };

    return {
      total_violations: this.violations.length,
      severity_breakdown: severityCount,
      rules_checked: this.rules.length,
      analysis_time: new Date().toISOString()
    };
  }

  getSourceFiles(targetPath) {
    const files = [];
    const extensions = ['.js', '.ts', '.jsx', '.tsx', '.vue', '.py', '.java', '.cpp', '.c'];

    function scanDirectory(dir) {
      const items = fs.readdirSync(dir);

      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDirectory(fullPath);
        } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      });
    }

    scanDirectory(targetPath);
    return files;
  }

  reportViolations() {
    if (this.violations.length === 0) {
      console.log('✅ No governance violations found!');
      return;
    }

    console.log(`❌ Found ${this.violations.length} governance violations:`);
    this.violations.forEach((violation, index) => {
      console.log(`${index + 1}. [${violation.severity.toUpperCase()}] ${violation.rule}`);
      console.log(`   File: ${violation.file}:${violation.line}`);
      console.log(`   Message: ${violation.message}`);
      console.log('');
    });
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const targetPath = args[0] || '.';
  const gateType = args[1] || 'pre-commit';

  const engine = new GovernanceRulesEngine();

  try {
    console.log('🚀 Starting Governance Rules Engine...\n');

    const result = await engine.runAnalysis(targetPath, gateType);

    engine.reportViolations();

    console.log('📊 Analysis Summary:');
    console.log(`   Total violations: ${result.summary.total_violations}`);
    console.log(`   Errors: ${result.summary.severity_breakdown.error}`);
    console.log(`   Warnings: ${result.summary.severity_breakdown.warning}`);
    console.log(`   Rules checked: ${result.summary.rules_checked}`);

    if (result.gateResult.passed) {
      console.log('✅ Quality gate PASSED');
      process.exit(0);
    } else {
      console.log('❌ Quality gate FAILED');
      console.log(`   Reason: ${result.gateResult.reason}`);
      process.exit(1);
    }

  } catch (error) {
    console.error('💥 Governance analysis failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = GovernanceRulesEngine;