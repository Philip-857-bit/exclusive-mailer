'use client';

import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';

    return (
        <main className={clsx(
            "flex-1 min-h-screen w-full relative transition-all duration-300",
            !isLoginPage && "md:pl-20 pt-16 md:pt-0"
        )}>
            {children}
        </main>
    );
}
