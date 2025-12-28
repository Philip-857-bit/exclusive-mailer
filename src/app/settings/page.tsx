'use client';

import { LogOut, Shield, Database, Server } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    return (
        <div className="p-4 lg:p-12 font-sans max-w-4xl mx-auto">
            <header className="mb-8 lg:mb-10">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight font-serif">Settings</h2>
                <p className="text-gray-500 mt-1 text-sm font-medium">System configuration and preferences</p>
            </header>

            <div className="space-y-6">
                {/* Account Section */}
                <div className="bg-white p-6 lg:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-[#006633]" /> Account Actions
                    </h3>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100 gap-4">
                        <div>
                            <h4 className="text-red-900 font-bold text-sm">Sign Out</h4>
                            <p className="text-red-700 text-xs mt-1">End your current session securely.</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-red-200 shadow-lg w-full sm:w-auto"
                        >
                            <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    </div>
                </div>

                {/* System Info */}
                <div className="bg-white p-6 lg:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Server className="w-5 h-5 text-gray-400" /> System Status
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                                <Database className="w-4 h-4 text-gray-400" />
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Database</span>
                            </div>
                            <p className="text-green-600 font-bold text-sm flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Connected (Prisma)
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                                <Server className="w-4 h-4 text-gray-400" />
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mailer</span>
                            </div>
                            <p className="text-green-600 font-bold text-sm flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Gmail SMTP Ready
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
