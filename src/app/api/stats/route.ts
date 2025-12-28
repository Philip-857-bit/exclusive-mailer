import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const professions = await prisma.contact.groupBy({
            by: ['profession'],
            _count: {
                profession: true,
            },
        });

        const normalizedMap = new Map<string, number>();

        professions.forEach((p: { profession: string | null, _count: { profession: number } }) => {
            if (!p.profession) return;
            // Normalize: "student" -> "Student"
            const normalized = p.profession.charAt(0).toUpperCase() + p.profession.slice(1).toLowerCase();
            const currentCount = normalizedMap.get(normalized) || 0;
            normalizedMap.set(normalized, currentCount + p._count.profession);
        });

        const formatted = Array.from(normalizedMap.entries()).map(([profession, count]) => ({
            profession,
            count
        })).sort((a, b) => b.count - a.count); // Sort by count desc

        return NextResponse.json({ professions: formatted });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
