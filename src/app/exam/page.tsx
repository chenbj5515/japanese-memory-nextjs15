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
    const results = await prisma.word_card.findMany({
        where: {
            user_id: session?.userId,
        },
        skip: randomSkip,
        take: 20,
        include: {
            memo_card: true,
        },
    });

    return (
        <div className="w-full pl-[20px] pb-10 pr-[20px]">
            <ExamPage results={results} />
        </div>
    );
}

export const dynamic = 'force-dynamic';