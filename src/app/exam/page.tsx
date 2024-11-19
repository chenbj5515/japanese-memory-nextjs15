import { prisma } from "@/prisma";
import { Prisma } from '@prisma/client';
import { auth } from "@/auth";
import ExamPage from "./_components/exam";

export type TWordCard = Prisma.word_cardGetPayload<{}> & {
    memo_card: Prisma.memo_cardGetPayload<{}>
};

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

    const randomShortCards = await prisma.$queryRaw`
        SELECT *
        FROM memo_card
        WHERE LENGTH(original_text) < 50
        ORDER BY RANDOM()
        LIMIT 5
    `;

    return (
        <div className="w-full pl-[20px] pb-10 pr-[20px]">
            <ExamPage wordCards={wordCards} randomShortCards={randomShortCards} />
        </div>
    );
}

export const dynamic = 'force-dynamic';