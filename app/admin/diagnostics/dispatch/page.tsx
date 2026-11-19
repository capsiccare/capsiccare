'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Truck,
  Users,
  Phone,
  Mail,
  Shield,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  BadgeCheck
} from 'lucide-react'

interface Phlebotomist {
  id: string
  name: string
  email: string
  phone: string
  roles: string[]
}

interface CollectionTask {
  id: string
  orderNumber: string
  patientName: string
  address: string
  scheduledSlot: string
  status: string
  totalInr: number
}

export default function PhlebotomistDispatchPage() {
  const [phlebotomists, setPhlebotomists] = useState<Phlebotomist[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStaff, setSelectedStaff] = useState<Phlebotomist | null>(null)
  const [activeTasks, setActiveTasks] = useState<CollectionTask[]>([])
  const [tasksLoading, setTasksLoading] = useState(false)

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/v1/diagnostics/dispatch')
      const data = await res.json()
      if (data.success) {
        setPhlebotomists(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching staff directory:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStaffTasks = async (staffId: string) => {
    try {
      setTasksLoading(true)
      const today = new Date().toISOString().split('T')[0]
      const res = await fetch(`/api/v1/diagnostics/home-collection?phlebotomistId=${staffId}&date=${today}`)
      const data = await res.json()
      if (data.success) {
        setActiveTasks(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching staff tasks:', err)
    } finally {
      setTasksLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  const handleSelectStaff = (staff: Phlebotomist) => {
    setSelectedStaff(staff)
    fetchStaffTasks(staff.id)
  }

  const filteredStaff = phlebotomists.filter(p => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.roles.some(r => r.toLowerCase().includes(q))
    )
  })

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/admin/diagnostics" className="hover:underline">Diagnostics</Link>
            <span>/</span>
            <Link href="/admin/diagnostics/home-collection" className="hover:underline">Home Collection</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Phlebotomist Directory & Dispatch</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" />
            Phlebotomist Directory & Field Dispatch
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage certified field phlebotomists, route workloads, contact info & real-time collection assignments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchStaff()}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-md hover:bg-muted transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <Link
            href="/admin/diagnostics/home-collection"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            View Operations Board
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Grid: Staff Directory on Left, Selected Staff Profile & Tasks on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Staff List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search phlebotomists by name, email, phone, role..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-muted-foreground border rounded-xl bg-card">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary mb-3" />
              <p>Loading phlebotomist directory...</p>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground border rounded-xl bg-card">
              <Users className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
              <h3 className="font-medium text-foreground">No staff members found</h3>
              <p className="text-sm mt-1">Check search query or ensure staff profiles are active.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStaff.map(staff => {
                const isSelected = selectedStaff?.id === staff.id

                return (
                  <div
                    key={staff.id}
                    onClick={() => handleSelectStaff(staff)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-md'
                        : 'border-border bg-card hover:border-primary/40 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          {staff.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                            {staff.name}
                            <BadgeCheck className="h-4 w-4 text-emerald-500" />
                          </h4>
                          <span className="text-xs text-muted-foreground">Certified Phlebotomist</span>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                        Active Duty
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-muted-foreground border-t pt-3">
                      {staff.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-primary" />
                          <span className="font-mono text-foreground">{staff.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-primary" />
                        <span className="truncate">{staff.email}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t">
                      <div className="flex flex-wrap gap-1">
                        {staff.roles.map(r => (
                          <span key={r} className="px-1.5 py-0.5 rounded bg-muted text-[10px] uppercase font-mono">
                            {r}
                          </span>
                        ))}
                      </div>
                      <span className="text-primary font-medium hover:underline flex items-center gap-1">
                        View Route <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Col: Selected Staff Duty Panel */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl border bg-card text-card-foreground shadow-sm">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Field Dispatch & Route Assignment
            </h3>

            {selectedStaff ? (
              <div className="mt-4 space-y-4">
                <div className="p-4 rounded-lg bg-muted/40 border">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
                      {selectedStaff.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{selectedStaff.name}</h4>
                      <p className="text-xs text-muted-foreground">{selectedStaff.email}</p>
                      {selectedStaff.phone && (
                        <a href={`tel:${selectedStaff.phone}`} className="text-xs font-mono text-primary hover:underline">
                          {selectedStaff.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Today&apos;s Assigned Collections</span>
                    <span className="text-primary font-bold">({activeTasks.length})</span>
                  </h5>

                  {tasksLoading ? (
                    <div className="p-6 text-center text-xs text-muted-foreground">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto text-primary mb-2" />
                      Loading today&apos;s tasks...
                    </div>
                  ) : activeTasks.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground border rounded-lg bg-background">
                      No collections assigned for today.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                      {activeTasks.map(task => (
                        <div key={task.id} className="p-3 rounded-lg border bg-background text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-semibold text-primary">{task.orderNumber}</span>
                            <span className="capitalize px-1.5 py-0.5 rounded bg-muted text-[10px]">
                              {task.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="font-medium text-foreground">{task.patientName}</div>
                          <div className="text-muted-foreground flex items-start gap-1">
                            <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                            <span className="truncate">{task.address}</span>
                          </div>
                          <div className="flex items-center justify-between text-muted-foreground pt-1 border-t">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-primary" />
                              {task.scheduledSlot}
                            </span>
                            <span className="font-bold text-foreground">₹{task.totalInr}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Link
                  href="/admin/diagnostics/home-collection"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-colors"
                >
                  Manage Live Collections
                </Link>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-muted-foreground">
                <Users className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                Select a phlebotomist from the directory to inspect their active schedule and assigned collections.
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl border bg-muted/30 text-xs space-y-2 text-muted-foreground">
            <h5 className="font-semibold text-foreground flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-primary" />
              CAPSIC Phlebotomy Standard
            </h5>
            <p>
              All field sample collectors adhere to cold-chain preservation protocols (vacutainer ice-pack transit ≤ 4°C), sterile one-time equipment disposal, and mandatory patient verification before venipuncture.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
