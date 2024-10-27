"use client"
import React from "react";
import { Prisma } from '@prisma/client';
import { useDispatch } from "react-redux";
import { setCardId } from "@/store/card-id-slice";
import { getTimeAgo, speakText } from "@/utils";
import { Dictation } from "@/components/dictation";
import { useTripleRightClick, useAudioRecorder } from "@/hooks";
import {
    Card,
} from "@/components/ui/card";
import { deleteMemoCard, updateMemoCardTranslation, updatePronunciation, updateOriginalText } from "./server-actions";

export function MemoCard(props: Prisma.memo_cardGetPayload<{}> & {
    onDelete?: (id: string) => void
}) {
    const { translation, kana_pronunciation, original_text, create_time, id, onDelete } = props;

    const [recorderPressed, setRecorderPressedState] = React.useState(false);
    const [recordPlayBtnPressed, setRecordPlayBtnPressed] = React.useState(false);

    const [isFocused, setIsFocused] = React.useState(false);

    const translationTextRef = React.useRef<HTMLDivElement>(null);
    const originalTextRef = React.useRef<HTMLDivElement>(null);
    const prevTranslationTextRef = React.useRef<string>("");
    const kanaTextRef = React.useRef<HTMLDivElement>(null);
    const prevKanaTextRef = React.useRef<string>("");

    const dispatch = useDispatch();

    const { startRecording, stopRecording, playRecording } = useAudioRecorder();

    const cardRef = useTripleRightClick(async () => {
        onDelete?.(id);
        await deleteMemoCard(id);
    })

    function handleBlurChange(type: string) {
        setIsFocused(type === "blur" ? false : true);
    }

    React.useEffect(() => {
        if (cardRef.current) {
            cardRef.current.addEventListener("mouseup", () => {
                dispatch(
                    setCardId(id)
                )
            });
        }
    }, []);

    function handlePlayBtn() {
        original_text && speakText(original_text, {
            voicerName: "ja-JP-NanamiNeural",
        });
    }

    function handleRecordBtnClick() {
        setRecorderPressedState((prev) => !prev);
        if (recorderPressed) {
            stopRecording();
        } else {
            startRecording();
        }
    }

    function handleRecordPlayBtnClick() {
        setRecordPlayBtnPressed((prev) => !prev);
        playRecording();
    }

    function handleFocus() {
        prevTranslationTextRef.current = translationTextRef.current?.textContent || "";
    }

    async function handleBlur() {
        if (translationTextRef.current?.textContent && translationTextRef.current?.textContent !== prevTranslationTextRef.current) {
            updateMemoCardTranslation(id, translationTextRef.current?.textContent)
        }
    }

    function handleOriginalTextBlur() {
        if (originalTextRef.current?.textContent) {
            updateOriginalText(id, originalTextRef.current?.textContent?.slice(3))
        }
    }

    function hanldeKanaFocus() {
        prevKanaTextRef.current = kanaTextRef.current?.textContent || "";
    }

    async function handleKanaBlur() {
        if (kanaTextRef.current?.textContent && kanaTextRef.current?.textContent !== prevKanaTextRef.current) {
            updatePronunciation(id, kanaTextRef.current?.textContent)
        }
    }

    return (
        <Card
            ref={cardRef}
            className="p-5 relative leading-[1.9] tracking-[1.5px]"
        >
            <div className="sm:text-[14px] text-[16px] absolute -top-[30px] left-1 text-[gray]">
                {create_time ? getTimeAgo(create_time.toString()) : ""}
            </div>
            {/* 朗読ボタン */}
            <div
                className="border-solid border-[1px] border-[hsl(var(--input))] play-button-bg dark:bg-bgDark dark:shadow-none rounded-[50%] w-12 h-12 absolute top-2 right-2 cursor-pointer"
                onClick={handlePlayBtn}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    height="20"
                    width="24"
                    className="volume_button absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2"
                >
                    <path
                        clipRule="evenodd"
                        d="M11.26 3.691A1.2 1.2 0 0 1 12 4.8v14.4a1.199 1.199 0 0 1-2.048.848L5.503 15.6H2.4a1.2 1.2 0 0 1-1.2-1.2V9.6a1.2 1.2 0 0 1 1.2-1.2h3.103l4.449-4.448a1.2 1.2 0 0 1 1.308-.26Zm6.328-.176a1.2 1.2 0 0 1 1.697 0A11.967 11.967 0 0 1 22.8 12a11.966 11.966 0 0 1-3.515 8.485 1.2 1.2 0 0 1-1.697-1.697A9.563 9.563 0 0 0 20.4 12a9.565 9.565 0 0 0-2.812-6.788 1.2 1.2 0 0 1 0-1.697Zm-3.394 3.393a1.2 1.2 0 0 1 1.698 0A7.178 7.178 0 0 1 18 12a7.18 7.18 0 0 1-2.108 5.092 1.2 1.2 0 1 1-1.698-1.698A4.782 4.782 0 0 0 15.6 12a4.78 4.78 0 0 0-1.406-3.394 1.2 1.2 0 0 1 0-1.698Z"
                        fillRule="evenodd"
                    ></path>
                </svg>
            </div>
            <div className="flex mb-[28px]">
                <div
                    suppressContentEditableWarning
                    contentEditable
                    className="relative outline-none w-calc100-42"
                    onBlur={handleOriginalTextBlur}
                    ref={originalTextRef}
                >
                    原文：
                    {isFocused ? (
                        <section
                            className={`rounded-lg absolute ${isFocused ? "glass" : ""
                                }  w-[101%] h-[105%] -left-[4px] -top-[2px]`}
                        ></section>
                    ) : null}
                    {original_text}
                </div>
            </div>
            翻訳：
            <div
                suppressContentEditableWarning
                contentEditable
                ref={translationTextRef}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="whitespace-pre-wrap pr-[42px] outline-none leading-[3]"
            >
                {translation}
            </div>
            読み：
            <div
                suppressContentEditableWarning
                contentEditable
                ref={kanaTextRef}
                onFocus={hanldeKanaFocus}
                onBlur={handleKanaBlur}
                className="whitespace-pre-wrap pr-[42px] outline-none leading-[3]"
            >
                {kana_pronunciation}
            </div>
            <div className="flex justify-center mt-3 relative cursor-pointer">
                {/* 录音ボタン */}
                <div className="toggle w-[40px] h-[40px] mr-[30px]">
                    <i className="ri-mic-fill z-[10] absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2"></i>
                    <input
                        checked={recorderPressed}
                        onChange={handleRecordBtnClick}
                        type="checkbox"
                        className="double-click absolute z-[11]"
                    />
                    <span className="button dark:shadow-none dark:bg-bgDark w-[50px] h-[50px] -translate-x-1/2 -translate-y-1/2"></span>
                </div>
                {/* 录音プレーボタン */}
                <div className="toggle w-[40px] h-[40px]">
                    <i className="text-[22px] ri-play-circle-fill z-[10] absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2"></i>
                    <input
                        checked={recordPlayBtnPressed}
                        onChange={handleRecordPlayBtnClick}
                        type="checkbox"
                        className="absolute z-[11]"
                    />
                    <span className="button dark:shadow-none dark:bg-bgDark w-[50px] h-[50px] -translate-x-1/2 -translate-y-1/2"></span>
                </div>
            </div>
            <div className="relative flex flex-col mt-2">
                {
                    original_text ? (
                        <Dictation
                            originalText={original_text}
                            cardID={id}
                            onBlurChange={handleBlurChange}
                        />
                    ) : null
                }
            </div>
        </Card>
    );
}
