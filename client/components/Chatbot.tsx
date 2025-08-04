'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'
import axios from 'axios'

interface Message {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
}

interface ChatbotProps {
  websiteId: string
}

export default function Chatbot({ websiteId }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState<string>('')
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [conversationId, setConversationId] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message
      setMessages([{
        id: '1',
        text: 'আস্সালামু আলাইকুম! আমি আপনাকে কিভাবে সাহায্য করতে পারি? আপনি আমাদের পণ্য সম্পর্কে জানতে পারেন এবং অর্ডার করতে পারেন।',
        isBot: true,
        timestamp: new Date()
      }]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await axios.post('/api/chatbot/chat', {
        websiteId,
        message: inputMessage,
        conversationId
      });

      if (!conversationId) {
        setConversationId(response.data.conversationId);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.response,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

      // Show suggested products if available
      if (response.data.suggestedProducts?.length > 0) {
        const productsMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: `এখানে কিছু জনপ্রিয় পণ্য রয়েছে:\n${response.data.suggestedProducts.map((p: any) => 
            `• ${p.name} - ৳${p.price}`
          ).join('\n')}`,
          isBot: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, productsMessage]);
      }

      // Show order form if needed
      if (response.data.needsOrderDetails) {
        const orderMessage: Message = {
          id: (Date.now() + 3).toString(),
          text: 'অর্ডার করতে অনুগ্রহ করে আপনার তথ্য দিন:\n- নাম\n- ফোন নম্বর\n- ঠিকানা',
          isBot: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, orderMessage]);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'দুঃখিত, একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-lg shadow-xl border z-50 flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg">
            <h3 className="font-semibold">চ্যাট সাপোর্ট</h3>
            <p className="text-sm opacity-90">আমরা আপনাকে সাহায্য করতে এখানে আছি</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg whitespace-pre-line ${
                    message.isBot
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-3 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="আপনার বার্তা লিখুন..."
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
