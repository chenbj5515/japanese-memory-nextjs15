"use client"
import { Button } from "@/components/ui/button"
import { startExam } from '@/store/exam-state-slice'
import { useDispatch } from 'react-redux'
import { useRouter } from "next/navigation"

export default function Component(props: any) {
    const dispatch = useDispatch();
    
    const router = useRouter();

    const handleAgree = () => {
        dispatch(
            startExam()
        );
        router.push("/exam")
    }

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