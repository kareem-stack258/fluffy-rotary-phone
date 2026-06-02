import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListInmates } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, ShieldAlert, FileText } from "lucide-react";
import { Link } from "wouter";

export default function Inmates() {
  const { data: response, isLoading } = useListInmates();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inmate Directory</h1>
            <p className="text-muted-foreground mt-1">Search and manage inmate profiles.</p>
          </div>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Register Inmate
          </Button>
        </div>

        <div className="flex items-center gap-4 bg-card p-4 rounded-lg border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or ID..." className="pl-9" />
          </div>
          <Button variant="outline">Filters</Button>
        </div>

        <div className="rounded-md border bg-card">
          <div className="grid grid-cols-6 border-b px-4 py-3 font-medium text-sm text-muted-foreground">
            <div className="col-span-2">Name</div>
            <div>Inmate ID</div>
            <div>Security Level</div>
            <div>Housing Unit</div>
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
              {response.data.map((inmate) => (
                <div key={inmate.id} className="grid grid-cols-6 items-center px-4 py-3 text-sm">
                  <div className="col-span-2 font-medium">
                    {inmate.lastName}, {inmate.firstName}
                  </div>
                  <div className="font-mono text-muted-foreground">
                    {inmate.inmateNumber}
                  </div>
                  <div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium uppercase ${
                      inmate.securityLevel === 'maximum' || inmate.securityLevel === 'supermax' ? 'bg-destructive/20 text-destructive' :
                      inmate.securityLevel === 'medium' ? 'bg-warning/20 text-warning' :
                      'bg-primary/20 text-primary'
                    }`}>
                      {inmate.securityLevel}
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    {inmate.housingUnit} {inmate.cell ? `- ${inmate.cell}` : ''}
                  </div>
                  <div className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/inmates/${inmate.id}`}>
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No inmates found.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
