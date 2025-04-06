"use client"
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface ModalProps {
    children: ReactNode;
}

export default function Modal({ children }: ModalProps) {
    const router = useRouter()
    return <button onClick={() => router.back()} className="absolute top-0 h-full w-full z-50">
        {children}
    </button>
};