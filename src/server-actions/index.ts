'use server';

import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';
import { signOut } from "@/auth";

export async function askAI(input: string, temperature?: number) {
    const stream = createStreamableValue('');

    (async () => {
        const { textStream } = await streamText({
            model: openai('gpt-4-turbo'),
            prompt: input,
            temperature: temperature || 0
        });

        for await (const delta of textStream) {
            stream.update(delta);
        }

        stream.done();
    })();

    return { output: stream.value };
}

export async function Logout() {
    return signOut({
        redirectTo: "/"
    });
}