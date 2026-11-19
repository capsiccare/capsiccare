'use client'

import React, { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import {
  Home,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  Truck,
  FlaskConical,
  Filter,
  Search,
  RefreshCw,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  Navigation,
  FileText
} from 'lucide-react'

interface HomeCollectionItem {
  id: string
  orderNumber: string
  branchId: string
  branchName: string
  patientId: string
  patientName: string
  patientUhid: string
  patientPhone: string
  status: string
  address: string
  landmark?: string
  pincode?: string
  scheduledDate: string
  scheduledSlot: string
  assignedPhlebotomistId?: string
  totalInr: number
  collectionFeeInr: number
  paymentStatus: string
  specialInstructions?: string
  itemsCount: number
  tests: string[]
}

interface Phlebotomist {
  id: string
  name: string
  email: string
  phone: string
  roles: string[]
}

export default function HomeCollectionPage() {
  const [collections, setCollections] = useState<HomeCollectionItem[]>([])
  const [phlebotomists, setPhlebotomists] = useState<Phlebotomist[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState(() => new Date().toISOString().split('T')[0])
  
  // Modal states
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<HomeCollectionItem | null>(null)
  const [selectedPhlebotomistId, setSelectedPhlebotomistId] = useState('')
  const [assignNotes, setAssignNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchCollections = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (dateFilter) params.append('date', dateFilter)

      const [collRes, phlebRes] = await Promise.all([
        fetch(`/api/v1/diagnostics/home-collection?${params.toString()}`),
        fetch(`/api/v1/diagnostics/dispatch`),
      ])

      const collData = await collRes.json()
      const phlebData = await phlebRes.json()

      if (collData.success) {
        setCollections(collData.data || [])
      }
      if (phlebData.success) {
        setPhlebotomists(phlebData.data || [])
      }
    } catch (err) {
      console.error('Error fetching home collections:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCollections()
  }, [statusFilter, dateFilter])

  const handleOpenAssignModal = (order: HomeCollectionItem) => {
    setSelectedOrder(order)
    setSelectedPhlebotomistId(order.assignedPhlebotomistId || '')
    setAssignNotes('')
    setAssignModalOpen(true)
  }

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder || !selectedPhlebotomistId) return

    setIsSubmitting(true)
    setFeedbackMsg(null)

    try {
      const res = await fetch('/api/v1/diagnostics/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: selectedOrder.id,
          phlebotomist_id: selectedPhlebotomistId,
          notes: assignNotes || undefined,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: `Phlebotomist assigned successfully to order ${selectedOrder.orderNumber}` })
        setAssignModalOpen(false)
        fetchCollections()
      } else {
        setFeedbackMsg({ type: 'error', text: data.error?.message || 'Failed to assign phlebotomist' })
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Network error occurred' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string, remarks: string) => {
    try {
      const res = await fetch(`/api/v1/diagnostics/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          notes: remarks,
        }),
      })
      const data = await res.json()
      if (data.success) {
        fetchCollections()
      } else {
        alert(data.error?.message || 'Status update failed')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update status')
    }
  }

  const filteredOrders = collections.filter(o => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.patientName.toLowerCase().includes(q) ||
      o.patientPhone.includes(q) ||
      o.address.toLowerCase().includes(q) ||
      (o.landmark && o.landmark.toLowerCase().includes(q))
    )
  })

  // Quick stats
  const totalCollections = collections.length
  const unassignedCount = collections.filter(c => !c.assignedPhlebotomistId || c.status === 'placed').length
  const inTransitCount = collections.filter(c => c.status === 'phlebotomist_assigned' || c.status === 'sample_collected').length
  const completedCount = collections.filter(c => c.status === 'received_at_lab' || c.status === 'completed').length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'placed':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">Pending Dispatch</span>
      case 'phlebotomist_assigned':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">Phlebotomist Dispatched</span>
      case 'sample_collected':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">Sample Collected</span>
      case 'received_at_lab':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300">Received at Lab</span>
      case 'processing':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300">Processing</span>
      case 'completed':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">Completed</span>
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">{status}</span>
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/admin/diagnostics" className="hover:underline">Diagnostics</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Home Collection Operations</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Home className="h-6 w-6 text-primary" />
            Home Sample Collection Operations
          </h1>
          <p className="text-sm text-muted-foreground">
            Doorstep phlebotomist routing, slot tracking, free-threshold policy enforcement & sample verification
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchCollections()}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-md hover:bg-muted transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <Link
            href="/admin/diagnostics/dispatch"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted transition-colors"
          >
            <Truck className="h-4 w-4 text-primary" />
            Phlebotomist Directory
          </Link>
          <Link
            href="/admin/diagnostics/orders/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            + New Doorstep Order
          </Link>
        </div>
      </div>

      {feedbackMsg && (
        <div className={`p-4 rounded-lg flex items-center gap-2 text-sm ${feedbackMsg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' : 'bg-destructive/10 border border-destructive/20 text-destructive'}`}>
          {feedbackMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          {feedbackMsg.text}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase">Scheduled Collections</span>
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold">{totalCollections}</div>
          <p className="text-xs text-muted-foreground mt-1">For selected date filter</p>
        </div>

        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase">Unassigned / Pending</span>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">{unassignedCount}</div>
          <p className="text-xs text-muted-foreground mt-1">Require phlebotomist dispatch</p>
        </div>

        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase">In Transit / Dispatched</span>
            <Truck className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">{inTransitCount}</div>
          <p className="text-xs text-muted-foreground mt-1">Phlebotomists on field</p>
        </div>

        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase">Received at Lab</span>
            <FlaskConical className="h-4 w-4 text-teal-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-teal-600 dark:text-teal-400">{completedCount}</div>
          <p className="text-xs text-muted-foreground mt-1">Samples handed to laboratory</p>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by order #, patient name, phone, address..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Statuses</option>
              <option value="placed">Pending Dispatch</option>
              <option value="phlebotomist_assigned">Dispatched</option>
              <option value="sample_collected">Sample Collected</option>
              <option value="received_at_lab">Received at Lab</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Collection Items List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground border rounded-xl bg-card">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary mb-3" />
            <p>Loading doorstep collections...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground border rounded-xl bg-card">
            <Home className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="font-medium text-foreground">No doorstep collections found</h3>
            <p className="text-sm mt-1">Try choosing a different date or clearing the status filter.</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const assignedStaff = phlebotomists.find(p => p.id === order.assignedPhlebotomistId)

            return (
              <div
                key={order.id}
                className="p-5 rounded-xl border bg-card text-card-foreground shadow-sm hover:border-primary/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                {/* Left Section: Patient & Address Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-sm font-semibold text-primary">{order.orderNumber}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-foreground">UHID: {order.patientUhid}</span>
                    {getStatusBadge(order.status)}
                    {order.collectionFeeInr === 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                        FREE Doorstep Collection
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                        ₹{order.collectionFeeInr} Collection Fee
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {order.patientName}
                    </div>
                    <a
                      href={`tel:${order.patientPhone}`}
                      className="flex items-center gap-1.5 text-primary hover:underline"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {order.patientPhone}
                    </a>
                  </div>

                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span>{order.address}</span>
                      {order.landmark && <span className="text-foreground"> (Near: {order.landmark})</span>}
                      {order.pincode && <span className="font-mono"> - {order.pincode}</span>}
                    </div>
                  </div>

                  {/* Scheduled Slot */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                    <div className="flex items-center gap-1 bg-muted/60 px-2.5 py-1 rounded-md">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span>{order.scheduledDate}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-muted/60 px-2.5 py-1 rounded-md">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span>{order.scheduledSlot}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FlaskConical className="h-3.5 w-3.5 text-primary" />
                      <span>{order.itemsCount} Tests: <strong className="text-foreground">{order.tests.slice(0, 2).join(', ')}{order.tests.length > 2 ? ` +${order.tests.length - 2} more` : ''}</strong></span>
                    </div>
                  </div>

                  {order.specialInstructions && (
                    <p className="text-xs italic text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-200 dark:border-amber-800/50">
                      Note: {order.specialInstructions}
                    </p>
                  )}
                </div>

                {/* Right Section: Phlebotomist Assignment & Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 border-t lg:border-t-0 pt-3 lg:pt-0">
                  <div className="text-left lg:text-right">
                    <span className="text-xs text-muted-foreground">Assigned Phlebotomist</span>
                    {assignedStaff ? (
                      <div className="flex items-center gap-1.5 font-medium text-sm text-foreground mt-0.5">
                        <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{assignedStaff.name}</span>
                        {assignedStaff.phone && (
                          <span className="text-xs text-muted-foreground">({assignedStaff.phone})</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                        <AlertCircle className="h-4 w-4" />
                        <span>Not Assigned Yet</span>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      Order Total: <strong className="text-foreground">₹{order.totalInr}</strong> ({order.paymentStatus})
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleOpenAssignModal(order)}
                      className="px-3 py-1.5 text-xs font-medium border rounded-md hover:bg-muted transition-colors flex items-center gap-1"
                    >
                      <UserCheck className="h-3.5 w-3.5 text-primary" />
                      {assignedStaff ? 'Reassign' : 'Assign Phlebotomist'}
                    </button>

                    {order.status === 'phlebotomist_assigned' && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'sample_collected', 'Sample collected at doorstep')}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Mark Collected
                      </button>
                    )}

                    {order.status === 'sample_collected' && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'received_at_lab', 'Sample received at pathology lab')}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-teal-600 text-white hover:bg-teal-700 transition-colors flex items-center gap-1"
                      >
                        <FlaskConical className="h-3.5 w-3.5" />
                        Handover to Lab
                      </button>
                    )}

                    <Link
                      href={`/admin/diagnostics/orders`}
                      className="p-1.5 text-muted-foreground hover:text-foreground border rounded-md hover:bg-muted"
                      title="Inspect order details"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Phlebotomist Assignment Modal */}
      {assignModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card text-card-foreground border rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              Assign Doorstep Phlebotomist
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Assign field phlebotomist for Order <span className="font-mono font-semibold text-foreground">{selectedOrder.orderNumber}</span> ({selectedOrder.patientName})
            </p>

            <form onSubmit={handleAssignSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Select Phlebotomist *</label>
                <select
                  required
                  value={selectedPhlebotomistId}
                  onChange={e => setSelectedPhlebotomistId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Choose Phlebotomist / Staff --</option>
                  {phlebotomists.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.phone ? `(${p.phone})` : ''} — {p.roles.join(', ') || 'Staff'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Dispatch Notes / Instructions (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Call before ringing bell; patient is fasting; take pediatric needle..."
                  value={assignNotes}
                  onChange={e => setAssignNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="bg-muted/50 p-3 rounded-lg text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient Address:</span>
                  <span className="font-medium text-foreground text-right">{selectedOrder.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scheduled Slot:</span>
                  <span className="font-medium text-foreground">{selectedOrder.scheduledDate} ({selectedOrder.scheduledSlot})</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedPhlebotomistId}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
