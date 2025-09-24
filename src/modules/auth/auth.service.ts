import { prisma } from '../../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';


export async function createUser(email: string, password: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw Object.assign(new Error('Email already in use'), { status: 400 });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash } });
    return user;
}


export async function login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

    const token = jwt.sign({ sub: user.id }, env.JWT_SECRET, { expiresIn: '7d' });
    return { user, token };
}


export function verifyToken(token: string) {
    return jwt.verify(token, env.JWT_SECRET) as { sub: string; iat: number; exp: number };
}