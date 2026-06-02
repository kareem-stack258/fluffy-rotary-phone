import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  useGetDashboardReport, 
  useGetCallVolumeReport, 
  getGetDashboardReportQueryKey, 
  getGetCallVolumeReportQueryKey 
} from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, PhoneCall, ShieldAlert, Activity, BarChart3, Clock, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function Dashboard() {
  const { data: dashboard, isLoading: isDashboardLoading } = useGetDashboardReport();
  const { data: volumeReport, isLoading: isVolumeLoading } = useGetCallVolumeReport();

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Status</h1>
            <p className="text-muted-foreground mt-1">Real-time telecommunications monitoring overview.</p>
          </div>
        </div>

        {isDashboardLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : dashboard ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Active Calls</CardTitle>
                <PhoneCall className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dashboard.activeCallsNow}</div>
                <p className="text-xs text-muted-foreground mt-1">{dashboard.totalCallsToday} total today</p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-destructive">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Security Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dashboard.openAlerts}</div>
                <p className="text-xs text-muted-foreground mt-1">Requires immediate review</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-chart-3">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Pending Approvals</CardTitle>
                <ShieldAlert className="h-4 w-4 text-chart-3" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dashboard.pendingApprovals}</div>
                <p className="text-xs text-muted-foreground mt-1">Contacts and messages</p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-chart-4">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Est. Revenue Today</CardTitle>
                <DollarSign className="h-4 w-4 text-chart-4" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${dashboard.totalRevenue?.toFixed(2) || '0.00'}</div>
                <p className="text-xs text-muted-foreground mt-1">Across all facilities</p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-7">
          <Card className="md:col-span-4 lg:col-span-5">
            <CardHeader>
              <CardTitle>Call Volume (Last 24 Hours)</CardTitle>
              <CardDescription>System-wide call minute utilization</CardDescription>
            </CardHeader>
            <CardContent>
              {isVolumeLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : volumeReport && volumeReport.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={volumeReport} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="timestamp" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => new Date(value).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                        labelFormatter={(label) => new Date(label).toLocaleString()}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="calls" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorCalls)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[300px] items-center justify-center border border-dashed rounded-lg">
                  <span className="text-muted-foreground">No call volume data available.</span>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="md:col-span-3 lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>Latest system flags</CardDescription>
            </CardHeader>
            <CardContent>
              {isDashboardLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : dashboard?.recentActivity && dashboard.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {dashboard.recentActivity.slice(0, 5).map(event => (
                    <div key={event.id} className="flex flex-col gap-1 p-3 rounded-lg border bg-muted/40">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold truncate">{event.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium uppercase bg-primary/20 text-primary capitalize">
                          {event.type.replace("_", " ")}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground truncate">{event.description}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-[200px] items-center justify-center">
                  <span className="text-muted-foreground text-sm">No recent alerts.</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
