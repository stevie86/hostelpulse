#!/usr/bin/env node

/**
 * Security Scanner
 * Automated vulnerability detection and security compliance checks
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

class SecurityScanner {
  constructor() {
    this.vulnerabilities = [];
    this.complianceIssues = [];
    this.scanResults = {
      owasp: [],
      secrets: [],
      dependencies: [],
      configuration: []
    };
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      const configPath = path.join(process.cwd(), '.governance-config.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        return config.security || {};
      }
    } catch (error) {
      console.error('Error loading security config:', error.message);
    }
    return {
      enabled_scans: ['owasp', 'secrets', 'dependencies', 'configuration'],
      severity_threshold: 'medium',
      exclude_patterns: ['node_modules', '.git', 'dist', 'build']
    };
  }

  async runFullScan(targetPath = '.', options = {}) {
    console.log('🔒 Starting comprehensive security scan...');
    console.log(`📁 Target: ${targetPath}`);

    const startTime = Date.now();

    // Reset results
    this.vulnerabilities = [];
    this.complianceIssues = [];
    this.scanResults = {
      owasp: [],
      secrets: [],
      dependencies: [],
      configuration: []
    };

    // Run OWASP Top 10 checks
    if (this.shouldRunScan('owasp', options)) {
      await this.runOWASPScan(targetPath);
    }

    // Run secret detection
    if (this.shouldRunScan('secrets', options)) {
      await this.runSecretDetection(targetPath);
    }

    // Run dependency vulnerability scan
    if (this.shouldRunScan('dependencies', options)) {
      await this.runDependencyScan();
    }

    // Run configuration security scan
    if (this.shouldRunScan('configuration', options)) {
      await this.runConfigurationScan(targetPath);
    }

    const scanTime = Date.now() - startTime;

    return {
      vulnerabilities: this.vulnerabilities,
      complianceIssues: this.complianceIssues,
      scanResults: this.scanResults,
      summary: this.generateSecuritySummary(),
      scanTime: scanTime
    };
  }

  shouldRunScan(scanType, options) {
    if (options.skip && options.skip.includes(scanType)) {
      return false;
    }
    return this.config.enabled_scans.includes(scanType);
  }

  async runOWASPScan(targetPath) {
    console.log('🛡️ Running OWASP Top 10 vulnerability scan...');

    const owaspChecks = [
      {
        id: 'A01:2021-Broken_Access_Control',
        name: 'Broken Access Control',
        patterns: [/admin.*=.*true/i, /role.*=.*admin/i, /access.*level.*=.*high/i],
        severity: 'high'
      },
      {
        id: 'A02:2021-Cryptographic_Failures',
        name: 'Cryptographic Failures',
        patterns: [/password.*=.*["'][^"']*["']/i, /api.*key.*=.*["'][^"']*["']/i],
        severity: 'high'
      },
      {
        id: 'A03:2021-Injection',
        name: 'Injection',
        patterns: [/sql.*query.*\+/i, /eval\s*\(/i, /exec\s*\(/i],
        severity: 'critical'
      },
      {
        id: 'A04:2021-Insecure_Design',
        name: 'Insecure Design',
        patterns: [/trust.*all/i, /disable.*security/i, /skip.*validation/i],
        severity: 'medium'
      },
      {
        id: 'A05:2021-Security_Misconfiguration',
        name: 'Security Misconfiguration',
        patterns: [/debug.*=.*true/i, /dev.*mode.*=.*true/i],
        severity: 'medium'
      },
      {
        id: 'A06:2021-Vulnerable_Components',
        name: 'Vulnerable and Outdated Components',
        patterns: [/version.*=.*["']0\./i, /version.*=.*["']1\./i],
        severity: 'high'
      },
      {
        id: 'A07:2021-Identification_Failures',
        name: 'Identification and Authentication Failures',
        patterns: [/session.*id.*=.*["'][^"']*["']/i, /auth.*token.*=.*["'][^"']*["']/i],
        severity: 'high'
      },
      {
        id: 'A08:2021-Software_Integrity',
        name: 'Software and Data Integrity Failures',
        patterns: [/checksum.*=.*false/i, /verify.*=.*false/i],
        severity: 'high'
      },
      {
        id: 'A09:2021-Security_Logging',
        name: 'Security Logging and Monitoring Failures',
        patterns: [/log.*=.*false/i, /monitor.*=.*false/i],
        severity: 'medium'
      },
      {
        id: 'A10:2021-SSRF',
        name: 'Server-Side Request Forgery',
        patterns: [/url.*=.*request/i, /fetch.*url/i, /axios.*url/i],
        severity: 'high'
      }
    ];

    const files = this.getSourceFiles(targetPath);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      owaspChecks.forEach(check => {
        lines.forEach((line, lineIndex) => {
          check.patterns.forEach(pattern => {
            if (pattern.test(line)) {
              const vulnerability = {
                id: check.id,
                name: check.name,
                severity: check.severity,
                file: path.relative(process.cwd(), file),
                line: lineIndex + 1,
                code: line.trim(),
                description: `Potential ${check.name} vulnerability detected`,
                recommendation: this.getOWASPRecommendation(check.id)
              };

              this.vulnerabilities.push(vulnerability);
              this.scanResults.owasp.push(vulnerability);
            }
          });
        });
      });
    }
  }

  getOWASPRecommendation(owaspId) {
    const recommendations = {
      'A01:2021-Broken_Access_Control': 'Implement proper access control checks and role-based permissions',
      'A02:2021-Cryptographic_Failures': 'Use strong encryption and proper key management',
      'A03:2021-Injection': 'Use parameterized queries and input validation',
      'A04:2021-Insecure_Design': 'Follow secure design principles and threat modeling',
      'A05:2021-Security_Misconfiguration': 'Apply security hardening and secure defaults',
      'A06:2021-Vulnerable_Components': 'Keep dependencies updated and use vulnerability scanning',
      'A07:2021-Identification_Failures': 'Implement multi-factor authentication and secure session management',
      'A08:2021-Software_Integrity': 'Verify integrity of software and data',
      'A09:2021-Security_Logging': 'Implement comprehensive security logging and monitoring',
      'A10:2021-SSRF': 'Validate and sanitize URLs, implement allowlists'
    };

    return recommendations[owaspId] || 'Review and fix the security vulnerability';
  }

  async runSecretDetection(targetPath) {
    console.log('🔐 Running secret detection scan...');

    const secretPatterns = [
      {
        name: 'API Key',
        pattern: /api[_-]?key\s*[:=]\s*["']([a-zA-Z0-9_-]{20,})["']/gi,
        severity: 'high'
      },
      {
        name: 'AWS Access Key',
        pattern: /AKIA[0-9A-Z]{16}/g,
        severity: 'critical'
      },
      {
        name: 'JWT Token',
        pattern: /eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_.]+/g,
        severity: 'high'
      },
      {
        name: 'Private Key',
        pattern: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/g,
        severity: 'critical'
      },
      {
        name: 'Database Password',
        pattern: /password\s*[:=]\s*["']([^"']{8,})["']/gi,
        severity: 'high'
      },
      {
        name: 'Stripe Secret Key',
        pattern: /sk_(test|live)_[a-zA-Z0-9]{24}/g,
        severity: 'critical'
      }
    ];

    const files = this.getSourceFiles(targetPath);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      secretPatterns.forEach(secretType => {
        let match;
        while ((match = secretType.pattern.exec(content)) !== null) {
          const lineNumber = this.getLineNumber(content, match.index);

          const secret = {
            type: secretType.name,
            severity: secretType.severity,
            file: path.relative(process.cwd(), file),
            line: lineNumber,
            value: this.maskSecret(match[1] || match[0]),
            description: `Potential ${secretType.name} found in code`,
            recommendation: 'Move secrets to environment variables or secure vault'
          };

          this.vulnerabilities.push(secret);
          this.scanResults.secrets.push(secret);
        }
      });
    }
  }

  maskSecret(secret) {
    if (secret.length <= 8) return '*'.repeat(secret.length);
    return secret.substring(0, 4) + '*'.repeat(secret.length - 8) + secret.substring(secret.length - 4);
  }

  getLineNumber(content, index) {
    const lines = content.substring(0, index).split('\n');
    return lines.length;
  }

  async runDependencyScan() {
    console.log('📦 Running dependency vulnerability scan...');

    try {
      // Check if package.json exists
      const packagePath = path.join(process.cwd(), 'package.json');
      if (!fs.existsSync(packagePath)) {
        console.log('⚠️ No package.json found, skipping dependency scan');
        return;
      }

      // Run npm audit if available
      try {
        const auditOutput = execSync('npm audit --json', { encoding: 'utf8', stdio: 'pipe' });
        const auditResult = JSON.parse(auditOutput);

        if (auditResult.vulnerabilities) {
          Object.entries(auditResult.vulnerabilities).forEach(([packageName, vuln]) => {
            const vulnerability = {
              package: packageName,
              severity: vuln.severity,
              title: vuln.title,
              description: vuln.overview,
              recommendation: vuln.recommendation || 'Update to a secure version',
              cwe: vuln.cwe,
              cvss: vuln.cvss
            };

            this.vulnerabilities.push(vulnerability);
            this.scanResults.dependencies.push(vulnerability);
          });
        }
      } catch (error) {
        // npm audit failed or found vulnerabilities
        if (error.stdout) {
          try {
            const auditResult = JSON.parse(error.stdout);
            if (auditResult.metadata && auditResult.metadata.vulnerabilities) {
              console.log(`⚠️ Found ${auditResult.metadata.vulnerabilities.total} vulnerabilities`);
            }
          } catch (parseError) {
            console.log('⚠️ Could not parse npm audit output');
          }
        }
      }
    } catch (error) {
      console.error('Error running dependency scan:', error.message);
    }
  }

  async runConfigurationScan(targetPath) {
    console.log('⚙️ Running configuration security scan...');

    const configChecks = [
      {
        name: 'Environment Variables',
        check: () => this.checkEnvironmentVariables()
      },
      {
        name: 'HTTPS Configuration',
        check: () => this.checkHTTPSConfiguration()
      },
      {
        name: 'CORS Settings',
        check: () => this.checkCORSSettings()
      },
      {
        name: 'Security Headers',
        check: () => this.checkSecurityHeaders()
      }
    ];

    for (const configCheck of configChecks) {
      try {
        const issues = await configCheck.check();
        this.complianceIssues.push(...issues);
        this.scanResults.configuration.push(...issues);
      } catch (error) {
        console.error(`Error in ${configCheck.name} check:`, error.message);
      }
    }
  }

  async checkEnvironmentVariables() {
    const issues = [];

    // Check for .env files
    const envFiles = ['.env', '.env.local', '.env.development', '.env.production'];
    envFiles.forEach(envFile => {
      if (fs.existsSync(envFile)) {
        const content = fs.readFileSync(envFile, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          if (line.includes('=') && !line.startsWith('#')) {
            const [key] = line.split('=');
            if (key && key.toLowerCase().includes('secret')) {
              issues.push({
                type: 'environment',
                severity: 'medium',
                file: envFile,
                line: index + 1,
                issue: 'Secret found in environment file',
                recommendation: 'Consider using a secret management service'
              });
            }
          }
        });
      }
    });

    return issues;
  }

  async checkHTTPSConfiguration() {
    const issues = [];

    // Check Next.js config for HTTPS settings
    const nextConfigPath = path.join(process.cwd(), 'next.config.js');
    if (fs.existsSync(nextConfigPath)) {
      const content = fs.readFileSync(nextConfigPath, 'utf8');
      if (content.includes('http://') && !content.includes('localhost')) {
        issues.push({
          type: 'configuration',
          severity: 'high',
          file: 'next.config.js',
          issue: 'HTTP URLs found in production configuration',
          recommendation: 'Use HTTPS URLs in production'
        });
      }
    }

    return issues;
  }

  async checkCORSSettings() {
    const issues = [];

    // Check for CORS configuration
    const apiFiles = this.getFilesByPattern('**/api/**/*.js');
    apiFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('Access-Control-Allow-Origin: *')) {
        issues.push({
          type: 'configuration',
          severity: 'high',
          file: path.relative(process.cwd(), file),
          issue: 'CORS allows all origins',
          recommendation: 'Restrict CORS to specific domains'
        });
      }
    });

    return issues;
  }

  async checkSecurityHeaders() {
    const issues = [];

    // Check for security headers in Next.js config
    const nextConfigPath = path.join(process.cwd(), 'next.config.js');
    if (fs.existsSync(nextConfigPath)) {
      const content = fs.readFileSync(nextConfigPath, 'utf8');
      const securityHeaders = [
        'X-Frame-Options',
        'X-Content-Type-Options',
        'X-XSS-Protection',
        'Strict-Transport-Security'
      ];

      securityHeaders.forEach(header => {
        if (!content.includes(header)) {
          issues.push({
            type: 'configuration',
            severity: 'medium',
            file: 'next.config.js',
            issue: `Missing security header: ${header}`,
            recommendation: 'Add security headers to protect against common attacks'
          });
        }
      });
    }

    return issues;
  }

  getSourceFiles(targetPath) {
    const files = [];
    const extensions = ['.js', '.ts', '.jsx', '.tsx', '.vue', '.py', '.java', '.cpp', '.c', '.php', '.rb'];

    function scanDirectory(dir) {
      try {
        const items = fs.readdirSync(dir);

        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory() &&
              !this.config.exclude_patterns.some(pattern => item.includes(pattern))) {
            scanDirectory.call(this, fullPath);
          } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
            files.push(fullPath);
          }
        });
      } catch (error) {
        // Skip directories we can't read
      }
    }

    scanDirectory.call(this, targetPath);
    return files;
  }

  getFilesByPattern(pattern) {
    // Simple pattern matching - in real implementation would use glob
    const files = [];
    const extensions = ['.js', '.ts'];

    function scanDirectory(dir) {
      try {
        const items = fs.readdirSync(dir);

        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory() && !item.startsWith('.')) {
            scanDirectory(fullPath);
          } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
            if (fullPath.includes('api/') || pattern === '**') {
              files.push(fullPath);
            }
          }
        });
      } catch (error) {
        // Skip directories we can't read
      }
    }

    scanDirectory(process.cwd());
    return files;
  }

  generateSecuritySummary() {
    const severityCount = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0
    };

    this.vulnerabilities.forEach(vuln => {
      severityCount[vuln.severity] = (severityCount[vuln.severity] || 0) + 1;
    });

    const complianceScore = Math.max(0, 100 - (this.vulnerabilities.length * 5));

    return {
      total_vulnerabilities: this.vulnerabilities.length,
      severity_breakdown: severityCount,
      compliance_score: complianceScore,
      scan_categories: Object.keys(this.scanResults),
      critical_findings: this.vulnerabilities.filter(v => v.severity === 'critical').length
    };
  }

  generateReport(outputPath = null) {
    const report = {
      timestamp: new Date().toISOString(),
      scanner_version: '1.0.0',
      target: process.cwd(),
      summary: this.generateSecuritySummary(),
      vulnerabilities: this.vulnerabilities,
      compliance_issues: this.complianceIssues,
      scan_results: this.scanResults
    };

    if (outputPath) {
      fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
      console.log(`📄 Security report saved to: ${outputPath}`);
    }

    return report;
  }

  printResults() {
    const summary = this.generateSecuritySummary();

    console.log('\n🔒 Security Scan Results:');
    console.log('═'.repeat(50));
    console.log(`Total Vulnerabilities: ${summary.total_vulnerabilities}`);
    console.log(`Critical: ${summary.severity_breakdown.critical}`);
    console.log(`High: ${summary.severity_breakdown.high}`);
    console.log(`Medium: ${summary.severity_breakdown.medium}`);
    console.log(`Low: ${summary.severity_breakdown.low}`);
    console.log(`Compliance Score: ${summary.compliance_score}/100`);
    console.log('═'.repeat(50));

    if (this.vulnerabilities.length > 0) {
      console.log('\n🚨 Top Vulnerabilities:');
      this.vulnerabilities
        .sort((a, b) => this.getSeverityWeight(b.severity) - this.getSeverityWeight(a.severity))
        .slice(0, 10)
        .forEach((vuln, index) => {
          console.log(`${index + 1}. [${vuln.severity.toUpperCase()}] ${vuln.name || vuln.type || vuln.package}`);
          if (vuln.file) console.log(`   File: ${vuln.file}:${vuln.line || ''}`);
          console.log(`   ${vuln.description || vuln.issue}`);
          console.log('');
        });
    }
  }

  getSeverityWeight(severity) {
    const weights = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
    return weights[severity] || 0;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const targetPath = args[0] || '.';
  const outputPath = args.find(arg => arg.startsWith('--output='))?.split('=')[1];
  const skipScans = args.filter(arg => arg.startsWith('--skip=')).map(arg => arg.split('=')[1]);

  const scanner = new SecurityScanner();

  try {
    console.log('🚀 Starting Security Scanner...\n');

    const options = {
      skip: skipScans
    };

    const result = await scanner.runFullScan(targetPath, options);

    scanner.printResults();

    if (outputPath) {
      scanner.generateReport(outputPath);
    }

    // Exit with error code if critical vulnerabilities found
    const hasCritical = result.vulnerabilities.some(v => v.severity === 'critical');
    if (hasCritical) {
      console.log('❌ Critical vulnerabilities found!');
      process.exit(1);
    } else {
      console.log('✅ No critical vulnerabilities found');
      process.exit(0);
    }

  } catch (error) {
    console.error('💥 Security scan failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = SecurityScanner;