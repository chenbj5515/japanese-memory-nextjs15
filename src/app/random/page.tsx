import React from "react"
import { auth } from "@/auth"
import { prisma } from "@/prisma"
import { MemoCards, LocalCards, InputBox, WordCardAdder } from "@/components";

export default async function Home() {
    const session = await auth()

    const count = await prisma.memo_card.count();

    const randomOffset = Math.floor(Math.random() * (count - 20));

    const memoCards = await prisma.memo_card.findMany({
        where: {
            user_id: session?.userId,
        },
        skip: randomOffset,
        take: 20,
    });

    return (
        <>
            <div className="pb-[36px]">
                <MemoCards memoCardsInitial={memoCards} />
                <LocalCards />
            </div>
            <div className="fixed z-[12] width-80-680 left-[50%] -translate-x-1/2 bottom-2 h-[50px] w-[100%]">
                <InputBox />
            </div>
            <WordCardAdder />
        </>
    )
}