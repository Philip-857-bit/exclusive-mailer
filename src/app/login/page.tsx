'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                router.push('/');
            } else {
                const data = await res.json();
                setError(data.error || 'Invalid credentials');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#051a10] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white rounded-3xl p-8 shadow-2xl shadow-green-900/40 relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <div className="text-center mb-10">
                            <div className="w-16 h-16 rounded-2xl bg-[#006633] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-700/30">
                                <Lock className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 font-serif">Welcome Back</h1>
                            <p className="text-gray-500 mt-2 text-sm">Sign in to manage your campaigns</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#006633] transition-all"
                                        placeholder="admin@exclusive.org"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#006633] transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium text-center">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#006633] hover:bg-[#005229] text-white py-4 rounded-xl font-bold shadow-xl shadow-green-900/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Signing In...' : 'Sign In Dashboard'}
                                {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </form>
                    </div>

                    {/* Decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-50 rounded-full -translate-x-1/2 translate-y-1/2 opacity-50 pointer-events-none" />
                </motion.div>

                <p className="text-center text-gray-500 text-xs mt-8">
                    &copy; {new Date().getFullYear()} DeExclusives Music Organization
                </p>
            </div>
        </div>
    );
}
