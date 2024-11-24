import { prisma } from "@/prisma";
import { auth } from "@/auth";
import Exam from "@/components/exam";
import { Prisma } from '@prisma/client';

export default async function App() {
    const session = await auth()
    const count = await prisma.word_card.count();

    const randomSkip = Math.max(0, Math.floor(Math.random() * (count - 10)));
    const wordCards = await prisma.word_card.findMany({
        where: {
            user_id: session?.userId,
        },
        skip: randomSkip,
        take: 20,
        include: {
            memo_card: true,
        },
    });

    const randomShortCards = await prisma.$queryRaw<Prisma.memo_cardGetPayload<{}>[]>`
        SELECT *
        FROM memo_card
        WHERE LENGTH(original_text) < 50
        ORDER BY RANDOM()
        LIMIT 5
    `;

    return (
        <div className="w-full pl-[20px] pb-10 pr-[20px]">
            <Exam wordCards={wordCards} randomShortCards={randomShortCards} />
        </div>
    );
}

