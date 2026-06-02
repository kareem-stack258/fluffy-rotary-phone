import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  useListRestrictions,
  useCreateRestriction,
  useDeleteRestriction,
  getListRestrictionsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Ban } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

const typeColors: Record<string, string> = {
  blocked_number: "bg-red-500/15 text-red-600 dark:text-red-400",
  time_limit: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  total_ban: "bg-red-700/15 text-red-700 dark:text-red-300",
  schedule_only: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
};

type FormData = {
  inmateId: string;
  type: string;
  reason: string;
  blockedNumber: string;
  dailyLimitMinutes: string;
};

export default function Restrictions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: restrictions, isLoading } = useListRestrictions();
  const create = useCreateRestriction({
    mutation: {
      onSuccess: () => {
        toast({ title: "Restriction created" });
        setOpen(false);
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListRestrictionsQueryKey() });
      },
      onError: () => toast({ title: "Failed to create restriction", variant: "destructive" }),
    },
  });
  const del = useDeleteRestriction({
    mutation: {
      onSuccess: () => {
        toast({ title: "Restriction removed", variant: "destructive" });
        queryClient.invalidateQueries({ queryKey: getListRestrictionsQueryKey() });
      },
    },
  });

  const form = useForm<FormData>({
    defaultValues: { inmateId: "", type: "blocked_number", reason: "", blockedNumber: "", dailyLimitMinutes: "" },
  });

  function onSubmit(data: FormData) {
    create.mutate({
      data: {
        inmateId: Number(data.inmateId),
        type: data.type as "blocked_number" | "time_limit" | "total_ban" | "schedule_only",
        reason: data.reason,
        blockedNumber: data.blockedNumber || undefined,
        dailyLimitMinutes: data.dailyLimitMinutes ? Number(data.dailyLimitMinutes) : undefined,
        allowedDays: [],
      },
    });
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Call Restrictions</h1>
            <p className="text-muted-foreground mt-1">Manage per-inmate communication restrictions.</p>
          </div>
          <Button onClick={() => setOpen(true)} data-testid="button-add-restriction">
            <Plus className="h-4 w-4 mr-2" />
            Add Restriction
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : !restrictions || restrictions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
              <Ban className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">No restrictions configured.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {restrictions.map((r) => (
              <Card key={r.id} data-testid={`card-restriction-${r.id}`} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={typeColors[r.type] ?? ""}>{r.type.replace(/_/g, " ")}</Badge>
                        {!r.isActive && <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>}
                        <span className="text-sm font-medium">Inmate #{r.inmateId}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 truncate">{r.reason}</p>
                      {r.blockedNumber && <p className="text-xs text-muted-foreground">Blocked: {r.blockedNumber}</p>}
                      {r.dailyLimitMinutes && <p className="text-xs text-muted-foreground">Daily limit: {r.dailyLimitMinutes} min</p>}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => del.mutate({ id: r.id })}
                    disabled={del.isPending}
                    data-testid={`button-delete-${r.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Restriction</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="inmateId"
                rules={{ required: "Inmate ID required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inmate ID</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Inmate ID" {...field} data-testid="input-inmate-id" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-type">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="blocked_number">Blocked Number</SelectItem>
                        <SelectItem value="time_limit">Time Limit</SelectItem>
                        <SelectItem value="total_ban">Total Ban</SelectItem>
                        <SelectItem value="schedule_only">Schedule Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              {form.watch("type") === "blocked_number" && (
                <FormField
                  control={form.control}
                  name="blockedNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number to Block</FormLabel>
                      <FormControl>
                        <Input placeholder="+1-555-000-0000" {...field} data-testid="input-blocked-number" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
              {form.watch("type") === "time_limit" && (
                <FormField
                  control={form.control}
                  name="dailyLimitMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Limit (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} data-testid="input-daily-limit" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="reason"
                rules={{ required: "Reason required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Input placeholder="Reason for restriction" {...field} data-testid="input-reason" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={create.isPending} data-testid="button-submit-restriction">
                  Create Restriction
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
