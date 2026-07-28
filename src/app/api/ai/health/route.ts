/**
 * AI Health Check endpoint
 * 
 * Returns the status of API keys and whether they're properly configured.
 * Does NOT expose the actual key values for security.
 */
import { NextResponse } from 'next/server';

export async function GET() {
    const groqKey = process.env.GROQ_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;

    const health = {
        groq: {
            configured: !!groqKey && groqKey.trim() !== '',
            keyPrefix: groqKey ? groqKey.substring(0, 7) + '...' : 'NOT_SET',
            keyLength: groqKey?.length || 0,
        },
        openrouter: {
            configured: !!openrouterKey && openrouterKey.trim() !== '',
            keyPrefix: openrouterKey ? openrouterKey.substring(0, 9) + '...' : 'NOT_SET',
            keyLength: openrouterKey?.length || 0,
        },
        allEnvVars: Object.keys(process.env).filter(key =>
            key.includes('GROQ') || key.includes('OPENROUTER') || key === 'DATABASE_URL'
        ),
        timestamp: new Date().toISOString(),
    };

    return NextResponse.json(health);
}
