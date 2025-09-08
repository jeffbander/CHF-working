'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PatientDashboard } from '@/types/clinical';
import { Users, Phone, TrendingUp, AlertTriangle, Activity, CheckCircle } from 'lucide-react';

interface DashboardOverviewProps {
  dashboard: PatientDashboard;
}

export function DashboardOverview({ dashboard }: DashboardOverviewProps) {
  const successRate = Math.round((dashboard.todaysMetrics.callsCompleted / dashboard.todaysMetrics.callsScheduled) * 100);
  
  const riskPercentages = {
    low: Math.round((dashboard.riskDistribution.low / dashboard.totalPatients) * 100),
    medium: Math.round((dashboard.riskDistribution.medium / dashboard.totalPatients) * 100),
    high: Math.round((dashboard.riskDistribution.high / dashboard.totalPatients) * 100),
    critical: Math.round((dashboard.riskDistribution.critical / dashboard.totalPatients) * 100)
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Patients */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboard.totalPatients}</div>
          <p className="text-xs text-muted-foreground">
            Active monitoring programs
          </p>
        </CardContent>
      </Card>

      {/* Call Success Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Call Success Rate</CardTitle>
          <Phone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{successRate}%</div>
          <div className="mt-2 space-y-1">
            <div className="text-xs text-muted-foreground">
              {dashboard.todaysMetrics.callsCompleted} of {dashboard.todaysMetrics.callsScheduled} completed
            </div>
            <Progress value={successRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Average Risk Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Risk Score</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboard.todaysMetrics.avgRiskScore}</div>
          <p className="text-xs text-muted-foreground">
            Population health metric
          </p>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {dashboard.todaysMetrics.alertsGenerated}
          </div>
          <p className="text-xs text-muted-foreground">
            Requiring immediate attention
          </p>
        </CardContent>
      </Card>

      {/* Risk Distribution */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Risk Distribution
          </CardTitle>
          <CardDescription>
            Current patient risk levels across your panel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Critical Risk */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Critical Risk</span>
              </div>
              <span className="font-medium">
                {dashboard.riskDistribution.critical} ({riskPercentages.critical}%)
              </span>
            </div>
            <Progress value={riskPercentages.critical} className="h-2" />
          </div>

          {/* High Risk */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>High Risk</span>
              </div>
              <span className="font-medium">
                {dashboard.riskDistribution.high} ({riskPercentages.high}%)
              </span>
            </div>
            <Progress value={riskPercentages.high} className="h-2" />
          </div>

          {/* Medium Risk */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span>Medium Risk</span>
              </div>
              <span className="font-medium">
                {dashboard.riskDistribution.medium} ({riskPercentages.medium}%)
              </span>
            </div>
            <Progress value={riskPercentages.medium} className="h-2" />
          </div>

          {/* Low Risk */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Low Risk</span>
              </div>
              <span className="font-medium">
                {dashboard.riskDistribution.low} ({riskPercentages.low}%)
              </span>
            </div>
            <Progress value={riskPercentages.low} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Today's Activity */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Today&apos;s Activity
          </CardTitle>
          <CardDescription>
            Summary of monitoring activities and outcomes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {dashboard.todaysMetrics.callsCompleted}
              </div>
              <p className="text-sm text-blue-800">Calls Completed</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {successRate}%
              </div>
              <p className="text-sm text-green-800">Success Rate</p>
            </div>
            
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">
                {dashboard.todaysMetrics.avgRiskScore}
              </div>
              <p className="text-sm text-amber-800">Avg Risk Score</p>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {dashboard.todaysMetrics.alertsGenerated}
              </div>
              <p className="text-sm text-red-800">Alerts Generated</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}