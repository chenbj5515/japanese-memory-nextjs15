"use server"
import { auth } from "@/auth";
import { prisma } from "@/prisma";

export async function updateReviewTimes(id: string) {
    const session = await auth();

    if (!session?.userId) {
        throw new Error('ユーザー未登録');
    }

    const updatedMemoCard = await prisma.memo_card.updateMany({
        where: {
            id: id,
            user_id: session.userId
        },
        data: {
            review_times: {
                increment: 1
            }
        }
    });

    return JSON.stringify(updatedMemoCard);
}
