"use client"
import { speakText } from "@/utils";
import { TWordCard } from "@/app/word-cards/page";
import { useTripleRightClick } from "@/hooks";
import {
    Card,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { deleteWordCard } from "./server-actions";

interface IProps {
    wordCardInfo: TWordCard;
    onRecognize: (id: string) => void;
    onUnRecognize: (wordCardInfo: TWordCard) => void;
}

export function WordCard(props: IProps) {
    const { wordCardInfo, wordCardInfo: { id, word, meaning }, onRecognize, onUnRecognize } = props;

    const cardRef = useTripleRightClick(async () => {
        onRecognize?.(id);
        await deleteWordCard(id);
    })

    function handlePlayBtn(text: string) {
        speakText(text, {
            voicerName: "ja-JP-NanamiNeural",
        });
    }

    return (
        <Card ref={cardRef} className="sm:w-[228px] sm:text-sm text-[17px] w-full word-card sm:h-[150px] rounded-[8px] dark:bg-eleDark dark:text-white p-5 mt-2 mb-8 relative">
            <div
                className="play-button-bg rounded-[50%] w-8 h-8 absolute top-2 right-2 cursor-pointer"
                onClick={() => handlePlayBtn(word)}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="sm:w-[20px] sm:h-[16px] w-[25px] h-[20px] volume_button absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2"
                >
                    <path
                        clipRule="evenodd"
                        d="M11.26 3.691A1.2 1.2 0 0 1 12 4.8v14.4a1.199 1.199 0 0 1-2.048.848L5.503 15.6H2.4a1.2 1.2 0 0 1-1.2-1.2V9.6a1.2 1.2 0 0 1 1.2-1.2h3.103l4.449-4.448a1.2 1.2 0 0 1 1.308-.26Zm6.328-.176a1.2 1.2 0 0 1 1.697 0A11.967 11.967 0 0 1 22.8 12a11.966 11.966 0 0 1-3.515 8.485 1.2 1.2 0 0 1-1.697-1.697A9.563 9.563 0 0 0 20.4 12a9.565 9.565 0 0 0-2.812-6.788 1.2 1.2 0 0 1 0-1.697Zm-3.394 3.393a1.2 1.2 0 0 1 1.698 0A7.178 7.178 0 0 1 18 12a7.18 7.18 0 0 1-2.108 5.092 1.2 1.2 0 1 1-1.698-1.698A4.782 4.782 0 0 0 15.6 12a4.78 4.78 0 0 0-1.406-3.394 1.2 1.2 0 0 1 0-1.698Z"
                        fillRule="evenodd"
                    ></path>
                </svg>
            </div>
            <div>{word}</div>
            <div className="mt-1 relative">
                <section
                    className={`rounded-lg absolute unique-glass ${"glass"}  w-[101%] h-[105%] -left-[4px] -top-[2px]`}
                ></section>
                {meaning}
            </div>
            <div className="flex justify-between sm:w-[195px] w-full mt-[32px] mb-[0px]">
                <Button
                    className="sm:text-sm text-[16px]"
                    onClick={() => onRecognize(id)}
                    variant="outline"
                >
                    わかる
                </Button>
                <Button
                    className="sm:text-sm text-[16px]"
                    onClick={() => onUnRecognize(wordCardInfo)}
                    variant="outline"
                >
                    分からない
                </Button>
            </div>
        </Card>
    )
}