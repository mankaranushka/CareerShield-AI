import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Onboarding step definitions
const ONBOARDING_STEPS = {
  GREETING: 'greeting',
  ASK_NAME: 'ask_name',
  ASK_YEAR: 'ask_year',
  ASK_GOAL: 'ask_goal',
  CAREER_QUESTIONS: 'career_questions',
  FREE_CHAT: 'free_chat',
};

const STREAM_OPTIONS = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Other'];
const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduated'];

const GOAL_OPTIONS = [
  '🎯 Placement Preparation',
  '📄 Resume & ATS Help',
  '🗺️ Career Roadmap',
  '💡 Project Suggestions',
  '🧭 General Career Guidance',
];

const CAREER_QUESTIONS = [
  'What skills should I learn for placement?',
  'How to prepare for coding interviews?',
  'Which career path suits me best?',
  'How to build a strong resume?',
  'What projects should I build?',
  'How to crack campus placements?',
  'Tips for aptitude and reasoning?',
  'How to choose between IT and Core?',
];

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 21) return 'Good Evening';
  return 'Good Evening';
};

const ChatModal = ({ onClose }) => {
  // Check if user has visited before
  const savedProfile = (() => {
    try {
      const data = localStorage.getItem('careershield_chat_profile');
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  })();

  const isReturningUser = !!savedProfile?.name;

  const getInitialMessages = () => {
    const greeting = getTimeGreeting();
    if (isReturningUser) {
      return [
        { sender: 'bot', text: `${greeting}! 🙏 Hello / Namaste, ${savedProfile.name}! Welcome back to CareerShield AI 👋` },
        { sender: 'bot', text: `Great to see you again! You're a ${savedProfile.year} ${savedProfile.stream} student interested in "${savedProfile.goal}". How can I help you today?` },
      ];
    }
    return [
      { sender: 'bot', text: `${greeting}! 🙏 Hello / Namaste! Welcome to CareerShield AI 👋` },
      { sender: 'bot', text: `I'm your personal AI career assistant. Let me get to know you a little so I can help you better!` },
    ];
  };

  const [messages, setMessages] = useState(getInitialMessages());
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(
    isReturningUser ? ONBOARDING_STEPS.FREE_CHAT : ONBOARDING_STEPS.GREETING
  );
  const [userProfile, setUserProfile] = useState(savedProfile || { name: '', stream: '', year: '', goal: '' });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Auto-advance from greeting to ask name after a delay
  useEffect(() => {
    if (onboardingStep === ONBOARDING_STEPS.GREETING && !isReturningUser) {
      const timer = setTimeout(() => {
        addBotMessage("What's your name? 😊");
        setOnboardingStep(ONBOARDING_STEPS.ASK_NAME);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [onboardingStep]);

  const addBotMessage = (text, delay = 0) => {
    if (delay > 0) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'bot', text }]);
        setIsTyping(false);
      }, delay);
    } else {
      setMessages(prev => [...prev, { sender: 'bot', text }]);
    }
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { sender: 'user', text }]);
  };

  const saveProfile = (profile) => {
    try {
      localStorage.setItem('careershield_chat_profile', JSON.stringify(profile));
    } catch { }
  };

  // Handle onboarding input
  const handleOnboardingInput = (text) => {
    addUserMessage(text);

    switch (onboardingStep) {
      case ONBOARDING_STEPS.ASK_NAME: {
        const name = text.trim();
        const updatedProfile = { ...userProfile, name };
        setUserProfile(updatedProfile);
        setIsTyping(true);
        setTimeout(() => {
          setMessages(prev => [...prev, { sender: 'bot', text: `Nice to meet you, ${name}! 🎉` }]);
          setIsTyping(false);
          setTimeout(() => {
            addBotMessage("Which stream / branch are you studying? Choose one below or type your own:");
            setOnboardingStep(ONBOARDING_STEPS.ASK_STREAM);
          }, 800);
        }, 1000);
        break;
      }
      case ONBOARDING_STEPS.ASK_STREAM: {
        const stream = text.trim();
        const updatedProfile = { ...userProfile, stream };
        setUserProfile(updatedProfile);
        setIsTyping(true);
        setTimeout(() => {
          setMessages(prev => [...prev, { sender: 'bot', text: `${stream} — great choice! 📚` }]);
          setIsTyping(false);
          setTimeout(() => {
            addBotMessage("Which year are you currently in?");
            setOnboardingStep(ONBOARDING_STEPS.ASK_YEAR);
          }, 800);
        }, 1000);
        break;
      }
      case ONBOARDING_STEPS.ASK_YEAR: {
        const year = text.trim();
        const updatedProfile = { ...userProfile, year };
        setUserProfile(updatedProfile);
        setIsTyping(true);
        setTimeout(() => {
          setMessages(prev => [...prev, { sender: 'bot', text: `Got it — ${year}! 🎓` }]);
          setIsTyping(false);
          setTimeout(() => {
            addBotMessage("What kind of help are you looking for from CareerShield AI? Pick one below or describe in your own words:");
            setOnboardingStep(ONBOARDING_STEPS.ASK_GOAL);
          }, 800);
        }, 1000);
        break;
      }
      case ONBOARDING_STEPS.ASK_GOAL: {
        const goal = text.trim();
        const finalProfile = { ...userProfile, goal };
        setUserProfile(finalProfile);
        saveProfile(finalProfile);
        setIsTyping(true);
        setTimeout(() => {
          setMessages(prev => [...prev, {
            sender: 'bot',
            text: `Awesome, ${finalProfile.name}! 🚀 Here's your profile:\n\n📛 Name: ${finalProfile.name}\n📚 Stream: ${finalProfile.stream}\n🎓 Year: ${finalProfile.year}\n🎯 Goal: ${goal}\n\nI'm all set to help you! Here are some career questions students like you commonly ask 👇`
          }]);
          setIsTyping(false);
          setOnboardingStep(ONBOARDING_STEPS.CAREER_QUESTIONS);
        }, 1500);
        break;
      }
      default:
        break;
    }
  };

  // Handle free-form chat / career question responses
  const handleFreeChat = (text) => {
    addUserMessage(text);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let botReply = `Thanks for asking, ${userProfile.name || 'there'}! That's a great question. `;
      const lowerText = text.toLowerCase();

      if (lowerText.includes('skill') || lowerText.includes('learn') || lowerText.includes('placement')) {
        botReply += `For placement preparation, I recommend focusing on:\n\n✅ Data Structures & Algorithms (DSA)\n✅ Core subjects — OS, DBMS, CN, OOPs\n✅ One strong programming language (C++/Java/Python)\n✅ Aptitude & logical reasoning\n✅ Communication & soft skills\n\nStart with DSA on platforms like LeetCode or GeeksforGeeks, then practice company-specific problems!`;
      } else if (lowerText.includes('coding') || lowerText.includes('interview') || lowerText.includes('dsa')) {
        botReply += `For coding interviews:\n\n🔹 Master Arrays, Strings, Linked Lists, Trees, Graphs\n🔹 Practice 150+ problems on LeetCode (Easy → Medium → Hard)\n🔹 Learn common patterns: Sliding Window, Two Pointers, DP\n🔹 Do mock interviews on Pramp or InterviewBit\n🔹 Time yourself — aim for optimal solutions in 20-30 mins\n\nConsistency is key — solve 2-3 problems daily!`;
      } else if (lowerText.includes('career') || lowerText.includes('path') || lowerText.includes('suits') || lowerText.includes('choose')) {
        botReply += `Choosing a career path depends on your interests:\n\n💻 Love building UIs? → Frontend Developer\n⚙️ Like server logic? → Backend / Full-Stack Developer\n📊 Enjoy data & math? → Data Science / ML Engineer\n☁️ Fascinated by infra? → Cloud / DevOps Engineer\n📱 Want to build apps? → Mobile Developer\n🔒 Interested in security? → Cybersecurity Analyst\n\nTry exploring mini-projects in 2-3 areas to discover what excites you most!`;
      } else if (lowerText.includes('resume') || lowerText.includes('ats') || lowerText.includes('cv')) {
        botReply += `For a strong resume:\n\n📄 Keep it 1 page (for freshers)\n🔑 Use relevant keywords from the job description\n💡 Quantify achievements (e.g., "Improved load time by 40%")\n🚫 Avoid generic summaries — be specific\n🛠️ List projects with tech stack & impact\n\nUse our AI Resume Scanner to get an ATS score and suggestions!`;
      } else if (lowerText.includes('project') || lowerText.includes('build') || lowerText.includes('portfolio')) {
        botReply += `Great projects for your portfolio:\n\n🌐 Full-stack web app (e.g., E-commerce, Social Media clone)\n📊 Data dashboard with real-time APIs\n🤖 ML project (sentiment analysis, image classifier)\n📱 Mobile app with React Native / Flutter\n🔗 API-based integration (weather, news, finance)\n\nAvoid to-do apps! Build something that solves a real problem and showcase it on GitHub with a good README.`;
      } else if (lowerText.includes('campus') || lowerText.includes('crack') || lowerText.includes('prepare')) {
        botReply += `To crack campus placements:\n\n📅 Start preparing 6 months before placement season\n📝 Clear aptitude rounds (Quant, Logical, Verbal)\n💻 Be strong in DSA + 1 language\n🧠 Revise core CS subjects thoroughly\n🎤 Practice HR questions: "Tell me about yourself", "Why this company?"\n💼 Build 2-3 solid projects\n\nMock tests + peer group discussions can really boost your confidence!`;
      } else if (lowerText.includes('aptitude') || lowerText.includes('reasoning') || lowerText.includes('quant')) {
        botReply += `For aptitude & reasoning:\n\n📖 Study from RS Aggarwal or IndiaBIX\n🔢 Focus: Percentages, Profit/Loss, Time & Work, Permutations\n🧩 Practice logical reasoning daily (puzzles, patterns, syllogisms)\n⏱️ Take timed mock tests on PrepInsta or PlacementPreparation.io\n\nMost companies have aptitude as the first filter — clear it, and you're halfway there!`;
      } else if (lowerText.includes('it') && lowerText.includes('core')) {
        botReply += `IT vs Core — here's how to decide:\n\n💻 Choose IT/Software if: You love coding, building apps, and enjoy problem-solving with tech\n⚙️ Choose Core if: You're passionate about your branch's domain (e.g., VLSI, Power Systems, Manufacturing)\n\n💡 Many core branch students successfully enter IT — your branch doesn't limit you!\n\nUpskill in coding + DSA regardless, as most companies (even core) test programming skills.`;
      } else if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) {
        const greeting = getTimeGreeting();
        botReply = `${greeting}, ${userProfile.name || 'there'}! 👋 How can I help you with your career today? Feel free to ask anything about placements, resumes, projects, or career paths!`;
      } else {
        botReply += `Our personalized AI engine is getting smarter every day! Here are things I can currently help with:\n\n🎯 Placement preparation tips\n📄 Resume & ATS optimization\n🗺️ Career roadmap guidance\n💡 Project recommendations\n💻 Coding interview strategies\n\nTry asking about any of these topics!`;
      }

      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
      setIsTyping(false);
    }, 1500);
  };

  // Unified send handler
  const handleSend = (text) => {
    if (!text.trim()) return;
    setInput('');

    if (onboardingStep === ONBOARDING_STEPS.FREE_CHAT || onboardingStep === ONBOARDING_STEPS.CAREER_QUESTIONS) {
      setOnboardingStep(ONBOARDING_STEPS.FREE_CHAT);
      handleFreeChat(text);
    } else {
      handleOnboardingInput(text);
    }
  };

  // Quick option click handler
  const handleQuickOption = (option) => {
    handleSend(option);
  };

  // Render quick-option buttons based on onboarding step
  const renderQuickOptions = () => {
    let options = [];
    let containerClass = 'flex flex-wrap gap-2 mt-2 ml-10';

    switch (onboardingStep) {
      case ONBOARDING_STEPS.ASK_STREAM:
        options = STREAM_OPTIONS;
        break;
      case ONBOARDING_STEPS.ASK_YEAR:
        options = YEAR_OPTIONS;
        break;
      case ONBOARDING_STEPS.ASK_GOAL:
        options = GOAL_OPTIONS;
        break;
      case ONBOARDING_STEPS.CAREER_QUESTIONS:
        options = CAREER_QUESTIONS;
        containerClass = 'flex flex-wrap gap-2 mt-2 ml-10';
        break;
      case ONBOARDING_STEPS.FREE_CHAT:
        // Show a small set of helpful options
        options = ['Placement Tips', 'Resume Help', 'Career Guidance', 'Project Ideas'];
        break;
      default:
        return null;
    }

    if (options.length === 0 || isTyping) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={containerClass}
      >
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleQuickOption(opt)}
            className="text-xs font-medium bg-blue-500/10 hover:bg-blue-500/25 active:scale-95 text-blue-300 border border-blue-500/30 rounded-full px-3 py-1.5 transition-all duration-200 text-left"
          >
            {opt}
          </button>
        ))}
      </motion.div>
    );
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] md:hidden"
      />

      {/* Chatbot Modal Container */}
      <motion.div
        initial={{ opacity: 0, y: '100%', scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: '100%', scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed z-[100] flex flex-col overflow-hidden custom-chat-scrollbar
                   bottom-0 left-0 w-full h-[100dvh] rounded-none
                   md:bottom-6 md:right-6 md:left-auto md:w-[400px] md:h-[620px] md:rounded-2xl
                   bg-gray-900/85 backdrop-blur-2xl border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.15)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gray-900/50 border-b border-gray-700/50 backdrop-blur-md relative overflow-hidden flex-shrink-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/10 to-emerald-500/10 pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                <span className="text-lg">🤖</span>
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
            </div>
            <div>
              <h3 className="font-bold text-white tracking-wide text-[15px]">CareerShield AI</h3>
              <p className="text-xs text-emerald-400 font-medium">Online • Replies instantly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-gray-300 relative z-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-4 relative custom-chat-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                    <span className="text-xs">🤖</span>
                  </div>
                )}
                <div className={`max-w-[75%] p-3.5 text-[14px] leading-relaxed shadow-md whitespace-pre-line ${msg.sender === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-2xl rounded-tr-sm'
                    : 'bg-gray-800/80 backdrop-blur-sm text-gray-100 border border-gray-700/50 rounded-2xl rounded-tl-sm'
                  }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex justify-start"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                  <span className="text-xs">🤖</span>
                </div>
                <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl rounded-tl-sm px-4 py-4 flex items-center gap-1 shadow-md">
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Option Buttons */}
          {renderQuickOptions()}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-gray-900/80 backdrop-blur-md border-t border-gray-700/50 flex-shrink-0">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="flex items-center gap-2 relative bg-gray-800/80 border border-gray-700 rounded-full pl-4 pr-1.5 py-1.5 focus-within:border-blue-500/50 focus-within:bg-gray-800 transition-colors shadow-inner"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                onboardingStep === ONBOARDING_STEPS.ASK_NAME ? "Type your name..." :
                  onboardingStep === ONBOARDING_STEPS.ASK_STREAM ? "Type your stream..." :
                    onboardingStep === ONBOARDING_STEPS.ASK_YEAR ? "Type your year..." :
                      onboardingStep === ONBOARDING_STEPS.ASK_GOAL ? "Describe what you need..." :
                        "Ask me anything..."
              }
              className="flex-grow bg-transparent text-white text-[14px] focus:outline-none w-full"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-blue-500 hover:bg-blue-400 disabled:bg-gray-600 disabled:text-gray-400 text-white rounded-full transition-colors shadow-[0_0_10px_rgba(59,130,246,0.3)] disabled:shadow-none"
            >
              <svg className="w-4 h-4 transform rotate-90 ml-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7"></path></svg>
            </button>
          </form>
        </div>
      </motion.div>
    </>
  );
};

export default ChatModal;
