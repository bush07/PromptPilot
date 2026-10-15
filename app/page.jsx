'use client';
import { useEffect, useRef, useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useAppContext } from '@/context/AppContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';
import { chatToMarkdown, download } from '@/lib/export';

export default function HomePage() {
  const { openSignIn } = useClerk();
  const { user, chats, setChats, selectedChat, setSelectedChat, createNewChat, fetchUsersChats } = useAppContext();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState('');
  const [theme, setTheme] = useState('light');
  const endRef = useRef(null);
  const messages = selectedChat?.messages || [];
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length, busy]);
  useEffect(() => { const saved = localStorage.getItem('pp:theme'); if (saved) setTheme(saved); }, []);
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('pp:theme', theme); }, [theme]);

  const send = async (text = message) => {
    const prompt = text.trim();
    if (!prompt || busy) return;
    if (!user) { openSignIn(); return; }
    let chat = selectedChat;
    try {
      if (!chat) {
        const { data } = await axios.post('/api/chat');
        if (!data.success) throw new Error(data.message || 'Could not create chat');
        chat = data.chat; setChats(prev => [chat, ...prev]); setSelectedChat(chat);
      }
      setMessage(''); setBusy(true);
      const userMsg = { role: 'user', content: prompt, timestamp: Date.now() };
      const optimistic = { ...chat, messages: [...(chat.messages || []), userMsg] };
      setSelectedChat(optimistic);
      setChats(prev => prev.map(c => c._id === chat._id ? optimistic : c));
      const { data } = await axios.post('/api/chat/ai', { chatId: chat._id, prompt });
      if (!data.success) throw new Error(data.message || 'AI request failed');
      const updated = { ...optimistic, name: data.chatName || chat.name, messages: [...optimistic.messages, data.data] };
      setSelectedChat(updated);
      setChats(prev => prev.map(c => c._id === chat._id ? updated : c));
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Something went wrong');
      setMessage(prompt); fetchUsersChats();
    } finally { setBusy(false); }
  };
  const quickAction = async (type, content) => {
    const prompts = {
      summarize: `Summarize the following response concisely:\n\n${content}`,
      rewrite: `Rewrite the following response to make it clearer and more polished, preserving its meaning:\n\n${content}`,
      bullets: `Convert the following response into concise bullet points:\n\n${content}`
    };
    await send(prompts[type]);
  };
  const exportChat = () => {
    if (!messages.length) return toast.error('There is no conversation to export yet.');
    download(`${(selectedChat?.name || 'promptpilot-chat').replace(/[^a-z0-9-_]+/gi,'-')}.md`, chatToMarkdown(messages));
  };
  const visibleChats = chats.filter(c => (c.name || '').toLowerCase().includes(query.toLowerCase()));

  return <main className="app-shell"><section className="workspace">
    <aside className="sidebar">
      <div className="brand-row"><div className="brand-mark">P</div><div className="brand-copy"><strong>PromptPilot</strong><span>AI Workspace</span></div><span className="pro-badge">Pro Workspace</span></div>
      <button className="new-chat" onClick={createNewChat}><span>＋</span> New Chat</button>
      <div className="sidebar-search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search conversations..." aria-label="Search conversations" /></div>
      <div className="section-label">RECENT</div>
      <div className="recent-list">{visibleChats.map(chat=><button key={chat._id} onClick={()=>setSelectedChat(chat)} className={`recent-chat ${selectedChat?._id===chat._id?'selected':''}`}><span className="recent-dot"/><span className="recent-name">{chat.name || 'New Chat'}</span><span className="recent-arrow">›</span></button>)}{!visibleChats.length&&<p className="empty-recent">{user?'Your conversations will appear here.':'Sign in to save conversations.'}</p>}</div>
      <div className="sidebar-bottom"><button className="side-link" onClick={()=>{if(!user)openSignIn();else window.location.href='/prompts';}}>▤ <span>Saved prompts</span></button><button className="profile-row" onClick={()=>user?toast('You are signed in.'):openSignIn()}><span className="avatar">{user?.firstName?.[0]||'M'}</span><span className="profile-copy"><b>{user?(`${user.firstName||''} ${user.lastName||''}`.trim()||'My Profile'):'My Profile'}</b><small>{user?'Signed in':'Sign in to sync chats'}</small></span><span className="profile-arrow">⌄</span></button></div>
    </aside>
    <section className="main-panel">
      <header className="topbar"><div className="mobile-brand"><span className="brand-mark small">P</span><strong>PromptPilot</strong></div><div className="top-search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search conversations..." aria-label="Search conversations" /></div><div className="top-actions"><button className="icon-button" title="Notifications" onClick={()=>toast('You are all caught up.')}>♧</button><button className="export-button" onClick={exportChat}>⇧ <span>Export</span></button><button className="theme-button" onClick={()=>setTheme(t=>t==='light'?'dark':'light')} title="Toggle theme">{theme==='light'?'☾':'☀'}</button><button className="avatar top-avatar" onClick={()=>user?toast('You are signed in.'):openSignIn()}>{user?.firstName?.[0]||'M'}</button></div></header>
      <div className="chat-heading"><div><h1>{selectedChat?.name||'Your AI workspace'}</h1><p><span className="status-dot"/> Quality AI <span className="heading-sep">•</span> Prompt workspace <span className="heading-sep">•</span> Ready</p></div><button className="more-button" onClick={()=>toast('Chat options are coming soon.')} aria-label="More options">⋮</button></div>
      <div className={`messages-area ${messages.length?'has-messages':''}`}>
        {!messages.length&&<div className="welcome"><div className="welcome-icon">✦</div><h2>What can I help you with?</h2><p>Ask a question, explore an idea, or turn a rough prompt into something great.</p><div className="suggestions"><button onClick={()=>send('Help me write a professional email')}>✉ <span><b>Write an email</b><small>Clear and professional</small></span></button><button onClick={()=>send('Summarize the key points of a topic')}>▤ <span><b>Summarize a topic</b><small>Get the essentials quickly</small></span></button><button onClick={()=>send('Help me brainstorm creative ideas')}>✧ <span><b>Brainstorm ideas</b><small>Explore new possibilities</small></span></button></div></div>}
        {messages.map((msg,i)=><article className={`message-row ${msg.role==='user'?'user-row':'assistant-row'}`} key={`${msg.timestamp||i}-${i}`}>{msg.role!=='user'&&<span className="assistant-avatar">P</span>}<div className={`message-bubble ${msg.role==='user'?'user-bubble':'assistant-bubble'}`}>{msg.role==='user'?msg.content:<><Markdown>{msg.content}</Markdown><div className="quick-actions"><button onClick={()=>quickAction('summarize',msg.content)}>Summarize</button><button onClick={()=>quickAction('rewrite',msg.content)}>Rewrite</button><button onClick={()=>quickAction('bullets',msg.content)}>Bullets</button><button onClick={()=>{navigator.clipboard?.writeText(msg.content);toast.success('Copied response');}}>Copy</button></div></>}</div></article>)}
        {busy&&<div className="typing-row"><span className="assistant-avatar">P</span><div className="typing-bubble"><i/><i/><i/></div></div>}<div ref={endRef}/>
      </div>
      <div className="composer-wrap"><div className="composer-tools"><button onClick={()=>toast('Professional response style selected.')}>✦ Professional</button><button onClick={()=>toast('Medium response length selected.')}>Medium</button><button onClick={()=>toast('Bullet response format selected.')}>Bullets</button></div><form className="composer" onSubmit={e=>{e.preventDefault();send();}}><textarea rows="2" value={message} onChange={e=>setMessage(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Ask me anything... (Shift+Enter for new line)" aria-label="Message PromptPilot"/><button type="submit" disabled={busy||!message.trim()} aria-label="Send message">➤</button></form><div className="composer-footer"><span>Safe mode enabled · Data retention on export</span><button onClick={()=>toast('Prompt saving is not connected to a backend yet.')}>Save prompt</button></div></div>
    </section>
  </section></main>;
}
