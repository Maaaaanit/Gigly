import React, { useEffect, useState, useRef } from 'react';
import { contractAPI, messageAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { timeAgo, cn } from '../utils/helpers';
import { MessageSquare, Send } from 'lucide-react';
import { io } from 'socket.io-client';

const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contracts, setContracts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    contractAPI.getAll().then(({ data }) => setContracts(data.data.contracts || [])).finally(() => setLoading(false));

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', { query: { userId: user?._id } });
    socketRef.current.on('receive_message', (msg) => { setMessages(prev => [...prev, msg]); });

    return () => socketRef.current?.disconnect();
  }, [user]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const selectContract = async (contract) => {
    setSelected(contract);
    socketRef.current?.emit('join_contract', contract._id);
    try {
      const { data } = await messageAPI.getMessages(contract._id);
      setMessages(data.data.messages || []);
    } catch {}
  };

  const sendMessage = async () => {
    if (!input.trim() || !selected) return;
    setSending(true);
    try {
      const { data } = await messageAPI.sendMessage(selected._id, input.trim());
      const msg = data.data.message;
      socketRef.current?.emit('send_message', { ...msg, contractId: selected._id });
      setMessages(prev => [...prev, msg]);
      setInput('');
    } catch { toast({ title: 'Failed to send message', type: 'error' }); }
    finally { setSending(false); }
  };

  const getOtherParty = (contract) => user?.role === 'client' ? contract.freelancerId : contract.clientId;

  return (
    <div className="h-[calc(100vh-10rem)] flex gap-4">
      {/* Sidebar */}
      <div className="w-72 card flex flex-col flex-shrink-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0"><h2 className="font-semibold text-gray-900">Messages</h2></div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {loading ? [...Array(4)].map((_, i) => <div key={i} className="p-4 animate-pulse flex gap-3"><div className="w-10 h-10 rounded-full bg-gray-200" /><div className="flex-1 space-y-2 pt-1"><div className="h-3 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div></div>) :
            contracts.length === 0 ? <div className="p-4 text-center text-sm text-gray-400">No conversations yet</div> :
            contracts.map(c => {
              const other = getOtherParty(c);
              return (
                <div key={c._id} onClick={() => selectContract(c)}
                  className={cn('flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50', selected?._id === c._id && 'bg-primary-50')}>
                  <Avatar src={other?.avatar} name={other?.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{other?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{c.title}</p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 card flex flex-col overflow-hidden">
        {!selected ? (
          <EmptyState icon={MessageSquare} title="Select a conversation" description="Choose a contract from the left to start messaging" />
        ) : (
          <>
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
              <Avatar src={getOtherParty(selected)?.avatar} name={getOtherParty(selected)?.name} size="sm" />
              <div><p className="font-semibold text-sm text-gray-900">{getOtherParty(selected)?.name}</p><p className="text-xs text-gray-400">{selected.title}</p></div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full"><p className="text-gray-400 text-sm">No messages yet. Say hello!</p></div>
              ) : messages.map((m, i) => {
                const isMe = m.senderId?._id === user?._id || m.senderId === user?._id;
                return (
                  <div key={m._id || i} className={cn('flex items-end gap-2', isMe ? 'justify-end' : 'justify-start')}>
                    {!isMe && <Avatar src={m.senderId?.avatar} name={m.senderId?.name} size="xs" />}
                    <div className={cn('max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm', isMe ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm')}>
                      <p>{m.content}</p>
                      <p className={cn('text-[10px] mt-1', isMe ? 'text-primary-200' : 'text-gray-400')}>{timeAgo(m.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-4 py-3 border-t border-gray-100 flex gap-3 flex-shrink-0">
              <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." className="input flex-1"
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
              <Button onClick={sendMessage} loading={sending} disabled={!input.trim()}>
                <Send size={16} />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Messages;
