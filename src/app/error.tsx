'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error to console in production
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
            <div className="text-center">
                <h2 className="mb-4 text-2xl font-bold text-white">
                    Something went wrong!
                </h2>
                <p className="mb-6 text-slate-400">
                    {error.message || 'An unexpected error occurred'}
                </p>
                <button
                    onClick={reset}
                    className="rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-white hover:bg-cyan-600"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}
