'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FlaskConical,
  Plus,
  Search,
  Filter,
  Truck,
  FileCheck2,
  Receipt,
  Clock,
  ArrowRight,
  RefreshCw,
  Home,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react'
import { useBranch } from '@/lib/context/branch-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface DiagnosticOrder {
  id: string
  orderNumber: string
  branchName: string
  patientName: string
  patientUhid: string
  patientPhone: string
  status: string
  fulfillmentType: string
  scheduledCollectionDate?: string
  totalInr: number
  paymentStatus: string
  itemsCount: number
  createdAt: string
}

export default function DiagnosticsHubPage() {
  const { selectedBranchId } = useBranch()
  const [orders, setOrders] = useState<DiagnosticOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [stats, setStats] = useState({
    totalOrders: 0,
    homeCollections: 0,
    samplesPending: 0,
    processing: 0,
    completed: 0,
  })

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (selectedBranchId !== 'all') params.set('branchId', selectedBranchId)
      params.set('limit', '20')

      const res = await fetch(`/api/v1/diagnostics/orders?${params.toString()}`)
      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to fetch diagnostic orders')
      }

      const list: DiagnosticOrder[] = json.data || []
      setOrders(list)

      // Compute statistics
      setStats({
        totalOrders: list.length,
        homeCollections: list.filter((o) => o.fulfillmentType === 'home_collection').length,
        samplesPending: list.filter((o) => o.status === 'placed' || o.status === 'phlebotomist_assigned').length,
        processing: list.filter((o) => o.status === 'processing' || o.status === 'received_at_lab' || o.status === 'sample_collected').length,
        completed: list.filter((o) => o.status === 'completed').length,
      })
    } catch (err: any) {
      setError(err.message || 'Error connecting to diagnostics service')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [selectedBranchId])

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Capsic Care" className="w-7 h-7 object-contain inline-block" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Diagnostics & Lab Operations
            </h1>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800 text-xs">
              Live Hub
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage pathology test catalogue, home sample phlebotomy dispatch, walk-in diagnostic orders, and verified reports.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/admin/diagnostics/catalogue">
            <Button variant="outline" size="sm" className="text-xs border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200">
              <Layers className="w-3.5 h-3.5 mr-1 text-purple-600" /> Test Catalogue
            </Button>
          </Link>

          <Link href="/admin/diagnostics/orders/new">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-xs shadow-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> New Diagnostic Order
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Diagnostic Orders</span>
            <FlaskConical className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalOrders}</div>
          <p className="text-[11px] text-slate-400">Recent active bookings</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Home Collections</span>
            <Home className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{stats.homeCollections}</div>
          <p className="text-[11px] text-slate-400">Doorstep sample pickup</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Sample Pending</span>
            <Truck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-400">{stats.samplesPending}</div>
          <p className="text-[11px] text-slate-400">Awaiting phlebotomist</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Lab Processing</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-700 dark:text-blue-400">{stats.processing}</div>
          <p className="text-[11px] text-slate-400">Samples at analyzer</p>
        </div>
      </div>

      {/* Quick Access Module Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/diagnostics/orders"
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs hover:border-purple-400 transition-all group space-y-2"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <FlaskConical className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors flex items-center justify-between">
            <span>Orders & Intake Desk</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Full diagnostic orders directory, walk-in cart intake, sample barcodes, and invoice generation.
          </p>
        </Link>

        <Link
          href="/admin/diagnostics/home-collection"
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs hover:border-emerald-400 transition-all group space-y-2"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Home className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors flex items-center justify-between">
            <span>Home Sample Collection</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Doorstep phlebotomy schedule, address routing, free collection threshold rules (₹1,000+), and sample handover.
          </p>
        </Link>

        <Link
          href="/admin/diagnostics/reports"
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs hover:border-blue-400 transition-all group space-y-2"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors flex items-center justify-between">
            <span>Report Verification & Delivery</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Attach laboratory reports, pathologist sign-off, patient smart PDF delivery, and digital verification records.
          </p>
        </Link>
      </div>

      {/* Recent Diagnostic Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-purple-600" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Recent Diagnostic Bookings</h3>
          </div>
          <Link href="/admin/diagnostics/orders" className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline">
            View All Orders &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-4">Order Ref</th>
                <th className="py-2.5 px-4">Patient & UHID</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Tests</th>
                <th className="py-2.5 px-4">Amount</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-purple-600" />
                    Loading diagnostic orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No diagnostic orders recorded yet. Click &ldquo;New Diagnostic Order&rdquo; to create a booking.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-purple-900 dark:text-purple-300">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{order.patientName}</div>
                      <div className="font-mono text-[10px] text-slate-400">{order.patientUhid} • {order.patientPhone}</div>
                    </td>
                    <td className="py-3 px-4 capitalize">
                      {order.fulfillmentType === 'home_collection' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <Home className="w-2.5 h-2.5" /> Doorstep
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          Walk-in
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium">
                      {order.itemsCount} test{order.itemsCount > 1 ? 's' : ''}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      ₹{order.totalInr}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/admin/diagnostics/orders`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-purple-600 dark:text-purple-400">
                          Inspect &rarr;
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
