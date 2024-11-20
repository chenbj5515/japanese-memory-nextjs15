"use client"
import { Button } from "@/components/ui/button"
import ExamPage from '@/components/exam'
import { startExam } from '@/store/exam-state-slice'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'

const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

export default function Component(props: any) {
    const { wordCards, randomShortCards } = props;
    const dispatch = useDispatch();
    const { status } = useTypedSelector((state: RootState) => state.examStateSlice);

    const handleAgree = () => {
        dispatch(
            startExam()
        );
    }

    if (status === "initial") {
        return (
            <div className="flex pt-[200px] flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-200 text-center">
                    試験を始める準備はできましたか？
                </h1>
                <Button onClick={handleAgree} size="sm" className="w-[120px] text-md px-6 py-5">
                    はい
                </Button>
            </div>
        )
    }

    return (
        <ExamPage wordCards={wordCards} randomShortCards={randomShortCards} />
    )
}