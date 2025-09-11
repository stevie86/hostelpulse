#!/usr/bin/env node

/**
 * Audit Trail System
 * Comprehensive logging and reporting for governance activities
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class AuditTrailSystem {
  constructor() {
    this.auditLog = [];
    this.config = this.loadConfig();
    this.logFile = path.join(process.cwd(), '.kilocode', 'audit-trail.json');
    this.ensureLogDirectory();
    this.loadExistingLogs();
  }

  loadConfig() {
    try {
      const configPath = path.join(process.cwd(), '.governance-config.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        return config.audit || {};
      }
    } catch (error) {
      console.error('Error loading audit config:', error.message);
    }
    return {
      enabled: true,
      retention_days: 365,
      max_log_size: 100, // MB
      encryption: false,
      export_formats: ['json', 'csv', 'pdf'],
      real_time_alerts: true
    };
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  loadExistingLogs() {
    try {
      if (fs.existsSync(this.logFile)) {
        const data = fs.readFileSync(this.logFile, 'utf8');
        this.auditLog = JSON.parse(data);
        this.cleanupOldLogs();
      }
    } catch (error) {
      console.error('Error loading existing audit logs:', error.message);
      this.auditLog = [];
    }
  }

  cleanupOldLogs() {
    const retentionMs = this.config.retention_days * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(Date.now() - retentionMs);

    this.auditLog = this.auditLog.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= cutoffDate;
    });

    this.saveLogs();
  }

  logActivity(activity) {
    if (!this.config.enabled) return;

    const auditEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      user: activity.user || process.env.USER || 'system',
      action: activity.action,
      resource: activity.resource,
      details: activity.details || {},
      severity: activity.severity || 'info',
      ip_address: activity.ip_address || 'localhost',
      user_agent: activity.user_agent || 'KiloCode-Governance',
      session_id: activity.session_id || this.generateSessionId(),
      checksum: ''
    };

    // Add checksum for integrity
    auditEntry.checksum = this.generateChecksum(auditEntry);

    this.auditLog.push(auditEntry);
    this.saveLogs();

    // Real-time alerts for critical activities
    if (this.config.real_time_alerts && auditEntry.severity === 'critical') {
      this.sendAlert(auditEntry);
    }

    console.log(`📝 Audit: ${auditEntry.action} by ${auditEntry.user} on ${auditEntry.resource}`);

    return auditEntry.id;
  }

  generateId() {
    return crypto.randomUUID();
  }

  generateSessionId() {
    return crypto.randomBytes(16).toString('hex');
  }

  generateChecksum(data) {
    const content = JSON.stringify({
      ...data,
      checksum: undefined // Exclude checksum from checksum calculation
    });
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  saveLogs() {
    try {
      // Check log size limit
      const logSizeMB = Buffer.byteLength(JSON.stringify(this.auditLog)) / (1024 * 1024);
      if (logSizeMB > this.config.max_log_size) {
        // Archive old logs and keep only recent ones
        const keepCount = Math.floor(this.auditLog.length * 0.7);
        const archivedLogs = this.auditLog.slice(0, this.auditLog.length - keepCount);
        this.archiveLogs(archivedLogs);
        this.auditLog = this.auditLog.slice(-keepCount);
      }

      const data = JSON.stringify(this.auditLog, null, 2);
      fs.writeFileSync(this.logFile, data);
    } catch (error) {
      console.error('Error saving audit logs:', error.message);
    }
  }

  archiveLogs(logs) {
    const archiveFile = path.join(
      process.cwd(),
      '.kilocode',
      `audit-trail-archive-${new Date().toISOString().split('T')[0]}.json`
    );

    try {
      fs.writeFileSync(archiveFile, JSON.stringify(logs, null, 2));
      console.log(`📦 Archived ${logs.length} old audit entries to ${archiveFile}`);
    } catch (error) {
      console.error('Error archiving audit logs:', error.message);
    }
  }

  sendAlert(auditEntry) {
    // In a real implementation, this would send alerts via email, Slack, etc.
    console.log(`🚨 ALERT: Critical activity detected - ${auditEntry.action}`);
    console.log(`   User: ${auditEntry.user}`);
    console.log(`   Resource: ${auditEntry.resource}`);
    console.log(`   Time: ${auditEntry.timestamp}`);
  }

  // Governance-specific logging methods
  logRuleViolation(violation) {
    return this.logActivity({
      action: 'rule_violation',
      resource: violation.file || 'unknown',
      details: {
        rule: violation.rule,
        severity: violation.severity,
        message: violation.message,
        line: violation.line
      },
      severity: violation.severity === 'error' ? 'high' : 'medium'
    });
  }

  logSecurityScan(scanResult) {
    return this.logActivity({
      action: 'security_scan',
      resource: 'codebase',
      details: {
        vulnerabilities_found: scanResult.vulnerabilities?.length || 0,
        critical_vulnerabilities: scanResult.vulnerabilities?.filter(v => v.severity === 'critical').length || 0,
        scan_time: scanResult.scanTime,
        compliance_score: scanResult.summary?.compliance_score
      },
      severity: (scanResult.vulnerabilities?.some(v => v.severity === 'critical')) ? 'critical' : 'info'
    });
  }

  logCodeReview(reviewResult) {
    return this.logActivity({
      action: 'code_review',
      resource: 'codebase',
      details: {
        files_reviewed: reviewResult.filesReviewed,
        issues_found: reviewResult.issues?.length || 0,
        grade: reviewResult.assessment?.grade,
        maintainability_score: reviewResult.assessment?.overall_score,
        review_time: reviewResult.reviewTime
      },
      severity: reviewResult.assessment?.grade === 'F' ? 'high' : 'info'
    });
  }

  logQualityGate(gateResult, gateType) {
    return this.logActivity({
      action: 'quality_gate',
      resource: gateType,
      details: {
        gate_type: gateType,
        passed: gateResult.passed,
        violations: gateResult.violations?.length || 0,
        reason: gateResult.reason
      },
      severity: gateResult.passed ? 'info' : 'high'
    });
  }

  logOverrideRequest(override) {
    return this.logActivity({
      action: 'override_request',
      resource: override.resource,
      details: {
        reason: override.reason,
        approved_by: override.approved_by,
        justification: override.justification,
        original_violation: override.original_violation
      },
      severity: 'medium'
    });
  }

  // Query and reporting methods
  queryLogs(filters = {}) {
    let results = [...this.auditLog];

    if (filters.user) {
      results = results.filter(entry => entry.user === filters.user);
    }

    if (filters.action) {
      results = results.filter(entry => entry.action === filters.action);
    }

    if (filters.resource) {
      results = results.filter(entry => entry.resource === filters.resource);
    }

    if (filters.severity) {
      results = results.filter(entry => entry.severity === filters.severity);
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate);
      results = results.filter(entry => new Date(entry.timestamp) >= start);
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate);
      results = results.filter(entry => new Date(entry.timestamp) <= end);
    }

    if (filters.limit) {
      results = results.slice(-filters.limit);
    }

    return results;
  }

  generateReport(filters = {}, format = 'json') {
    const logs = this.queryLogs(filters);
    const report = {
      generated_at: new Date().toISOString(),
      filters,
      summary: this.generateSummary(logs),
      entries: logs
    };

    switch (format) {
      case 'csv':
        return this.exportToCSV(report);
      case 'pdf':
        return this.exportToPDF(report);
      default:
        return JSON.stringify(report, null, 2);
    }
  }

  generateSummary(logs) {
    const summary = {
      total_entries: logs.length,
      date_range: {
        start: logs.length > 0 ? logs[0].timestamp : null,
        end: logs.length > 0 ? logs[logs.length - 1].timestamp : null
      },
      activities_by_type: {},
      activities_by_user: {},
      severity_breakdown: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0
      },
      top_resources: {},
      compliance_metrics: this.calculateComplianceMetrics(logs)
    };

    logs.forEach(entry => {
      // Count by activity type
      summary.activities_by_type[entry.action] = (summary.activities_by_type[entry.action] || 0) + 1;

      // Count by user
      summary.activities_by_user[entry.user] = (summary.activities_by_user[entry.user] || 0) + 1;

      // Count by severity
      summary.severity_breakdown[entry.severity] = (summary.severity_breakdown[entry.severity] || 0) + 1;

      // Count by resource
      summary.top_resources[entry.resource] = (summary.top_resources[entry.resource] || 0) + 1;
    });

    return summary;
  }

  calculateComplianceMetrics(logs) {
    const ruleViolations = logs.filter(entry => entry.action === 'rule_violation');
    const qualityGates = logs.filter(entry => entry.action === 'quality_gate');
    const securityScans = logs.filter(entry => entry.action === 'security_scan');

    return {
      rule_compliance_rate: this.calculateComplianceRate(ruleViolations),
      quality_gate_success_rate: this.calculateGateSuccessRate(qualityGates),
      security_scan_frequency: securityScans.length,
      average_critical_findings: this.calculateAverageCriticalFindings(securityScans)
    };
  }

  calculateComplianceRate(violations) {
    if (violations.length === 0) return 100;

    const errorViolations = violations.filter(v => v.details.severity === 'error').length;
    return Math.max(0, 100 - (errorViolations * 5));
  }

  calculateGateSuccessRate(gates) {
    if (gates.length === 0) return 100;

    const passedGates = gates.filter(g => g.details.passed).length;
    return Math.round((passedGates / gates.length) * 100);
  }

  calculateAverageCriticalFindings(scans) {
    if (scans.length === 0) return 0;

    const totalCritical = scans.reduce((sum, scan) => sum + (scan.details.critical_vulnerabilities || 0), 0);
    return Math.round(totalCritical / scans.length * 100) / 100;
  }

  exportToCSV(report) {
    const headers = ['Timestamp', 'User', 'Action', 'Resource', 'Severity', 'Details'];
    const rows = report.entries.map(entry => [
      entry.timestamp,
      entry.user,
      entry.action,
      entry.resource,
      entry.severity,
      JSON.stringify(entry.details)
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  exportToPDF(report) {
    // In a real implementation, this would generate a PDF
    // For now, return a placeholder
    return `PDF Report Generated: ${report.summary.total_entries} entries from ${report.summary.date_range.start} to ${report.summary.date_range.end}`;
  }

  // Verification and integrity methods
  verifyLogIntegrity() {
    const invalidEntries = [];

    this.auditLog.forEach((entry, index) => {
      const expectedChecksum = this.generateChecksum(entry);
      if (entry.checksum !== expectedChecksum) {
        invalidEntries.push({
          index,
          entry: entry.id,
          expected: expectedChecksum,
          actual: entry.checksum
        });
      }
    });

    if (invalidEntries.length > 0) {
      console.error(`🚨 Log integrity compromised! ${invalidEntries.length} entries have been tampered with.`);
      return {
        valid: false,
        invalid_entries: invalidEntries
      };
    }

    return {
      valid: true,
      message: 'All audit log entries are intact and valid.'
    };
  }

  // Dashboard and monitoring methods
  getDashboardData(timeRange = '7d') {
    const now = new Date();
    const timeRangeMs = this.parseTimeRange(timeRange);
    const startDate = new Date(now.getTime() - timeRangeMs);

    const recentLogs = this.auditLog.filter(entry =>
      new Date(entry.timestamp) >= startDate
    );

    return {
      summary: this.generateSummary(recentLogs),
      recent_activities: recentLogs.slice(-10).reverse(),
      alerts: this.getActiveAlerts(),
      compliance_trend: this.getComplianceTrend(timeRange)
    };
  }

  parseTimeRange(range) {
    const unit = range.slice(-1);
    const value = parseInt(range.slice(0, -1));

    switch (unit) {
      case 'd': return value * 24 * 60 * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'm': return value * 60 * 1000;
      default: return 7 * 24 * 60 * 60 * 1000; // Default 7 days
    }
  }

  getActiveAlerts() {
    const recentLogs = this.auditLog.slice(-100); // Last 100 entries
    return recentLogs
      .filter(entry => entry.severity === 'critical' || entry.severity === 'high')
      .slice(-5) // Last 5 alerts
      .reverse();
  }

  getComplianceTrend(timeRange) {
    const now = new Date();
    const timeRangeMs = this.parseTimeRange(timeRange);
    const startDate = new Date(now.getTime() - timeRangeMs);

    const relevantLogs = this.auditLog.filter(entry =>
      new Date(entry.timestamp) >= startDate &&
      (entry.action === 'quality_gate' || entry.action === 'rule_violation')
    );

    // Group by day
    const dailyStats = {};
    relevantLogs.forEach(entry => {
      const day = entry.timestamp.split('T')[0];
      if (!dailyStats[day]) {
        dailyStats[day] = { total: 0, violations: 0, gates: 0 };
      }

      dailyStats[day].total++;
      if (entry.action === 'rule_violation') {
        dailyStats[day].violations++;
      } else if (entry.action === 'quality_gate') {
        dailyStats[day].gates++;
        if (!entry.details.passed) {
          dailyStats[day].violations++;
        }
      }
    });

    return Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      compliance_rate: stats.total > 0 ? Math.round(((stats.total - stats.violations) / stats.total) * 100) : 100
    }));
  }

  printDashboard() {
    const dashboard = this.getDashboardData();

    console.log('\n📊 Audit Trail Dashboard:');
    console.log('═'.repeat(50));
    console.log(`Total Activities: ${dashboard.summary.total_entries}`);
    console.log(`Active Alerts: ${dashboard.alerts.length}`);
    console.log(`Compliance Rate: ${dashboard.summary.compliance_metrics.rule_compliance_rate}%`);
    console.log('═'.repeat(50));

    if (dashboard.alerts.length > 0) {
      console.log('\n🚨 Recent Alerts:');
      dashboard.alerts.forEach((alert, index) => {
        console.log(`${index + 1}. [${alert.severity.toUpperCase()}] ${alert.action}`);
        console.log(`   User: ${alert.user} | Resource: ${alert.resource}`);
        console.log(`   Time: ${new Date(alert.timestamp).toLocaleString()}`);
        console.log('');
      });
    }

    console.log('\n📈 Compliance Trend (Last 7 days):');
    dashboard.compliance_trend.forEach(day => {
      console.log(`${day.date}: ${day.compliance_rate}%`);
    });
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const auditSystem = new AuditTrailSystem();

  switch (command) {
    case 'log':
      const activity = {
        action: args[1] || 'test_activity',
        resource: args[2] || 'test_resource',
        user: args[3] || 'cli_user',
        severity: args[4] || 'info'
      };
      const entryId = auditSystem.logActivity(activity);
      console.log(`✅ Logged activity with ID: ${entryId}`);
      break;

    case 'query':
      const filters = {};
      if (args[1]) filters.action = args[1];
      if (args[2]) filters.user = args[2];
      const results = auditSystem.queryLogs(filters);
      console.log(`📋 Found ${results.length} matching entries`);
      results.slice(-5).forEach(entry => {
        console.log(`  ${entry.timestamp} | ${entry.user} | ${entry.action} | ${entry.resource}`);
      });
      break;

    case 'report':
      const format = args[1] || 'json';
      const report = auditSystem.generateReport({}, format);
      console.log('📄 Generated audit report:');
      if (format === 'json') {
        console.log(JSON.stringify(JSON.parse(report), null, 2));
      } else {
        console.log(report);
      }
      break;

    case 'dashboard':
      auditSystem.printDashboard();
      break;

    case 'verify':
      const integrity = auditSystem.verifyLogIntegrity();
      if (integrity.valid) {
        console.log('✅ Audit log integrity verified');
      } else {
        console.log('❌ Audit log integrity compromised!');
        console.log(integrity);
      }
      break;

    default:
      console.log('Usage: audit-trail.js <command> [options]');
      console.log('Commands:');
      console.log('  log <action> <resource> [user] [severity]  - Log an activity');
      console.log('  query [action] [user]                      - Query audit logs');
      console.log('  report [format]                           - Generate audit report');
      console.log('  dashboard                                 - Show audit dashboard');
      console.log('  verify                                    - Verify log integrity');
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = AuditTrailSystem;