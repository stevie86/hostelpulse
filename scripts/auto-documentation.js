#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Auto-Documentation System for Hostelpulse
 * Generates structured documentation for changes, commits, and features
 */

class AutoDocumentation {
  constructor() {
    this.docsDir = path.join(process.cwd(), 'docs');
    this.templatesDir = path.join(this.docsDir, 'templates');
    this.changelogsDir = path.join(this.docsDir, 'changelogs');
    this.metadataDir = path.join(this.docsDir, 'metadata');
    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.docsDir, this.templatesDir, this.changelogsDir, this.metadataDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Generate documentation for code changes
   */
  generateChangeDocs(changes) {
    const timestamp = new Date().toISOString();
    const changeDoc = {
      timestamp,
      changes: changes.map(change => ({
        file: change.file,
        type: change.type,
        before: change.before || null,
        after: change.after || null,
        description: this.generateChangeDescription(change)
      }))
    };

    const filename = `change-${timestamp.replace(/[:.]/g, '-')}.json`;
    const filepath = path.join(this.metadataDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(changeDoc, null, 2));

    // Generate Markdown summary
    this.generateMarkdownSummary(changeDoc, `change-summary-${timestamp.replace(/[:.]/g, '-')}.md`);
    return filepath;
  }

  /**
   * Generate commit documentation
   */
  generateCommitDocs(commitHash, message, changes) {
    const commitDoc = {
      hash: commitHash,
      message,
      timestamp: new Date().toISOString(),
      changes: changes,
      type: this.classifyCommitType(message),
      impact: this.assessImpact(changes)
    };

    const filename = `commit-${commitHash}.json`;
    const filepath = path.join(this.metadataDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(commitDoc, null, 2));

    // Update changelog
    this.updateChangelog(commitDoc);
    return filepath;
  }

  /**
   * Generate feature documentation
   */
  generateFeatureDocs(featureName, spec) {
    const featureDoc = {
      name: featureName,
      timestamp: new Date().toISOString(),
      specification: spec,
      apiEndpoints: spec.apiEndpoints || [],
      userStories: spec.userStories || [],
      acceptanceCriteria: spec.acceptanceCriteria || []
    };

    const filename = `feature-${featureName.toLowerCase().replace(/\s+/g, '-')}.json`;
    const filepath = path.join(this.metadataDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(featureDoc, null, 2));

    // Generate API docs if endpoints exist
    if (featureDoc.apiEndpoints.length > 0) {
      this.generateOpenAPIDocs(featureDoc);
    }

    // Generate user guide
    this.generateUserGuide(featureDoc);
    return filepath;
  }

  /**
   * Classify commit type based on message
   */
  classifyCommitType(message) {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('feat:')) return 'feature';
    if (lowerMessage.includes('fix:')) return 'bugfix';
    if (lowerMessage.includes('docs:')) return 'documentation';
    if (lowerMessage.includes('refactor:')) return 'refactor';
    if (lowerMessage.includes('test:')) return 'test';
    return 'other';
  }

  /**
   * Assess impact of changes
   */
  assessImpact(changes) {
    const impact = { breaking: false, scope: 'minor' };
    const breakingKeywords = ['breaking', 'major', 'remove', 'delete'];
    const majorFiles = ['package.json', 'next.config.js', 'prisma/schema.prisma'];

    changes.forEach(change => {
      if (breakingKeywords.some(keyword => change.description.toLowerCase().includes(keyword))) {
        impact.breaking = true;
      }
      if (majorFiles.includes(change.file)) {
        impact.scope = 'major';
      }
    });

    return impact;
  }

  /**
   * Generate change description
   */
  generateChangeDescription(change) {
    const descriptions = {
      added: `Added ${change.file}`,
      modified: `Modified ${change.file}`,
      deleted: `Deleted ${change.file}`,
      renamed: `Renamed ${change.file}`
    };
    return descriptions[change.type] || `Changed ${change.file}`;
  }

  /**
   * Generate Markdown summary
   */
  generateMarkdownSummary(changeDoc, filename) {
    const content = `# Change Summary - ${changeDoc.timestamp}

## Overview
${changeDoc.changes.length} file(s) changed

## Changes
${changeDoc.changes.map(change => `- **${change.type.toUpperCase()}**: ${change.description}`).join('\n')}

## Details
${changeDoc.changes.map(change => `
### ${change.file}
- **Type**: ${change.type}
- **Description**: ${change.description}
${change.before ? `- **Before**: ${change.before.substring(0, 100)}...` : ''}
${change.after ? `- **After**: ${change.after.substring(0, 100)}...` : ''}
`).join('\n')}

---
*Generated automatically by Hostelpulse Auto-Documentation System*
`;

    const filepath = path.join(this.docsDir, filename);
    fs.writeFileSync(filepath, content);
  }

