import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    const csvPath = path.join(__dirname, '../registrations_export_2025-07-31T17_19_52.922Z.csv');
    const data = fs.readFileSync(csvPath, 'utf-8');
    const lines = data.split('\n').filter((line) => line.trim() !== '');

    console.log(`Found ${lines.length - 1} contacts to process.`);

    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        // Match CSV fields: "value" or value
        const parts = line.match(/(?:^|,)(\"(?:[^\"]+|\"\")*\"|[^,]*)/g);

        if (!parts) continue;

        const cleanParts = parts.map(p => p.replace(/^,/, '').replace(/^"|"$/g, '').trim());

        // CSV Header: id,name,email,phone,company,createdAt
        // cleanParts indices: 0=id, 1=name, 2=email, 3=phone, 4=company(profession), 5=createdAt
        const name = cleanParts[1];
        const email = cleanParts[2];
        const phone = cleanParts[3];
        const profession = cleanParts[4];
        const createdAtStr = cleanParts[5];

        if (!email) continue;

        try {
            await prisma.contact.upsert({
                where: { email },
                update: {
                    name,
                    phone,
                    profession,
                },
                create: {
                    name,
                    email,
                    phone,
                    profession,
                    createdAt: createdAtStr ? new Date(createdAtStr) : new Date(),
                },
            });
        } catch (e) {
            console.error(`Failed to upsert contact ${email}:`, e);
        }
    }
    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
