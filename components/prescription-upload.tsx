'use client'

import { useState } from 'react'
import { Upload, X, File } from 'lucide-react'

interface PrescriptionUploadProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
  onRemove: () => void
}

export function PrescriptionUpload({ onFileSelect, selectedFile, onRemove }: PrescriptionUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
  const MAX_SIZE = 10 * 1024 * 1024 // 10MB

  const validateFile = (file: File): boolean => {
    setError('')
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please upload a JPG, PNG, or PDF file')
      return false
    }

    if (file.size > MAX_SIZE) {
      setError('File size must be less than 10MB')
      return false
    }

    return true
  }

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      onFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  if (selectedFile) {
    return (
      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <File size={24} className="text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium text-slate-900 dark:text-white text-sm">{selectedFile.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-200">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <button
            onClick={onRemove}
            className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition"
            aria-label="Remove file"
          >
            <X size={20} className="text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Upload Prescription (Optional)
      </label>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-teal-500 bg-teal-50 dark:bg-teal-950'
            : 'border-slate-300 dark:border-slate-600 hover:border-teal-400'
        }`}
      >
        <input
          type="file"
          onChange={handleInputChange}
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          id="prescription-upload"
          aria-label="Upload prescription file"
        />
        
        <label htmlFor="prescription-upload" className="cursor-pointer block">
          <Upload size={32} className="mx-auto mb-2 text-teal-600 dark:text-teal-300" />
          <p className="font-medium text-slate-900 dark:text-white">
            Drag and drop your prescription here
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-200 mt-1">
            or click to select (JPG, PNG, PDF - Max 10MB)
          </p>
        </label>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}
