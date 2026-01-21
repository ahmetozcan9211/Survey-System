import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Delete answers first then response
        // Or transaction
        await prisma.$transaction([
            prisma.answer.deleteMany({ where: { responseId: id } }),
            prisma.response.delete({ where: { id } })
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting response:', error);
        return NextResponse.json({ error: 'Failed to delete response' }, { status: 500 });
    }
}
