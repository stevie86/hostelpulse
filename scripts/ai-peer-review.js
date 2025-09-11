#!/usr/bin/env node

/**
 * AI Peer Review System
 * Automated code review simulation with best practices validation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AIPeerReview {
  constructor() {
    this.reviews = [];
    this.suggestions = [];
    this.issues = [];
    this.config = this.loadConfig();
    this.bestPractices = this.loadBestPractices();
  }

  loadConfig() {
    try {
      const configPath = path.join(process.cwd(), '.governance-config.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        return config.ai_review || {};
      }
    } catch (error) {
      console.error('Error loading AI review config:', error.message);
    }
    return {
      enabled_checks: ['code_quality', 'best_practices', 'maintainability', 'performance'],
      severity_threshold: 'medium',
      max_suggestions: 20,
      languages: ['javascript', 'typescript', 'python', 'java']
    };
  }

  loadBestPractices() {
    return {
      javascript: {
        patterns: [
          {
            name: 'Use const/let instead of var',
            pattern: /\bvar\s+/g,
            severity: 'medium',
            suggestion: 'Replace var with const or let for better scoping'
          },
          {
            name: 'Avoid console.log in production',
            pattern: /console\.log\s*\(/g,
            severity: 'low',
            suggestion: 'Remove or replace console.log with proper logging'
          },
          {
            name: 'Use arrow functions',
            pattern: /function\s*\([^)]*\)\s*{/g,
            severity: 'low',
            suggestion: 'Consider using arrow function syntax'
          },
          {
            name: 'Avoid nested callbacks',
            pattern: /}\s*\)\s*\(/g,
            severity: 'medium',
            suggestion: 'Consider using Promises or async/await'
          }
        ],
        complexity_rules: {
          max_function_length: 50,
          max_nested_depth: 3,
          max_parameters: 4
        }
      },
      typescript: {
        patterns: [
          {
            name: 'Use explicit types',
            pattern: /function\s+\w+\s*\([^)]*\)\s*:\s*any/g,
            severity: 'medium',
            suggestion: 'Avoid using any type, use specific types instead'
          },
          {
            name: 'Use interface over type for objects',
            pattern: /type\s+\w+\s*=\s*{/g,
            severity: 'low',
            suggestion: 'Consider using interface for object types'
          }
        ],
        complexity_rules: {
          max_function_length: 40,
          max_nested_depth: 3,
          max_parameters: 3
        }
      }
    };
  }

  async reviewCodebase(targetPath = '.', options = {}) {
    console.log('🤖 Starting AI peer review...');
    console.log(`📁 Target: ${targetPath}`);

    const startTime = Date.now();

    // Reset results
    this.reviews = [];
    this.suggestions = [];
    this.issues = [];

    // Get files to review
    const files = this.getFilesToReview(targetPath);

    for (const file of files) {
      await this.reviewFile(file);
    }

    // Generate overall assessment
    const assessment = this.generateAssessment();

    const reviewTime = Date.now() - startTime;

    return {
      reviews: this.reviews,
      suggestions: this.suggestions,
      issues: this.issues,
      assessment,
      reviewTime,
      filesReviewed: files.length
    };
  }

  getFilesToReview(targetPath) {
    const files = [];
    const supportedExtensions = {
      javascript: ['.js', '.jsx'],
      typescript: ['.ts', '.tsx'],
      python: ['.py'],
      java: ['.java']
    };

    function scanDirectory(dir) {
      try {
        const items = fs.readdirSync(dir);

        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory() &&
              !item.startsWith('.') &&
              item !== 'node_modules' &&
              item !== 'dist' &&
              item !== 'build') {
            scanDirectory(fullPath);
          } else if (stat.isFile()) {
            const ext = path.extname(item);
            const isSupported = Object.values(supportedExtensions).flat().includes(ext);
            if (isSupported) {
              files.push(fullPath);
            }
          }
        });
      } catch (error) {
        // Skip directories we can't read
      }
    }

    scanDirectory(targetPath);
    return files.slice(0, 50); // Limit to 50 files for performance
  }

  async reviewFile(filePath) {
    console.log(`🔍 Reviewing: ${path.relative(process.cwd(), filePath)}`);

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const language = this.detectLanguage(filePath);
    const fileReview = {
      file: path.relative(process.cwd(), filePath),
      language,
      issues: [],
      suggestions: [],
      metrics: this.calculateMetrics(content, lines, language)
    };

    // Run pattern-based checks
    if (this.bestPractices[language]) {
      this.checkPatterns(content, lines, fileReview, this.bestPractices[language]);
    }

    // Run complexity analysis
    this.analyzeComplexity(content, lines, fileReview, language);

    // Run maintainability checks
    this.checkMaintainability(content, lines, fileReview);

    // Run performance checks
    this.checkPerformance(content, lines, fileReview);

    this.reviews.push(fileReview);
  }

  detectLanguage(filePath) {
    const ext = path.extname(filePath);
    const languageMap = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.java': 'java'
    };
    return languageMap[ext] || 'unknown';
  }

  checkPatterns(content, lines, fileReview, languagePractices) {
    languagePractices.patterns.forEach(pattern => {
      let match;
      const regex = new RegExp(pattern.pattern);
      let lineIndex = 0;

      while ((match = regex.exec(content)) !== null) {
        // Find the line number
        const beforeMatch = content.substring(0, match.index);
        lineIndex = beforeMatch.split('\n').length;

        const issue = {
          type: 'pattern',
          severity: pattern.severity,
          line: lineIndex,
          message: pattern.name,
          suggestion: pattern.suggestion,
          code: lines[lineIndex - 1]?.trim()
        };

        fileReview.issues.push(issue);
        this.issues.push({
          ...issue,
          file: fileReview.file
        });

        // Avoid infinite loop
        if (match.index === regex.lastIndex) {
          regex.lastIndex++;
        }
      }
    });
  }

  analyzeComplexity(content, lines, fileReview, language) {
    const complexityRules = this.bestPractices[language]?.complexity_rules || {
      max_function_length: 50,
      max_nested_depth: 3,
      max_parameters: 4
    };

    // Analyze functions
    const functionMatches = content.match(/function\s+\w+\s*\([^)]*\)|const\s+\w+\s*=\s*\([^)]*\)\s*=>|def\s+\w+\s*\([^)]*\):/g) || [];

    functionMatches.forEach(funcMatch => {
      const funcStart = content.indexOf(funcMatch);
      const funcBody = this.extractFunctionBody(content, funcStart);

      if (funcBody) {
        const funcLines = funcBody.split('\n').length;
        const nestedDepth = this.calculateNestingDepth(funcBody);
        const paramCount = (funcMatch.match(/\w+\s*,?\s*/g) || []).length;

        if (funcLines > complexityRules.max_function_length) {
          const issue = {
            type: 'complexity',
            severity: 'medium',
            line: this.getLineNumber(content, funcStart),
            message: `Function too long (${funcLines} lines, max ${complexityRules.max_function_length})`,
            suggestion: 'Consider breaking down into smaller functions'
          };
          fileReview.issues.push(issue);
          this.issues.push({ ...issue, file: fileReview.file });
        }

        if (nestedDepth > complexityRules.max_nested_depth) {
          const issue = {
            type: 'complexity',
            severity: 'medium',
            line: this.getLineNumber(content, funcStart),
            message: `Excessive nesting depth (${nestedDepth}, max ${complexityRules.max_nested_depth})`,
            suggestion: 'Consider extracting nested logic into separate functions'
          };
          fileReview.issues.push(issue);
          this.issues.push({ ...issue, file: fileReview.file });
        }

        if (paramCount > complexityRules.max_parameters) {
          const issue = {
            type: 'complexity',
            severity: 'low',
            line: this.getLineNumber(content, funcStart),
            message: `Too many parameters (${paramCount}, max ${complexityRules.max_parameters})`,
            suggestion: 'Consider using an options object or config parameter'
          };
          fileReview.issues.push(issue);
          this.issues.push({ ...issue, file: fileReview.file });
        }
      }
    });
  }

  extractFunctionBody(content, funcStart) {
    const afterFunc = content.substring(funcStart);
    const braceMatch = afterFunc.match(/{[\s\S]*?}/);

    if (braceMatch) {
      return braceMatch[0].slice(1, -1); // Remove braces
    }

    // For Python or other languages
    const lines = afterFunc.split('\n');
    let bodyLines = [];
    let indentLevel = -1;

    for (const line of lines) {
      if (line.trim() === '') continue;

      const currentIndent = line.length - line.trimStart().length;

      if (indentLevel === -1) {
        indentLevel = currentIndent;
      } else if (currentIndent <= indentLevel && line.trim() !== '') {
        break;
      }

      bodyLines.push(line);
    }

    return bodyLines.join('\n');
  }

  calculateNestingDepth(code) {
    let maxDepth = 0;
    let currentDepth = 0;

    for (const char of code) {
      if (char === '{' || char === '(' || char === '[') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (char === '}' || char === ')' || char === ']') {
        currentDepth = Math.max(0, currentDepth - 1);
      }
    }

    return maxDepth;
  }

  checkMaintainability(content, lines, fileReview) {
    // Check for magic numbers
    const magicNumbers = content.match(/\b\d{2,}\b/g) || [];
    if (magicNumbers.length > 5) {
      const issue = {
        type: 'maintainability',
        severity: 'low',
        line: 1,
        message: 'Multiple magic numbers detected',
        suggestion: 'Consider extracting magic numbers into named constants'
      };
      fileReview.issues.push(issue);
      this.issues.push({ ...issue, file: fileReview.file });
    }

    // Check for long lines
    lines.forEach((line, index) => {
      if (line.length > 120) {
        const issue = {
          type: 'maintainability',
          severity: 'low',
          line: index + 1,
          message: `Line too long (${line.length} characters)`,
          suggestion: 'Break long lines for better readability'
        };
        fileReview.issues.push(issue);
        this.issues.push({ ...issue, file: fileReview.file });
      }
    });

    // Check for TODO comments
    const todoMatches = content.match(/\/\/\s*TODO|\/\*\s*TODO|\#\s*TODO/gi) || [];
    if (todoMatches.length > 0) {
      const issue = {
        type: 'maintainability',
        severity: 'info',
        line: 1,
        message: `${todoMatches.length} TODO comment(s) found`,
        suggestion: 'Consider addressing or documenting TODO items'
      };
      fileReview.issues.push(issue);
      this.issues.push({ ...issue, file: fileReview.file });
    }
  }

  checkPerformance(content, lines, fileReview) {
    // Check for inefficient patterns
    const inefficientPatterns = [
      {
        pattern: /for\s*\([^)]*in\s+[^)]*\)/g,
        message: 'Using for...in with arrays',
        suggestion: 'Use for...of or traditional for loop for arrays'
      },
      {
        pattern: /\w+\.length\s*>\s*0/g,
        message: 'Checking length > 0 instead of truthiness',
        suggestion: 'Use if (array.length) for better performance'
      }
    ];

    inefficientPatterns.forEach(check => {
      const matches = content.match(check.pattern);
      if (matches) {
        matches.forEach(match => {
          const lineNumber = this.getLineNumber(content, content.indexOf(match));
          const issue = {
            type: 'performance',
            severity: 'low',
            line: lineNumber,
            message: check.message,
            suggestion: check.suggestion
          };
          fileReview.issues.push(issue);
          this.issues.push({ ...issue, file: fileReview.file });
        });
      }
    });
  }

  calculateMetrics(content, lines, language) {
    return {
      lines_of_code: lines.length,
      characters: content.length,
      functions: (content.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || []).length,
      classes: (content.match(/class\s+\w+/g) || []).length,
      comments: (content.match(/\/\/|\/\*|\#/g) || []).length,
      complexity_score: this.calculateComplexityScore(content)
    };
  }

  calculateComplexityScore(content) {
    let score = 0;

    // Count control structures
    const controlStructures = content.match(/\b(if|for|while|switch|catch)\b/g) || [];
    score += controlStructures.length * 2;

    // Count logical operators
    const logicalOps = content.match(/\|\||&&/g) || [];
    score += logicalOps.length;

    // Count function calls (simplified)
    const functionCalls = content.match(/\w+\s*\(/g) || [];
    score += Math.floor(functionCalls.length / 10);

    return Math.min(score, 100); // Cap at 100
  }

  getLineNumber(content, index) {
    const lines = content.substring(0, index).split('\n');
    return lines.length;
  }

  generateAssessment() {
    const totalIssues = this.issues.length;
    const severityCount = {
      critical: this.issues.filter(i => i.severity === 'critical').length,
      high: this.issues.filter(i => i.severity === 'high').length,
      medium: this.issues.filter(i => i.severity === 'medium').length,
      low: this.issues.filter(i => i.severity === 'low').length,
      info: this.issues.filter(i => i.severity === 'info').length
    };

    const averageComplexity = this.reviews.reduce((sum, review) =>
      sum + review.metrics.complexity_score, 0) / this.reviews.length;

    const maintainabilityScore = Math.max(0, 100 - (totalIssues * 2) - averageComplexity);

    return {
      overall_score: maintainabilityScore,
      total_issues: totalIssues,
      severity_breakdown: severityCount,
      average_complexity: Math.round(averageComplexity * 100) / 100,
      files_reviewed: this.reviews.length,
      grade: this.getGrade(maintainabilityScore)
    };
  }

  getGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  generateSuggestions() {
    const suggestions = [];

    // Group issues by type
    const issuesByType = {};
    this.issues.forEach(issue => {
      if (!issuesByType[issue.type]) {
        issuesByType[issue.type] = [];
      }
      issuesByType[issue.type].push(issue);
    });

    // Generate type-specific suggestions
    Object.entries(issuesByType).forEach(([type, issues]) => {
      switch (type) {
        case 'complexity':
          suggestions.push({
            category: 'Code Complexity',
            priority: 'high',
            description: `${issues.length} complexity issues found`,
            actions: [
              'Break down large functions into smaller ones',
              'Extract complex conditional logic into separate functions',
              'Consider using early returns to reduce nesting'
            ]
          });
          break;

        case 'pattern':
          suggestions.push({
            category: 'Best Practices',
            priority: 'medium',
            description: `${issues.length} best practice violations found`,
            actions: [
              'Replace var with const/let',
              'Use modern JavaScript features (arrow functions, template literals)',
              'Implement proper error handling'
            ]
          });
          break;

        case 'maintainability':
          suggestions.push({
            category: 'Maintainability',
            priority: 'medium',
            description: `${issues.length} maintainability issues found`,
            actions: [
              'Extract magic numbers into named constants',
              'Break long lines for better readability',
              'Address TODO comments'
            ]
          });
          break;
      }
    });

    this.suggestions = suggestions;
    return suggestions;
  }

  printResults() {
    const assessment = this.generateAssessment();
    const suggestions = this.generateSuggestions();

    console.log('\n🤖 AI Peer Review Results:');
    console.log('═'.repeat(50));
    console.log(`Overall Grade: ${assessment.grade}`);
    console.log(`Maintainability Score: ${assessment.overall_score}/100`);
    console.log(`Files Reviewed: ${assessment.files_reviewed}`);
    console.log(`Total Issues: ${assessment.total_issues}`);
    console.log(`Average Complexity: ${assessment.average_complexity}`);
    console.log('═'.repeat(50));

    if (assessment.severity_breakdown.critical > 0 || assessment.severity_breakdown.high > 0) {
      console.log('\n🚨 Critical/High Priority Issues:');
      this.issues
        .filter(issue => issue.severity === 'critical' || issue.severity === 'high')
        .slice(0, 10)
        .forEach((issue, index) => {
          console.log(`${index + 1}. [${issue.severity.toUpperCase()}] ${issue.message}`);
          console.log(`   File: ${issue.file}:${issue.line}`);
          console.log(`   Suggestion: ${issue.suggestion}`);
          console.log('');
        });
    }

    if (suggestions.length > 0) {
      console.log('\n💡 Improvement Suggestions:');
      suggestions.forEach((suggestion, index) => {
        console.log(`${index + 1}. ${suggestion.category} (${suggestion.priority})`);
        console.log(`   ${suggestion.description}`);
        suggestion.actions.forEach(action => {
          console.log(`   • ${action}`);
        });
        console.log('');
      });
    }
  }

  generateReport(outputPath = null) {
    const report = {
      timestamp: new Date().toISOString(),
      reviewer_version: '1.0.0',
      assessment: this.generateAssessment(),
      suggestions: this.generateSuggestions(),
      reviews: this.reviews,
      summary: {
        total_files: this.reviews.length,
        total_issues: this.issues.length,
        issues_by_severity: this.issues.reduce((acc, issue) => {
          acc[issue.severity] = (acc[issue.severity] || 0) + 1;
          return acc;
        }, {})
      }
    };

    if (outputPath) {
      fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
      console.log(`📄 AI review report saved to: ${outputPath}`);
    }

    return report;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const targetPath = args[0] || '.';
  const outputPath = args.find(arg => arg.startsWith('--output='))?.split('=')[1];

  const reviewer = new AIPeerReview();

  try {
    console.log('🚀 Starting AI Peer Review...\n');

    const result = await reviewer.reviewCodebase(targetPath);

    reviewer.printResults();

    if (outputPath) {
      reviewer.generateReport(outputPath);
    }

    // Exit with error code if critical issues found
    const hasCriticalIssues = result.issues.some(issue => issue.severity === 'critical');
    if (hasCriticalIssues) {
      console.log('❌ Critical issues found that need immediate attention!');
      process.exit(1);
    } else {
      console.log('✅ Code review completed successfully');
      process.exit(0);
    }

  } catch (error) {
    console.error('💥 AI peer review failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = AIPeerReview;