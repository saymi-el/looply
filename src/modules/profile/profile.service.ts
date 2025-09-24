import { prisma } from '../../config/db.js';


export async function getProfile(userId: string) {
    return prisma.profile.findUnique({ where: { userId } });
}


export async function upsertProfile(userId: string, data: any) {
    return prisma.profile.upsert({
        where: { userId },
        create: { userId, ...data },
        update: data,
    });
}