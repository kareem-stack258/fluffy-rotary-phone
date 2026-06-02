import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  useListAccounts,
  useDepositToAccount,
  useFreezeAccount,
  useUnfreezeAccount,
  useListAccountTransactions,
  getListAccountsQueryKey,
  getListAccountTransactionsQueryKey,
  type DepositInputPaymentMethod,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, DollarSign, Lock, Unlock, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function TransactionHistory({ accountId, open, onClose }: { accountId: number; open: boolean; onClose: () => void }) {
  const { data: txns, isLoading } = useListAccountTransactions(accountId, {
    query: { enabled: open && !!accountId, queryKey: getListAccountTransactionsQueryKey(accountId) },
  });
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[480px] max-w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Transaction History — Account #{accountId}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-2">
          {isLoading ? (
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)
          ) : !txns || txns.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No transactions found.</p>
          ) : (
            txns.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border p-3 bg-card" data-testid={`row-transaction-${t.id}`}>
                <div>
                  <p className="text-sm font-medium">{t.description}</p>
                  <p className="text-xs text-muted-foreground capitalize">{t.type.replace("_", " ")} &middot; {new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
                <p className={`text-sm font-bold ${t.type === "deposit" || t.type === "refund" ? "text-green-600" : "text-red-600"}`}>
                  {t.type === "deposit" || t.type === "refund" ? "+" : "-"}${Math.abs(Number(t.amount)).toFixed(2)}
                </p>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function Accounts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [depositTarget, setDepositTarget] = useState<{ id: number; name: string } | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositMethod, setDepositMethod] = useState("cash");
  const [txTarget, setTxTarget] = useState<number | null>(null);

  const { data: accounts, isLoading } = useListAccounts();
  const deposit = useDepositToAccount({
    mutation: {
      onSuccess: () => {
        toast({ title: "Deposit successful" });
        setDepositTarget(null);
        setDepositAmount("");
        queryClient.invalidateQueries({ queryKey: getListAccountsQueryKey() });
      },
    },
  });
  const freeze = useFreezeAccount({
    mutation: {
      onSuccess: () => {
        toast({ title: "Account frozen" });
        queryClient.invalidateQueries({ queryKey: getListAccountsQueryKey() });
      },
    },
  });
  const unfreeze = useUnfreezeAccount({
    mutation: {
      onSuccess: () => {
        toast({ title: "Account unfrozen" });
        queryClient.invalidateQueries({ queryKey: getListAccountsQueryKey() });
      },
    },
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inmate Accounts</h1>
          <p className="text-muted-foreground mt-1">Manage inmate commissary balances and transactions.</p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-52 rounded-lg" />)}
          </div>
        ) : !accounts || accounts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
              <CreditCard className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">No accounts found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((acct) => (
              <Card
                key={acct.id}
                data-testid={`card-account-${acct.id}`}
                className={`hover:border-primary/30 transition-colors ${acct.status === "frozen" ? "border-blue-500/40 opacity-80" : ""}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Inmate #{acct.inmateId}
                    </CardTitle>
                    <Badge className={
                      acct.status === "active" ? "bg-green-500/15 text-green-600 dark:text-green-400" :
                      acct.status === "frozen" ? "bg-blue-500/15 text-blue-600 dark:text-blue-400" :
                      "bg-gray-500/15 text-gray-400"
                    }>{acct.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-3xl font-bold">${Number(acct.balance).toFixed(2)}</p>
                    {Number(acct.pendingBalance) > 0 && (
                      <p className="text-xs text-muted-foreground">${Number(acct.pendingBalance).toFixed(2)} pending</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>
                      <p className="text-foreground font-medium">${Number(acct.totalDeposited).toFixed(2)}</p>
                      <p>Total deposited</p>
                    </div>
                    <div>
                      <p className="text-foreground font-medium">${Number(acct.totalSpent).toFixed(2)}</p>
                      <p>Total spent</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setDepositTarget({ id: acct.id, name: `Inmate #${acct.inmateId}` })}
                      data-testid={`button-deposit-${acct.id}`}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Deposit
                    </Button>
                    {acct.status === "frozen" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => unfreeze.mutate({ id: acct.id })}
                        disabled={unfreeze.isPending}
                        data-testid={`button-unfreeze-${acct.id}`}
                      >
                        <Unlock className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => freeze.mutate({ id: acct.id })}
                        disabled={freeze.isPending}
                        data-testid={`button-freeze-${acct.id}`}
                      >
                        <Lock className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setTxTarget(acct.id)}
                      data-testid={`button-history-${acct.id}`}
                    >
                      <DollarSign className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!depositTarget} onOpenChange={() => { setDepositTarget(null); setDepositAmount(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deposit Funds — {depositTarget?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="deposit-amount">Amount ($)</Label>
              <Input
                id="deposit-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0.00"
                data-testid="input-deposit-amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deposit-method">Payment Method</Label>
              <Select value={depositMethod} onValueChange={setDepositMethod}>
                <SelectTrigger id="deposit-method" data-testid="select-deposit-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="money_order">Money Order</SelectItem>
                  <SelectItem value="kiosk">Kiosk</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDepositTarget(null)}>Cancel</Button>
            <Button
              disabled={!depositAmount || Number(depositAmount) <= 0 || deposit.isPending}
              onClick={() => {
                if (!depositTarget) return;
                deposit.mutate({ id: depositTarget.id, data: { amount: Number(depositAmount), paymentMethod: depositMethod as DepositInputPaymentMethod } });
              }}
              data-testid="button-confirm-deposit"
            >
              Confirm Deposit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {txTarget !== null && (
        <TransactionHistory accountId={txTarget} open={true} onClose={() => setTxTarget(null)} />
      )}
    </AppLayout>
  );
}
