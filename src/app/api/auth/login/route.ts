import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        const validEmail = process.env.GMAIL_USER;
        const validPassword = process.env.ADMIN_PASSWORD; // Must be set in .env

        if (!validEmail || !validPassword) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        if (email === validEmail && password === validPassword) {
            // Set simple auth cookie
            // In production, use JWT or proper session. For MVP, a simple flag or secret is ok.
            // We'll set a basic token.

            const response = NextResponse.json({ success: true });
            response.cookies.set('auth_token', 'logged_in', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7, // 1 week
                path: '/',
            });

            return response;
        }

        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
