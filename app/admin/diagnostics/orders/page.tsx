'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FlaskConical,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Home,
  Building2,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Truck,
  FileText,
  ArrowRight,
  Eye,
  Receipt,
  X,
} from 'lucide-react'
import { useBranch } from '@/lib/context/branch-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface OrderItem {
  id: string
  orderNumber: string
  branchName: string
  patientName: string
  patientUhid: string
  patientPhone: string
  patientGender?: string
  patientAge?: number
  status: string
  fulfillmentType: string
  collectionAddress?: string
  scheduledCollectionDate?: string
  scheduledSlot?: string
  totalInr: number
  paymentStatus: string
  paymentMode: string
  itemsCount: number
  items: Array<{
    id: string
    name: string
    code: string
    priceInr: number
    status: string
  }>
  createdAt: string
}

export default function DiagnosticOrdersPage() {
  const { selectedBranchId } = useBranch()
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState('all')
  const [fulfillmentFilter, setFulfillmentFilter] = useState('all')
  const [search, setSearch] = useState('')

  // Detail Modal / Drawer
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null)
  const [statusUpdating, setStatusUpdating] = useState(false)

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (selectedBranchId !== 'all') params.set('branchId', selectedBranchId)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (fulfillmentFilter !== 'all') params.set('fulfillment', fulfillmentFilter)
      params.set('limit', '50')

      const res = await fetch(`/api/v1/diagnostics/orders?${params.toString()}`)
      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to fetch diagnostic orders')
      }

      setOrders(json.data || [])
    } catch (err: any) {
      setError(err.message || 'Error fetching diagnostic orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [selectedBranchId, statusFilter, fulfillmentFilter])

  // Advance Order Status
  const handleUpdateStatus = async (orderId: string, nextStatus: string, note?: string) => {
    setStatusUpdating(true)
    try {
      const res = await fetch(`/api/v1/diagnostics/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, note }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to update order status')
      }

      fetchOrders()
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: nextStatus })
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setStatusUpdating(false)
    }
  }

  const filteredOrders = orders.filter((o) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.patientName.toLowerCase().includes(q) ||
      o.patientUhid.toLowerCase().includes(q) ||
      o.patientPhone.includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Diagnostic Orders</h1>
            <Badge variant="outline" className="bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 text-xs">
              {filteredOrders.length} Bookings
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Pathology order intake, home sample tracking, lab status lifecycle, and linked POS invoices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            disabled={loading}
            className="text-xs border-slate-300 dark:border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Link href="/admin/diagnostics/orders/new">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-xs shadow-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> New Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by order number (ORD-...), patient name, UHID, or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs border-slate-200 dark:border-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="placed">Placed (New)</option>
            <option value="phlebotomist_assigned">Phlebotomist Assigned</option>
            <option value="sample_collected">Sample Collected</option>
            <option value="received_at_lab">Received at Lab</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Fulfillment Filter */}
          <select
            value={fulfillmentFilter}
            onChange={(e) => setFulfillmentFilter(e.target.value)}
            className="h-9 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Fulfillment</option>
            <option value="home_collection">Home Collection (Doorstep)</option>
            <option value="center_visit">Clinic Walk-in</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-4">Order Ref</th>
                <th className="py-2.5 px-4">Patient & UHID</th>
                <th className="py-2.5 px-4">Type & Details</th>
                <th className="py-2.5 px-4">Tests Included</th>
                <th className="py-2.5 px-4">Total (₹)</th>
                <th className="py-2.5 px-4">Payment</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-purple-600" />
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No diagnostic orders found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-900 dark:text-purple-300">
                      {order.orderNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{order.patientName}</div>
                      <div className="font-mono text-[10px] text-slate-400">
                        {order.patientUhid} • {order.patientPhone}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {order.fulfillmentType === 'home_collection' ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            <Home className="w-2.5 h-2.5" /> Doorstep Pickup
                          </span>
                          {order.scheduledCollectionDate && (
                            <span className="text-[10px] text-slate-500 block font-mono">
                              {order.scheduledCollectionDate} ({order.scheduledSlot || 'Morning'})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          Walk-in Center
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                      {order.itemsCount} test{order.itemsCount > 1 ? 's' : ''}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      ₹{order.totalInr}
                    </td>

                    <td className="py-3.5 px-4">
                      {order.paymentStatus === 'paid' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Paid ({order.paymentMode})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                          Unpaid
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] capitalize ${
                          order.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : order.status === 'processing' || order.status === 'received_at_lab'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : order.status === 'sample_collected'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedOrder(order)}
                        className="h-7 text-xs border-slate-300 dark:border-slate-700 text-purple-700 dark:text-purple-400 hover:bg-purple-50"
                      >
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Order {selectedOrder.orderNumber}</h3>
                  <p className="text-[11px] text-slate-500 font-mono">Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600 text-xl font-semibold leading-none">&times;</button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              {/* Patient info */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Patient Information</span>
                <div className="font-bold text-sm text-slate-900 dark:text-white">{selectedOrder.patientName}</div>
                <p className="text-slate-600 dark:text-slate-400 font-mono">
                  UHID: {selectedOrder.patientUhid} • Mobile: {selectedOrder.patientPhone}
                </p>
                {selectedOrder.collectionAddress && (
                  <p className="text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200/50 mt-1">
                    Address: {selectedOrder.collectionAddress}
                  </p>
                )}
              </div>

              {/* Status progression quick actions */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                  Advance Order State
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {selectedOrder.status === 'placed' && (
                    <Button
                      size="sm"
                      disabled={statusUpdating}
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'phlebotomist_assigned', 'Phlebotomist dispatched for sample collection')}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8"
                    >
                      Dispatch Phlebotomist
                    </Button>
                  )}

                  {(selectedOrder.status === 'placed' || selectedOrder.status === 'phlebotomist_assigned') && (
                    <Button
                      size="sm"
                      disabled={statusUpdating}
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'sample_collected', 'Specimen collected and sealed in vial')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                    >
                      Sample Collected
                    </Button>
                  )}

                  {selectedOrder.status === 'sample_collected' && (
                    <Button
                      size="sm"
                      disabled={statusUpdating}
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'received_at_lab', 'Specimen delivered to pathology lab')}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
                    >
                      Received at Lab
                    </Button>
                  )}

                  {selectedOrder.status === 'received_at_lab' && (
                    <Button
                      size="sm"
                      disabled={statusUpdating}
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'processing', 'Specimen currently running in analyzer')}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8"
                    >
                      Start Processing
                    </Button>
                  )}

                  {selectedOrder.status === 'processing' && (
                    <Button
                      size="sm"
                      disabled={statusUpdating}
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'completed', 'Reports verified and authorized')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                    >
                      Complete & Authorize
                    </Button>
                  )}

                  {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={statusUpdating}
                      onClick={() => {
                        const reason = prompt('Cancellation reason:')
                        if (reason) handleUpdateStatus(selectedOrder.id, 'cancelled', reason)
                      }}
                      className="border-slate-200 text-slate-500 hover:text-rose-600 text-xs h-8"
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>
              </div>

              {/* Order items */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                  Tests & Diagnostic Profiles ({selectedOrder.items?.length || 0})
                </span>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  {(selectedOrder.items || []).map((it) => (
                    <div key={it.id} className="p-2.5 flex items-center justify-between bg-white dark:bg-slate-900">
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">{it.name}</span>
                        <span className="font-mono text-[10px] text-slate-400">{it.code}</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">₹{it.priceInr}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Total Billed Amount</span>
                  <div className="text-lg font-black font-mono text-purple-900 dark:text-purple-300">₹{selectedOrder.totalInr}</div>
                </div>
                <Badge variant="outline" className="text-xs uppercase">
                  {selectedOrder.paymentStatus}
                </Badge>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex justify-between">
              <Link href="/admin/billing">
                <Button size="sm" variant="outline" className="text-xs">
                  <Receipt className="w-3.5 h-3.5 mr-1" /> View Linked Invoice
                </Button>
              </Link>
              <Button size="sm" variant="outline" onClick={() => setSelectedOrder(null)} className="text-xs">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
