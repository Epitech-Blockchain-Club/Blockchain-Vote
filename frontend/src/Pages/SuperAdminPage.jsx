import React, { useState } from 'react'
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import {
    Squares2X2Icon,
    BuildingOfficeIcon,
    ShieldCheckIcon,
    ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'
import { useSettings } from '../contexts/SettingsContext'

import SuperAdminDashboard from '../components/superadmin/SuperAdminDashboard'
import OrganizationManager from '../components/superadmin/OrganizationManager'
import SuperAdminManager from '../components/superadmin/SuperAdminManager'

const SuperAdminPage = () => {
    const location = useLocation()
    const { logout } = useAuth()
    const { t } = useSettings()

    const navigation = [
        { name: t({ fr: 'Tableau de bord', en: 'Dashboard' }), href: '/superadmin', icon: Squares2X2Icon },
        { name: t({ fr: 'Organisations & Admins', en: 'Organizations & Admins' }), href: '/superadmin/organizations', icon: BuildingOfficeIcon },
        { name: t({ fr: 'Super Admins', en: 'Super Admins' }), href: '/superadmin/supers', icon: ShieldCheckIcon },
    ]

    const isActive = (path) => {
        if (path === '/superadmin' && location.pathname === '/superadmin') return true
        if (path !== '/superadmin' && location.pathname.startsWith(path)) return true
        return false
    }

    return (
        <ProtectedRoute requiredRole="superadmin">
            <div className="min-h-screen bg-slate-50 flex">
                {/* ─── Desktop Sidebar ─── */}
                <aside className="w-64 bg-white border-r border-slate-200 fixed h-full z-30 hidden md:block">
                    <div className="flex flex-col h-full pt-24">
                        <div className="px-6 mb-6">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {t({ fr: 'Menu Propriétaire', en: 'Owner Menu' })}
                            </span>
                        </div>

                        <nav className="flex-1 px-4 space-y-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-200 group ${isActive(item.href)
                                        ? 'bg-primary-50 text-primary-600'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <item.icon className={`h-5 w-5 mr-3 transition-colors ${isActive(item.href) ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>

                        <div className="p-4 border-t border-slate-100">
                            <button
                                onClick={logout}
                                className="flex items-center w-full px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-200"
                            >
                                <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" />
                                {t({ fr: 'Déconnexion', en: 'Logout' })}
                            </button>
                        </div>
                    </div>
                </aside>

                {/* ─── Main Content ─── */}
                <main className="flex-1 md:ml-64 pt-20 sm:pt-24 pb-28 md:pb-12 px-4 md:px-8">
                    <div className="max-w-6xl mx-auto">
                        <Routes>
                            <Route index element={<SuperAdminDashboard />} />
                            <Route path="organizations" element={<OrganizationManager />} />
                            <Route path="supers" element={<SuperAdminManager />} />
                            <Route path="*" element={<Navigate to="/superadmin" replace />} />
                        </Routes>
                    </div>
                </main>

                {/* ─── Mobile Bottom Nav ─── */}
                <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-200 shadow-2xl shadow-slate-900/10">
                    <div className="flex items-stretch">
                        {/* Menu label */}
                        <div className="flex items-center justify-center px-3 border-r border-slate-100">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight text-center">
                                Menu<br />Prop.
                            </span>
                        </div>
                        {/* Nav items */}
                        {navigation.map((item) => {
                            const active = isActive(item.href)
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${active ? 'text-primary-600' : 'text-slate-400 hover:text-slate-700'}`}
                                >
                                    <item.icon className={`h-5 w-5 ${active ? 'text-primary-600' : ''}`} />
                                    <span className={`text-[9px] font-bold leading-tight text-center ${active ? 'text-primary-600' : ''}`}>
                                        {item.name.split(' ')[0]}
                                    </span>
                                    {active && <span className="w-1 h-1 rounded-full bg-primary-600" />}
                                </Link>
                            )
                        })}
                        {/* Logout */}
                        <button
                            onClick={logout}
                            className="flex flex-col items-center justify-center px-4 py-3 gap-1 text-red-400 hover:text-red-600 border-l border-slate-100 transition-colors"
                        >
                            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                            <span className="text-[9px] font-bold">Quitter</span>
                        </button>
                    </div>
                </nav>
            </div>
        </ProtectedRoute>
    )
}

export default SuperAdminPage
