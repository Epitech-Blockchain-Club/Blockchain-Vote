import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import AdminDashboard from '../components/admin/AdminDashboard'
import CreateElectionForm from '../components/admin/CreateElectionForm'
import ManageCandidates from '../components/admin/ManageCandidates'
import VoterList from '../components/admin/VoterList'
import Statistics from '../components/admin/Statistics'

const AdminPage = () => {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="container mx-auto px-4 py-12">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="elections/new" element={<CreateElectionForm />} />
          <Route path="elections/:id/edit" element={<CreateElectionForm />} />
          <Route path="elections/:id/candidates" element={<ManageCandidates />} />
          <Route path="voters" element={<VoterList />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </ProtectedRoute>
  )
}

export default AdminPage