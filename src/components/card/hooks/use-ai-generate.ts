import React from "react";
import { readStreamableValue } from 'ai/rsc';
import { askAI } from "@/server-actions";

interface IProps {
    prompt: string,
    onmessage: (res: string) => void,
    onclose: () => void
}

export function useAIGenerate(props: IProps) {
    const { prompt, onmessage, onclose } = props;

    React.useEffect(() => {
        (async () => {
            const { output } = await askAI(prompt);
            for await (const delta of readStreamableValue(output)) {
                delta && onmessage(delta);
            }
            onclose();
        })()
    }, []);

    return null;
}