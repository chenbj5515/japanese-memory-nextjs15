"use client"
import { useSelector, TypedUseSelectorHook } from "react-redux";
import { LocalCard } from "@/components/card";
import { RootState } from "@/store";

const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

export function LocalCards() {
    const { localCards } = useTypedSelector((state: RootState) => state.localCardsSlice);
    return (
        <div className="space-y-14 sm:text-base text-[18px] mx-auto mb-14 width-92-675">
            {localCards?.map(card => (
                <LocalCard key={card.key} original_text={card.original_text} />
            ))}
        </div>
    )
}