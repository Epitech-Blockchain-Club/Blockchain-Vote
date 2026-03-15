import React from 'react'
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import AdminDashboard from '../components/admin/AdminDashboard'
import CreateElectionForm from '../components/admin/CreateElectionForm'
import AdminElectionDetail from '../components/admin/AdminElectionDetail'
import Statistics from '../components/admin/Statistics'
import {
  Squares2X2Icon,
  ChartBarSquareIcon
} from '@heroicons/react/24/outline'

const AdminPage = () => {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-slate-50 pt-16 sm:pt-20 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="elections/new" element={<CreateElectionForm />} />
            <Route path="elections/:id" element={<AdminElectionDetail />} />
            <Route path="elections/:id/edit" element={<CreateElectionForm />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default AdminPage