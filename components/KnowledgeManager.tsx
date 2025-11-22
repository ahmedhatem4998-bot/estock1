import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon, SpinnerIcon, CloseIcon } from './Icons';

// Add pdfjsLib to window type for TypeScript
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

interface KnowledgeManagerProps {
  addKnowledge: (text: string) => void;
  knowledgeBase: string;
  onClose: () => void;
}

export const KnowledgeManager: React.FC<KnowledgeManagerProps> = ({ addKnowledge, knowledgeBase, onClose }) => {
  const [manualText, setManualText] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    
    const resetInput = () => {
        if (event.target) event.target.value = '';
    };

    try {
      let textContent: string;
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const pdf = await window.pdfjsLib.getDocument({ data }).promise;
        const textPromises = [];
        for (let i = 1; i <= pdf.numPages; i++) {
            textPromises.push(pdf.getPage(i).then((page: any) => page.getTextContent()));
        }
        const textContents = await Promise.all(textPromises);
        textContent = textContents.map(tc => tc.items.map((item: any) => item.str).join(' ')).join('\n\n');
      } else if (file.type === 'text/plain' || file.name.endsWith('.md')) {
        textContent = await file.text();
      } else {
        alert('نوع الملف غير مدعوم. يرجى رفع ملفات .txt, .md, أو .pdf');
        setFileName(null);
        setIsProcessing(false);
        resetInput();
        return;
      }
      addKnowledge(`محتوى من ملف (${file.name}):\n${textContent}`);
    } catch (error) {
      console.error("Error processing file:", error);
      alert('حدث خطأ أثناء معالجة الملف.');
      setFileName(null);
    } finally {
      setIsProcessing(false);
      resetInput();
    }
  }, [addKnowledge]);

  const handleManualAdd = () => {
    if (manualText.trim()) {
      addKnowledge(`نص مضاف يدويًا:\n${manualText}`);
      setManualText('');
    }
  };

  const handleAddQA = () => {
    if (question.trim() && answer.trim()) {
      addKnowledge(`---\nسؤال: ${question}\nجواب: ${answer}\n---`);
      setQuestion('');
      setAnswer('');
    }
  };


  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-full">
        <header className="flex-shrink-0 p-6 flex justify-between items-center border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800">قاعدة المعرفة</h2>
            <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors" aria-label="إغلاق">
                <CloseIcon />
            </button>
        </header>

        <div className="flex-grow p-6 overflow-y-auto space-y-6">
            <div>
                <button
                onClick={triggerFileSelect}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-3 bg-indigo-50 text-indigo-600 font-semibold py-3 px-4 rounded-lg hover:bg-indigo-100 border border-indigo-200 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-100 disabled:text-indigo-400 disabled:cursor-wait"
                >
                {isProcessing ? <SpinnerIcon className="text-indigo-500" /> : <UploadIcon />}
                <span>{isProcessing ? 'جاري المعالجة...' : 'رفع ملف (.txt, .md, .pdf)'}</span>
                </button>
                <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept=".txt,.md,.pdf"
                disabled={isProcessing}
                />
                {fileName && <p className="text-sm text-slate-500 mt-2 text-center">{isProcessing ? `جاري معالجة: ${fileName}` : `تمت إضافة محتوى من: ${fileName}`}</p>}
            </div>

            <div className="border-t border-slate-200 pt-6">
                <h3 className="text-md font-semibold text-slate-600 mb-3">إضافة سؤال وجواب:</h3>
                <div className="space-y-3">
                    <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="اكتب السؤال هنا..."
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    rows={2}
                    disabled={isProcessing}
                    ></textarea>
                    <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="اكتب الجواب هنا..."
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    rows={4}
                    disabled={isProcessing}
                    ></textarea>
                    <button
                    onClick={handleAddQA}
                    disabled={!question.trim() || !answer.trim() || isProcessing}
                    className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                    إضافة سؤال وجواب
                    </button>
                </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
                <h3 className="text-md font-semibold text-slate-600 mb-3">إضافة نص حر:</h3>
                <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="أو أضف نصًا هنا مباشرة..."
                className="w-full h-24 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                rows={3}
                disabled={isProcessing}
                ></textarea>
                <button
                onClick={handleManualAdd}
                disabled={!manualText.trim() || isProcessing}
                className="w-full mt-2 bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                إضافة نص
                </button>
            </div>

            <div className="border-t border-slate-200 pt-6">
                <h3 className="text-lg font-semibold text-slate-700 mb-2">المحتوى الحالي:</h3>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-slate-600">{knowledgeBase || 'قاعدة المعرفة فارغة حاليًا.'}</pre>
                </div>
            </div>
        </div>
    </div>
  );
};