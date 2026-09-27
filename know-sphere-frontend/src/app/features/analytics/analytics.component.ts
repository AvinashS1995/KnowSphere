import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AnalyticsService } from '../../core/services/analytics.service';
import { AnalyticsSummary } from '../../core/models/analytics.model';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import {
  ApexChart, ApexXAxis, ApexYAxis, ApexDataLabels, ApexStroke,
  ApexFill, ApexTooltip, ApexPlotOptions, ApexResponsive, ApexLegend
} from 'ng-apexcharts';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, NgApexchartsModule, LoadingStateComponent],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div class="page-header mb-0">
          <h1>Usage Analytics</h1>
          <p>Insights about document usage and AI queries</p>
        </div>
        <div class="flex items-center gap-2">
          <select class="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Last 90 days</option>
          </select>
          <button mat-stroked-button class="!border-slate-200 !text-slate-600 !text-sm !rounded-lg">
            <mat-icon class="!text-base mr-1">download</mat-icon> Export
          </button>
        </div>
      </div>

      @if (loading()) {
        <app-loading-state type="card" [count]="4" />
      } @else {
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          @for (kpi of kpis; track kpi.label) {
            <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-medium text-slate-500">{{ kpi.label }}</span>
                <div class="w-8 h-8 rounded-lg flex items-center justify-center" [style.backgroundColor]="kpi.bgColor">
                  <mat-icon class="!text-base" [style.color]="kpi.iconColor">{{ kpi.icon }}</mat-icon>
                </div>
              </div>
              <div class="text-2xl font-bold text-slate-900 mb-1">{{ kpi.value }}</div>
              <div class="text-xs text-emerald-600 flex items-center gap-1">
                <mat-icon class="!text-xs">trending_up</mat-icon>{{ kpi.change }}
              </div>
            </div>
          }
        </div>

        <!-- Charts row -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          <!-- Line chart -->
          <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 class="text-sm font-semibold text-slate-700 mb-4">Query Trends</h3>
            <apx-chart
              [series]="lineChartSeries"
              [chart]="lineChart"
              [xaxis]="lineXAxis"
              [yaxis]="lineYAxis"
              [stroke]="lineStroke"
              [fill]="lineFill"
              [dataLabels]="dataLabels"
              [tooltip]="tooltip"
              [colors]="['#6366f1']" />
          </div>

          <!-- Bar chart top docs -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 class="text-sm font-semibold text-slate-700 mb-4">Top Documents</h3>
            <apx-chart
              [series]="barSeries"
              [chart]="barChart"
              [xaxis]="barXAxis"
              [plotOptions]="barPlotOptions"
              [dataLabels]="dataLabels"
              [colors]="['#6366f1']" />
          </div>
        </div>

        <!-- Bottom row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <!-- Most asked questions table -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div class="px-5 py-4 border-b border-slate-100">
              <h3 class="text-sm font-semibold text-slate-700">Most Asked Questions</h3>
            </div>
            <div class="divide-y divide-slate-50">
              <div class="grid grid-cols-[1fr_auto] gap-4 px-5 py-2.5 bg-slate-50">
                <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Question</span>
                <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Queries</span>
              </div>
              @if (data()) {
                @for (q of data()!.topQueries; track q.question) {
                  <div class="grid grid-cols-[1fr_auto] gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div class="flex items-center gap-2">
                      <mat-icon class="!text-sm text-slate-400">chat_bubble_outline</mat-icon>
                      <span class="text-sm text-slate-600 truncate">{{ q.question }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-semibold text-slate-800">{{ q.count }}</span>
                      <mat-icon class="!text-sm" [class.text-emerald-500]="q.trend === 'up'" [class.text-red-400]="q.trend === 'down'" [class.text-slate-400]="q.trend === 'stable'">
                        {{ q.trend === 'up' ? 'trending_up' : q.trend === 'down' ? 'trending_down' : 'trending_flat' }}
                      </mat-icon>
                    </div>
                  </div>
                }
              }
            </div>
          </div>

          <!-- Dept usage donut -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 class="text-sm font-semibold text-slate-700 mb-4">Usage by Department</h3>
            <div class="flex items-center gap-4">
              <apx-chart
                [series]="donutSeries"
                [chart]="donutChart"
                [labels]="donutLabels"
                [colors]="donutColors"
                [legend]="donutLegend"
                [plotOptions]="donutPlotOptions"
                [dataLabels]="dataLabels" />
            </div>
          </div>
        </div>

        <!-- Per-user usage table -->
        @if (data()?.userUsage?.length) {
          <div class="mt-5 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 class="text-sm font-semibold text-slate-700">User AI Usage</h3>
              <span class="text-xs text-slate-400">Queries per user</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-100">
                    <th class="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                    <th class="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                    <th class="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Department</th>
                    <th class="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Queries</th>
                    <th class="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Usage</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  @for (u of data()!.userUsage!; track u.userId) {
                    <tr class="hover:bg-slate-50 transition-colors">
                      <td class="px-5 py-3">
                        <div class="flex items-center gap-2">
                          <div class="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <span class="text-xs font-bold text-indigo-700">{{ u.name.charAt(0) }}</span>
                          </div>
                          <span class="text-sm font-medium text-slate-700">{{ u.name }}</span>
                        </div>
                      </td>
                      <td class="px-5 py-3 text-sm text-slate-500 hidden md:table-cell">{{ u.email }}</td>
                      <td class="px-5 py-3 hidden sm:table-cell">
                        <span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{{ u.department }}</span>
                      </td>
                      <td class="px-5 py-3 text-sm font-semibold text-slate-800">{{ u.queries }}</td>
                      <td class="px-5 py-3 w-40">
                        <div class="flex items-center gap-2">
                          <div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div class="h-full bg-indigo-500 rounded-full" [style.width.%]="getUsagePercent(u.queries)"></div>
                          </div>
                          <span class="text-xs text-slate-400 w-8 text-right">{{ getUsagePercent(u.queries) }}%</span>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      }
    </div>
  `
})
export class AnalyticsComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  data = signal<AnalyticsSummary | null>(null);
  loading = signal(true);

  kpis = [
    { label: 'Total Queries', value: '1,254', change: '+20% vs last period', icon: 'query_stats', bgColor: '#ede9fe', iconColor: '#7c3aed' },
    { label: 'Unique Users', value: '48', change: '+8% vs last period', icon: 'group', bgColor: '#dcfce7', iconColor: '#16a34a' },
    { label: 'Top Documents', value: '12', change: '+3 new this period', icon: 'star', bgColor: '#fef3c7', iconColor: '#d97706' },
    { label: 'Avg Response Time', value: '2.3s', change: '-35% faster', icon: 'speed', bgColor: '#dbeafe', iconColor: '#2563eb' }
  ];

  // Line chart
  lineChartSeries = [{ name: 'Queries', data: [120, 145, 180, 160, 220, 195, 234] }];
  lineChart: ApexChart = { type: 'area', height: 220, toolbar: { show: false }, sparkline: { enabled: false } };
  lineXAxis: ApexXAxis = { categories: ['Sep 1', 'Sep 5', 'Sep 10', 'Sep 15', 'Sep 20', 'Sep 25', 'Sep 27'], labels: { style: { fontSize: '11px', colors: '#94a3b8' } }, axisBorder: { show: false }, axisTicks: { show: false } };
  lineYAxis: ApexYAxis = { labels: { style: { fontSize: '11px', colors: '#94a3b8' } } };
  lineStroke: ApexStroke = { curve: 'smooth', width: 2 };
  lineFill: ApexFill = { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.25, opacityTo: 0.01, stops: [0, 100] } };
  dataLabels: ApexDataLabels = { enabled: false };
  tooltip: ApexTooltip = { theme: 'light' };

  // Bar chart
  barSeries = [{ name: 'Queries', data: [187, 154, 132, 98, 76] }];
  barChart: ApexChart = { type: 'bar', height: 220, toolbar: { show: false } };
  barXAxis: ApexXAxis = { categories: ['HR_Policy', 'Leave_Policy', 'IT_Policy', 'Travel', 'Salary'], labels: { style: { fontSize: '11px', colors: '#94a3b8' }, rotate: -20 } };
  barPlotOptions: ApexPlotOptions = { bar: { borderRadius: 4, horizontal: false, columnWidth: '60%' } };

  // Donut chart
  donutSeries = [420, 280, 245, 180, 129];
  donutChart: ApexChart = { type: 'donut', height: 200 };
  donutLabels = ['HR', 'Finance', 'IT', 'Sales', 'Admin'];
  donutColors = ['#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#ef4444'];
  donutLegend: ApexLegend = { position: 'right', fontSize: '12px' };
  donutPlotOptions: ApexPlotOptions = { pie: { donut: { size: '65%' } } };

  getUsagePercent(queries: number): number {
    const max = Math.max(...(this.data()?.userUsage?.map(u => u.queries) ?? [1]));
    return max === 0 ? 0 : Math.round((queries / max) * 100);
  }

  ngOnInit(): void {
    this.analyticsService.getSummary().subscribe({
      next: data => {
        this.data.set(data);
        // Update KPIs from real data
        this.kpis = [
          { label: 'Total Queries', value: String(data.totalQueries ?? 0), change: '+live queries', icon: 'query_stats', bgColor: '#ede9fe', iconColor: '#7c3aed' },
          { label: 'Unique Users', value: String(data.uniqueUsers ?? 0), change: 'Active users', icon: 'group', bgColor: '#dcfce7', iconColor: '#16a34a' },
          { label: 'Top Documents', value: String(data.topDocuments ?? 0), change: 'Indexed docs', icon: 'star', bgColor: '#fef3c7', iconColor: '#d97706' },
          { label: 'Avg Response Time', value: data.avgResponseTime ?? '—', change: 'AI speed', icon: 'speed', bgColor: '#dbeafe', iconColor: '#2563eb' }
        ];
        // Update line chart with real trend data
        if (data.queryTrends?.length) {
          this.lineChartSeries = [{ name: 'Queries', data: data.queryTrends.map(t => t.queries) }];
          this.lineXAxis = { ...this.lineXAxis, categories: data.queryTrends.map(t => t.date) };
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
