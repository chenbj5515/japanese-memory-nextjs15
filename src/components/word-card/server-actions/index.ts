"use server"
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { revalidatePath } from 'next/cache';

export async function deleteWordCard(id: string) {
    const session = await auth();

    const deletedWordCard = await prisma.word_card.deleteMany({
        where: {
            id: id,
            user_id: session?.userId
        },
    });
    revalidatePath("/word-cards")

    return JSON.stringify(deletedWordCard);
}
