import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListCalls } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, AlertTriangle, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Calls() {
  const { data: response, isLoading } = useListCalls();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Call Center</h1>
            <p className="text-muted-foreground mt-1">Monitor and review communication streams.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-card p-4 rounded-lg border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search phone numbers..." className="pl-9" />
          </div>
          <Button variant="outline"><Filter className="h-4 w-4 mr-2" /> Filters</Button>
        </div>

        <div className="rounded-md border bg-card">
          <div className="grid grid-cols-7 border-b px-4 py-3 font-medium text-sm text-muted-foreground">
            <div className="col-span-2">Number</div>
            <div>Direction</div>
            <div>Status</div>
            <div>Duration</div>
            <div>Started</div>
            <div className="text-right">Actions</div>
          </div>
          
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : response?.data && response.data.length > 0 ? (
            <div className="divide-y">
              {response.data.map((call) => (
                <div key={call.id} className="grid grid-cols-7 items-center px-4 py-3 text-sm">
                  <div className="col-span-2 font-mono flex items-center gap-2">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    {call.phoneNumber}
                    {call.isFlagged && <AlertTriangle className="h-4 w-4 text-destructive" />}
                  </div>
                  <div className="capitalize">{call.direction}</div>
                  <div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium uppercase ${
                      call.status === 'active' ? 'bg-primary/20 text-primary' : 
                      call.status === 'flagged' || call.status === 'blocked' || call.status === 'failed' ? 'bg-destructive/20 text-destructive' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {call.status}
                    </span>
                  </div>
                  <div>{call.durationSeconds ? `${Math.floor(call.durationSeconds / 60)}m ${call.durationSeconds % 60}s` : '-'}</div>
                  <div className="text-muted-foreground">{new Date(call.startedAt).toLocaleString()}</div>
                  <div className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/calls/${call.id}`}>
                        Review
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No calls found.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
