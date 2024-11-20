'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlayCircle, CheckCircle, XCircle } from 'lucide-react'
import { containsKanji, speakText } from '@/utils'
import { askAI } from '@/server-actions'
import { readStreamableValue } from 'ai/rsc';

export default function ExamPage(props: any) {
    const { wordCards, randomShortCards } = props;
    const [inputValues, setInputValues] = useState<any>({});
    const [reviewResults, setReviewResults] = useState<any>({}); // Stores review results for each question

    console.log(reviewResults, "reviewResults===")

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
            // DOMに直接時間を更新
            if (timerDisplayRef.current) {
                const minutes = Math.floor(timeLeftRef.current / 60);
                const seconds = timeLeftRef.current % 60;
                timerDisplayRef.current.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);

        return () => clearInterval(timer); // クリーンアップ
    }, []);

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

    async function mockReview(original_text: string, key: string, userInputValue: string, type: string) {
        if (type === "hiragana" && userInputValue) {
            const { output } = await askAI(`「${original_text}」这个短语对应的平假名是「${userInputValue}」吗？如果你觉得是就返回true，你觉得不对就返回false，不要返回其他任何东西。`, 0.9);
            let result = "";
            let correctAnswer = "";
            for await (const delta of readStreamableValue(output)) {
                if (delta) {
                    result += delta;
                }
            }
            let isCorrect = result === "true"
            if (!isCorrect) {
                const { output: hiraganaOutput } = await askAI(`「${original_text}」这个短语的平假名读音是什么？请只给我平假名读音不要输出任何其他内容。`, 0.9);
                for await (const delta of readStreamableValue(hiraganaOutput)) {
                    if (delta) {
                        correctAnswer += delta;
                    }
                }
                isCorrect = correctAnswer === userInputValue;
            }
            const feedback = isCorrect ? "Good job!" : `The correct answer is: ${correctAnswer}`;
            const score = isCorrect ? 3 : 0;

            return {
                userInputValue,
                original_text,
                isCorrect,
                feedback,
                correctAnswer,
                score,
            };
        }

        return {
            isCorrect: false,
            feedback: "",
            correctAnswer: "",
            score: 0,
        };
    }

    function handleCommit() {
        const results: any = {};
        let totalScore = 0;

        wordCards.slice(0, 10).forEach((wordCard: any, index: number) => {
            const keyHiragana = `q1-${index}-hiragana`;
            const keyChinese = `q1-${index}-chinese`;

            if (containsKanji(wordCard.word)) {
                mockReview(wordCard.word, keyHiragana, inputValues[keyHiragana] || "", "hiragana")
                    .then(hiraganaResult => {
                        // const hiraganaResult = 
                        // results[keyHiragana] = hiraganaResult;
                        totalScore += hiraganaResult?.score || 0;
                        setReviewResults((prev: any) => ({
                            ...prev,
                            [keyHiragana]: hiraganaResult
                        }));
                    })
                // const chineseResult = mockReview(wordCard, keyChinese, inputValues[keyChinese] || "", "chinese");
                // results[keyChinese] = chineseResult;

            } else {
                // const chineseResult = mockReview(wordCard, keyChinese, inputValues[keyChinese] || "", "chinese");
                // results[keyChinese] = chineseResult;
                // totalScore += chineseResult.score * 2; // Double score if no Hiragana
            }
        });

    }

    return (
        <div className="p-5 font-NewYork container w-[680px] pb-16 mx-auto bg-gray-50 min-h-screen">
            <h1 className='font-bold text-[24px] text-center'>試験</h1>
            <div
                ref={timerDisplayRef}
                className="p-2 inset-0 flex items-center justify-center text-xl font-medium tabular-nums"
            >
                25:00
            </div>
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
                                                        value={inputValues[keyHiragana] || ""}
                                                        onChange={(e) => handleInputChange(keyHiragana, e.target.value)}
                                                    />
                                                    {reviewResults[keyHiragana] && (
                                                        <div className="mt-2 flex items-center">
                                                            {reviewResults[keyHiragana].isCorrect ? (
                                                                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                                            ) : (
                                                                <XCircle className="h-5 w-5 text-red-500 mr-2" />
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
                                            className="mt-2"
                                            value={inputValues[keyChinese] || ""}
                                            onChange={(e) => handleInputChange(keyChinese, e.target.value)}
                                        />
                                        {reviewResults[keyChinese] && (
                                            <div className="mt-2 flex items-center">
                                                {reviewResults[keyChinese].isCorrect ? (
                                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
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
            {/* 聴解問題 */}
            <div className="space-y-8 mt-[20px]">
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
                                        <Label htmlFor={keyListening}>聞いた文を入力してください：</Label>
                                        <Input
                                            id={keyListening}
                                            placeholder="日本語で入力してください"
                                            className="mt-2"
                                            value={inputValues[keyListening] || ""}
                                            onChange={(e) => handleInputChange(keyListening, e.target.value)}
                                        />
                                    </div>
                                )
                            })
                        }
                    </CardContent>
                </Card>
            </div>
            <div className='flex justify-center mt-16'>
                <Button onClick={handleCommit} size="sm" className="w-[120px] text-md px-6 py-5">
                    提出
                </Button>
            </div>
        </div>
    )
}