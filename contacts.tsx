import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  useListContacts,
  useApproveContact,
  useRejectContact,
  useRevokeContact,
  getListContactsQueryKey,
  type ListContactsStatus,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, UserX, Search, Phone, Users } from "lucide-react";
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
  rejected: "bg-red-500/15 text-red-600 dark:text-red-400",
  revoked: "bg-gray-500/15 text-gray-600 dark:text-gray-400",
};

export default function Contacts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [actionTarget, setActionTarget] = useState<{ id: number; name: string; action: "reject" | "revoke" } | null>(null);
  const [reason, setReason] = useState("");

  const { data: contacts, isLoading } = useListContacts({ status: (statusFilter || undefined) as ListContactsStatus | undefined });
  const approve = useApproveContact({
    mutation: {
      onSuccess: () => {
        toast({ title: "Contact approved" });
        queryClient.invalidateQueries({ queryKey: getListContactsQueryKey() });
      },
    },
  });
  const reject = useRejectContact({
    mutation: {
      onSuccess: () => {
        toast({ title: "Contact rejected" });
        setActionTarget(null);
        setReason("");
        queryClient.invalidateQueries({ queryKey: getListContactsQueryKey() });
      },
    },
  });
  const revoke = useRevokeContact({
    mutation: {
      onSuccess: () => {
        toast({ title: "Contact approval revoked" });
        setActionTarget(null);
        setReason("");
        queryClient.invalidateQueries({ queryKey: getListContactsQueryKey() });
      },
    },
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contact Approvals</h1>
          <p className="text-muted-foreground mt-1">Manage approved contacts for inmate communications.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["pending", "approved", "rejected", "revoked", ""].map((s) => (
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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-40 rounded-lg" />)}
          </div>
        ) : !contacts || contacts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
              <Users className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">No contacts found for this filter.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {contacts.map((c) => (
              <Card key={c.id} data-testid={`card-contact-${c.id}`} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{c.relationship}</p>
                    </div>
                    <Badge className={statusColors[c.status] ?? ""}>{c.status}</Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{c.phoneNumber}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Inmate #{c.inmateId}</p>
                  <div className="flex gap-2 pt-1">
                    {c.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="flex-1"
                          variant="outline"
                          onClick={() => approve.mutate({ id: c.id })}
                          disabled={approve.isPending}
                          data-testid={`button-approve-${c.id}`}
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          variant="outline"
                          onClick={() => setActionTarget({ id: c.id, name: `${c.firstName} ${c.lastName}`, action: "reject" })}
                          data-testid={`button-reject-${c.id}`}
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    {c.status === "approved" && (
                      <Button
                        size="sm"
                        className="flex-1"
                        variant="outline"
                        onClick={() => setActionTarget({ id: c.id, name: `${c.firstName} ${c.lastName}`, action: "revoke" })}
                        data-testid={`button-revoke-${c.id}`}
                      >
                        <UserX className="h-3.5 w-3.5 mr-1" />
                        Revoke
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!actionTarget} onOpenChange={() => { setActionTarget(null); setReason(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionTarget?.action === "reject" ? "Reject Contact" : "Revoke Contact Approval"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              {actionTarget?.action === "reject" ? "Rejecting" : "Revoking"}: <span className="font-medium text-foreground">{actionTarget?.name}</span>
            </p>
            <div className="space-y-2">
              <Label htmlFor="action-reason">Reason</Label>
              <Input
                id="action-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason..."
                data-testid="input-action-reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={!reason.trim() || reject.isPending || revoke.isPending}
              onClick={() => {
                if (!actionTarget) return;
                if (actionTarget.action === "reject") {
                  reject.mutate({ id: actionTarget.id, data: { reason } });
                } else {
                  revoke.mutate({ id: actionTarget.id, data: { reason } });
                }
              }}
              data-testid="button-confirm-action"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
