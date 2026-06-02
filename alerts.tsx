import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  useListAlerts,
  useGetAlertSummary,
  useResolveAlert,
  useDismissAlert,
  getListAlertsQueryKey,
  getGetAlertSummaryQueryKey,
  type ListAlertsStatus,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, AlertTriangle, ShieldAlert, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const severityColors: Record<string, string> = {
  low: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  medium: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  high: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  critical: "bg-red-500/15 text-red-600 dark:text-red-400",
};

const statusColors: Record<string, string> = {
  open: "bg-red-500/15 text-red-600 dark:text-red-400",
  investigating: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  resolved: "bg-green-500/15 text-green-600 dark:text-green-400",
  dismissed: "bg-gray-500/15 text-gray-400",
};

export default function Alerts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [resolveTarget, setResolveTarget] = useState<{ id: number; title: string } | null>(null);
  const [resolveNotes, setResolveNotes] = useState("");

  const { data: alertData, isLoading } = useListAlerts({ status: (statusFilter || undefined) as ListAlertsStatus | undefined });
  const { data: summary } = useGetAlertSummary();
  const resolve = useResolveAlert({
    mutation: {
      onSuccess: () => {
        toast({ title: "Alert resolved" });
        setResolveTarget(null);
        setResolveNotes("");
        queryClient.invalidateQueries({ queryKey: getListAlertsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAlertSummaryQueryKey() });
      },
    },
  });
  const dismiss = useDismissAlert({
    mutation: {
      onSuccess: () => {
        toast({ title: "Alert dismissed" });
        queryClient.invalidateQueries({ queryKey: getListAlertsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAlertSummaryQueryKey() });
      },
    },
  });

  const alerts = alertData?.data ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Alerts</h1>
          <p className="text-muted-foreground mt-1">Monitor and respond to security incidents.</p>
        </div>

        {summary && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Critical Open</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent><p className="text-2xl font-bold">{summary.openCritical}</p></CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Total Open</CardTitle>
                <ShieldAlert className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent><p className="text-2xl font-bold">{summary.byStatus?.open ?? 0}</p></CardContent>
            </Card>
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Investigating</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent><p className="text-2xl font-bold">{summary.byStatus?.investigating ?? 0}</p></CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Resolved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent><p className="text-2xl font-bold">{summary.byStatus?.resolved ?? 0}</p></CardContent>
            </Card>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {["open", "investigating", "resolved", "dismissed", ""].map((s) => (
            <Button
              key={s || "all"}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s)}
              data-testid={`filter-status-${s || "all"}`}
            >
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
          </div>
        ) : alerts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
              <ShieldAlert className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">No alerts found for this filter.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <Card key={alert.id} data-testid={`card-alert-${alert.id}`} className={`hover:border-primary/30 transition-colors ${alert.severity === "critical" ? "border-red-500/30" : ""}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold">{alert.title}</p>
                        <Badge className={severityColors[alert.severity] ?? ""}>{alert.severity}</Badge>
                        <Badge className={statusColors[alert.status] ?? ""}>{alert.status}</Badge>
                        <Badge variant="outline" className="text-xs capitalize">{alert.type.replace(/_/g, " ")}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Facility #{alert.facilityId}
                        {alert.inmateId && <> &middot; Inmate #{alert.inmateId}</>}
                        &nbsp;&middot; {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {(alert.status === "open" || alert.status === "investigating") && (
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600/30"
                          onClick={() => setResolveTarget({ id: alert.id, title: alert.title })}
                          data-testid={`button-resolve-${alert.id}`}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => dismiss.mutate({ id: alert.id })}
                          disabled={dismiss.isPending}
                          data-testid={`button-dismiss-${alert.id}`}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!resolveTarget} onOpenChange={() => { setResolveTarget(null); setResolveNotes(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Alert</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">Resolving: <span className="font-medium text-foreground">{resolveTarget?.title}</span></p>
            <div className="space-y-2">
              <Label htmlFor="resolve-notes">Resolution notes</Label>
              <Input
                id="resolve-notes"
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                placeholder="Describe the resolution..."
                data-testid="input-resolve-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveTarget(null)}>Cancel</Button>
            <Button
              disabled={!resolveNotes.trim() || resolve.isPending}
              onClick={() => resolveTarget && resolve.mutate({ id: resolveTarget.id, data: { notes: resolveNotes } })}
              data-testid="button-confirm-resolve"
            >
              Mark Resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
