import React, { useState, useCallback } from 'react';
import { KnowledgeManager } from './components/KnowledgeManager';
import { ChatPanel } from './components/ChatPanel';
import { generateResponse } from './services/geminiService';
import type { Message } from './types';

const App: React.FC = () => {
  const [knowledgeBase, setKnowledgeBase] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: 'أهلاً بك! أنا مساعدك الذكي. كيف يمكنني خدمتك اليوم؟ يمكنك إضافة ملفات أو نصوص لقاعدة المعرفة أولاً بالضغط على الزر في الأعلى.',
    },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState<boolean>(false);


  const addKnowledge = useCallback((text: string) => {
    setKnowledgeBase((prev) => prev + '\n\n' + text);
  }, []);

  const handleSendMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim()) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);

    try {
      const response = await generateResponse(userInput, knowledgeBase);
      setMessages((prev) => [...prev, { role: 'model', content: response }]);
    } catch (err) {
      const errorMessage = 'عفوًا، حدث خطأ ما. يرجى المحاولة مرة أخرى.';
      setError(errorMessage);
      setMessages((prev) => [...prev, { role: 'model', content: errorMessage }]);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [messages, knowledgeBase]);

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-slate-100 min-h-screen text-slate-800 antialiased">
      <main className="container mx-auto p-4 lg:p-6 h-screen max-h-screen">
        <ChatPanel 
          messages={messages} 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading} 
          error={error} 
          onOpenKnowledgeManager={() => setIsKnowledgeModalOpen(true)}
        />
      </main>
      
      {isKnowledgeModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" 
          onClick={() => setIsKnowledgeModalOpen(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" 
            onClick={(e) => e.stopPropagation()}
          >
            <KnowledgeManager 
              addKnowledge={addKnowledge} 
              knowledgeBase={knowledgeBase}
              onClose={() => setIsKnowledgeModalOpen(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;