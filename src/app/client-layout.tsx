"use client"
import React, { ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession } from "next-auth/react";
import { useDispatch } from 'react-redux';
import { clearLocalCards } from '@/store/local-cards-slice';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Logout } from "@/server-actions";
import "remixicon/fonts/remixicon.css";

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Link Component Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <div>loading</div>;
        }

        return this.props.children;
    }
}

export default function ClientLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [theme, setTheme] = React.useState("light");
    const { data } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useDispatch();

    function handleToggle() {
        if (theme === "dark") {
            setTheme("light");
        } else {
            setTheme("dark");
        }
        document.body.classList.toggle("dark");
    }

    async function handleLogout() {
        await Logout();
        router.push('/');
    }

    React.useEffect(() => {
        dispatch(
            clearLocalCards()
        );
    }, [pathname]);

    return (
        <>
            <header className="p-[12px] justify-between items-center w-full fixed z-[200] top-0 flex">
                <Popover>
                    <PopoverTrigger asChild>
                        <Avatar className="hidden sm:block  h-10 w-10 cursor-pointer">
                            <AvatarImage src={data?.profile} alt="profile" />
                            <AvatarFallback>user</AvatarFallback>
                        </Avatar>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-sm"
                            onClick={handleLogout}
                        >
                            ログアウト
                        </Button>
                    </PopoverContent>
                </Popover>
                <Tabs value={pathname.replace(/\//g, '').replace(/-/g, ' ')} className="w-[400px]">
                    <TabsList className="grid w-full sm:grid-cols-4 grid-cols-3">
                        <TabsTrigger className="p-0 h-full" value="latest">
                            <Link prefetch className="sm:text-sm text-[16px] w-full" href="/latest">最新</Link>
                        </TabsTrigger>
                        <TabsTrigger className="p-0 h-full leading-[28px]" value="random">
                            <Link prefetch className="sm:text-sm text-[16px] w-full" href="/random">ランダム</Link>
                        </TabsTrigger>
                        <TabsTrigger className="p-0 h-full leading-[28px]" value="word cards">
                            <Link prefetch className="sm:text-sm text-[16px] w-full" href="/word-cards">単語帳</Link>
                        </TabsTrigger>
                        <TabsTrigger className="sm:block hidden p-0 h-full leading-[28px]" value="translation">
                            <Link prefetch className="w-full" href="/translation">翻訳練習</Link>
                        </TabsTrigger>
                    </TabsList>
                </Tabs >
                <label className="hidden md:inline-block text-base relative w-[56px] h-[28px]">
                    <input
                        onChange={handleToggle}
                        checked={theme === "light"}
                        className="peer opacity-0 w-0 h-0"
                        type="checkbox"
                    />
                    <span className="transition duration-300 ease-in-out peer-checked:translate-x-5 peer-checked:shadow-full-moon left-2 top-1 rounded-full shadow-crescent absolute h-5 w-5 z-[1]"></span>
                    <span className="peer-checked:bg-blue absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-black transition duration-500 rounded-3xl"></span>
                </label>
            </header>
            <main className="pt-[86px]">
                {children}
            </main>
        </>
    )
}