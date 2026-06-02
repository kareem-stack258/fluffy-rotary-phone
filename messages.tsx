import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  useListMessages,
  useApproveMessage,
  useRejectMessage,
  useFlagMessage,
  getListMessagesQueryKey,
  type ListMessagesStatus,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Flag, Search, Clock, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  approved: "bg-green-500/15 text-green-600 dark:text-green-400",
  delivered: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  rejected: "bg-red-500/15 text-red-600 dark:text-red-400",
  flagged: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
};

export default function Messages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [rejectTarget, setRejectTarget] = useState<{ id: number; subject: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: msgData, isLoading } = useListMessages({ status: (statusFilter || undefined) as ListMessagesStatus | undefined });
  const approve = useApproveMessage({
    mutation: {
      onSuccess: () => {
        toast({ title: "Message approved" });
        queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey() });
      },
    },
  });
  const reject = useRejectMessage({
    mutation: {
      onSuccess: () => {
        toast({ title: "Message rejected" });
        setRejectTarget(null);
        setRejectReason("");
        queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey() });
      },
    },
  });
  const flag = useFlagMessage({
    mutation: {
      onSuccess: () => {
        toast({ title: "Message flagged for review" });
        queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey() });
      },
    },
  });

  const messages = msgData?.data ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Message Queue</h1>
            <p className="text-muted-foreground mt-1">Review and manage inmate correspondence.</p>
          </div>
          {msgData && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border rounded-lg px-3 py-2">
              <Clock className="h-4 w-4" />
              <span>{msgData.total} total</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["pending", "approved", "rejected", "flagged", "delivered", ""].map((s) => (
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
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}
          </div>
        ) : messages.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
              <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">No messages found for this filter.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <Card key={msg.id} data-testid={`card-message-${msg.id}`} className="transition-colors hover:border-primary/30">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-base font-semibold">{msg.subject}</CardTitle>
                        <Badge className={statusColors[msg.status] ?? ""}>{msg.status}</Badge>
                        {msg.isFlagged && <Badge className="bg-red-500/15 text-red-600 dark:text-red-400">Flagged</Badge>}
                        <Badge variant="outline" className="text-xs">{msg.direction}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        From: <span className="font-medium">{msg.senderName}</span> &rarr; To: <span className="font-medium">{msg.recipientName}</span>
                        {" "}&mdash; Inmate #{msg.inmateId} &middot; {msg.wordCount} words
                      </p>
                    </div>
                    {msg.status === "pending" && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600/30 hover:bg-green-50 dark:hover:bg-green-900/20"
                          onClick={() => approve.mutate({ id: msg.id })}
                          disabled={approve.isPending}
                          data-testid={`button-approve-${msg.id}`}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600/30 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => setRejectTarget({ id: msg.id, subject: msg.subject })}
                          data-testid={`button-reject-${msg.id}`}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-orange-600 border-orange-600/30"
                          onClick={() => flag.mutate({ id: msg.id, data: { reason: "Manual flag by staff" } })}
                          disabled={flag.isPending}
                          data-testid={`button-flag-${msg.id}`}
                        >
                          <Flag className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2 bg-muted/40 rounded-md p-3">{msg.body}</p>
                  <p className="text-xs text-muted-foreground mt-2">{new Date(msg.createdAt).toLocaleString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!rejectTarget} onOpenChange={() => { setRejectTarget(null); setRejectReason(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">Rejecting: <span className="font-medium text-foreground">{rejectTarget?.subject}</span></p>
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Reason for rejection</Label>
              <Input
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason..."
                data-testid="input-reject-reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={!rejectReason.trim() || reject.isPending}
              onClick={() => rejectTarget && reject.mutate({ id: rejectTarget.id, data: { reason: rejectReason } })}
              data-testid="button-confirm-reject"
            >
              Reject Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
