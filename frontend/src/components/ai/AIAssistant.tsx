import React, { useState } from 'react';
import { FiX, FiSend, FiCpu } from 'react-icons/fi';

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Salaam! I am your FoodLoop AI Assistant. Ask me about food safety, donation guidelines, or surplus matching.' },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: message }]);
    setMessage('');
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: 'Thank you for your question! Our AI is processing your query. In production, this connects to the Gemini API for intelligent responses about food safety and redistribution.',
      }]);
    }, 800);
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white border-2 border-emerald-900 shadow-pop-gold flex items-center justify-center text-xl transition-all active:scale-95"
        aria-label="Toggle AI Assistant"
      >
        {isOpen ? <FiX /> : <FiCpu />}
      </button>

      {/* Drawer Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-80 sm:w-96 h-[28rem] bg-white dark:bg-slate-900 border-2 border-emerald-900/20 dark:border-emerald-700/30 rounded-2xl shadow-lg flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="px-4 py-3 bg-emerald-700 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <FiCpu />
              <span className="font-display font-bold text-sm">AI Food Safety Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <FiX />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs ${
                  msg.role === 'user'
                    ? 'bg-emerald-700 text-white rounded-br-sm'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 text-slate-800 dark:text-slate-200 border border-emerald-100 dark:border-emerald-900/40 rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about food safety..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleSend}
                className="p-2 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 transition-colors"
              >
                <FiSend />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
