"use server"
import { auth } from "@/auth";
import { prisma } from "@/prisma";

export async function updateOriginalText(id: string, original_text: string) {
    const session = await auth();

    if (!session?.userId) {
        throw new Error('用户未登录');
    }

    const updatedMemoCard = await prisma.memo_card.updateMany({
        where: {
            id: id,
            user_id: session.userId
        },
        data: {
            original_text
        },
    });

    return JSON.stringify(updatedMemoCard);
}
