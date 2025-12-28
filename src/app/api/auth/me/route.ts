import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        return NextResponse.json({ user: null }, { status: 401 });
    }

    // In a real app, we'd decode the token. 
    // Here we know the user is the admin defined in env.
    // We can return the env user if the token is valid.

    return NextResponse.json({
        user: {
            name: 'Admin',
            email: process.env.GMAIL_USER
        }
    });
}
