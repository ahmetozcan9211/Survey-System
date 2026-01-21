import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Delete related records first (cascade should handle this if configured, but explicit is safer with some DBs)
        // Prisma schema doesn't strictly enforce cascade on sqlite unless configured? 
        // Usually prisma handles nested deletes if relations are set up right, but let's be safe or rely on simple delete if schema allows.
        // Our schema: Survey -> Question -> Option, Survey -> Response -> Answer.
        // We should delete in order: Answer, Response, Option, Question, Survey.
        // Or use transaction with deleteMany.

        await prisma.$transaction(async (tx) => {
            // Delete Answers and Responses
            const responses = await tx.response.findMany({ where: { surveyId: id }, select: { id: true } });
            const responseIds = responses.map(r => r.id);

            await tx.answer.deleteMany({ where: { responseId: { in: responseIds } } });
            await tx.response.deleteMany({ where: { surveyId: id } });

            // Delete Options and Questions
            const questions = await tx.question.findMany({ where: { surveyId: id }, select: { id: true } });
            const questionIds = questions.map(q => q.id);

            await tx.option.deleteMany({ where: { questionId: { in: questionIds } } });
            await tx.question.deleteMany({ where: { surveyId: id } });

            // Delete Survey
            await tx.survey.delete({ where: { id } });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting survey:', error);
        return NextResponse.json({ error: 'Failed to delete survey' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { titleTR, titleEN, type, questions } = body;

        // Use transaction to update
        await prisma.$transaction(async (tx) => {
            // Update Survey basics
            await tx.survey.update({
                where: { id },
                data: { titleTR, titleEN, type }
            });

            // Managing questions is complex. 
            // Strategy: 
            // 1. Get existing question IDs
            // 2. Identify questions to delete (in DB but not in request)
            // 3. Identify questions to create (no ID)
            // 4. Identify questions to update (has ID)

            const existingQuestions = await tx.question.findMany({
                where: { surveyId: id },
                select: { id: true }
            });
            const existingQIds = existingQuestions.map(q => q.id);

            const incomingQIds = questions
                .filter((q: any) => q.id)
                .map((q: any) => q.id);

            const toDeleteQIds = existingQIds.filter(qid => !incomingQIds.includes(qid));

            // Delete removed questions (and their options via cascade if implicit or manual)
            // Manual delete of options first just in case
            await tx.option.deleteMany({ where: { questionId: { in: toDeleteQIds } } });
            await tx.question.deleteMany({ where: { id: { in: toDeleteQIds } } });

            // Upsert questions
            for (const q of questions) {
                if (q.id) {
                    // Update existing question
                    await tx.question.update({
                        where: { id: q.id },
                        data: {
                            textTR: q.textTR,
                            textEN: q.textEN,
                            descriptionTR: q.descriptionTR,
                            descriptionEN: q.descriptionEN,
                            required: q.required,
                            type: q.type,
                            order: q.order
                        }
                    });

                    // Handle Options for this question
                    if (q.type === 'CHOICE') {
                        const existingOptions = await tx.option.findMany({ where: { questionId: q.id }, select: { id: true } });
                        const existingOIds = existingOptions.map(o => o.id);
                        const incomingOIds = q.options.filter((o: any) => o.id).map((o: any) => o.id);
                        const toDeleteOIds = existingOIds.filter(oid => !incomingOIds.includes(oid));

                        await tx.option.deleteMany({ where: { id: { in: toDeleteOIds } } });

                        for (const opt of q.options) {
                            if (opt.id) {
                                await tx.option.update({
                                    where: { id: opt.id },
                                    data: { textTR: opt.textTR, textEN: opt.textEN }
                                });
                            } else {
                                await tx.option.create({
                                    data: {
                                        questionId: q.id,
                                        textTR: opt.textTR,
                                        textEN: opt.textEN
                                    }
                                });
                            }
                        }
                    }
                } else {
                    // Create new question
                    await tx.question.create({
                        data: {
                            surveyId: id,
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
                        }
                    });
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating survey:', error);
        return NextResponse.json({ error: 'Failed to update survey' }, { status: 500 });
    }
}
