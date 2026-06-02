import { AppLayout } from "@/components/layout/AppLayout";
import {
  useGetCallVolumeReport,
  useGetRevenueReport,
  useGetTopCallers,
  useGetFlaggedSummary,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line } from "recharts";
import { TrendingUp, PhoneCall, Flag, Users, DollarSign } from "lucide-react";

export default function Reports() {
  const { data: callVolume, isLoading: cvLoading } = useGetCallVolumeReport({ dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] } as { dateFrom?: string });
  const { data: revenue, isLoading: revLoading } = useGetRevenueReport({ dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] } as { dateFrom?: string });
  const { data: topCallers, isLoading: tcLoading } = useGetTopCallers({ limit: 10 } as { limit?: number });
  const { data: flagged } = useGetFlaggedSummary();

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
          <p className="text-muted-foreground mt-1">30-day performance and security overview.</p>
        </div>

        {flagged && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-2 space-y-0 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Flagged Calls</CardTitle>
                <Flag className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent><p className="text-2xl font-bold">{flagged.flaggedCalls}</p></CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-2 space-y-0 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Flagged Msgs</CardTitle>
                <Flag className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent><p className="text-2xl font-bold">{flagged.flaggedMessages}</p></CardContent>
            </Card>
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="pb-2 space-y-0 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Open Alerts</CardTitle>
                <PhoneCall className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent><p className="text-2xl font-bold">{flagged.openAlerts}</p></CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2 space-y-0 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Resolved</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent><p className="text-2xl font-bold">{flagged.resolvedAlerts}</p></CardContent>
            </Card>
            <Card className="border-l-4 border-l-destructive">
              <CardHeader className="pb-2 space-y-0 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Critical</CardTitle>
                <Flag className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent><p className="text-2xl font-bold">{flagged.criticalAlerts}</p></CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Call Volume (30 Days)</CardTitle>
              <CardDescription>Daily total calls across all facilities</CardDescription>
            </CardHeader>
            <CardContent>
              {cvLoading ? <Skeleton className="h-[280px] w-full" /> : callVolume && callVolume.length > 0 ? (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={callVolume} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false}
                        tickFormatter={(d) => new Date(d).toLocaleDateString([], { month: "short", day: "numeric" })} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "var(--radius)" }} />
                      <Bar dataKey="totalCalls" name="Total Calls" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="flaggedCalls" name="Flagged" fill="hsl(var(--destructive))" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[280px] items-center justify-center border border-dashed rounded-lg">
                  <p className="text-muted-foreground text-sm">No data available.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend (30 Days)</CardTitle>
              <CardDescription>Daily revenue from calls and messages</CardDescription>
            </CardHeader>
            <CardContent>
              {revLoading ? <Skeleton className="h-[280px] w-full" /> : revenue && revenue.length > 0 ? (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenue} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false}
                        tickFormatter={(d) => new Date(d).toLocaleDateString([], { month: "short", day: "numeric" })} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false}
                        tickFormatter={(v) => `$${v}`} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "var(--radius)" }}
                        formatter={(v: number) => [`$${v.toFixed(2)}`, ""]} />
                      <Area type="monotone" dataKey="totalRevenue" name="Revenue" stroke="hsl(var(--chart-2))" strokeWidth={2} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[280px] items-center justify-center border border-dashed rounded-lg">
                  <p className="text-muted-foreground text-sm">No data available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top Callers</CardTitle>
            <CardDescription>Inmates ranked by total call volume</CardDescription>
          </CardHeader>
          <CardContent>
            {tcLoading ? (
              <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : !topCallers || topCallers.length === 0 ? (
              <div className="flex h-32 items-center justify-center">
                <p className="text-muted-foreground text-sm">No caller data available.</p>
              </div>
            ) : (
              <div className="space-y-0 divide-y">
                {topCallers.map((c, idx) => (
                  <div key={c.inmateId} className="flex items-center gap-4 py-3 hover:bg-muted/20" data-testid={`row-caller-${c.inmateId}`}>
                    <span className="text-lg font-bold text-muted-foreground/40 w-8">#{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-muted-foreground">{c.inmateNumber} &middot; {c.facilityName}</p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className="text-sm font-bold">{c.totalCalls} calls</p>
                      <p className="text-xs text-muted-foreground">{c.totalMinutes.toFixed(0)}min &middot; ${c.totalSpent.toFixed(2)}</p>
                    </div>
                    {(c.flaggedCalls ?? 0) > 0 && (
                      <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 text-xs">{c.flaggedCalls} flagged</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
