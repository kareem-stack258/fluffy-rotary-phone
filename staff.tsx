import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  useListStaff,
  useCreateStaff,
  useUpdateStaff,
  useDeleteStaff,
  getListStaffQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ShieldCheck, Search, UserCog } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const roleColors: Record<string, string> = {
  admin: "bg-red-500/15 text-red-600 dark:text-red-400",
  supervisor: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  officer: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  analyst: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  operator: "bg-green-500/15 text-green-600 dark:text-green-400",
};

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  facilityId: string;
  role: string;
  department: string;
  shift: string;
};

export default function Staff() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: staff, isLoading } = useListStaff();
  const create = useCreateStaff({
    mutation: {
      onSuccess: () => {
        toast({ title: "Staff member created" });
        setOpen(false);
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListStaffQueryKey() });
      },
      onError: () => toast({ title: "Failed to create staff member", variant: "destructive" }),
    },
  });
  const update = useUpdateStaff({
    mutation: {
      onSuccess: () => {
        toast({ title: "Staff member updated" });
        queryClient.invalidateQueries({ queryKey: getListStaffQueryKey() });
      },
    },
  });
  const del = useDeleteStaff({
    mutation: {
      onSuccess: () => {
        toast({ title: "Staff member removed" });
        queryClient.invalidateQueries({ queryKey: getListStaffQueryKey() });
      },
    },
  });

  const form = useForm<FormData>({
    defaultValues: { firstName: "", lastName: "", email: "", employeeId: "", facilityId: "", role: "officer", department: "", shift: "day" },
  });

  const filtered = (staff ?? []).filter(s =>
    !search || `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.employeeId.toLowerCase().includes(search.toLowerCase())
  );

  function onSubmit(data: FormData) {
    create.mutate({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        employeeId: data.employeeId,
        facilityId: Number(data.facilityId),
        role: data.role as "admin" | "supervisor" | "officer" | "analyst" | "operator",
        department: data.department || undefined,
        shift: data.shift as "day" | "evening" | "night",
        permissions: [],
      },
    });
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Staff Directory</h1>
            <p className="text-muted-foreground mt-1">Manage facility personnel and access roles.</p>
          </div>
          <Button onClick={() => setOpen(true)} data-testid="button-add-staff">
            <Plus className="h-4 w-4 mr-2" />
            Add Staff
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or employee ID..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search"
          />
        </div>

        <div className="rounded-md border bg-card">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] border-b px-4 py-3 text-sm font-medium text-muted-foreground uppercase tracking-wider gap-4">
            <div>Name / Email</div>
            <div className="w-24 text-center">Role</div>
            <div className="w-24 text-center">Shift</div>
            <div className="w-20 text-center">Status</div>
            <div className="w-16" />
          </div>

          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <UserCog className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">{search ? "No results found." : "No staff members."}</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((s) => (
                <div
                  key={s.id}
                  className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center px-4 py-3 hover:bg-muted/30 transition-colors gap-4"
                  data-testid={`row-staff-${s.id}`}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{s.firstName} {s.lastName}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.email} &middot; {s.employeeId}</p>
                  </div>
                  <div className="w-24 flex justify-center">
                    <Badge className={`text-xs ${roleColors[s.role] ?? ""}`}>{s.role}</Badge>
                  </div>
                  <div className="w-24 flex justify-center">
                    {s.shift && (
                      <span className="text-xs capitalize text-muted-foreground">{s.shift}</span>
                    )}
                  </div>
                  <div className="w-20 flex justify-center">
                    <Badge className={s.status === "active" ? "bg-green-500/15 text-green-600 dark:text-green-400" : "bg-gray-500/15 text-gray-400"}>
                      {s.status}
                    </Badge>
                  </div>
                  <div className="w-16 flex items-center justify-end gap-1">
                    {s.status === "active" ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => update.mutate({ id: s.id, data: { status: "inactive" } })}
                        disabled={update.isPending}
                        data-testid={`button-deactivate-${s.id}`}
                      >
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => update.mutate({ id: s.id, data: { status: "active" } })}
                        disabled={update.isPending}
                        data-testid={`button-activate-${s.id}`}
                      >
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => del.mutate({ id: s.id })}
                      disabled={del.isPending}
                      data-testid={`button-delete-${s.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="firstName" rules={{ required: true }} render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl><Input {...field} data-testid="input-first-name" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="lastName" rules={{ required: true }} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl><Input {...field} data-testid="input-last-name" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" rules={{ required: true }} render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" {...field} data-testid="input-email" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="employeeId" rules={{ required: true }} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee ID</FormLabel>
                    <FormControl><Input {...field} data-testid="input-employee-id" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="facilityId" rules={{ required: true }} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facility ID</FormLabel>
                    <FormControl><Input type="number" {...field} data-testid="input-facility-id" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="role" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-role"><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="officer">Officer</SelectItem>
                        <SelectItem value="analyst">Analyst</SelectItem>
                        <SelectItem value="operator">Operator</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={form.control} name="shift" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shift</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-shift"><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="evening">Evening</SelectItem>
                        <SelectItem value="night">Night</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={form.control} name="department" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Department</FormLabel>
                    <FormControl><Input placeholder="e.g. Communications, Security" {...field} data-testid="input-department" /></FormControl>
                  </FormItem>
                )} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={create.isPending} data-testid="button-submit">Add Staff</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
