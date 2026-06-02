import { AppLayout } from "@/components/layout/AppLayout";
import { useListTransactions, useGetTransactionSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, ArrowDownLeft, ArrowUpRight, Receipt } from "lucide-react";

const typeColors: Record<string, string> = {
  deposit: "bg-green-500/15 text-green-600 dark:text-green-400",
  call_charge: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  message_charge: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  refund: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
  adjustment: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  fee: "bg-red-500/15 text-red-600 dark:text-red-400",
};

const isCredit = (type: string) => type === "deposit" || type === "refund";

export default function Transactions() {
  const { data: txData, isLoading } = useListTransactions({ limit: 50 } as { limit?: number });
  const { data: summary } = useGetTransactionSummary();

  const transactions = txData?.data ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaction Ledger</h1>
          <p className="text-muted-foreground mt-1">Full financial history across all inmate accounts.</p>
        </div>

        {summary && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Total Deposits</CardTitle>
                <ArrowDownLeft className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${Number(summary.totalDeposits).toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Call Revenue</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${Number(summary.totalCallCharges).toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Msg Revenue</CardTitle>
                <Receipt className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${Number(summary.totalMessageCharges).toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Net Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${Number(summary.netRevenue).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">{summary.transactionCount} transactions</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-[1fr_auto_auto_auto] border-b px-5 py-3 text-sm font-medium text-muted-foreground uppercase tracking-wider gap-4">
              <div>Description</div>
              <div className="text-right w-32">Type</div>
              <div className="text-right w-28">Amount</div>
              <div className="text-right w-36">Date</div>
            </div>
            {isLoading ? (
              <div className="p-5 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <DollarSign className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-muted-foreground">No transactions found.</p>
              </div>
            ) : (
              <div className="divide-y">
                {transactions.map((t) => (
                  <div
                    key={t.id}
                    className="grid grid-cols-[1fr_auto_auto_auto] items-center px-5 py-3 hover:bg-muted/30 transition-colors gap-4"
                    data-testid={`row-transaction-${t.id}`}
                  >
                    <div>
                      <p className="text-sm font-medium">{t.description}</p>
                      <p className="text-xs text-muted-foreground">Account #{t.accountId}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={`text-xs ${typeColors[t.type] ?? ""}`}>
                        {t.type.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <div className={`text-right text-sm font-bold w-28 ${isCredit(t.type) ? "text-green-600" : "text-red-600"}`}>
                      {isCredit(t.type) ? "+" : "-"}${Math.abs(Number(t.amount)).toFixed(2)}
                    </div>
                    <div className="text-right text-xs text-muted-foreground w-36">
                      {new Date(t.createdAt).toLocaleString()}
                    </div>
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
