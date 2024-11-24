'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlayCircle, CheckCircle, XCircle } from 'lucide-react'
import { containsKanji, speakText } from '@/utils'
import { askAI } from '@/server-actions'
import { readStreamableValue } from 'ai/rsc';
import { TWordCard } from '@/app/word-cards/page'
import { Prisma } from '@prisma/client'
import diff_match_patch from 'diff-match-patch'

interface IProps {
    wordCards: TWordCard[]
    randomShortCards: Prisma.memo_cardGetPayload<{}>[]
}

enum GradeStatus {
    MissingInput = "MissingInput",
    CheckAnswer = "CheckAnswer",
    ProvideAnswer = "ProvideAnswer",
}

type GradeResult = {
    userInputValue: string;
    word: string;
    isCorrect: boolean;
    feedback: string;
    correctAnswer: string;
    score: number;
};

function useCountDowner() {
    const timeLeftRef = useRef(25 * 60); // 25 minutes in seconds
    const timerDisplayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            if (timeLeftRef.current <= 1) {
                clearInterval(timer);
                timeLeftRef.current = 0;
            } else {
                timeLeftRef.current -= 1;
            }
            if (timerDisplayRef.current) {
                const minutes = Math.floor(timeLeftRef.current / 60);
                const seconds = timeLeftRef.current % 60;
                timerDisplayRef.current.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return { timeLeftRef, timerDisplayRef }
}

export default function ExamPage(props: IProps) {
    const { wordCards, randomShortCards } = props;
    const [inputValues, setInputValues] = useState<any>({});
    const [reviewResults, setReviewResults] = useState<any>({}); // Stores review results for each question
    const [score, setScore] = useState<number | null>(null);
    const { timerDisplayRef } = useCountDowner();
    const compeleted = score !== null;

    const handleInputChange = (key: string, value: string) => {
        setInputValues((prev: any) => ({
            ...prev,
            [key]: value,
        }));
    };

    function handlePlay(original_text: string) {
        original_text && speakText(original_text, {
            voicerName: "ja-JP-NanamiNeural",
        });
    }

    async function fetchCorrectAnswer(word: string, type: string): Promise<string> {
        const prompt = type === "hiragana"
            ? `「${word}」这个短语的平假名读音是什么？请只给我平假名读音不要输出任何其他内容。`
            : `「${word}」这个短语的意思是什么？请直接给出中文意思，不要输出任何其他内容。`;
        const { output } = await askAI(prompt, 0.9);

        let correctAnswer = "";
        for await (const delta of readStreamableValue(output)) {
            if (delta) correctAnswer += delta;
        }
        return correctAnswer;
    }

    async function checkAnswer(word: string, userInputValue: string, type: string): Promise<boolean> {
        const prompt = type === "hiragana"
            ? `「${word}」这个短语的读法用假名表示出来是「${userInputValue}」吗？如果你觉得是就返回true，你觉得不对就返回false，不要返回其他任何东西。`
            : `「${word}」这个短语用中文表达的话意思是「${userInputValue}」吗？如果你觉得是这个意思的话就返回true，你觉得并不是这个意思的就返回false，不要返回其他任何东西。`;

        const { output } = await askAI(prompt, 0.9);

        let result = "";
        for await (const delta of readStreamableValue(output)) {
            if (delta) result += delta;
        }

        return result === "true";
    }

    async function grade(wordCard: TWordCard, userInputValue: string, type: string): Promise<GradeResult> {
        const { word, meaning } = wordCard;

        // 确定当前状态
        const status = !userInputValue
            ? GradeStatus.MissingInput
            : GradeStatus.CheckAnswer;

        if (status === GradeStatus.MissingInput) {
            const correctAnswer = type === "hiragana"
                ? await fetchCorrectAnswer(word, type)
                : type === "japanese"
                    ? word
                    : meaning.replace("意味：", "");

            return {
                userInputValue,
                word,
                isCorrect: false,
                feedback: `参考答案: ${correctAnswer}`,
                correctAnswer,
                score: 0,
            };
        }

        const isCorrect = await checkAnswer(word, userInputValue, type);

        if (!isCorrect && type === "hiragana") {
            const correctAnswer = await fetchCorrectAnswer(word, type);

            return {
                userInputValue,
                word,
                isCorrect: correctAnswer === userInputValue,
                feedback: correctAnswer === userInputValue ? "正解" : `参考答案: ${correctAnswer}`,
                correctAnswer,
                score: correctAnswer === userInputValue ? 3 : 0,
            };
        }

        return {
            userInputValue,
            word,
            isCorrect,
            feedback: isCorrect ? "正解" : `参考答案: ${type === "japanese" ? word : meaning.replace("意味：", "")}`,
            correctAnswer: type === "japanese" ? word : meaning.replace("意味：", ""),
            score: isCorrect ? 3 : 0,
        };
    }

    async function handleCommit() {
        let totalScore = 0;
        const gradePromises: Promise<void>[] = [];

        // 日本語から中国語への翻訳のグレード
        wordCards.slice(0, 10).forEach((wordCard: any, index: number) => {
            const keyHiragana = `q1-${index}-hiragana`;
            const keyChinese = `q1-${index}-chinese`;

            if (containsKanji(wordCard.word)) {
                gradePromises.push(
                    grade(wordCard, inputValues[keyHiragana] || "", "hiragana")
                        .then(hiraganaResult => {
                            if (hiraganaResult.isCorrect) {
                                totalScore += 2;
                            }
                            setReviewResults((prev: any) => ({
                                ...prev,
                                [keyHiragana]: hiraganaResult,
                            }));
                        })
                );

                gradePromises.push(
                    grade(wordCard, inputValues[keyChinese] || "", "chinese")
                        .then(chineseResult => {
                            if (chineseResult.isCorrect) {
                                totalScore += 2;
                            }
                            setReviewResults((prev: any) => ({
                                ...prev,
                                [keyChinese]: chineseResult,
                            }));
                        })
                );
            } else {
                gradePromises.push(
                    grade(wordCard, inputValues[keyHiragana] || "", "chinese")
                        .then(chineseResult => {
                            if (chineseResult.isCorrect) {
                                totalScore += 4;
                            }
                            setReviewResults((prev: any) => ({
                                ...prev,
                                [keyChinese]: chineseResult,
                            }));
                        })
                );
            }
        });

        // 中国語から日本語への翻訳のグレード
        wordCards.slice(10).forEach((wordCard: any, index: number) => {
            const keyJapanese = `q2-${index}-japanese`;

            gradePromises.push(
                grade(wordCard, inputValues[keyJapanese] || "", "japanese")
                    .then(japaneseResult => {
                        if (japaneseResult.isCorrect) {
                            totalScore += 4;
                        }
                        setReviewResults((prev: any) => ({
                            ...prev,
                            [keyJapanese]: japaneseResult,
                        }));
                    })
            );
        });

        // 聴解問題のグレード
        randomShortCards.forEach((cardInfo: Prisma.memo_cardGetPayload<{}>, index: number) => {
            const keyListening = `q3-${index}-listening`;
            const dmp = new diff_match_patch();

            if (cardInfo.original_text) {
                gradePromises.push(
                    new Promise<void>((resolve) => {
                        const diff = dmp.diff_main(
                            cardInfo.original_text || "",
                            inputValues[keyListening] || ""
                        );
                        const htmlString = diff.map(([result, text]) => {
                            return `<span class="${result === -1
                                ? "text-wrong w-full break-words pointer-events-none"
                                : result === 1
                                    ? "text-correct w-full break-words pointer-events-none"
                                    : "w-full break-words pointer-events-none"
                                }">${text}</span>`;
                        }).join("");

                        const rightWordsLen = diff
                            .filter(diffInfo => diffInfo[0] === 1)
                            .reduce((acc, cur) => acc + cur[1].length, 0);

                        if (rightWordsLen > 0.9 * (cardInfo.original_text?.length ?? 0)) {
                            totalScore += 4;
                        }

                        setReviewResults((prev: any) => ({
                            ...prev,
                            [keyListening]: htmlString,
                        }));
                        resolve();
                    })
                );
            }
        });

        // 等待所有评分完成后设置总分
        await Promise.all(gradePromises);
        setScore(totalScore);
    }

    return (
        <div className="p-5 relative font-NewYork container w-[680px] mx-auto bg-gray-50 min-h-screen">
            <h1 className='font-bold text-[24px] text-center'>試験</h1>
            {
                !compeleted ? (
                    <div
                        ref={timerDisplayRef}
                        className="p-2 inset-0 flex items-center justify-center text-xl font-medium tabular-nums"
                    >
                        25:00
                    </div>
                ) : null
            }
            {
                compeleted ? (
                    <div className='absolute w-[360px] top-[6px] -right-[440px]'>
                        <div
                            style={{marginLeft: score.toString().length === 1 ? "34px" : "16px"}}
                            className='text-wrong h-[142px] -rotate-6 text-[112px] top'
                        >{score}</div>
                        <Image
                            className='absolute'
                            src="/lines.png"
                            width="246"
                            height="82"
                            alt='line'
                        />
                    </div>
                ) : null
            }
            <div className="space-y-8 mt-[20px]">
                {/* 日本語から中国語への翻訳 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-[18px]">日本語から中国語への翻訳</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {
                            wordCards.slice(0, 10).map((wordCard: any, index: number) => {
                                const keyHiragana = `q1-${index}-hiragana`;
                                const keyChinese = `q1-${index}-chinese`;

                                return (
                                    <div key={index}>
                                        <Label htmlFor={keyHiragana} className="text-[15px]">{index + 1}.「{wordCard.word}」</Label>
                                        {
                                            containsKanji(wordCard.word) && (
                                                <>
                                                    <Input
                                                        id={keyHiragana}
                                                        placeholder="平假名を入力してください"
                                                        className="mt-2"
                                                        disabled={compeleted}
                                                        autoComplete="off"
                                                        value={inputValues[keyHiragana] || ""}
                                                        onChange={(e) => handleInputChange(keyHiragana, e.target.value)}
                                                    />
                                                    {reviewResults[keyHiragana] && (
                                                        <div className="mt-2 flex items-center">
                                                            {reviewResults[keyHiragana].isCorrect ? (
                                                                <CheckCircle color="#32CD32" className="h-5 w-5 text-green-500 mr-2" />
                                                            ) : (
                                                                <XCircle color="#E50914" className="h-5 w-5 text-red-500 mr-2" />
                                                            )}
                                                            <span className="text-sm">
                                                                {reviewResults[keyHiragana].feedback}
                                                            </span>
                                                        </div>
                                                    )}
                                                </>
                                            )
                                        }
                                        <Input
                                            id={keyChinese}
                                            placeholder="中国語で入力してください"
                                            disabled={compeleted}
                                            autoComplete="off"
                                            className="mt-2"
                                            value={inputValues[keyChinese] || ""}
                                            onChange={(e) => handleInputChange(keyChinese, e.target.value)}
                                        />
                                        {reviewResults[keyChinese] && (
                                            <div className="mt-2 flex items-center">
                                                {reviewResults[keyChinese].isCorrect ? (
                                                    <CheckCircle color="#32CD32" className="h-5 w-5 text-green-500 mr-2" />
                                                ) : (
                                                    <XCircle color="#E50914" className="h-5 w-5 text-red-500 mr-2" />
                                                )}
                                                <span className="text-sm">
                                                    {reviewResults[keyChinese].feedback}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )
                            })
                        }
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-8 mt-[40px]">
                {/* 中国語から日本語への翻訳 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-[18px]">中国語から日本語への翻訳</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {
                            wordCards.slice(10).map((wordCard: any, index: number) => {
                                const keyJapanese = `q2-${index}-japanese`;

                                return (
                                    <div key={index}>
                                        <Label htmlFor={keyJapanese} className="text-[15px]">{index + 1}.「{wordCard.meaning.replace("意味：", "")}」</Label>
                                        <Input
                                            id={keyJapanese}
                                            placeholder="日本語で入力してください"
                                            disabled={compeleted}
                                            autoComplete="off"
                                            className="mt-2"
                                            value={inputValues[keyJapanese] || ""}
                                            onChange={(e) => handleInputChange(keyJapanese, e.target.value)}
                                        />
                                        {reviewResults[keyJapanese] && (
                                            <div className="mt-2 flex items-center">
                                                {reviewResults[keyJapanese].isCorrect ? (
                                                    <CheckCircle color="#32CD32" className="h-5 w-5 text-green-500 mr-2" />
                                                ) : (
                                                    <XCircle color="#E50914" className="h-5 w-5 text-red-500 mr-2" />
                                                )}
                                                <span className="text-sm">
                                                    {reviewResults[keyJapanese].feedback}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )
                            })
                        }
                    </CardContent>
                </Card>
            </div>
            {/* 聴解問題 */}
            <div className="space-y-8 mt-[40px]">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-[18px]">聴解問題</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {
                            randomShortCards.map((cardInfo: any, index: number) => {
                                const keyListening = `q3-${index}-listening`;
                                return (
                                    <div key={index}>
                                        <div className="flex items-center justify-start mb-4">
                                            <Button onClick={() => handlePlay(cardInfo.original_text)} variant="outline" size="icon">
                                                <PlayCircle className="h-6 w-6" />
                                                <span className="sr-only">音声を再生</span>
                                            </Button>
                                            <span className="ml-2 text-[15px]">問題 {index + 1}</span>
                                        </div>

                                        {reviewResults[keyListening] ? (
                                            <div className="ml-2 text-[15px] p-2" dangerouslySetInnerHTML={{ __html: reviewResults[keyListening] }}></div>
                                        ) : (
                                            <>
                                                <Label htmlFor={keyListening}>聞いた文を入力してください：</Label>
                                                <Input
                                                    id={keyListening}
                                                    placeholder="日本語で入力してください"
                                                    autoComplete="off"
                                                    className="mt-2"
                                                    value={inputValues[keyListening] || ""}
                                                    onChange={(e) => handleInputChange(keyListening, e.target.value)}
                                                />
                                            </>

                                        )}
                                    </div>
                                )
                            })
                        }
                    </CardContent>
                </Card>
            </div>
            {
                !compeleted ? (
                    <div className='flex justify-center mt-14'>
                        <Button onClick={handleCommit} size="sm" className="w-[120px] text-md px-6 py-5">
                            提出
                        </Button>
                    </div>
                ) : null
            }
        </div>
    )
}