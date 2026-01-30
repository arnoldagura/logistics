import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-800 hover:bg-transparent">
            <TableHead className="text-zinc-400 font-mono text-xs uppercase tracking-wider">ID</TableHead>
            <TableHead className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Source</TableHead>
            <TableHead className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Destination</TableHead>
            <TableHead className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Zone</TableHead>
            <TableHead className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Status</TableHead>
            <TableHead className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Rider</TableHead>
            <TableHead className="text-zinc-400 font-mono text-xs uppercase tracking-wider text-right">Quote</TableHead>
            <TableHead className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRow key={i} className="border-zinc-800/50 hover:bg-zinc-800/30">
              <TableCell>
                <Skeleton className="h-4 w-20 bg-zinc-800" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32 bg-zinc-800" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32 bg-zinc-800" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16 rounded-full bg-zinc-800" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20 rounded-full bg-zinc-800" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24 bg-zinc-800" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-4 w-16 ml-auto bg-zinc-800" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-20 rounded bg-zinc-800" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
