import connectDB from '@/config/db';
import Chat from '@/models/Chat';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    await connectDB();
    const chats = await Chat.find({ userId }).sort({ updatedAt: -1 }).lean();
    return NextResponse.json({ success: true, chats: chats.map(c => ({ ...c, _id: String(c._id) })) });
  } catch (error) {
    console.error('List chats failed:', error);
    return NextResponse.json({ success: false, message: 'Could not load chats' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    await connectDB();
    const chat = await Chat.create({ name: 'New Chat', messages: [], userId });
    return NextResponse.json({ success: true, chat: { ...chat.toObject(), _id: String(chat._id) } });
  } catch (error) {
    console.error('Create chat failed:', error);
    return NextResponse.json({ success: false, message: 'Could not create chat' }, { status: 500 });
  }
}