  /**
   * Update changelog
   */
  updateChangelog(commitDoc) {
    const changelogPath = path.join(this.changelogsDir, 'CHANGELOG.md');
    let changelog = '';

    if (fs.existsSync(changelogPath)) {
      changelog = fs.readFileSync(changelogPath, 'utf8');
    }

    const newEntry = `## [${commitDoc.hash.substring(0, 7)}] - ${new Date(commitDoc.timestamp).toISOString().split('T')[0]}

### ${commitDoc.type.charAt(0).toUpperCase() + commitDoc.type.slice(1)}
- ${commitDoc.message}
- Impact: ${commitDoc.impact.scope}${commitDoc.impact.breaking ? ' (BREAKING)' : ''}

`;

    const updatedChangelog = newEntry + changelog;
    fs.writeFileSync(changelogPath, updatedChangelog);
  }

  /**
   * Generate OpenAPI documentation
   */
  generateOpenAPIDocs(featureDoc) {
    const openapi = {
      openapi: '3.0.0',
      info: {
        title: `${featureDoc.name} API`,
        version: '1.0.0',
        description: `API documentation for ${featureDoc.name} feature`
      },
      paths: {}
    };

    featureDoc.apiEndpoints.forEach(endpoint => {
      if (!openapi.paths[endpoint.path]) {
        openapi.paths[endpoint.path] = {};
      }
      openapi.paths[endpoint.path][endpoint.method.toLowerCase()] = {
        summary: endpoint.summary,
        description: endpoint.description,
        responses: {
          200: {
            description: 'Success'
          }
        }
      };
    });

    const filename = `api-${featureDoc.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    const filepath = path.join(this.docsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(openapi, null, 2));
  }

  /**
   * Generate user guide
   */
  generateUserGuide(featureDoc) {
    const content = `# ${featureDoc.name} User Guide

## Overview
${featureDoc.specification.description || 'Feature description not provided'}

## User Stories
${featureDoc.userStories.map(story => `- ${story}`).join('\n')}

## How to Use
${featureDoc.specification.usage || 'Usage instructions not provided'}

## Acceptance Criteria
${featureDoc.acceptanceCriteria.map(criteria => `- ${criteria}`).join('\n')}

---
*Generated automatically by Hostelpulse Auto-Documentation System*
`;

    const filename = `guide-${featureDoc.name.toLowerCase().replace(/\s+/g, '-')}.md`;
    const filepath = path.join(this.docsDir, filename);
    fs.writeFileSync(filepath, content);
  }

  /**
   * Get recent changes from Git
   */
  getRecentChanges() {
    try {
      const output = execSync('git status --porcelain', { encoding: 'utf8' });
      return output.split('\n').filter(line => line.trim()).map(line => {
        const [status, file] = line.trim().split(/\s+/);
        return {
          file,
          type: this.mapGitStatus(status),
          before: null,
          after: null
        };
      });
    } catch (error) {
      console.error('Error getting Git changes:', error.message);
      return [];
    }
  }

  /**
   * Map Git status to change type
   */
  mapGitStatus(status) {
    if (status.includes('A')) return 'added';
    if (status.includes('M')) return 'modified';
    if (status.includes('D')) return 'deleted';
    if (status.includes('R')) return 'renamed';
    return 'modified';
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const autoDoc = new AutoDocumentation();

  switch (command) {
    case 'changes':
      const changes = autoDoc.getRecentChanges();
      const docPath = autoDoc.generateChangeDocs(changes);
      console.log(`Change documentation generated: ${docPath}`);
      break;

    case 'commit':
      const commitHash = args[1] || execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
      const message = args[2] || execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
      const commitChanges = autoDoc.getRecentChanges();
      const commitDocPath = autoDoc.generateCommitDocs(commitHash, message, commitChanges);
      console.log(`Commit documentation generated: ${commitDocPath}`);
      break;

    case 'feature':
      const featureName = args[1];
      const spec = JSON.parse(args[2] || '{}');
      const featureDocPath = autoDoc.generateFeatureDocs(featureName, spec);
      console.log(`Feature documentation generated: ${featureDocPath}`);
      break;

    default:
      console.log('Usage:');
      console.log('  node auto-documentation.js changes');
      console.log('  node auto-documentation.js commit [hash] [message]');
      console.log('  node auto-documentation.js feature <name> [spec]');
  }
}

module.exports = AutoDocumentation;