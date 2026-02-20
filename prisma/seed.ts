import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding ...')

    // Create Admin User
    const adminEmail = 'admin@admin.com'
    const adminPassword = await bcrypt.hash('admin1234', 10)

    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            password: adminPassword,
            role: 'ADMIN',
            name: 'System Admin'
        },
        create: {
            email: adminEmail,
            password: adminPassword,
            role: 'ADMIN',
            name: 'System Admin'
        }
    })
    console.log(`Admin user created: ${adminEmail} / admin1234`)

    // Clear existing data (Note: Careful with deleteMany in production)
    // await prisma.stampTemplate.deleteMany()

    const templates = [
        {
            name: 'Square Medium (5x5 cm)',
            width: 5.0,
            height: 5.0,
            backgroundUrl: '/templates/bg-square-medium.png',
            backgroundWidth: 5.0,
            backgroundHeight: 5.0,
            backgroundX: 0,
            backgroundY: 0,
            userImageWidth: 4.0,
            userImageHeight: 4.0,
            userImageX: 0.5,
            userImageY: 0.5,
        },
        {
            name: 'Custom Overlay (10x10 cm)',
            width: 10.0,
            height: 10.0,
            backgroundUrl: '/templates/bg-square-medium.png',
            backgroundWidth: 6.0,
            backgroundHeight: 6.0,
            backgroundX: 2.0, // Middle
            backgroundY: 2.0, // Middle
            userImageWidth: 4.0,
            userImageHeight: 4.0,
            userImageX: 0, // Top-Left
            userImageY: 0, // Top-Left
        },
    ]

    for (const t of templates) {
        const template = await prisma.stampTemplate.create({
            data: {
                ...t,
                backgrounds: {
                    create: [
                        { url: t.backgroundUrl },
                        { url: t.backgroundUrl.replace('.png', '-alt1.png') },
                        { url: t.backgroundUrl.replace('.png', '-alt2.png') },
                        { url: t.backgroundUrl.replace('.png', '-alt3.png') },
                    ]
                }
            },
        })
        console.log(`Created template: ${template.name} with 4 backgrounds`)
    }

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
