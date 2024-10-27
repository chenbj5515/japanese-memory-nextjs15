"use server"
import { auth } from "@/auth";
import { prisma } from "@/prisma"

export async function insertMemoCard(originalText: string, translation: string, pronunciation: string) {
    const session = await auth();
    
    const newMemoCard = await prisma.memo_card.create({
        data: {
            record_file_path: "",
            original_text: originalText,
            review_times: 0,
            translation: translation,
            user_id: session?.userId,
            kana_pronunciation: pronunciation,
            create_time: new Date(),
            update_time: new Date()
        },
    });

    return JSON.stringify(newMemoCard);
}
