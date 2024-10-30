"use client"
import React from "react";
import { useSelector, TypedUseSelectorHook } from "react-redux";
import { MemoCard } from "@/components";
import { Prisma } from '@prisma/client';
import { RootState } from "@/store";

interface IProps {
    memoCardsInitial: Prisma.memo_cardGetPayload<{}>[]
}

const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

export function MemoCards(props: IProps) {
    const { memoCardsInitial } = props;
    const [memoCards, setMemoCards] = React.useState(memoCardsInitial);
    const { localCards } = useTypedSelector((state: RootState) => state.localCardsSlice);

    function handleDelete(id: string) {
        setMemoCards(prev => prev.filter(card => card.id !== id));
    }

    return (
        <>
            {memoCards?.map(card => (
                <div className="sm:text-base text-[18px] mx-auto mb-14 width-92-675" key={card.id}>
                    <MemoCard {...card} onDelete={handleDelete} />
                </div>
            ))}
            {
                localCards.length === 0 && memoCards.length === 0 ? (
                    <div className="flex mt-[80px] items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-blue-900 dark:to-blue-800">
                        <div className="px-4 mx-auto text-center lg:px-8 sm:py-24 lg:py-32">
                            <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white sm:text-5xl">
                                データが見つかりません
                            </h1>
                            <p className="mt-6 text-base leading-7 text-black dark:text-white">
                                気になる日本語を入力してください
                            </p>
                        </div>
                    </div>
                ) : null
            }
        </>
    )
}