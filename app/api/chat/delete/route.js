import connectDB from '@/config/db';
import Chat from '@/models/Chat';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({success:false,message:'Not authenticated'},{status:401});
    const { chatId } = await req.json();
    if (!chatId) return NextResponse.json({success:false,message:'Chat ID is required'},{status:400});
    await connectDB();
    const result = await Chat.deleteOne({_id:chatId,userId});
    if (!result.deletedCount) return NextResponse.json({success:false,message:'Chat not found'},{status:404});
    return NextResponse.json({success:true,message:'Chat deleted'});
  } catch(e) { console.error(e); return NextResponse.json({success:false,message:'Could not delete chat'},{status:500}); }
}
