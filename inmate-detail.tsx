import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useGetInmate, useGetInmateAccount, getGetInmateQueryKey, getGetInmateAccountQueryKey } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, User, Phone, MessageSquare, CreditCard, Ban } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function InmateDetail() {
  const { id } = useParams<{ id: string }>();
  const inmateId = id ? parseInt(id, 10) : 0;

  const { data: inmate, isLoading: isInmateLoading } = useGetInmate(inmateId, {
    query: { enabled: !!inmateId, queryKey: getGetInmateQueryKey(inmateId) }
  });

  const { data: account, isLoading: isAccountLoading } = useGetInmateAccount(inmateId, {
    query: { enabled: !!inmateId, queryKey: getGetInmateAccountQueryKey(inmateId) }
  });

  if (isInmateLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-3 gap-6">
            <Skeleton className="col-span-1 h-64" />
            <Skeleton className="col-span-2 h-64" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!inmate) {
    return (
      <AppLayout>
        <div className="p-8 text-center text-muted-foreground">Inmate not found.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between bg-card p-6 rounded-xl border border-border">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center border-4 border-background shadow-sm">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {inmate.lastName}, {inmate.firstName}
              </h1>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground font-mono">
                <span>ID: {inmate.inmateNumber}</span>
                <span>•</span>
                <span>DOB: {inmate.dateOfBirth}</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className={`text-[10px] px-2 py-0.5 rounded font-medium uppercase ${
                  inmate.status === 'active' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {inmate.status}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-medium uppercase ${
                  inmate.securityLevel === 'maximum' || inmate.securityLevel === 'supermax' ? 'bg-destructive/20 text-destructive' :
                  inmate.securityLevel === 'medium' ? 'bg-warning/20 text-warning' :
                  'bg-primary/20 text-primary'
                }`}>
                  {inmate.securityLevel}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0">
            <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none h-full px-4">Overview</TabsTrigger>
            <TabsTrigger value="calls" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none h-full px-4">Calls</TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none h-full px-4">Messages</TabsTrigger>
            <TabsTrigger value="contacts" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none h-full px-4">Contacts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Account Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {isAccountLoading ? (
                    <Skeleton className="h-16 w-full" />
                  ) : account ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Balance</span>
                        <span className="text-2xl font-bold">${account.balance.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-t pt-3">
                        <span className="text-muted-foreground">Status</span>
                        <span className="capitalize font-medium">{account.status}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No account data</div>
                  )}
                </CardContent>
              </Card>

              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Housing & Placement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Unit</span>
                      <span className="font-medium">{inmate.housingUnit}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Cell</span>
                      <span className="font-medium">{inmate.cell || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Admission</span>
                      <span className="font-medium">{new Date(inmate.admissionDate || '').toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Offense</span>
                      <span className="font-medium">{inmate.offense || 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="calls">
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">Call history will appear here.</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">Message history will appear here.</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts">
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">Approved contacts will appear here.</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
