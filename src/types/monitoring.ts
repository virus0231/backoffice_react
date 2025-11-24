/**
 * TypeScript interfaces for Website Monitoring Dashboard
 *
 * Defines the structure for uptime monitoring data from Google Sheets
 */

/**
 * Individual log entry from monitoring system
 */
export interface MonitoringLog {
  timestamp: string;
  websiteName: string;
  url: string;
  statusCode: number | null;
  responseTime: number | null;
  status: 'Up' | 'Down';
  error: string | null;
}

/**
 * Current status snapshot for a client
 */
export interface CurrentStatus {
  status: 'Up' | 'Down';
  statusCode: number | null;
  responseTime: number | null;
  error: string | null;
  timestamp: string;
}

/**
 * Historical entry in recent history
 */
export interface HistoryEntry {
  timestamp: string;
  status: 'Up' | 'Down';
  statusCode: number | null;
  responseTime: number | null;
  error: string | null;
}

/**
 * Statistical data for a client over the monitoring period
 */
export interface ClientStatistics {
  totalChecks: number;
  upCount: number;
  downCount: number;
  uptimePercentage: number;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  lastCheck: string;
}

/**
 * Complete client monitoring data
 */
export interface ClientMonitoringData {
  name: string;
  url: string;
  currentStatus: CurrentStatus;
  statistics: ClientStatistics;
  recentHistory: HistoryEntry[];
}

/**
 * Overall monitoring statistics across all clients
 */
export interface OverallStatistics {
  totalClients: number;
  clientsUp: number;
  clientsDown: number;
  overallUptimePercentage: number;
  avgResponseTime: number;
}

/**
 * Data range information
 */
export interface DataRange {
  totalLogs: number;
  oldestLog: string;
  newestLog: string;
}

/**
 * Complete dashboard API response
 */
export interface MonitoringDashboardResponse {
  success: boolean;
  timestamp: string;
  executionTime: string;
  overallStats: OverallStatistics;
  clients: ClientMonitoringData[];
  dataRange: DataRange;
}

/**
 * Raw log data from Google Sheets (before processing)
 */
export interface RawSheetLog {
  Timestamp: string;
  'Website Name': string;
  URL: string;
  'Status Code': string | number;
  'Response Time (ms)': string | number;
  Status: string;
  Error?: string;
}

/**
 * Individual data point in client history
 */
export interface ClientHistoryDataPoint {
  timestamp: string;
  status: 'Up' | 'Down';
  statusCode: number | null;
  responseTime: number | null;
  error: string | null;
}

/**
 * Hourly aggregated monitoring data
 */
export interface HourlyAggregatedData {
  hour: string;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  uptimePercentage: number;
  totalChecks: number;
  upCount: number;
  downCount: number;
}

/**
 * Statistics for client history period
 */
export interface ClientHistoryStatistics {
  totalChecks: number;
  upCount: number;
  downCount: number;
  uptimePercentage: number;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  firstCheck: string;
  lastCheck: string;
}

/**
 * Client history API response (24-hour monitoring data)
 */
export interface ClientHistoryResponse {
  success: boolean;
  timestamp?: string;
  executionTime?: string;
  client?: {
    name: string;
    url: string;
  };
  dataPoints?: ClientHistoryDataPoint[];
  hourlyAggregated?: HourlyAggregatedData[];
  statistics?: ClientHistoryStatistics;
  error?: string;
  message?: string;
}
