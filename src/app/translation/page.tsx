import { Prisma } from '@prisma/client';
import { prisma } from "@/prisma";
import { auth } from "@/auth"
import { Translation } from "@/components";

export default async function App() {
    const session = await auth();

    const countResult = await prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*) as count FROM memo_card WHERE LENGTH(original_text) < 80
    `;
    const count = Number(countResult[0].count);

    const latestCardsPromise = prisma.$queryRaw<Prisma.memo_cardGetPayload<{}>[]>`
        SELECT * FROM memo_card 
        WHERE LENGTH(original_text) < 80 AND user_id = ${session?.userId}
        ORDER BY create_time DESC 
        LIMIT 10
    `;

    const randomSkip = Math.max(0, Math.floor(Math.random() * Math.max(1, count - 10)));

    const randomCardsPromise = prisma.$queryRaw<Prisma.memo_cardGetPayload<{}>[]>`
        SELECT * FROM memo_card 
        WHERE LENGTH(original_text) < 80 AND user_id = ${session?.userId}
        OFFSET ${randomSkip} 
        LIMIT 10
    `;

    const [latestCards, randomCards] = await Promise.all([latestCardsPromise, randomCardsPromise]);

    const memoCards = [...latestCards, ...randomCards];

    return (
        <div className="pl-5 pb-10 pr-5">
            {
                memoCards.length === 0 ? (
                    <div className="flex mt-[80px] items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-blue-900 dark:to-blue-800">
                        <div className="px-4 mx-auto text-center lg:px-8 sm:py-24 lg:py-32">
                            <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white sm:text-5xl">
                                データが見つかりません
                            </h1>
                        </div>
                    </div>
                ) : null
            }
            {
                memoCards.map(card => (
                    <Translation key={card.id} {...card} />
                ))
            }
        </div>
    );
}
