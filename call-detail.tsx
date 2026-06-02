import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useGetCall, getGetCallQueryKey } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function CallDetail() {
  const { id } = useParams<{ id: string }>();
  const callId = id ? parseInt(id, 10) : 0;

  const { data: call, isLoading } = useGetCall(callId, {
    query: { enabled: !!callId, queryKey: getGetCallQueryKey(callId) }
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Call Record</h1>
            <p className="text-muted-foreground mt-1">Review communication details and playback.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10">Flag Call</Button>
            {call?.status === 'active' && <Button variant="destructive">Terminate Call</Button>}
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : call ? (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Call Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Status</span>
                    <span className="font-medium capitalize">{call.status}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Direction</span>
                    <span className="font-medium capitalize">{call.direction}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Phone Number</span>
                    <span className="font-mono">{call.phoneNumber}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Duration</span>
                    <span>{call.durationSeconds ? `${Math.floor(call.durationSeconds / 60)}m ${call.durationSeconds % 60}s` : '-'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recording</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-32 border border-dashed rounded-lg">
                  <span className="text-muted-foreground">Audio playback not available.</span>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">Call not found.</div>
        )}
      </div>
    </AppLayout>
  );
}
