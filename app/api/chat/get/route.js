import connectDB from '@/config/db';
import Chat from '@/models/Chat';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({success:false,message:'Not authenticated'},{status:401});
    const { chatId } = await req.json();
    await connectDB();
    const chat = await Chat.findOne({_id:chatId,userId}).lean();
    if (!chat) return NextResponse.json({success:false,message:'Chat not found'},{status:404});
    return NextResponse.json({success:true,chat:{...chat,_id:String(chat._id)}});
  } catch(e) { console.error(e); return NextResponse.json({success:false,message:'Could not get chat'},{status:500}); }
}
