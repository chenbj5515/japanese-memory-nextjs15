"use client"
import { useRouter } from "next/navigation";
import React from "react";
import { Prisma } from '@prisma/client';
import { MemoCard, WordCard } from "@/components";
import { updateReviewTimes } from "../_server-actions";
import { TWordCard } from "../page";
import Loading from "@/app/loading";

interface IProps {
    wordCards: TWordCard[]
}

function calculateElementsPerRow(parentWidth: number, childWidth = 228) {
    let n = Math.floor(parentWidth / childWidth);
    if (n <= 1) {
        return 1;
    }
    let space = (parentWidth - (n * childWidth)) / (n - 1);

    if (space < 10) {
        return n - 1;
    }

    return n;
}

function splitIntoRows<T>(wordList: T[], n: number) {
    const rows = [];
    for (let i = 0; i < wordList.length; i += n) {
        rows.push(wordList.slice(i, i + n));
    }
    return rows;
}

export function WordCards(props: IProps) {
    const { wordCards } = props;
    const router = useRouter();

    const [rows, setRows] = React.useState<TWordCard[][]>([]);

    const [cardInfo, setCardInfo] = React.useState<Prisma.memo_cardGetPayload<{}> | null>(null);

    const [showGlass, setShowGlass] = React.useState(false);

    const containerRef = React.useRef<HTMLDivElement>(null);

    const intervalRef = React.useRef(10);

    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        document.addEventListener("mouseup", (event) => {
            const target = event.target;
            if (target instanceof Node) {
                const inContainer =
                    target === containerRef.current
                    || containerRef.current?.contains(target);
                if (inContainer === false) {
                    setShowGlass(false);
                }
            }
        });
    }, []);

    React.useEffect(() => {
        const observer = new ResizeObserver(() => {
            // 1. 現在のウィンドウサイズに応じて、1行に表示できるカードの数を取得します
            // 2. すべてのカードを二次元配列で表現し、各サブ配列が1行を表します。
            if (ref.current) {
                const containerWidth = ref.current.clientWidth;
                const elementNumPerRow = calculateElementsPerRow(containerWidth);
                intervalRef.current = (containerWidth - elementNumPerRow * 228) / (elementNumPerRow - 1);
                setRows(prev => {
                    const curRows = prev.flat().length ? prev.flat() : wordCards;
                    const next = splitIntoRows<TWordCard>(curRows, elementNumPerRow)
                    return next;
                });
            }
        });
        observer.observe(document.documentElement);

        return () => {
            observer.disconnect();
        };
    }, [wordCards]);

    async function handleRecognizeClick(id: string) {
        if (rows.length === 1 && rows[0].length === 1) {
            router.refresh();
        }
        // 1. 対応する要素を見つけて削除します。
        // 2. 要素が含まれる部分配列およびその後の部分配列を再配置する。
        setRows(prev => {
            if (prev.length === 1) {
                const updatedRow = prev[0].filter(item => item.id !== id);
                return [updatedRow];
            }
            const n = prev[0].length;
            const flattened = prev.flat();
            const updated = flattened.filter(item => item.id !== id);
            const next: TWordCard[][] = [];
            for (let i = 0; i < updated.length; i += n) {
                next.push(updated.slice(i, i + n));
            }
            return next;
        });
        await updateReviewTimes(id);
    }

    function handleUnRecognizeClick(item: TWordCard) {
        setShowGlass(true);
        setCardInfo(item.memo_card);
    }

    return (
        <>
            {
                rows.flat().length === 0 ? <Loading /> : null
            }
            {showGlass && cardInfo ? (
                <div className="fixed w-[100vw] h-[100vh] left-[0] top-[0] glass overflow-scroll z-[10000]">
                    <div ref={containerRef} className="sm:w-[auto] sm:min-w-[46vw] w-full p-[22px] absolute max-h-[92%] overflow-auto left-[50%] top-[50%] center">
                        <MemoCard {...cardInfo} />
                    </div>
                </div>
            ) : null}
            <div ref={ref} className="w-full">
                {
                    rows.map((row, idx) => (
                        <div key={idx} className={`flex ${idx === rows.length - 1 ? "" : "justify-between"}`}>
                            {
                                row.map(cardInfo => (
                                    <div
                                        key={cardInfo.id}
                                        className="sm:w-auto w-full"
                                        style={{ marginRight: `${idx === rows.length - 1 ? `${intervalRef.current}px` : "0"}` }}
                                    >
                                        <WordCard
                                            wordCardInfo={cardInfo}
                                            onRecognize={handleRecognizeClick}
                                            onUnRecognize={handleUnRecognizeClick}
                                        />
                                    </div>
                                ))
                            }
                        </div>
                    ))
                }
            </div>
        </>
    )
}