import './globals.css';
import './prism.css';
import { ClerkProvider } from '@clerk/nextjs';
import { AppContextProvider } from '@/context/AppContext';
import { Toaster } from 'react-hot-toast';
export const metadata = { title: 'PromptPilot — AI Workspace', description: 'A focused AI chat workspace for better prompts and conversations.', authors: [{ name: 'Bushra Inamdar', url: 'https://github.com/AnsariTech-25667' }] };
export default function RootLayout({ children }) {
  return <html lang="en"><body className="antialiased"><ClerkProvider><AppContextProvider><Toaster position="bottom-right" toastOptions={{success:{style:{background:'#191923',color:'#fff'}},error:{style:{background:'#191923',color:'#fff'}}}} />{children}</AppContextProvider></ClerkProvider></body></html>;
}
