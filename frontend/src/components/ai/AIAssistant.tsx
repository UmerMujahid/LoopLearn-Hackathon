import React, { useState, useRef, useEffect } from 'react';
import {
  FiX,
  FiSend,
  FiShield,
  FiTrendingUp,
  FiCpu,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiChevronRight,
  FiZap,
} from 'react-icons/fi';
import { TbMessageChatbot } from 'react-icons/tb';
import { aiService, RAGResponse, AgentResponse } from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';
import { useFood } from '../../context/FoodContext';

type AITab = 'rag' | 'recommendations' | 'agent';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  tab: AITab;
  sources?: Array<{ title: string; source: string; snippet?: string }>;
  actions?: Array<{ tool: string; input: any; output: any }>;
  isError?: boolean;
}

const AIAssistant: React.FC = () => {
  const { currentUser, role } = useAuth();
  const { providerStats, organizationStats, listings } = useFood();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AITab>('rag');
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'ai',
      tab: 'rag',
      content:
        '👋 **Salaam & Welcome to FoodLoop AI Intelligence!**\n\nI am connected to Groq and FoodLoop knowledge systems. Choose a mode above:\n- 🛡️ **Food Safety (RAG)**: Ask about storage temps, packaging, redistribution safety.\n- 💡 **Waste Strategy (GenAI)**: Instant operational recommendations for kitchens.\n- ⚡ **Matching Agent (Agentic AI)**: Autonomous matchmaker pairing surplus with charities.',
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Suggested prompt chips per tab
  const suggestions: Record<AITab, string[]> = {
    rag: [
      'How should cooked rice and pasta be stored safely?',
      'What are the cold-holding temperature limits for dairy?',
      'Can expired packaged goods with "Best By" dates be donated?',
      'What are Good Samaritan liability protections for food donors?',
    ],
    recommendations: [
      'Analyze cafeteria surplus and recommend waste reduction steps.',
      'How can bakeries optimize daily bread yields to avoid waste?',
      'Suggest portion planning improvements for weekend banquets.',
    ],
    agent: [
      'Find organizations that can accept 50 vegetarian meals right now.',
      'Match available bakery surplus in Downtown area with verified shelters.',
      'Search for high-priority perishable food needing emergency pickup.',
    ],
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      tab: activeTab,
      content: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      if (activeTab === 'rag') {
        const res: RAGResponse = await aiService.queryRAG(query);
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'ai',
          tab: 'rag',
          content: res.answer || 'No answer generated.',
          sources: res.sources,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else if (activeTab === 'recommendations') {
        // Collect current stats if available
        const payloadStats = providerStats || {
          total_listings: listings.length,
          total_surplus_quantity: 120,
          expired_count: 2,
          collected_count: 18,
          waste_rate_pct: 10,
          collection_rate_pct: 90,
        };
        const res = await aiService.getRecommendations({
          providerId: currentUser?.id,
          stats: payloadStats,
        });
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'ai',
          tab: 'recommendations',
          content: res.recommendations || 'No recommendations returned.',
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else if (activeTab === 'agent') {
        const res: AgentResponse = await aiService.runAgent(query);
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'ai',
          tab: 'agent',
          content: res.response || 'Agent completed with no response.',
          actions: res.actions,
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Failed to get response from AI Service. Ensure Groq API key is configured.';
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'ai',
          tab: activeTab,
          content: `⚠️ **AI Service Notice**\n\n${errorMsg}`,
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedMarkdown = (text: string) => {
    // Basic markdown formatting helper for bold, bullet points, headers
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-display font-bold text-xs text-emerald-900 dark:text-emerald-300 mt-2 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('## ') || line.startsWith('# ')) {
        return (
          <h3 key={idx} className="font-display font-black text-sm text-emerald-950 dark:text-emerald-200 mt-2 mb-1">
            {line.replace(/^#+\s/, '')}
          </h3>
        );
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const cleanItem = line.substring(2);
        return (
          <li key={idx} className="ml-3 list-disc text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
            <span dangerouslySetInnerHTML={{ __html: formatInline(cleanItem) }} />
          </li>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        const cleanItem = line.replace(/^\d+\.\s/, '');
        return (
          <li key={idx} className="ml-3 list-decimal text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
            <span dangerouslySetInnerHTML={{ __html: formatInline(cleanItem) }} />
          </li>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
          <span dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
        </p>
      );
    });
  };

  const formatInline = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-[10px]">$1</code>');
  };

  return (
    <>
      {/* Floating trigger button with double-box pop shadow */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-4 sm:right-6 z-40 w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white border-2 border-emerald-950 shadow-pop-emerald flex items-center justify-center text-xl sm:text-2xl transition-transform duration-150 active:scale-95 group"
        aria-label="Toggle FoodLoop AI Assistant"
      >
        <div className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border border-emerald-950"></span>
        </div>
        {isOpen ? <FiX /> : <TbMessageChatbot className="group-hover:rotate-12 transition-transform" size={24} />}
      </button>

      {/* Main Drawer Panel with calibrated double-box styling */}
      {isOpen && (
        <div className="fixed bottom-19 sm:bottom-20 right-3 sm:right-6 z-40 w-[92vw] sm:w-[22.5rem] md:w-[24rem] h-[27.5rem] sm:h-[28.5rem] max-h-[calc(100vh-5.8rem)] bg-[#faf8f4] dark:bg-[#0f1a14] border-2 border-emerald-950 dark:border-emerald-800 rounded-2xl sm:rounded-3xl shadow-pop-lg flex flex-col overflow-hidden animate-scale-in">
          
          {/* Header */}
          <div className="px-3.5 py-2.5 bg-gradient-to-r from-emerald-800 via-emerald-900 to-emerald-950 text-white border-b-2 border-emerald-950 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-emerald-950 border border-emerald-950 flex items-center justify-center font-bold text-sm shadow-pop-sm">
                <FiZap size={14} />
              </div>
              <div>
                <div className="font-display font-extrabold text-xs sm:text-sm tracking-tight flex items-center gap-1.5">
                  FoodLoop AI Hub
                  <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                    Groq
                  </span>
                </div>
                <p className="text-[9px] sm:text-[10px] text-emerald-200/80 leading-none mt-0.5">RAG Knowledge · GenAI · Match Agent</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <FiX size={16} />
            </button>
          </div>

          {/* Mode Selector Tabs (Double-box pills) */}
          <div className="p-2 bg-emerald-100/60 dark:bg-emerald-950/50 border-b border-emerald-900/10 flex gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('rag')}
              className={`flex-1 py-1.5 px-2 rounded-xl font-display font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1 transition-all border ${
                activeTab === 'rag'
                  ? 'bg-emerald-700 text-white border-emerald-900 shadow-pop-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-emerald-50'
              }`}
            >
              <FiShield size={12} /> Food Safety (RAG)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('recommendations')}
              className={`flex-1 py-1.5 px-2 rounded-xl font-display font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1 transition-all border ${
                activeTab === 'recommendations'
                  ? 'bg-amber-600 text-white border-amber-900 shadow-pop-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-amber-50'
              }`}
            >
              <FiTrendingUp size={12} /> Waste AI
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('agent')}
              className={`flex-1 py-1.5 px-2 rounded-xl font-display font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1 transition-all border ${
                activeTab === 'agent'
                  ? 'bg-indigo-600 text-white border-indigo-900 shadow-pop-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-indigo-50'
              }`}
            >
              <FiCpu size={12} /> Match Agent
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3 rounded-2xl border-2 text-xs transition-all ${
                    msg.role === 'user'
                      ? 'bg-emerald-700 text-white border-emerald-950 rounded-br-none shadow-pop-sm'
                      : msg.isError
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border-rose-400 rounded-bl-none'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-emerald-900/20 dark:border-emerald-700/30 rounded-bl-none shadow-soft'
                  }`}
                >
                  {/* Message content */}
                  <div className="space-y-1">
                    {renderFormattedMarkdown(msg.content)}
                  </div>

                  {/* Sources display for RAG */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/50">
                      <div className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                        <FiCheckCircle size={10} /> Verified Knowledge Sources:
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {msg.sources.map((src, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 font-mono text-[9px] border border-emerald-300 dark:border-emerald-800"
                          >
                            {src.title || src.source}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Agent Actions display */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/50">
                      <div className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-800 dark:text-indigo-400 flex items-center gap-1">
                        <FiCpu size={10} /> Autonomous Tool Invocations ({msg.actions.length}):
                      </div>
                      <div className="mt-1 space-y-1">
                        {msg.actions.map((act, aIdx) => (
                          <div
                            key={aIdx}
                            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/40 text-[9px] font-mono text-indigo-900 dark:text-indigo-300"
                          >
                            <span className="font-bold">⚡ tool: {act.tool}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-900/20 w-fit">
                <FiRefreshCw className="animate-spin text-emerald-600" size={14} />
                <span className="font-mono text-[11px] text-emerald-800 dark:text-emerald-300">
                  Groq LLM is thinking & processing knowledge...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          <div className="px-3 py-1.5 bg-emerald-50/50 dark:bg-slate-950/40 border-t border-emerald-900/10 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none shrink-0">
            {suggestions[activeTab].map((sug, sIdx) => (
              <button
                key={sIdx}
                type="button"
                onClick={() => handleSend(sug)}
                disabled={loading}
                className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-emerald-900/20 text-[10px] text-emerald-900 dark:text-emerald-300 font-semibold hover:bg-emerald-100 hover:border-emerald-500 transition-colors shrink-0 disabled:opacity-50"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t-2 border-emerald-950 shrink-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={
                  activeTab === 'rag'
                    ? 'Ask about safe food handling, storage...'
                    : activeTab === 'recommendations'
                    ? 'Request custom waste reduction advice...'
                    : 'Ask agent: e.g. Match 30 meals with shelters...'
                }
                disabled={loading}
                className="flex-1 px-3 py-2 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-[#faf8f4] dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-emerald-600 font-medium"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={loading || !inputMessage.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-bold border-2 border-emerald-950 shadow-pop-sm hover:from-emerald-700 hover:to-emerald-900 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                aria-label="Send query"
              >
                <FiSend size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
