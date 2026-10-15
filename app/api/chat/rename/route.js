import connectDB from '@/config/db';
import Chat from '@/models/Chat';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success:false, message:'Not authenticated' }, {status:401});
    const { chatId, name } = await req.json();
    if (!chatId || typeof name !== 'string' || !name.trim()) return NextResponse.json({success:false,message:'Chat ID and name are required'},{status:400});
    await connectDB();
    const chat = await Chat.findOneAndUpdate({_id:chatId,userId},{name:name.trim().slice(0,100)},{new:true});
    if (!chat) return NextResponse.json({success:false,message:'Chat not found'},{status:404});
    return NextResponse.json({success:true,message:'Chat renamed'});
  } catch(e) { console.error(e); return NextResponse.json({success:false,message:'Could not rename chat'},{status:500}); }
}
