'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { PlayCircle } from 'lucide-react'
import { containsKanji, speakText } from '@/utils'

export default function ExamPage(props: any) {
    const { wordCards, randomShortCards } = props;
    const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timer)
                    return 0
                }
                return prevTime - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    function handlePlay(original_text: string) {
        original_text && speakText(original_text, {
            voicerName: "ja-JP-NanamiNeural",
        });
    }

    return (
        <div className="p-5 font-Hiragino container w-[680px] pb-16 mx-auto bg-gray-50 min-h-screen">
            <h1 className='font-bold text-[24px] text-center'>試験</h1>
            <div className="p-2 inset-0 flex items-center justify-center text-xl font-medium font-mono tabular-nums">
                {formatTime(timeLeft)}
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
                                return (
                                    <div key={index}>
                                        <Label htmlFor="q1-1" className="text-[15px]">{index + 1}.「{wordCard.word}」</Label>
                                        {
                                            containsKanji(wordCard.word) ? (
                                                <Input id="q1-1" placeholder="平假名を入力してください" className="mt-2" />
                                            ) : null
                                        }
                                        <Input id="q1-1" placeholder="中国語で入力してください" className="mt-2" />
                                    </div>
                                )
                            })
                        }
                    </CardContent>
                </Card>

                {/* 中国語から日本語への翻訳 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-[18px]">中国語から日本語への翻訳</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {
                            wordCards.slice(10).map((wordCard: any, index: number) => {
                                return (
                                    <div key={index}>
                                        <Label htmlFor="q1-1" className="text-[15px]">{index + 1}.「{wordCard.meaning.replace("意味：", "")}」</Label>
                                        <Input id="q1-1" placeholder="日本語で入力してください" className="mt-2" />
                                    </div>
                                )
                            })
                        }
                    </CardContent>
                </Card>

                {/* 聴解問題 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-[18px]">聴解問題</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {
                            randomShortCards.map((cardInfo: any, index: number) => (
                                <div key={index}>
                                    <div className="flex items-center justify-start mb-4">
                                        <Button onClick={() => handlePlay(cardInfo.original_text)} variant="outline" size="icon">
                                            <PlayCircle className="h-6 w-6" />
                                            <span className="sr-only">音声を再生</span>
                                        </Button>
                                        <span className="ml-2 text-[15px]">問題 {index + 1}</span>
                                    </div>
                                    <Label htmlFor="q3-1">聞いた文を入力してください：</Label>
                                    <Input id="q3-1" placeholder="日本語で入力してください" className="mt-2" />
                                </div>
                            ))
                        }
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}