import { auth } from "@/auth";
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.redirect(new URL('/api/auth/signin', req.url));
    }
    if (req.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/latest', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/",
        '/latest',
        '/random',
        '/translation',
        '/word-cards',
        '/test',
    ],
};
