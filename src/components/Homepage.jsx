import React, { useEffect, useState, useRef } from 'react';
import logoImg from '../assets/images/Logo.png';
import vectorSvg from '../assets/svg/Vector.svg';
import vector1Svg from '../assets/svg/Vector-1.svg';
import vector2Svg from '../assets/svg/Vector-2.svg';
import ellipse1476 from '../assets/svg/Ellipse 1476.svg';
import ellipse1477 from '../assets/svg/Ellipse 1477.svg';
import subtractSvg from '../assets/svg/Subtract.svg';
import maskGroupSvg from '../assets/svg/Mask Group.svg';
import icon1 from '../assets/svg/icon1.svg';
import icon2 from '../assets/svg/icon2.svg';
import icon3 from '../assets/svg/icon3.svg';
import icon4 from '../assets/svg/icon4.svg';
import MobileMenu from './MobileMenu';
import { getUserLocation } from '../utils/geoLocation';
import { createConversation, getConversation, streamQuery } from '../lib/api';

const Homepage = () => {
  const [location, setLocation] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    getUserLocation().then(setLocation).catch(console.error);
    const savedConvId = localStorage.getItem('conversationId');
    if (savedConvId) {
      setConversationId(parseInt(savedConvId));
      loadConversation(parseInt(savedConvId));
    }
  }, []);

  const loadConversation = async (convId) => {
    try {
      const conv = await getConversation(convId);
      setMessages(conv.messages.map(msg => ({
        id: `msg_${msg.id}`,
        content: msg.role === 'assistant' ? msg.content : msg.content,
        message_type: msg.role,
        created_at: msg.created_at
      })));
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const initializeConversation = async () => {
    try {
      const conv = await createConversation('general');
      setConversationId(conv.id);
      localStorage.setItem('conversationId', conv.id);
      return conv.id;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      return null;
    }
  };

  const sendStreamingMessage = async (message) => {
    if (!message.trim()) return;

    let convId = conversationId;
    if (!convId) {
      convId = await initializeConversation();
      if (!convId) return;
    }

    const userMessage = {
      id: `msg_${Date.now()}`,
      content: message,
      message_type: 'user',
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);

    const botMessage = {
      id: `msg_${Date.now() + 1}`,
      content: '',
      message_type: 'assistant',
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, botMessage]);

    try {
      await streamQuery(message, convId, location, (chunk, type) => {
        if (type === 'text') {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === botMessage.id ? { ...msg, content: chunk } : msg
            )
          );
        }
      });
    } catch (error) {
      console.error('Failed to send query:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === botMessage.id
            ? { ...msg, content: 'Error: Failed to get response' }
            : msg
        )
      );
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      await sendStreamingMessage(currentInput);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewSession = () => {
    setConversationId(null);
    setMessages([]);
    setInputValue('');
    localStorage.removeItem('conversationId');
  };

  return (
    <div className="w-full min-h-screen bg-[#fbf8f8]">
      <div className="bg-[#fbf8f8] relative min-h-screen w-full max-w-[1440px] mx-auto">

        {/* Hero Section */}
        <section className="hero-section relative h-auto min-h-[777px] w-full overflow-hidden">

          {/* Background Decorative Elements */}
          <div className="absolute -bottom-2 -right-0 opacity-100">
            <img src={vector1Svg} alt="" className="w-full h-full object-cover" />
          </div>

          <div className="absolute -bottom-2 -right-0 opacity-100">
            <img src={vector2Svg} alt="" className="w-full h-full object-cover" />
          </div>

          <div className="absolute -right-26 -bottom-26 rotate-[0deg] opacity-100">
            <img src={vectorSvg} alt="" className="w-full h-full object-cover" />
          </div>

          {/* Header */}
          <header className="relative z-10 flex items-center justify-between px-6 lg:px-20 py-4">
            <div className="flex items-center gap-4">
              <img src={logoImg} alt="MetR Logo" className="w-12 h-12 lg:w-16 lg:h-16 object-contain" />
            </div>

            <nav className="hidden lg:flex gap-12 items-center">
              <a href="#" className="font-semibold text-lg text-[#3d3e3f] hover:text-[#266EF6] transition-colors">Releases</a>
              <a href="#" className="font-semibold text-lg text-[#3d3e3f] hover:text-[#266EF6] transition-colors">Features</a>
              <a href="#" className="font-semibold text-lg text-[#3d3e3f] hover:text-[#266EF6] transition-colors">Pricing</a>
              <a href="#" className="font-semibold text-lg text-[#3d3e3f] hover:text-[#266EF6] transition-colors">About</a>
            </nav>
          </header>

          {/* Main Content */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 mt-8 lg:mt-16">
            <h1 className="font-bold text-4xl lg:text-6xl xl:text-[64px] text-[#3d3e3f] mb-6 leading-tight max-w-4xl">
              How can we help you
            </h1>
            <p className="text-lg lg:text-2xl text-[#3d3e3f] mb-12 max-w-2xl">
              Search here to get answers to your questions
            </p>

            {/* Input Area */}
            <div className="w-full max-w-2xl mb-6">
              <div className="flex gap-2 mb-3">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search the Doc"
                  className="flex-1 bg-[#3d3e3f] bg-opacity-50 backdrop-blur-sm rounded-[20px] px-3 py-2 text-white text-sm lg:text-base placeholder-gray-300 outline-none resize-none"
                  rows={1}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  className="bg-[#266EF6] text-white px-4 py-2 rounded-[20px] font-semibold hover:bg-[#1e52c4] disabled:opacity-50 transition-colors"
                  disabled={!inputValue.trim() || isLoading}
                  aria-label="Send message"
                >
                  {isLoading ? '⏳' : '↵'}
                </button>
              </div>
              {conversationId && (
                <button
                  onClick={handleNewSession}
                  className="text-sm font-semibold text-[#266EF6] hover:text-[#1e52c4] transition-colors"
                >
                  + New Session
                </button>
              )}
            </div>

            {/* Chat Messages */}
            {messages.length > 0 && (
              <div className="w-full max-w-2xl bg-white bg-opacity-40 backdrop-blur-sm rounded-2xl p-6 h-96 overflow-y-auto">
                {messages.map((msg) => (
                  <div key={msg.id} className={`mb-4 ${msg.message_type === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.message_type === 'user'
                        ? 'bg-[#266EF6] text-white'
                        : 'bg-gray-200 text-[#3d3e3f]'
                    }`}>
                      {msg.message_type === 'assistant' ? (
                        <div dangerouslySetInnerHTML={{ __html: msg.content }} className="prose prose-sm max-w-none" />
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Suggested Search Tags */}
            {messages.length === 0 && (
              <div className="flex flex-wrap items-center justify-center gap-3 max-w-2xl">
                <span className="text-sm lg:text-base text-[#3d3e3f] whitespace-nowrap">Suggested Search:</span>
                <span className="bg-[#3d3e3f] text-white px-[15px] py-[2px] rounded-[20px] text-base cursor-pointer hover:bg-[#2a2b2c] transition-colors">Code</span>
                <span className="bg-[#3d3e3f] text-white px-[15px] py-[2px] rounded-[20px] text-base cursor-pointer hover:bg-[#2a2b2c] transition-colors">Wordpress</span>
                <span className="bg-[#3d3e3f] text-white px-[15px] py-[2px] rounded-[20px] text-base cursor-pointer hover:bg-[#2a2b2c] transition-colors">Security</span>
              </div>
            )}
          </div>
        </section>

        {/* Recommended Topics Section */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          <div className="absolute left-1/2 top-16 transform -translate-x-1/2 w-[400px] lg:w-[699px] h-[400px] lg:h-[699px] opacity-15">
            <img src={subtractSvg} alt="" className="w-full h-full object-cover" />
          </div>

          <div className="absolute left-[360px] top-80 lg:top-[550px] transform -translate-x-1/2 w-32 lg:w-[202px] h-32 lg:h-[202px]">
            <img src={ellipse1477} alt="" className="w-full h-full object-cover" />
          </div>

          <div className="absolute right-8 lg:right-[185px] top-20 lg:top-[92px] w-16 lg:w-[79px] h-16 lg:h-[79px]">
            <img src={ellipse1476} alt="" className="w-full h-full object-cover" />
          </div>

          <div className="relative z-10 container mx-auto px-6">
            <div className="text-center mb-16 lg:mb-24">
              <h2 className="font-bold text-3xl lg:text-5xl text-[#3d3e3f] mb-6">
                Recommended Topics
              </h2>
              <p className="text-lg lg:text-2xl text-[#3d3e3f] max-w-4xl mx-auto">
                Loaded with awesome features like Documentation, Knowledge base,<br className="hidden lg:block" />
                Forum & more!
              </p>
            </div>

            <div className="relative">
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-100 z-0">
                <img src={subtractSvg} alt="" className="w-full h-full object-contain" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 relative z-10">
                <TopicCard icon={icon1} title="Module 1" bgColor="bg-[#00d5be]" />
                <TopicCard icon={icon2} title="Module 2" bgColor="bg-[#ff8904]" />
                <TopicCard icon={icon3} title="Module 3" bgColor="bg-[#51a2ff]" />
                <TopicCard icon={icon4} title="Module 4" bgColor="bg-[#c27aff]" />
              </div>
            </div>

            <div className="text-center">
              <p className="text-lg lg:text-xl text-[#51a2ff] font-bold">
                Want to know more or have a <span className="underline cursor-pointer hover:text-[#3d5afe] transition-colors">Question?</span>
              </p>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 lg:py-24 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="relative rounded-xl lg:rounded-2xl overflow-hidden min-h-[300px] lg:h-[400px]">
              <div className="absolute inset-0">
                <img src={maskGroupSvg} alt="" className="w-full h-full object-cover" />
              </div>

              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between h-full p-8 lg:px-16 lg:py-12 gap-8">
                <div className="text-white text-center lg:text-left">
                  <h3 className="font-bold text-2xl lg:text-4xl xl:text-[40px] leading-tight mb-6">
                    Great Customer<br />
                    Relationships start here
                  </h3>
                </div>

                <div className="text-white w-full lg:w-auto">
                  <h4 className="font-bold text-xl lg:text-3xl mb-6 text-center lg:text-left">Subscribe Now</h4>
                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 lg:w-[317px] h-12 lg:h-[50px] px-5 py-3 rounded-md border border-[#dfe4ea] text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    />
                    <button className="bg-[#3758f9] text-white px-7 py-3 rounded-[25px] font-bold hover:bg-[#2a47e8] transition-colors">
                      Submit
                    </button>
                  </div>
                  <p className="text-sm lg:text-base text-center lg:text-left opacity-90">You will receive every news and pro tips</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white py-16 lg:py-24 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
              <div className="w-full lg:w-[384px] flex flex-col gap-8">
                <div className="w-24 lg:w-[120px] h-8">
                  <img src={logoImg} alt="MetR Logo" className="w-full h-full object-contain" />
                </div>
                <p className="text-sm text-[#3d3e3f]">
                  © 2024 MetR Infinity. All rights reserved
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 w-full">
                <FooterColumn title="Product" links={['Overview', 'Features', 'Tutorials', 'Pricing', 'Releases']} />
                <FooterColumn title="Company" links={['About', 'Press', 'Careers', 'Contact', 'Partners']} />
                <FooterColumn title="Support" links={['Help Center', 'Terms of service', 'Legal', 'Privacy Policy', 'Status']} />
                <FooterColumn title="Follow us" links={['Facebook', 'Twitter', 'Dribbble', 'Instagram', 'LinkedIn']} />
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

const TopicCard = ({ icon, title, bgColor }) => (
  <div className="bg-white bg-opacity-40 backdrop-blur-sm rounded-2xl relative hover:bg-opacity-60 transition-all duration-300 hover:shadow-lg w-full max-w-sm h-80 lg:h-[336px] p-6 cursor-pointer group">
    <div className={`w-12 h-12 ${bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
      <img src={icon} alt="" className="w-6 h-6" />
    </div>
    <h3 className="font-bold text-2xl lg:text-4xl xl:text-[48px] text-[#3d3e3f] group-hover:text-[#266EF6] transition-colors duration-300">
      {title}
    </h3>
  </div>
);

const FooterColumn = ({ title, links }) => (
  <div className="flex flex-col gap-6">
    <h4 className="font-bold text-lg lg:text-2xl text-[#3d3e3f]">{title}</h4>
    <div className="flex flex-col gap-3">
      {links.map((link, index) => (
        <a key={index} href="#" className="text-base text-[#3d3e3f] hover:text-[#266EF6] transition-colors">
          {link}
        </a>
      ))}
    </div>
  </div>
);

export default Homepage;
