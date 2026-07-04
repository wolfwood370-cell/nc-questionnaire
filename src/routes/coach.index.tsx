import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtDateTime, STATUS_LABEL, type StatusValue } from "@/lib/coach-labels";

export const Route = createFileRoute("/coach/")({
  ssr: false,
  component: CoachListPage,
});

type Row = {
  id: string;
  created_at: string;
  status: StatusValue;
  full_name: string | null;
  email: string | null;
  main_goal: string | null;
};

function StatusBadge({ status }: { status: StatusValue }) {
  const classes: Record<StatusValue, string> = {
    new: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    reviewed: "bg-green-100 text-green-800 hover:bg-green-100",
    archived: "bg-gray-200 text-gray-700 hover:bg-gray-200",
  };
  return <Badge className={classes[status]}>{STATUS_LABEL[status]}</Badge>;
}

function truncate(s: string | null, n = 80): string {
  if (!s) return "—";
  const t = s.trim();
  if (t.length <= n) return t || "—";
  return t.slice(0, n) + "…";
}

function CoachListPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<"all" | StatusValue>("all");
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["coach", "submissions"],
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase
        .from("submissions")
        .select("id, created_at, status, full_name, email, main_goal")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const filtered = useMemo(() => {
    const rows = data ?? [];
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (q && !(r.full_name ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [data, statusFilter, search]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Questionari ricevuti</h1>
        <p className="text-sm text-muted-foreground">
          Elenco delle risposte al questionario d'ingresso.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Cerca per nome…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as "all" | StatusValue)}
        >
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Filtra per stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti</SelectItem>
            <SelectItem value="new">Nuovi</SelectItem>
            <SelectItem value="reviewed">Visti</SelectItem>
            <SelectItem value="archived">Archiviati</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Data invio</TableHead>
              <TableHead>Obiettivo</TableHead>
              <TableHead>Stato</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  Impossibile caricare l'elenco. Riprova più tardi.
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  Nessun questionario.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow
                  key={r.id}
                  className="cursor-pointer"
                  onClick={() => navigate({ to: "/coach/$id", params: { id: r.id } })}
                >
                  <TableCell className="font-medium">{r.full_name || "—"}</TableCell>
                  <TableCell>{r.email || "—"}</TableCell>
                  <TableCell className="whitespace-nowrap">{fmtDateTime(r.created_at)}</TableCell>
                  <TableCell className="max-w-md">{truncate(r.main_goal)}</TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
