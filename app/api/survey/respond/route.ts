import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Rate Limiter: 10 requests per website visitor per minute
const rateLimiter = new RateLimiterMemory({
    points: 10,
    duration: 60,
});

// Validation Schema
const ResponseSchema = z.object({
    surveyId: z.string().min(1),
    customerInfo: z.object({
        fullName: z.string().min(1, 'Name required'),
        email: z.string().email().or(z.literal('')), // Allow empty if not required in UI, but UI says required
        phone: z.string().min(1),
        companyName: z.string().min(1),
        country: z.string().optional(),
        address: z.string().optional()
    }),
    language: z.enum(['tr', 'en']).default('tr'),
    answers: z.record(z.string(), z.string())
});

export async function POST(request: Request) {
    // 1. Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    try {
        await rateLimiter.consume(ip);
    } catch {
        return NextResponse.json({ success: false, error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    try {
        const body = await request.json();

        // 2. Input Validation
        const validation = ResponseSchema.safeParse(body);
        if (!validation.success) {
            console.error('Validation error:', validation.error);
            return NextResponse.json({ success: false, error: 'Invalid data format' }, { status: 400 });
        }

        const { surveyId, customerInfo, language, answers } = validation.data;

        // 3. Database Interaction
        const response = await prisma.response.create({
            data: {
                surveyId,
                customerInfo: JSON.stringify(customerInfo),
                language,
                answers: {
                    create: Object.entries(answers).map(([questionId, value]) => ({
                        questionId,
                        value
                    }))
                }
            }
        });

        return NextResponse.json({ success: true, id: response.id });
    } catch (error) {
        console.error('Error in respond route:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
