import { useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowUpDown, UserPlus, MapPin, Zap, ExternalLink } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Delivery, DeliveryStatus, Zone } from '@/lib/deliveries'
import { AssignRiderDialog } from './assign-rider-dialog'

interface DeliveryTableProps {
  data: Delivery[]
  statusFilter?: DeliveryStatus
  zoneFilter?: Zone
}

const statusConfig: Record<DeliveryStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
  picked_up: {
    label: 'In Transit',
    className: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
}

const zoneConfig: Record<Zone, { label: string; className: string }> = {
  Mandaue: {
    label: 'Mandaue',
    className: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  },
  Cebu_City: {
    label: 'Cebu City',
    className: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  },
  Lapu_Lapu: {
    label: 'Lapu-Lapu',
    className: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  },
}

export function DeliveryTable({ data, statusFilter, zoneFilter }: DeliveryTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Filter data based on search params
  const filteredData = useMemo(() => {
    return data.filter((delivery) => {
      if (statusFilter && delivery.status !== statusFilter) return false
      if (zoneFilter && delivery.destination.zone !== zoneFilter) return false
      return true
    })
  }, [data, statusFilter, zoneFilter])

  const columns: ColumnDef<Delivery>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="text-zinc-400 hover:text-zinc-200 -ml-3 h-8 font-mono text-xs uppercase tracking-wider"
          >
            ID
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <Link
            to="/delivery/$id"
            params={{ id: row.original.id }}
            className="font-mono text-xs text-cyan-400 hover:text-cyan-300 hover:underline inline-flex items-center gap-1 group"
          >
            {row.original.id}
            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ),
      },
      {
        accessorKey: 'source',
        header: () => (
          <span className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Source</span>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 max-w-[180px]">
            <MapPin className="h-3 w-3 text-emerald-400 shrink-0" />
            <span className="text-sm text-zinc-300 truncate" title={row.original.source.name}>
              {row.original.source.name}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'destination',
        header: () => (
          <span className="text-zinc-400 font-mono text-xs uppercase tracking-wider">
            Destination
          </span>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 max-w-[180px]">
            <MapPin className="h-3 w-3 text-rose-400 shrink-0" />
            <span className="text-sm text-zinc-300 truncate" title={row.original.destination.name}>
              {row.original.destination.name}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'zone',
        header: () => (
          <span className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Zone</span>
        ),
        cell: ({ row }) => {
          const zone = row.original.destination.zone
          const config = zoneConfig[zone]
          return (
            <Badge variant="outline" className={cn('text-xs font-medium', config.className)}>
              {config.label}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'status',
        header: () => (
          <span className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Status</span>
        ),
        cell: ({ row }) => {
          const status = row.original.status
          const config = statusConfig[status]
          return (
            <Badge variant="outline" className={cn('text-xs font-medium', config.className)}>
              {config.label}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'priority',
        header: () => (
          <span className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Priority</span>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            {row.original.priority === 'express' ? (
              <>
                <Zap className="h-3 w-3 text-amber-400 fill-amber-400" />
                <span className="text-xs text-amber-400 font-medium">Express</span>
              </>
            ) : (
              <span className="text-xs text-zinc-500">Normal</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'rider',
        header: () => (
          <span className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Rider</span>
        ),
        cell: ({ row }) => (
          <span className={cn('text-sm', row.original.rider ? 'text-zinc-300' : 'text-zinc-600')}>
            {row.original.rider || 'Unassigned'}
          </span>
        ),
      },
      {
        accessorKey: 'quote',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="text-zinc-400 hover:text-zinc-200 -ml-3 h-8 font-mono text-xs uppercase tracking-wider"
          >
            Quote
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-sm text-emerald-400 font-medium">
            ₱{row.original.quote.toLocaleString()}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => (
          <span className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Actions</span>
        ),
        cell: ({ row }) => {
          const delivery = row.original
          const canAssign = delivery.status === 'pending' && !delivery.rider

          return (
            <Button
              size="sm"
              variant="outline"
              disabled={!canAssign}
              onClick={() => {
                setSelectedDelivery(delivery)
                setDialogOpen(true)
              }}
              className={cn(
                'h-7 text-xs',
                canAssign
                  ? 'border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300'
                  : 'border-zinc-700 text-zinc-600'
              )}
            >
              <UserPlus className="h-3 w-3 mr-1" />
              Assign
            </Button>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  return (
    <>
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-zinc-800 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-10 px-3">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-3 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-zinc-500">
                  No deliveries found matching the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Table Footer */}
        <div className="border-t border-zinc-800 px-4 py-2 flex items-center justify-between text-xs text-zinc-500">
          <span>
            Showing <span className="text-zinc-300 font-medium">{filteredData.length}</span> of{' '}
            <span className="text-zinc-300 font-medium">{data.length}</span> deliveries
          </span>
          <span className="font-mono">
            Total: ₱
            <span className="text-emerald-400 font-medium">
              {filteredData.reduce((acc, d) => acc + d.quote, 0).toLocaleString()}
            </span>
          </span>
        </div>
      </div>

      <AssignRiderDialog
        delivery={selectedDelivery}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}
