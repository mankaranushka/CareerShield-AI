import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const ContactUs = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi there! Welcome to CareerShield AI. To help me understand you better, what year of college are you currently in?' }
  ]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState(1);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    // Simulate bot response based on step
    setTimeout(() => {
      if (step === 1) {
        setMessages(prev => [...prev, { 
          sender: 'bot', 
          text: "That's great! And what specific roles or technologies are you aiming to get placed in? (e.g., Frontend, Backend, Data Science)" 
        }]);
        setStep(2);
      } else {
        setMessages(prev => [...prev, { 
          sender: 'bot', 
          text: "Thanks for sharing! Our personalized career AI is currently an upcoming feature in early development. Based on your answers, we'll be able to generate highly tailored advice and project recommendations very soon. Stay tuned for the update!" 
        }]);
      }
    }, 1000);
  };

  return (
    <section className="pt-32 pb-24 bg-gray-950 min-h-[90vh] flex flex-col items-center relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[100px]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-emerald-500/10 blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 w-full max-w-4xl flex-grow flex flex-col h-full">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="text-emerald-500 font-semibold uppercase tracking-wider mb-2 text-sm">Contact Us</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Chat with <span className="gradient-text">CareerShield AI</span></h2>
          <p className="text-gray-400">Tell us about yourself, and let's start preparing for your future.</p>
        </motion.div>

        {/* Chat Interface */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-grow glass border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.05)] rounded-2xl overflow-hidden flex flex-col min-h-[400px]"
        >
          {/* Chat Messages */}
          <div className="flex-grow p-6 overflow-y-auto space-y-6 max-h-[55vh]">
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.95, x: msg.sender === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-sm">🤖</span>
                  </div>
                )}
                <div className={`max-w-[80%] p-4 text-[15px] leading-relaxed shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-emerald-500 text-white rounded-2xl rounded-tr-sm' 
                    : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-2xl rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-gray-900 border-t border-gray-800">
            <form onSubmit={handleSend} className="flex gap-4 relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your answer..." 
                className="flex-grow bg-gray-800 border border-gray-700 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
              />
              <button 
                type="submit"
                disabled={!input.trim()}
                className="absolute right-2 top-2 bottom-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19V5m0 0l-7 7m7-7l7 7"></path></svg>
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactUs;
