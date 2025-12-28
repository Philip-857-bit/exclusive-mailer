'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PenTool, Settings, Users, LogOut, Music, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const navItems = [
    { href: '/', label: 'Overview', icon: LayoutDashboard },
    { href: '/compose', label: 'Campaigns', icon: PenTool },
    { href: '/contacts', label: 'Contacts', icon: Users },
    { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(true); // Default to collapsed as requested
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [user, setUser] = useState<{ name: string, email: string } | null>(null);

    useEffect(() => {
        // Fetch User
        async function fetchUser() {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
            } catch (e) { }
        }
        if (pathname !== '/login') fetchUser();
    }, [pathname]);

    // Don't render on login page
    if (pathname === '/login') return null;

    return (
        <>
            {/* Mobile Hamburger Trigger - Only visible on small screens when closed */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md text-gray-800"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Sidebar Container */}
            <motion.aside
                initial={false}
                animate={{
                    width: isCollapsed ? '80px' : '288px',
                    x: isMobileOpen ? 0 : '-100%' // On mobile: 0 if open, -100% if closed. On Desktop: override via CSS
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={clsx(
                    "fixed left-0 top-0 h-screen bg-[#051a10] text-white flex flex-col border-r border-white/5 shadow-2xl z-50 overflow-hidden",
                    // Mobile: fixed off-screen handled by motion 'x'. Desktop: sticky/fixed.
                    // We use a media query trick or just force the 'x' to 0 on desktop
                    "md:translate-x-0"
                )}
                // Override framer motion 'x' on desktop using style prop if needed, or better:
                style={{ x: 0 }} // This forces desktop to be visible. We need to handle mobile 'x' carefully.
            >
                {/* HACK: We need separate animation logic for Desktop vs Mobile. 
                   Framer motion interacts with CSS. 
                   Let's use a standard implementation: 
                   Mobile: fixed inset-y-0 left-0 z-50 w-72 transform ...
                   Desktop: relative/fixed h-full ...
               */}
            </motion.aside>

            {/* Re-implementing with cleaner separating for Mobile/Desktop to avoid hydration mismatches and complexity */}
            <div className={clsx(
                "fixed inset-y-0 left-0 z-50 bg-[#051a10] text-white flex flex-col transition-all duration-300 shadow-2xl border-r border-white/5",
                // Mobile State
                isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full w-72",
                // Desktop State (overrides mobile)
                isCollapsed ? "md:translate-x-0 md:w-20" : "md:translate-x-0 md:w-72"
            )}>
                {/* Mobile Close Button */}
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="md:hidden absolute top-4 right-4 text-white/50 hover:text-white"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Desktop Collapse Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden md:flex absolute -right-3 top-10 w-6 h-6 bg-[#006633] rounded-full items-center justify-center shadow-lg cursor-pointer hover:bg-white hover:text-[#006633] transition-colors z-50"
                >
                    {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
                </button>

                {/* Brand Header */}
                <div className={clsx("p-6 border-b border-white/5 flex items-center gap-3", isCollapsed && "md:justify-center md:p-4")}>
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                    </div>
                    <div className={clsx("transition-opacity duration-200", isCollapsed ? "md:hidden" : "block")}>
                        <h1 className="text-lg font-bold tracking-tight font-serif whitespace-nowrap">DeEXCLUSIVES</h1>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium">Music Org</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)} // Close on navigate (mobile)
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium relative",
                                    isActive ? "bg-[#006633] text-white shadow-lg shadow-[#006633]/25" : "text-gray-400 hover:text-white hover:bg-white/5",
                                    isCollapsed && "md:justify-center md:px-2"
                                )}
                                title={isCollapsed ? item.label : undefined}
                            >
                                <Icon className={clsx("w-5 h-5 flex-shrink-0", isActive ? "text-white" : "text-gray-500 group-hover:text-white")} />
                                <span className={clsx("transition-opacity duration-200 whitespace-nowrap", isCollapsed ? "md:hidden" : "block")}>
                                    {item.label}
                                </span>
                                {isActive && isCollapsed && (
                                    <span className="hidden md:block absolute right-2 w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Footer */}
                <div className="p-4 border-t border-white/5">
                    <div className={clsx(
                        "flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group",
                        isCollapsed && "md:justify-center md:p-2"
                    )}>
                        <div className="w-10 h-10 rounded-full bg-[#EF3A05] flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div className={clsx("flex-1 overflow-hidden transition-opacity duration-200", isCollapsed ? "md:hidden" : "block")}>
                            <p className="text-sm font-bold text-gray-200 group-hover:text-white truncate">{user?.name || 'Admin User'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email || 'Loading...'}</p>
                        </div>
                        {!isCollapsed && <LogOut className="w-4 h-4 text-gray-500 group-hover:text-[#EF3A05]" />}
                    </div>
                </div>
            </div>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    onClick={() => setIsMobileOpen(false)}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fade-in"
                />
            )}
        </>
    );
}
