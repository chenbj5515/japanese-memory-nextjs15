"use client"
import { useSelector, TypedUseSelectorHook } from "react-redux";
import { LocalCard } from "@/components/card";
import { RootState } from "@/store";

const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

export function LocalCards() {
    const { localCards } = useTypedSelector((state: RootState) => state.localCardsSlice);
    return (
        <div className="space-y-14 mb-14">
            {localCards?.map(card => (
                <LocalCard key={card.key} original_text={card.original_text} />
            ))}
        </div>
    )
}