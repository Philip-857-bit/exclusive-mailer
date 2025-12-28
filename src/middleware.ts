import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isAuthPage = path === '/login';
    const isProtectedPath = path === '/' || path.startsWith('/compose') || path.startsWith('/contacts') || path.startsWith('/settings');

    const token = request.cookies.get('auth_token')?.value;

    // Redirect to login if accessing protected route without token
    if (isProtectedPath && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Redirect to dashboard if accessing login while logged in
    if (isAuthPage && token) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/login', '/compose/:path*', '/contacts/:path*', '/settings/:path*'],
};
