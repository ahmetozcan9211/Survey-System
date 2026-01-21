import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        const validUsername = process.env.ADMIN_USERNAME;
        const validPassword = process.env.ADMIN_PASSWORD;

        if (!validUsername || !validPassword) {
            console.error('Admin credentials not set in environment variables');
            return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
        }

        if (username === validUsername && password === validPassword) {
            // Create a response with a success message
            const response = NextResponse.json({ success: true });

            // Set a cookie
            // In a real app, use a proper session token or JWT.
            // For this simple requirement, we'll set a 'admin_session' cookie.
            response.cookies.set('admin_session', 'true', {
                httpOnly: true, // Not accessible via JS
                secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
                sameSite: 'strict',
                maxAge: 60 * 60 * 24, // 1 day
                path: '/',
            });

            return response;
        }

        return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Error processing request' }, { status: 500 });
    }
}
