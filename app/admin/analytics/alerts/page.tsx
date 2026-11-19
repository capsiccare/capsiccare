'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  ArrowUpRight,
  ExternalLink,
  Flame,
  CheckSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useBranch } from '@/lib/context/branch-context'

export default function DecisionAlertsPage() {
  const { selectedBranchId } = useBranch()
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterSeverity, setFilterSeverity] = useState('ALL')
  const [resolvingId, setResolvingId] = useState<string | null>(null)

  const fetchAlerts = async () => {
    setLoading(true)
    try {
      const branchParam = selectedBranchId && selectedBranchId !== 'all' ? `?branchId=${selectedBranchId}` : ''
      const res = await fetch(`/api/v1/analytics/alerts${branchParam}`)
      const json = await res.json()
      if (json.success) {
        setAlerts(json.data.alerts || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [selectedBranchId])

  const handleResolveAlert = async (alertId: string) => {
    setResolvingId(alertId)
    try {
      const res = await fetch(`/api/v1/analytics/alerts/${alertId}`, {
        method: 'PATCH'
      })
      const json = await res.json()
      if (res.ok && json.success) {
        fetchAlerts()
      } else {
        alert(json.error?.message || 'Failed to update alert')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setResolvingId(null)
    }
  }

  const filteredAlerts = alerts.filter((a) => {
    return filterSeverity === 'ALL' || a.severity?.toUpperCase() === filterSeverity.toUpperCase()
  })

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link href="/admin/analytics" className="hover:text-indigo-600 transition-colors">Executive MIS</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-medium text-slate-900 dark:text-slate-100">Decision Alerts</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <AlertCircle className="w-7 h-7 text-amber-500" />
            Decision Intelligence & Rules-Based Management Alerts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time threshold surveillance for cash variances, diagnostic SLA breaches, waiting delays, and task backlogs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="text-xs border rounded-xl px-3 py-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="WARNING">Warning Only</option>
            <option value="INFO">Info Only</option>
          </select>

          <Button variant="outline" size="sm" onClick={fetchAlerts} disabled={loading} className="gap-1.5 rounded-xl">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">No Active Alerts</span>
            <span className="text-xs text-slate-500 mt-1 block">
              All clinical, billing, and operational parameters are within authorized tolerance limits.
            </span>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs"
            >
              <div className="flex items-start gap-3.5">
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold uppercase shrink-0 mt-0.5 ${
                    alert.severity === 'critical'
                      ? 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950/60 dark:text-red-300'
                      : alert.severity === 'warning'
                      ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300'
                  }`}
                >
                  {alert.severity}
                </Badge>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{alert.title}</h3>
                    {alert.branches?.name && (
                      <span className="text-xs text-slate-400 font-medium">({alert.branches.name})</span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                    {alert.description}
                  </p>

                  <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-lg border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-300 mt-2">
                    <strong>Recommended Operational Action:</strong> {alert.action_recommendation}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {alert.drilldown_url && (
                  <Link href={alert.drilldown_url}>
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1 rounded-lg">
                      <span>Investigate</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                )}

                {alert.status === 'active' && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={resolvingId === alert.id}
                    onClick={() => handleResolveAlert(alert.id)}
                    className="h-8 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 rounded-lg"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    {resolvingId === alert.id ? 'Resolving...' : 'Acknowledge & Resolve'}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
