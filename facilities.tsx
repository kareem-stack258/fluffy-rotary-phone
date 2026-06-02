import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListFacilities } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building, MapPin, Users, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Facilities() {
  const { data: facilities, isLoading } = useListFacilities();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Facilities</h1>
            <p className="text-muted-foreground mt-1">Manage prison facilities and settings.</p>
          </div>
          <Button>Add Facility</Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {facilities?.map((facility) => (
              <Card key={facility.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{facility.name}</CardTitle>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium uppercase ${
                      facility.status === 'active' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {facility.status}
                    </span>
                  </div>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {facility.city}, {facility.state}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" /> Population
                      </span>
                      <span className="font-medium mt-1">{facility.currentPopulation} / {facility.capacity}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Building className="h-3 w-3" /> Type
                      </span>
                      <span className="font-medium mt-1 capitalize">{facility.type}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
