export interface KpiCard {
  label: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative';
  icon: string;
  color: string;
}

export interface QueryTrend {
  date: string;
  queries: number;
}

export interface TopDocument {
  name: string;
  queries: number;
  department: string;
}

export interface TopQuery {
  question: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
}

export interface DepartmentUsage {
  department: string;
  queries: number;
  percentage: number;
}

export interface UserUsage {
  userId: string;
  name: string;
  email: string;
  department: string;
  queries: number;
}

export interface AnalyticsSummary {
  totalQueries: number;
  uniqueUsers: number;
  topDocuments: number;
  avgResponseTime: string;
  queryTrends: QueryTrend[];
  topDocumentsList: TopDocument[];
  topQueries: TopQuery[];
  departmentUsage: DepartmentUsage[];
  userUsage?: UserUsage[];
}
