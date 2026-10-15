'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import toast from 'react-hot-toast';

const AppContext = createContext(null);
export function AppContextProvider({ children }) {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const user = isLoaded && isSignedIn ? clerkUser : null;
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isLoadingChats, setIsLoadingChats] = useState(false);

  const fetchUsersChats = useCallback(async () => {
    if (!isLoaded || !isSignedIn) { setChats([]); setSelectedChat(null); return; }
    setIsLoadingChats(true);
    try {
      const { data } = await axios.get('/api/chat');
      if (data.success) {
        setChats(data.chats || []);
        setSelectedChat(current => current && data.chats.some(c => c._id === current._id)
          ? (data.chats.find(c => c._id === current._id) || current)
          : (data.chats[0] || null));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load chats');
    } finally { setIsLoadingChats(false); }
  }, [isLoaded, isSignedIn]);

  useEffect(() => { fetchUsersChats(); }, [fetchUsersChats]);

  const createNewChat = useCallback(async () => {
    if (!user) { toast.error('Sign in to create a chat'); return; }
    try {
      const { data } = await axios.post('/api/chat');
      if (!data.success) throw new Error(data.message || 'Could not create chat');
      setChats(prev => [data.chat, ...prev]);
      setSelectedChat(data.chat);
    } catch (error) { toast.error(error.response?.data?.message || error.message); }
  }, [user]);

  const value = useMemo(() => ({
    user, chats, setChats, selectedChat, setSelectedChat, createNewChat,
    fetchUsersChats, isLoadingChats
  }), [user, chats, selectedChat, createNewChat, fetchUsersChats, isLoadingChats]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export function useAppContext() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useAppContext must be used inside AppContextProvider');
  return value;
}
