'use client'

import React from 'react'
import { Printer, Calendar, Clock, MapPin, Phone, User, Stethoscope, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface AppointmentSlipData {
  appointmentNumber: string
  tokenNumber: number | null
  patientName: string
  patientUhid: string
  patientPhone: string
  patientGender?: string
  patientAge?: number | null
  doctorName: string
  doctorSpecialty: string
  doctorCode?: string
  doctorRegistrationNumber?: string
  branchName: string
  branchAddress?: string
  branchPhone?: string
  chamberName?: string | null
  chamberRoom?: string | null
  scheduledDate: string
  startTime: string
  endTime: string
  consultationType: string
  feeInr: number
  status: string
  chiefComplaint?: string | null
  createdAt?: string
}

interface AppointmentSlipProps {
  data: AppointmentSlipData
  onClose?: () => void
}

export function AppointmentSlipModal({ data, onClose }: AppointmentSlipProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Controls Header (Hidden in Print) */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-800">Print Appointment Slip</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8">
              <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Voucher
            </Button>
            {onClose && (
              <Button size="sm" variant="outline" onClick={onClose} className="h-8 text-xs">
                Close
              </Button>
            )}
          </div>
        </div>

        {/* Printable Slip Body */}
        <div className="p-6 overflow-y-auto print:p-0 print:m-0 print:overflow-visible">
          <div
            id="printable-slip"
            className="border-2 border-slate-800 rounded-xl p-5 bg-white space-y-4 print:border-black print:p-3 print:rounded-none"
          >
            {/* Header Brand */}
            <div className="border-b-2 border-slate-800 pb-3 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 font-black text-lg tracking-tight text-slate-950 uppercase">
                <span>CAPSIC CARE</span>
                <span className="text-xs px-1.5 py-0.2 rounded bg-slate-900 text-white font-mono">OS</span>
              </div>
              <p className="font-bold text-xs uppercase tracking-wider text-slate-700">{data.branchName}</p>
              {data.branchAddress && (
                <p className="text-[11px] text-slate-600">{data.branchAddress}</p>
              )}
              {data.branchPhone && (
                <p className="text-[11px] font-mono text-slate-600">Helpdesk: {data.branchPhone}</p>
              )}
            </div>

            {/* Token & Reference Banner */}
            <div className="bg-slate-100 p-3 rounded-lg border border-slate-300 flex items-center justify-between print:bg-slate-50">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Appointment Reference</span>
                <span className="font-mono text-xs font-bold text-slate-950">{data.appointmentNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Daily Token No.</span>
                <span className="font-mono text-xl font-black text-emerald-800">
                  #{String(data.tokenNumber || 1).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Patient Details */}
            <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-200 pb-3">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Name</span>
                <span className="font-bold text-slate-900">{data.patientName}</span>
                <div className="text-[11px] text-slate-500 capitalize">
                  {data.patientGender || 'N/A'} {data.patientAge ? `• ${data.patientAge} Yrs` : ''}
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Universal Health ID (UHID)</span>
                <span className="font-mono font-bold text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                  {data.patientUhid}
                </span>
                <p className="text-[11px] font-mono text-slate-500 mt-0.5">{data.patientPhone}</p>
              </div>
            </div>

            {/* Doctor & Chamber Details */}
            <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-200 pb-3">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Consulting Physician</span>
                <span className="font-bold text-slate-900">{data.doctorName}</span>
                <p className="text-[11px] text-slate-600">{data.doctorSpecialty}</p>
                {data.doctorRegistrationNumber && (
                  <p className="text-[10px] font-mono text-slate-400">Reg: {data.doctorRegistrationNumber}</p>
                )}
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Chamber / Room</span>
                <span className="font-bold text-slate-900 block mt-0.5">
                  {data.chamberName || (data.chamberRoom ? `Room ${data.chamberRoom}` : 'Assigned at Reception')}
                </span>
                <span className="text-[11px] text-slate-500 capitalize font-medium">
                  {data.consultationType} Consultation
                </span>
              </div>
            </div>

            {/* Schedule & Financial Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-200 pb-3">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Date & Time</span>
                <span className="font-bold text-slate-900">
                  {new Date(data.scheduledDate).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <p className="font-mono text-[11px] text-slate-700 mt-0.5">
                  {data.startTime.substring(0, 5)} - {data.endTime.substring(0, 5)}
                </p>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Consultation Fee</span>
                <span className="font-bold text-base text-slate-950 block mt-0.5">
                  ₹{data.feeInr}
                </span>
                <span className="text-[10px] text-slate-500">Fixed Consultation Fee</span>
              </div>
            </div>

            {/* Complaint if any */}
            {data.chiefComplaint && (
              <div className="text-xs border-b border-slate-200 pb-2">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Reason for Visit</span>
                <p className="text-slate-700 text-[11px] italic">{data.chiefComplaint}</p>
              </div>
            )}

            {/* Notice & Clinic Instructions */}
            <div className="space-y-1 text-[10px] text-slate-500 pt-1">
              <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-900 font-medium">
                * Note: This slip is an Appointment & Token Confirmation Voucher. It is NOT a finalized GST tax invoice. Tax invoices and payment receipts are issued at the billing counter.
              </div>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                <li>Please report to the clinic reception 15 minutes before your slot time.</li>
                <li>Carry your previous prescription sheets and recent diagnostic reports.</li>
                <li>Emergency doctor schedule changes will be notified via SMS/WhatsApp.</li>
              </ul>
            </div>

            {/* Slip Footer */}
            <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-[9px] font-mono text-slate-400">
              <span>Issued: {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
              <span>CAPSIC CARE OS • System Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
