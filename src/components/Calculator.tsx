import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Delete, 
  RotateCcw, 
  Equal, 
  Plus, 
  Minus, 
  X, 
  Divide, 
  Sparkles, 
  History,
  MessageSquare,
  XCircle
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { solveMathProblem, parseNaturalLanguageMath } from '@/src/services/gemini';
import ReactMarkdown from 'react-markdown';

type HistoryItem = {
  expression: string;
  result: string;
  timestamp: number;
};

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleNumber = (num: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    if (display === 'Error') return;
    setExpression(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const calculate = () => {
    try {
      const fullExpression = expression + display;
      // Basic evaluation - in a real app, use a safer math parser
      // For this demo, we'll use a simple eval-like logic but safer
      const sanitized = fullExpression.replace(/[^-0-9+*/(). ]/g, '');
      const result = Function('"use strict";return (' + sanitized + ')')().toString();
      
      const newHistoryItem: HistoryItem = {
        expression: fullExpression,
        result,
        timestamp: Date.now(),
      };
      
      setHistory([newHistoryItem, ...history].slice(0, 10));
      setDisplay(result);
      setExpression('');
    } catch (e) {
      setDisplay('Error');
    }
  };

  const clear = () => {
    setDisplay('0');
    setExpression('');
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleAskAI = async () => {
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    setAiResponse('');
    try {
      const response = await solveMathProblem(aiQuery);
      setAiResponse(response || 'Sorry, I couldn\'t solve that.');
    } catch (error) {
      setAiResponse('Error connecting to AI service.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleNaturalLanguage = async () => {
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    try {
      const expr = await parseNaturalLanguageMath(aiQuery);
      if (expr) {
        setDisplay(expr);
        setIsAIModalOpen(false);
        setAiQuery('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans p-4 md:p-8 flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-black/5"
      >
        {/* Header */}
        <div className="p-6 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-black/5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 hover:bg-black/5 rounded-full transition-colors"
            >
              <History size={20} className="text-[#86868B]" />
            </button>
            <button 
              onClick={() => setIsAIModalOpen(true)}
              className="p-2 hover:bg-black/5 rounded-full transition-colors"
            >
              <Sparkles size={20} className="text-[#0071E3]" />
            </button>
          </div>
        </div>

        {/* Display Area */}
        <div className="p-8 text-right flex flex-col justify-end min-h-[160px] bg-white">
          <div className="text-[#86868B] text-lg h-8 overflow-hidden whitespace-nowrap">
            {expression}
          </div>
          <div className="text-6xl font-light tracking-tight overflow-x-auto whitespace-nowrap scrollbar-hide">
            {display}
          </div>
        </div>

        {/* Keypad */}
        <div className="p-6 grid grid-cols-4 gap-3 bg-[#FBFBFD]">
          {/* Row 1 */}
          <CalcButton onClick={clear} className="bg-[#E8E8ED] text-[#1D1D1F]">AC</CalcButton>
          <CalcButton onClick={backspace} className="bg-[#E8E8ED] text-[#1D1D1F]"><Delete size={20} /></CalcButton>
          <CalcButton onClick={() => handleOperator('%')} className="bg-[#E8E8ED] text-[#1D1D1F]">%</CalcButton>
          <CalcButton onClick={() => handleOperator('/')} className="bg-[#0071E3] text-white"><Divide size={20} /></CalcButton>

          {/* Row 2 */}
          <CalcButton onClick={() => handleNumber('7')}>7</CalcButton>
          <CalcButton onClick={() => handleNumber('8')}>8</CalcButton>
          <CalcButton onClick={() => handleNumber('9')}>9</CalcButton>
          <CalcButton onClick={() => handleOperator('*')} className="bg-[#0071E3] text-white"><X size={20} /></CalcButton>

          {/* Row 3 */}
          <CalcButton onClick={() => handleNumber('4')}>4</CalcButton>
          <CalcButton onClick={() => handleNumber('5')}>5</CalcButton>
          <CalcButton onClick={() => handleNumber('6')}>6</CalcButton>
          <CalcButton onClick={() => handleOperator('-')} className="bg-[#0071E3] text-white"><Minus size={20} /></CalcButton>

          {/* Row 4 */}
          <CalcButton onClick={() => handleNumber('1')}>1</CalcButton>
          <CalcButton onClick={() => handleNumber('2')}>2</CalcButton>
          <CalcButton onClick={() => handleNumber('3')}>3</CalcButton>
          <CalcButton onClick={() => handleOperator('+')} className="bg-[#0071E3] text-white"><Plus size={20} /></CalcButton>

          {/* Row 5 */}
          <CalcButton onClick={() => handleNumber('0')} className="col-span-2 text-left px-8">0</CalcButton>
          <CalcButton onClick={() => handleNumber('.')}>.</CalcButton>
          <CalcButton onClick={calculate} className="bg-[#0071E3] text-white"><Equal size={20} /></CalcButton>
        </div>
      </motion.div>

      {/* History Sidebar/Overlay */}
      <AnimatePresence>
        {showHistory && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed right-4 top-4 bottom-4 w-80 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-black/5 p-6 z-40 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">History</h3>
              <button onClick={() => setShowHistory(false)}><XCircle size={20} className="text-[#86868B]" /></button>
            </div>
            {history.length === 0 ? (
              <p className="text-[#86868B] text-center mt-20">No history yet</p>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.timestamp} className="p-4 bg-black/5 rounded-2xl">
                    <div className="text-sm text-[#86868B] mb-1">{item.expression}</div>
                    <div className="text-xl font-medium">= {item.result}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Modal */}
      <AnimatePresence>
        {isAIModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAIModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-black/5 flex justify-between items-center bg-white">
                <div className="flex items-center gap-2 text-[#0071E3]">
                  <Sparkles size={24} />
                  <h2 className="text-xl font-semibold">AI Math Assistant</h2>
                </div>
                <button onClick={() => setIsAIModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full">
                  <X size={24} className="text-[#86868B]" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto flex-1 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#86868B] uppercase tracking-wider">Your Question</label>
                  <div className="relative">
                    <textarea 
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      placeholder="Ask anything... e.g., 'What is the integral of x^2?' or 'Solve 2x + 5 = 15'"
                      className="w-full p-4 bg-[#F5F5F7] rounded-2xl border-none focus:ring-2 focus:ring-[#0071E3] min-h-[100px] resize-none text-lg"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={handleAskAI}
                    disabled={isAiLoading || !aiQuery}
                    className="flex-1 bg-[#0071E3] text-white py-4 rounded-2xl font-semibold hover:bg-[#0077ED] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isAiLoading ? <RotateCcw className="animate-spin" /> : <MessageSquare size={20} />}
                    Explain & Solve
                  </button>
                  <button 
                    onClick={handleNaturalLanguage}
                    disabled={isAiLoading || !aiQuery}
                    className="flex-1 bg-black text-white py-4 rounded-2xl font-semibold hover:bg-black/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isAiLoading ? <RotateCcw className="animate-spin" /> : <Equal size={20} />}
                    Convert to Calc
                  </button>
                </div>

                {aiResponse && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-[#F5F5F7] rounded-3xl border border-black/5"
                  >
                    <div className="prose prose-slate max-w-none">
                      <ReactMarkdown>{aiResponse}</ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CalcButton({ children, onClick, className, colSpan }: { children: React.ReactNode, onClick: () => void, className?: string, colSpan?: number }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "h-16 rounded-2xl text-2xl font-medium flex items-center justify-center transition-colors bg-white shadow-sm border border-black/5 hover:bg-[#F5F5F7]",
        className
      )}
    >
      {children}
    </motion.button>
  );
}
