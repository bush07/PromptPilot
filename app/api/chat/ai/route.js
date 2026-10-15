export const maxDuration = 60;
import connectDB from '@/config/db';
import Chat from '@/models/Chat';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({success:false,message:'Please sign in to use chat.'},{status:401});
    const { chatId, prompt } = await req.json();
    if (typeof prompt !== 'string' || !prompt.trim()) return NextResponse.json({success:false,message:'Prompt is required.'},{status:400});
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({success:false,message:'AI provider key is missing. Add OPENAI_API_KEY to .env.local.'},{status:503});
    await connectDB();
    const chat = await Chat.findOne({_id:chatId,userId});
    if (!chat) return NextResponse.json({success:false,message:'Chat not found.'},{status:404});
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      ...(process.env.OPENAI_BASE_URL ? { baseURL: process.env.OPENAI_BASE_URL } : {})
    });
    const history = (chat.messages || []).slice(-20).map(m => ({ role: m.role, content: m.content }));
    history.push({role:'user',content:prompt.trim()});
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{role:'system',content:'You are PromptPilot, a helpful assistant.'}, ...history],
      temperature: 0.7
    });
    const content = completion.choices?.[0]?.message?.content;
    if (!content) throw new Error('The AI provider returned an empty response.');
    chat.messages.push({role:'user',content:prompt.trim(),timestamp:Date.now()});
    const assistantMessage = {role:'assistant',content:content.trim(),timestamp:Date.now()};
    chat.messages.push(assistantMessage);
    if (chat.name === 'New Chat') chat.name = prompt.trim().slice(0,40);
    await chat.save();
    return NextResponse.json({success:true,data:assistantMessage,chatName:chat.name});
  } catch(error) {
    console.error('AI route error:', error);
    const status = error.status && error.status >= 400 && error.status < 600 ? error.status : 500;
    return NextResponse.json({success:false,message:error.message || 'AI request failed.'},{status});
  }
}
