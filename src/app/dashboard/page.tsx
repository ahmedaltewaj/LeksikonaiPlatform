import { createBrowserClient } from '@/lib/supabase/browser-client'
import { Inquiry, Response } from '@/types'

interface InquiryWithResponse extends Inquiry {
  response?: Response
}

export default function DashboardPage() {
  return <DashboardClient />
}

function DashboardClient() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Leksikon.ai Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Customer Inquiries</h2>
              <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm">
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>

          <div id="inquiries-list" className="divide-y divide-gray-200">
            <div className="px-6 py-8 text-center text-gray-500">
              No inquiries yet. Connect your email or web form to get started.
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
