import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  useListSchedules,
  useCreateSchedule,
  useDeleteSchedule,
  useUpdateSchedule,
  getListSchedulesQueryKey,
  type ScheduleInputDaysOfWeekItem,
  type ScheduleDaysOfWeekItem,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Calendar, Power } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_SHORT: Record<string, string> = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
  friday: "Fri", saturday: "Sat", sunday: "Sun",
};

type FormData = {
  name: string;
  inmateId: string;
  facilityId: string;
  startTime: string;
  endTime: string;
  maxDurationMinutes: string;
  daysOfWeek: string[];
};

export default function Schedules() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const { data: schedules, isLoading } = useListSchedules();
  const create = useCreateSchedule({
    mutation: {
      onSuccess: () => {
        toast({ title: "Schedule created" });
        setOpen(false);
        form.reset();
        setSelectedDays([]);
        queryClient.invalidateQueries({ queryKey: getListSchedulesQueryKey() });
      },
    },
  });
  const del = useDeleteSchedule({
    mutation: {
      onSuccess: () => {
        toast({ title: "Schedule removed" });
        queryClient.invalidateQueries({ queryKey: getListSchedulesQueryKey() });
      },
    },
  });
  const update = useUpdateSchedule({
    mutation: {
      onSuccess: () => {
        toast({ title: "Schedule updated" });
        queryClient.invalidateQueries({ queryKey: getListSchedulesQueryKey() });
      },
    },
  });

  const form = useForm<FormData>({
    defaultValues: { name: "", inmateId: "", facilityId: "", startTime: "09:00", endTime: "11:00", maxDurationMinutes: "30", daysOfWeek: [] },
  });

  const toggleDay = (d: string) => setSelectedDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  function onSubmit(data: FormData) {
    create.mutate({
      data: {
        name: data.name,
        inmateId: Number(data.inmateId),
        facilityId: Number(data.facilityId),
        startTime: data.startTime,
        endTime: data.endTime,
        maxDurationMinutes: data.maxDurationMinutes ? Number(data.maxDurationMinutes) : undefined,
        daysOfWeek: selectedDays as ScheduleInputDaysOfWeekItem[],
      },
    });
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Call Schedules</h1>
            <p className="text-muted-foreground mt-1">Define allowed call windows per inmate.</p>
          </div>
          <Button onClick={() => setOpen(true)} data-testid="button-add-schedule">
            <Plus className="h-4 w-4 mr-2" />
            Add Schedule
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
          </div>
        ) : !schedules || schedules.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
              <Calendar className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">No schedules configured.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {schedules.map((s) => (
              <Card key={s.id} data-testid={`card-schedule-${s.id}`} className={`hover:border-primary/30 transition-colors ${!s.isActive ? "opacity-60" : ""}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">{s.name}</CardTitle>
                    <Badge className={s.isActive ? "bg-green-500/15 text-green-600 dark:text-green-400" : "bg-gray-500/15 text-gray-400"}>
                      {s.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">Inmate #{s.inmateId} &middot; Facility #{s.facilityId}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{s.startTime}</span>
                    <span className="text-muted-foreground">—</span>
                    <span className="text-lg font-bold">{s.endTime}</span>
                    {s.maxDurationMinutes && <span className="text-xs text-muted-foreground">(max {s.maxDurationMinutes}min)</span>}
                  </div>
                  {s.daysOfWeek && s.daysOfWeek.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {DAYS.map((d) => (
                        <span
                          key={d}
                          className={`text-xs px-1.5 py-0.5 rounded font-medium ${s.daysOfWeek.includes(d as ScheduleDaysOfWeekItem) ? "bg-primary/20 text-primary" : "text-muted-foreground/40"}`}
                        >
                          {DAY_SHORT[d]}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => update.mutate({ id: s.id, data: { isActive: !s.isActive } })}
                      disabled={update.isPending}
                      data-testid={`button-toggle-${s.id}`}
                    >
                      <Power className="h-3.5 w-3.5 mr-1" />
                      {s.isActive ? "Disable" : "Enable"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => del.mutate({ id: s.id })}
                      disabled={del.isPending}
                      data-testid={`button-delete-${s.id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Call Schedule</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="name" rules={{ required: true }} render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Schedule Name</FormLabel>
                    <FormControl><Input placeholder="Morning call window" {...field} data-testid="input-name" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="inmateId" rules={{ required: true }} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inmate ID</FormLabel>
                    <FormControl><Input type="number" {...field} data-testid="input-inmate-id" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="facilityId" rules={{ required: true }} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facility ID</FormLabel>
                    <FormControl><Input type="number" {...field} data-testid="input-facility-id" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="startTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl><Input type="time" {...field} data-testid="input-start-time" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="endTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl><Input type="time" {...field} data-testid="input-end-time" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="maxDurationMinutes" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Max Duration (minutes)</FormLabel>
                    <FormControl><Input type="number" min="1" {...field} data-testid="input-max-duration" /></FormControl>
                  </FormItem>
                )} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Allowed Days</p>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDay(d)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${selectedDays.includes(d) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
                      data-testid={`day-${d}`}
                    >
                      {DAY_SHORT[d]}
                    </button>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={create.isPending} data-testid="button-submit">Create Schedule</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
