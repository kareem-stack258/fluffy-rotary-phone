import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  useListRecordings,
  useUpdateRecording,
  useDeleteRecording,
  getListRecordingsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Trash2, Play, Mic, Filter } from "lucide-react";

const statusColors: Record<string, string> = {
  processing: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
  available: "bg-green-500/15 text-green-600 dark:text-green-400",
  archived: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  deleted: "bg-gray-500/15 text-gray-400",
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Recordings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reviewedFilter, setReviewedFilter] = useState<boolean | undefined>(false);

  const { data: recData, isLoading } = useListRecordings(
    { reviewed: reviewedFilter } as { reviewed?: boolean },
  );
  const update = useUpdateRecording({
    mutation: {
      onSuccess: () => {
        toast({ title: "Recording marked as reviewed" });
        queryClient.invalidateQueries({ queryKey: getListRecordingsQueryKey() });
      },
    },
  });
  const del = useDeleteRecording({
    mutation: {
      onSuccess: () => {
        toast({ title: "Recording deleted", variant: "destructive" });
        queryClient.invalidateQueries({ queryKey: getListRecordingsQueryKey() });
      },
    },
  });

  const recordings = recData?.data ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Call Recordings</h1>
          <p className="text-muted-foreground mt-1">Review and manage captured call recordings.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={reviewedFilter === false ? "default" : "outline"}
            size="sm"
            onClick={() => setReviewedFilter(false)}
            data-testid="filter-unreviewed"
          >
            Unreviewed
          </Button>
          <Button
            variant={reviewedFilter === true ? "default" : "outline"}
            size="sm"
            onClick={() => setReviewedFilter(true)}
            data-testid="filter-reviewed"
          >
            Reviewed
          </Button>
          <Button
            variant={reviewedFilter === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => setReviewedFilter(undefined)}
            data-testid="filter-all"
          >
            All
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
          </div>
        ) : recordings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
              <Mic className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">No recordings found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recordings.map((rec) => (
              <Card key={rec.id} data-testid={`card-recording-${rec.id}`} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold text-sm">Call #{rec.callId}</p>
                      <p className="text-xs text-muted-foreground">Inmate #{rec.inmateId}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <Badge className={statusColors[rec.status] ?? ""}>{rec.status}</Badge>
                      {rec.isReviewed && <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 text-xs">Reviewed</Badge>}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-muted/40 rounded p-2">
                      <p className="font-semibold text-sm">{formatDuration(rec.durationSeconds)}</p>
                      <p className="text-muted-foreground">Duration</p>
                    </div>
                    <div className="bg-muted/40 rounded p-2">
                      <p className="font-semibold text-sm">{formatBytes(rec.fileSizeBytes)}</p>
                      <p className="text-muted-foreground">Size</p>
                    </div>
                    <div className="bg-muted/40 rounded p-2">
                      <p className="font-semibold text-sm uppercase">{rec.format}</p>
                      <p className="text-muted-foreground">Format</p>
                    </div>
                  </div>

                  {rec.reviewNotes && (
                    <p className="text-xs text-muted-foreground italic bg-muted/40 rounded p-2">{rec.reviewNotes}</p>
                  )}

                  <div className="flex gap-2">
                    {!rec.isReviewed && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-green-600 border-green-600/30"
                        onClick={() => update.mutate({ id: rec.id, data: { isReviewed: true, reviewNotes: "Reviewed" } })}
                        disabled={update.isPending}
                        data-testid={`button-review-${rec.id}`}
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Mark Reviewed
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => del.mutate({ id: rec.id })}
                      disabled={del.isPending}
                      data-testid={`button-delete-${rec.id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">{new Date(rec.createdAt).toLocaleString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
