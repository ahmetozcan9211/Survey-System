import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { titleTR, titleEN, type, questions } = body;

        const survey = await prisma.survey.create({
            data: {
                titleTR,
                titleEN,
                type,
                questions: {
                    create: questions.map((q: any) => ({
                        type: q.type,
                        textTR: q.textTR,
                        textEN: q.textEN,
                        descriptionTR: q.descriptionTR,
                        descriptionEN: q.descriptionEN,
                        required: q.required,
                        order: q.order,
                        options: {
                            create: q.options.map((opt: any) => ({
                                textTR: opt.textTR,
                                textEN: opt.textEN
                            }))
                        }
                    }))
                }
            }
        });

        return NextResponse.json({ success: true, id: survey.id });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create survey' }, { status: 500 });
    }
}
