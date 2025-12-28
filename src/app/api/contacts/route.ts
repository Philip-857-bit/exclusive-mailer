import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const contacts = await prisma.contact.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(contacts);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, profession, phone } = body;

        // Basic validation
        if (!email || !name) {
            return NextResponse.json({ error: 'Email and Name required' }, { status: 400 });
        }

        const newContact = await prisma.contact.create({
            data: { name, email, profession, phone },
        });

        return NextResponse.json(newContact);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, name, email, profession, phone } = body;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const updated = await prisma.contact.update({
            where: { id: Number(id) },
            data: { name, email, profession, phone },
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.contact.delete({ where: { id: Number(id) } });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
