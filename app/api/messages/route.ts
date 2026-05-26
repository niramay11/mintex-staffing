import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mintex@admin';
const BUCKET = 'messages-data';

type MessagePayload = {
    id: string;
    name: string;
    email: string;
    message: string;
    read: boolean;
    created_at: string;
};

async function downloadMessage(fileName: string): Promise<MessagePayload | null> {
    const { data, error } = await supabaseAdmin.storage.from(BUCKET).download(fileName);
    if (error || !data) return null;
    try {
        const text = await data.text();
        return JSON.parse(text) as MessagePayload;
    } catch {
        return null;
    }
}

export async function GET(req: NextRequest) {
    const password = req.headers.get('x-admin-password');
    if (password !== ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: files, error: listError } = await supabaseAdmin.storage
        .from(BUCKET)
        .list('', { limit: 1000, offset: 0, sortBy: { column: 'name', order: 'desc' } });

    if (listError) {
        return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    const jsonFiles = (files ?? []).filter((f) => f.name.endsWith('.json'));

    const messages = (
        await Promise.all(jsonFiles.map((f) => downloadMessage(f.name)))
    ).filter((m): m is MessagePayload => m !== null);

    // Sort newest first
    messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json(messages);
}

export async function DELETE(req: NextRequest) {
    const { id, password } = await req.json();

    if (password !== ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabaseAdmin.storage.from(BUCKET).remove([`${id}.json`]);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
    const { id, read, password } = await req.json();

    if (password !== ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fileName = `${id}.json`;
    const existing = await downloadMessage(fileName);
    if (!existing) {
        return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const updated = { ...existing, read };
    const { error } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(fileName, new TextEncoder().encode(JSON.stringify(updated)), {
            contentType: 'application/json',
            upsert: true,
        });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
