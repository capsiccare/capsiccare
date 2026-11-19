'use client'

import { useState } from 'react'
import { labTestsPricing, healthPackagesPricing, getDiscount, getSavings } from '@/lib/pricing'
import { Badge } from '@/components/ui/badge'
import { Edit2, Plus, Trash2 } from 'lucide-react'

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState<'tests' | 'packages'>('tests')
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Pricing Management
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-200">
            Manage all test and package pricing. Changes automatically update across the website.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ease-out ${
              activeTab === 'tests'
                ? 'bg-teal-600 text-white'
                : 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
            }`}
          >
            Lab Tests ({labTestsPricing.length})
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ease-out ${
              activeTab === 'packages'
                ? 'bg-teal-600 text-white'
                : 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
            }`}
          >
            Health Packages ({healthPackagesPricing.length})
          </button>
        </div>

        {/* Add New Button */}
        <div className="mb-6">
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 ease-out">
            <Plus size={20} />
            Add New {activeTab === 'tests' ? 'Test' : 'Package'}
          </button>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900 dark:text-white">Name</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900 dark:text-white">Category</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900 dark:text-white">Price</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900 dark:text-white">MRP</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900 dark:text-white">Discount</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
                {activeTab === 'tests'
                  ? labTestsPricing.map((test) => (
                      <tr key={test.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-300 ease-out">
                        <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">{test.name}</td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="text-teal-600 border-teal-200">
                            {test.category}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-900 dark:text-white">₹{test.price}</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-200 line-through">₹{test.mrp}</td>
                        <td className="px-6 py-4">
                          <Badge className="bg-green-600 text-white">{getDiscount(test.mrp, test.price)}% OFF</Badge>
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-all duration-300 ease-out">
                            <Edit2 size={18} className="text-teal-600" />
                          </button>
                          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-all duration-300 ease-out">
                            <Trash2 size={18} className="text-red-600" />
                          </button>
                        </td>
                      </tr>
                    ))
                  : healthPackagesPricing.map((pkg) => (
                      <tr key={pkg.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-300 ease-out">
                        <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">{pkg.name}</td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="text-teal-600 border-teal-200">
                            {pkg.category}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-900 dark:text-white">₹{pkg.price}</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-200 line-through">₹{pkg.mrp}</td>
                        <td className="px-6 py-4">
                          <Badge className="bg-green-600 text-white">{getDiscount(pkg.mrp, pkg.price)}% OFF</Badge>
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-all duration-300 ease-out">
                            <Edit2 size={18} className="text-teal-600" />
                          </button>
                          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-all duration-300 ease-out">
                            <Trash2 size={18} className="text-red-600" />
                          </button>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            <strong>Note:</strong> All prices are automatically updated across the website. Any changes made here will be reflected on the home page, lab tests page, and all product cards immediately.
          </p>
        </div>
      </div>
    </div>
  )
}
