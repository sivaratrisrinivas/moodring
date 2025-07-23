'use client';

import { createContext, useState, useContext, ReactNode } from 'react';

interface FocusContextType {
    focusedId: number | null;
    setFocusedId: (id: number | null) => void;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export function FocusProvider({ children }: { children: ReactNode }) {
    const [focusedId, setFocusedId] = useState<number | null>(null);

    return (
        <FocusContext.Provider value={{ focusedId, setFocusedId }}>
            {children}
        </FocusContext.Provider>
    );
}

export function useFocus() {
    const context = useContext(FocusContext);
    if (context === undefined) {
        throw new Error('useFocus must be used within a FocusProvider');
    }
    return context;
}