import { JSX, ReactNode } from "react";

interface WindowFrameProps {
    children?: ReactNode
}

export default function WindowFrame({ children }: WindowFrameProps) {
    return <div className="bg-neutral-800 border rounded border-neutral-600 bg-opacity-60 p-2">
        {children}
    </div>
}