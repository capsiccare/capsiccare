'use client'

import React, { useState, useEffect } from 'react'
import {
  FileText,
  RefreshCw,
  AlertCircle,
  Clock,
  User,
  Shield,
  ChevronDown,
  ChevronRight,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface AuditLogItem {
  id: string
  action: string
  entityType: string
  entityId: string
  oldValues: Record<string, any> | null
  newValues: Record<string, any> | null
  ipAddress: string | null
  createdAt: string
  actorName: string
  actorPhone: string
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionFilter, setActionFilter] = useState('all')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const fetchLogs = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (actionFilter !== 'all') params.set('action', actionFilter)
      params.set('limit', '50')

      const res = await fetch(`/api/v1/admin/audit?${params.toString()}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to load audit logs')
      }

      setLogs(data.data || [])
    } catch (err: any) {
      setError(err.message || 'Error loading audit logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [actionFilter])

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Audit Trail</h1>
            <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200 text-xs">
              Forensic Log
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Immutable log of clinical actions, credential assignments, doctor updates, and patient intakes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={loading}
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">Filter Event:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="h-8 text-xs rounded-lg border border-slate-200 bg-white px-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="all">All Events</option>
            <option value="SUPER_ADMIN_BOOTSTRAP">SUPER_ADMIN_BOOTSTRAP</option>
            <option value="DOCTOR_CREATED">DOCTOR_CREATED</option>
            <option value="DOCTOR_UPDATED">DOCTOR_UPDATED</option>
            <option value="PATIENT_REGISTERED">PATIENT_REGISTERED</option>
            <option value="PATIENT_UPDATED">PATIENT_UPDATED</option>
          </select>
        </div>
        <span className="text-xs text-slate-400">{logs.length} events recorded</span>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchLogs} className="ml-auto text-xs border-red-300">
            Retry
          </Button>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Timestamp (IST)</th>
                <th className="px-4 py-3.5">Action Event</th>
                <th className="px-4 py-3.5">Entity</th>
                <th className="px-4 py-3.5">Actor</th>
                <th className="px-4 py-3.5">IP Address</th>
                <th className="px-5 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
                    Querying audit log entries from PostgreSQL...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-slate-700">No audit log records found</p>
                    <p className="text-xs text-slate-400 mt-1">Actions performed in the admin portal will appear here.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isExpanded = expandedRow === log.id
                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        onClick={() => toggleRow(log.id)}
                        className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${
                          isExpanded ? 'bg-slate-50/90' : ''
                        }`}
                      >
                        <td className="px-5 py-3.5 font-mono text-xs text-slate-700 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </td>

                        <td className="px-4 py-3.5">
                          <Badge
                            className={`font-mono text-[10px] tracking-wide ${
                              log.action.includes('BOOTSTRAP')
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : log.action.includes('CREATED') || log.action.includes('REGISTERED')
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-blue-100 text-blue-800 border-blue-300'
                            }`}
                          >
                            {log.action}
                          </Badge>
                        </td>

                        <td className="px-4 py-3.5">
                          <p className="text-xs font-semibold text-slate-800 capitalize">{log.entityType}</p>
                          <span className="font-mono text-[10px] text-slate-400">{log.entityId}</span>
                        </td>

                        <td className="px-4 py-3.5">
                          <p className="text-xs font-medium text-slate-800">{log.actorName}</p>
                          <span className="font-mono text-[10px] text-slate-400">{log.actorPhone}</span>
                        </td>

                        <td className="px-4 py-3.5 font-mono text-xs text-slate-500">
                          {log.ipAddress || '127.0.0.1'}
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <button className="text-slate-400 hover:text-slate-600 p-1">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-slate-50">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                              <div className="bg-white p-3 rounded-lg border border-slate-200">
                                <span className="font-sans font-bold text-slate-500 uppercase text-[10px] block mb-1">
                                  Previous State (Old Values)
                                </span>
                                <pre className="text-slate-700 overflow-x-auto text-[11px]">
                                  {log.oldValues ? JSON.stringify(log.oldValues, null, 2) : 'null (Initial Creation)'}
                                </pre>
                              </div>
                              <div className="bg-white p-3 rounded-lg border border-slate-200">
                                <span className="font-sans font-bold text-slate-500 uppercase text-[10px] block mb-1">
                                  Applied State (New Values)
                                </span>
                                <pre className="text-emerald-800 overflow-x-auto text-[11px]">
                                  {log.newValues ? JSON.stringify(log.newValues, null, 2) : 'null'}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
