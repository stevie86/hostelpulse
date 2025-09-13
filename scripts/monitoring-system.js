#!/usr/bin/env node

/**
 * Hostelpulse Monitoring and Alerting System
 * Real-time performance monitoring, error tracking, and automated alerts
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');

class MonitoringSystem {
  constructor() {
    this.metrics = new Map();
    this.alerts = new Map();
    this.thresholds = new Map();
    this.config = null;
    this.monitoringInterval = null;
    this.alertCooldowns = new Map();
  }

  async loadConfig() {
    try {
      const configPath = path.join(__dirname, 'deployment-config.json');
      const configData = await fs.readFile(configPath, 'utf8');
      this.config = JSON.parse(configData).monitoring;
      console.log('✅ Monitoring configuration loaded');
    } catch (error) {
      console.error('❌ Failed to load monitoring config:', error.message);
      throw error;
    }
  }

  async startMonitoring(deploymentId, environment = 'production') {
    console.log(`📊 Starting monitoring for deployment: ${deploymentId}`);

    // Setup thresholds
    this.setupThresholds();

    // Start metrics collection
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.collectMetrics(deploymentId, environment);
        await this.checkThresholds(deploymentId);
      } catch (error) {
        console.error('❌ Monitoring error:', error.message);
      }
    }, 30000); // Collect metrics every 30 seconds

    console.log(`✅ Monitoring started for ${deploymentId}`);
  }

  setupThresholds() {
    // Setup default thresholds from config
    this.thresholds.set('error_rate', this.config.alerts.error_rate_threshold);
    this.thresholds.set('response_time', this.config.alerts.response_time_threshold);
    this.thresholds.set('traffic_drop', this.config.alerts.traffic_drop_threshold);
    this.thresholds.set('success_rate', 0.95); // 95% success rate minimum
  }

  async collectMetrics(deploymentId, environment) {
    const timestamp = Date.now();

    // Collect various metrics (in a real implementation, this would integrate with APM tools)
    const metrics = {
      response_time: this.generateMockMetric(200, 2000, 800), // ms
      error_rate: this.generateMockMetric(0, 0.1, 0.02), // percentage
      success_rate: this.generateMockMetric(0.9, 1.0, 0.98), // percentage
      throughput: this.generateMockMetric(50, 500, 200), // requests per minute
      cpu_usage: this.generateMockMetric(10, 90, 45), // percentage
      memory_usage: this.generateMockMetric(100, 800, 350), // MB
      active_connections: this.generateMockMetric(10, 200, 75), // count
      error_count: Math.floor(this.generateMockMetric(0, 20, 2)), // count
      timestamp
    };

    // Store metrics
    if (!this.metrics.has(deploymentId)) {
      this.metrics.set(deploymentId, []);
    }

    const deploymentMetrics = this.metrics.get(deploymentId);
    deploymentMetrics.push(metrics);

    // Keep only last 100 metrics points
    if (deploymentMetrics.length > 100) {
      deploymentMetrics.shift();
    }

    console.log(`📊 ${environment} metrics collected:`, {
      response_time: `${metrics.response_time.toFixed(0)}ms`,
      error_rate: `${(metrics.error_rate * 100).toFixed(2)}%`,
      throughput: `${metrics.throughput.toFixed(0)} req/min`,
      cpu: `${metrics.cpu_usage.toFixed(1)}%`,
      memory: `${metrics.memory_usage.toFixed(0)}MB`
    });

    return metrics;
  }

  generateMockMetric(min, max, mean) {
    // Generate mock metrics with some randomness around the mean
    const variance = (max - min) * 0.2;
    return Math.max(min, Math.min(max, mean + (Math.random() - 0.5) * variance));
  }

  async checkThresholds(deploymentId) {
    const deploymentMetrics = this.metrics.get(deploymentId);
    if (!deploymentMetrics || deploymentMetrics.length === 0) {
      return;
    }

    const latestMetrics = deploymentMetrics[deploymentMetrics.length - 1];

    // Check each threshold
    for (const [metricName, threshold] of this.thresholds) {
      const currentValue = latestMetrics[metricName];
      const isViolation = this.isThresholdViolation(metricName, currentValue, threshold);

      if (isViolation) {
        await this.triggerAlert(deploymentId, metricName, currentValue, threshold);
      }
    }
  }

  isThresholdViolation(metricName, currentValue, threshold) {
    switch (metricName) {
      case 'error_rate':
        return currentValue > threshold;
      case 'response_time':
        return currentValue > threshold;
      case 'traffic_drop':
        return currentValue < threshold;
      case 'success_rate':
        return currentValue < threshold;
      default:
        return false;
    }
  }

  async triggerAlert(deploymentId, metricName, currentValue, threshold) {
    const alertKey = `${deploymentId}-${metricName}`;
    const now = Date.now();

    // Check cooldown to prevent alert spam
    const lastAlert = this.alertCooldowns.get(alertKey);
    if (lastAlert && (now - lastAlert) < 300000) { // 5 minutes cooldown
      return;
    }

    const alert = {
      id: `alert_${Date.now()}`,
      deployment_id: deploymentId,
      metric: metricName,
      current_value: currentValue,
      threshold,
      severity: this.calculateSeverity(metricName, currentValue, threshold),
      timestamp: new Date().toISOString(),
      status: 'active'
    };

    this.alerts.set(alert.id, alert);
    this.alertCooldowns.set(alertKey, now);

    console.log(`🚨 ALERT: ${metricName} violation in ${deploymentId}`);
    console.log(`   Current: ${currentValue}, Threshold: ${threshold}`);

    // Send notifications
    await this.sendAlertNotifications(alert);

    // Auto-remediation for critical alerts
    if (alert.severity === 'critical') {
      await this.attemptAutoRemediation(alert);
    }
  }

  calculateSeverity(metricName, currentValue, threshold) {
    const ratio = metricName.includes('rate') || metricName.includes('drop')
      ? Math.abs(currentValue - threshold) / threshold
      : currentValue / threshold;

    if (ratio > 2) return 'critical';
    if (ratio > 1.5) return 'high';
    if (ratio > 1.2) return 'medium';
    return 'low';
  }

  async sendAlertNotifications(alert) {
    if (!this.config.alerts.channels) return;

    const message = this.formatAlertMessage(alert);

    for (const channel of this.config.alerts.channels) {
      try {
        switch (channel) {
          case 'slack':
            await this.sendSlackNotification(message);
            break;
          case 'email':
            await this.sendEmailNotification(message);
            break;
          case 'pagerduty':
            await this.sendPagerDutyNotification(alert);
            break;
          default:
            console.log(`Unknown notification channel: ${channel}`);
        }
      } catch (error) {
        console.error(`Failed to send ${channel} notification:`, error.message);
      }
    }
  }

  formatAlertMessage(alert) {
    const severityEmoji = {
      critical: '🚨',
      high: '⚠️',
      medium: '⚡',
      low: 'ℹ️'
    };

    return {
      text: `${severityEmoji[alert.severity]} *${alert.severity.toUpperCase()} ALERT*

*Deployment:* ${alert.deployment_id}
*Metric:* ${alert.metric}
*Current Value:* ${alert.current_value}
*Threshold:* ${alert.threshold}
*Time:* ${alert.timestamp}

This alert requires immediate attention.`,
      severity: alert.severity,
      alert: alert
    };
  }

  async sendSlackNotification(message) {
    // Mock Slack notification (in real implementation, use Slack API)
    console.log('📱 Slack notification sent:', message.text);
  }

  async sendEmailNotification(message) {
    // Mock email notification (in real implementation, use email service)
    console.log('📧 Email notification sent:', message.text);
  }

  async sendPagerDutyNotification(alert) {
    // Mock PagerDuty notification (in real implementation, use PagerDuty API)
    console.log('📟 PagerDuty alert sent:', alert);
  }

  async attemptAutoRemediation(alert) {
    console.log(`🔧 Attempting auto-remediation for alert: ${alert.id}`);

    switch (alert.metric) {
      case 'error_rate':
        if (alert.current_value > 0.1) {
          console.log('High error rate detected - scaling up instances');
          // In real implementation, trigger auto-scaling
        }
        break;

      case 'response_time':
        if (alert.current_value > 5000) {
          console.log('High response time detected - enabling caching');
          // In real implementation, adjust caching strategies
        }
        break;

      case 'traffic_drop':
        console.log('Traffic drop detected - checking service health');
        // In real implementation, perform health checks
        break;
    }
  }

  async getMetricsSummary(deploymentId, timeRange = 3600000) { // 1 hour default
    const deploymentMetrics = this.metrics.get(deploymentId);
    if (!deploymentMetrics) {
      return null;
    }

    const cutoffTime = Date.now() - timeRange;
    const recentMetrics = deploymentMetrics.filter(m => m.timestamp > cutoffTime);

    if (recentMetrics.length === 0) {
      return null;
    }

    const summary = {
      deployment_id: deploymentId,
      time_range: timeRange,
      metrics_count: recentMetrics.length,
      averages: {},
      peaks: {},
      current: recentMetrics[recentMetrics.length - 1]
    };

    // Calculate averages and peaks
    const metricsKeys = ['response_time', 'error_rate', 'success_rate', 'throughput', 'cpu_usage', 'memory_usage'];

    for (const key of metricsKeys) {
      const values = recentMetrics.map(m => m[key]);
      summary.averages[key] = values.reduce((sum, val) => sum + val, 0) / values.length;
      summary.peaks[key] = Math.max(...values);
    }

    return summary;
  }

  async getActiveAlerts(deploymentId = null) {
    const activeAlerts = Array.from(this.alerts.values())
      .filter(alert => alert.status === 'active')
      .filter(alert => !deploymentId || alert.deployment_id === deploymentId);

    return activeAlerts;
  }

  async resolveAlert(alertId, resolution = 'manual') {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    alert.status = 'resolved';
    alert.resolved_at = new Date().toISOString();
    alert.resolution = resolution;

    console.log(`✅ Alert ${alertId} resolved: ${resolution}`);

    // Send resolution notification
    await this.sendAlertNotifications({
      ...alert,
      severity: 'info',
      text: `✅ Alert ${alertId} has been resolved`
    });
  }

  async generateReport(deploymentId, format = 'json') {
    const summary = await this.getMetricsSummary(deploymentId);
    const activeAlerts = await this.getActiveAlerts(deploymentId);

    const report = {
      deployment_id: deploymentId,
      generated_at: new Date().toISOString(),
      summary,
      active_alerts: activeAlerts,
      recommendations: this.generateRecommendations(summary, activeAlerts)
    };

    if (format === 'json') {
      return JSON.stringify(report, null, 2);
    }

    // Generate text report
    return this.generateTextReport(report);
  }

  generateRecommendations(summary, activeAlerts) {
    const recommendations = [];

    if (!summary) {
      return recommendations;
    }

    // Performance recommendations
    if (summary.averages.response_time > 2000) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: 'Consider optimizing API response times',
        action: 'Review database queries and implement caching'
      });
    }

    if (summary.averages.cpu_usage > 80) {
      recommendations.push({
        type: 'infrastructure',
        priority: 'high',
        message: 'High CPU usage detected',
        action: 'Consider scaling up instances or optimizing code'
      });
    }

    if (summary.averages.error_rate > 0.05) {
      recommendations.push({
        type: 'reliability',
        priority: 'critical',
        message: 'High error rate detected',
        action: 'Investigate error logs and fix critical issues'
      });
    }

    // Alert-based recommendations
    if (activeAlerts.length > 0) {
      recommendations.push({
        type: 'monitoring',
        priority: 'medium',
        message: `${activeAlerts.length} active alerts require attention`,
        action: 'Review and resolve active alerts'
      });
    }

    return recommendations;
  }

  generateTextReport(report) {
    let text = `📊 Monitoring Report for ${report.deployment_id}\n`;
    text += `Generated: ${report.generated_at}\n\n`;

    if (report.summary) {
      text += `📈 Performance Summary:\n`;
      text += `- Average Response Time: ${report.summary.averages.response_time?.toFixed(0)}ms\n`;
      text += `- Average Error Rate: ${(report.summary.averages.error_rate * 100)?.toFixed(2)}%\n`;
      text += `- Average Throughput: ${report.summary.averages.throughput?.toFixed(0)} req/min\n`;
      text += `- Peak CPU Usage: ${report.summary.peaks.cpu_usage?.toFixed(1)}%\n`;
      text += `- Peak Memory Usage: ${report.summary.peaks.memory_usage?.toFixed(0)}MB\n\n`;
    }

    if (report.active_alerts.length > 0) {
      text += `🚨 Active Alerts (${report.active_alerts.length}):\n`;
      report.active_alerts.forEach(alert => {
        text += `- ${alert.severity.toUpperCase()}: ${alert.metric} (${alert.current_value})\n`;
      });
      text += '\n';
    }

    if (report.recommendations.length > 0) {
      text += `💡 Recommendations:\n`;
      report.recommendations.forEach(rec => {
        text += `- ${rec.priority.toUpperCase()}: ${rec.message}\n`;
        text += `  Action: ${rec.action}\n`;
      });
    }

    return text;
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('🛑 Monitoring stopped');
    }
  }

  async saveMetrics() {
    const metricsPath = path.join(__dirname, 'monitoring-metrics.json');
    const metricsData = Array.from(this.metrics.entries());

    await fs.writeFile(metricsPath, JSON.stringify({
      metrics: metricsData,
      alerts: Array.from(this.alerts.entries()),
      lastSaved: new Date().toISOString()
    }, null, 2));

    console.log('💾 Monitoring data saved');
  }

  async loadMetrics() {
    try {
      const metricsPath = path.join(__dirname, 'monitoring-metrics.json');
      const data = await fs.readFile(metricsPath, 'utf8');
      const saved = JSON.parse(data);

      // Restore metrics
      saved.metrics.forEach(([deploymentId, metrics]) => {
        this.metrics.set(deploymentId, metrics);
      });

      // Restore alerts
      saved.alerts.forEach(([alertId, alert]) => {
        this.alerts.set(alertId, alert);
      });

      console.log('📂 Monitoring data loaded');
    } catch (error) {
      console.log('No previous monitoring data found');
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const monitoring = new MonitoringSystem();

  try {
    await monitoring.loadConfig();
    await monitoring.loadMetrics();

    switch (command) {
      case 'start':
        const deploymentId = args[1] || 'default-deployment';
        const environment = args[2] || 'production';
        await monitoring.startMonitoring(deploymentId, environment);
        console.log(`Started monitoring for ${deploymentId}`);
        // Keep the process running
        setInterval(() => {}, 1000);
        break;

      case 'stop':
        monitoring.stopMonitoring();
        break;

      case 'status':
        const statusDeploymentId = args[1] || 'default-deployment';
        const summary = await monitoring.getMetricsSummary(statusDeploymentId);
        const alerts = await monitoring.getActiveAlerts(statusDeploymentId);
        console.log('Monitoring Status:');
        console.log('Summary:', summary ? JSON.stringify(summary, null, 2) : 'No data');
        console.log('Active Alerts:', alerts.length);
        break;

      case 'alerts':
        const alertDeploymentId = args[1];
        const activeAlerts = await monitoring.getActiveAlerts(alertDeploymentId);
        console.log('Active Alerts:');
        activeAlerts.forEach(alert => {
          console.log(`- ${alert.id}: ${alert.metric} (${alert.severity})`);
        });
        break;

      case 'resolve':
        const alertId = args[1];
        await monitoring.resolveAlert(alertId, 'CLI resolution');
        console.log(`Resolved alert ${alertId}`);
        break;

      case 'report':
        const reportDeploymentId = args[1] || 'default-deployment';
        const format = args[2] || 'text';
        const report = await monitoring.generateReport(reportDeploymentId, format);
        console.log(report);
        break;

      default:
        console.log('Usage: monitoring-system <command>');
        console.log('Commands:');
        console.log('  start [deployment-id] [environment]    Start monitoring');
        console.log('  stop                                   Stop monitoring');
        console.log('  status [deployment-id]                 Show monitoring status');
        console.log('  alerts [deployment-id]                 Show active alerts');
        console.log('  resolve <alert-id>                     Resolve alert');
        console.log('  report [deployment-id] [format]        Generate monitoring report');
        break;
    }

    await monitoring.saveMetrics();

  } catch (error) {
    console.error('❌ Monitoring error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = MonitoringSystem;