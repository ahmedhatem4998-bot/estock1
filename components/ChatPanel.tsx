import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '../types';
import { MessageBubble } from './MessageBubble';
import { SendIcon, BotIcon, KnowledgeIcon } from './Icons';

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  error: string | null;
  onOpenKnowledgeManager: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isLoading, error, onOpenKnowledgeManager }) => {
  const [userInput, setUserInput] = useState('');
  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage(userInput);
    setUserInput('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
    }
  };


  return (
    <section className="w-full bg-white rounded-xl shadow-lg shadow-indigo-100/50 flex flex-col h-full">
      <header className="flex-shrink-0 border-b border-slate-200 p-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">مساعد الشركة الذكي</h2>
        <button 
          onClick={onOpenKnowledgeManager}
          className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          aria-label="إدارة قاعدة المعرفة"
          title="إدارة قاعدة المعرفة"
        >
          <KnowledgeIcon />
        </button>
      </header>
      
      <div ref={chatWindowRef} className="flex-grow p-6 overflow-y-auto space-y-6">
        {messages.map((msg, index) => (
          <MessageBubble key={index} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
              <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-white">
                    <BotIcon />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-4 rounded-tr-none animate-pulse">
                      <div className="space-y-2">
                        <div className="h-3 w-32 bg-slate-200 rounded"></div>
                        <div className="h-3 w-24 bg-slate-200 rounded"></div>
                      </div>
                  </div>
              </div>
          </div>
        )}
      </div>

      {error && <div className="p-4 text-red-600 bg-red-100 border-t border-red-200">{error}</div>}
      
      <div className="flex-shrink-0 border-t border-slate-200 p-4 bg-white rounded-b-xl">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتب سؤالك هنا..."
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className="bg-indigo-600 text-white rounded-full p-3 hover:bg-indigo-700 transition-colors duration-300 disabled:bg-indigo-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </section>
  );
};