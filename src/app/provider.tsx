"use client"
import React from "react";
import { Provider } from "react-redux";
import { SessionProvider } from "next-auth/react";
import store from "@/store";
import ClientLayout from "./client-layout";

export default function ReduxProvider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <Provider store={store}>
            <SessionProvider>
                <ClientLayout>
                    {children}
                </ClientLayout>
            </SessionProvider>
        </Provider>
    )
}