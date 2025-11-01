"use client";

import React, { useState, useEffect, useRef } from 'react';
// 💅 Đã thay đổi icon Zap thành Leaf
import { MessageCircle, X, Send, Sparkles, Leaf } from 'lucide-react'; 
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- Bảng màu La Rosé (Mới) ---
const PRIMARY_PINK = '#E63980'; // Màu hồng đậm chủ đạo (từ chữ 'La Rosé')
const DARK_PINK_GRADIENT = '#D13075'; // Màu hồng đậm hơn cho gradient
const LIGHT_BG = '#FDF8F9'; // Màu nền chatbox (hồng rất nhạt)
const DARK_TEXT = '#212529';
const WHITE = '#FFFFFF';
const BORDER_PINK = 'rgba(230, 57, 128, 0.2)'; // Màu viền hồng nhạt
// ------------------------------

// 💅 Đã đổi tên component
export default function LaRoseChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      // 💅 Đã cập nhật lời chào
      content:
        '✨ Xin chào bạn! Tôi là **Trợ lý La Rosé**, sẵn sàng tư vấn về đặt phòng khách sạn! 🏨',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 🚨 CẢNH BÁO BẢO MẬT (Giữ nguyên)

  const genAI = new GoogleGenerativeAI('AIzaSyDSyEf5f4jRWCzL7_qJEjmqKPPr_n_9gZc');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      // 💅 CONTEXT (PROMPT) ĐÃ ĐƯỢC THAY ĐỔI HOÀN TOÀN
      const laRoseContext = `Bạn là trợ lý ảo của khách sạn La Rosé, một khách sạn nghỉ dưỡng sang trọng với phong cách nữ tính và tinh tế.
      Nhiệm vụ của bạn là tư vấn cho khách hàng về các dịch vụ đặt phòng.
      Hãy trả lời thân thiện, chuyên nghiệp, tập trung vào:
      1. Các loại phòng (như Phòng Deluxe giá 2.500.000đ, Phòng Suite giá 4.500.000đ).
      2. Tiện ích khách sạn (ví dụ: spa, nhà hàng, hồ bơi, phòng gym).
      3. Quy trình đặt phòng (VD: Chọn phòng, điền thông tin, thanh toán, nhận xác nhận).
      4. Các chương trình khuyến mãi (nếu khách hỏi).
      Sử dụng emoji 🏨, ✨, 💖, 🛌 và Markdown để trình bày.

      Câu hỏi của khách: ${input}`;

      const result = await model.generateContent(laRoseContext); // 💅 Dùng context mới
      const botMessage = {
        role: 'bot',
        content:
          result.response.text() ||
          'Xin lỗi, tôi chưa thể hỗ trợ câu hỏi này. 💖', // 💅 Cập nhật emoji
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Lỗi API:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          // 💅 Cập nhật emoji
          content: `❌ Lỗi: ${error.message}. Bạn vui lòng thử lại sau nhé!`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div
          className="absolute bottom-20 right-0 w-full max-w-md h-[60vh] md:h-[500px] rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col md:w-96"
          style={{ background: LIGHT_BG }} // 💅 Màu nền hồng nhạt
        >
          {/* Header */}
          <div
            className="text-white p-6 relative"
            style={{
              // 💅 Gradient màu hồng
              background: `linear-gradient(135deg, ${PRIMARY_PINK} 0%, ${DARK_PINK_GRADIENT} 100%)`,
            }}
          >
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(45deg, #FFFFFF, #E0E0E0)',
                  }}
                >
                  {/* 💅 Thay icon Zap thành Leaf và đổi màu */}
                  <Leaf className="w-6 h-6" style={{ color: PRIMARY_PINK }} />
                </div>
                <div>
                  {/* 💅 Đổi tên trợ lý */}
                  <h3 className="font-bold text-lg">Trợ lý La Rosé</h3>
                  <p className="text-sm opacity-90 flex items-center">
                    <span className="w-2 h-2 bg-green-300 rounded-full mr-2"></span>
                    Powered by Gemini AI
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded-full p-2 transition-all duration-300 hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs p-4 rounded-2xl shadow-sm relative ${
                    msg.role === 'user'
                      ? 'text-white rounded-br-md'
                      : 'rounded-bl-md border'
                  }`}
                  style={{
                    background:
                      msg.role === 'user'
                        // 💅 Gradient hồng cho tin nhắn user
                        ? `linear-gradient(135deg, ${PRIMARY_PINK} 0%, ${DARK_PINK_GRADIENT} 100%)`
                        : WHITE,
                    color: msg.role === 'user' ? WHITE : DARK_TEXT,
                    // 💅 Border hồng cho tin nhắn bot
                    borderColor: msg.role === 'user' ? 'transparent' : BORDER_PINK,
                  }}
                >
                  {/* Phần sửa lỗi Markdown giữ nguyên */}
                  <div className="text-sm leading-relaxed prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>

                  {/* Tail for user message */}
                  {msg.role === 'user' && (
                    <div
                      className="absolute -bottom-1 -right-1 w-3 h-3 transform rotate-45"
                      // 💅 Đuôi tin nhắn user màu hồng đậm
                      style={{ backgroundColor: DARK_PINK_GRADIENT }}
                    ></div>
                  )}
                  {/* Tail for bot message */}
                  {msg.role === 'bot' && (
                    <div
                      className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border-l border-b transform rotate-45"
                      // 💅 Đuôi tin nhắn bot viền hồng
                      style={{ borderColor: BORDER_PINK }}
                    ></div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="bg-white rounded-2xl rounded-bl-md p-4 border shadow-sm relative"
                  // 💅 Viền hồng
                  style={{ borderColor: BORDER_PINK }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div
                        className="w-2 h-2 rounded-full animate-bounce"
                        // 💅 Chấm loading màu hồng
                        style={{ backgroundColor: PRIMARY_PINK }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{
                          // 💅 Chấm loading màu hồng
                          backgroundColor: PRIMARY_PINK,
                          animationDelay: '0.1s',
                        }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{
                          // 💅 Chấm loading màu hồng
                          backgroundColor: PRIMARY_PINK,
                          animationDelay: '0.2s',
                        }}
                      ></div>
                    </div>
                    {/* 💅 Cập nhật text loading */}
                    <span className="text-xs" style={{ color: PRIMARY_PINK }}>
                      AI đang tìm phòng...
                    </span>
                  </div>
                  <div
                    className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border-l border-b transform rotate-45"
                    // 💅 Viền hồng
                    style={{ borderColor: BORDER_PINK }}
                  ></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="p-6 bg-white/80 backdrop-blur-sm"
            // 💅 Viền hồng
            style={{ borderTop: `1px solid ${BORDER_PINK}` }}
          >
            <div className="flex space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                // 💅 Cập nhật placeholder
                placeholder="Hỏi tôi về phòng, tiện nghi, giá cả..."
                className="flex-1 p-4 border-2 rounded-2xl focus:outline-none text-sm transition-all duration-300"
                style={{
                  backgroundColor: WHITE,
                  // 💅 Viền hồng
                  borderColor: BORDER_PINK,
                  color: DARK_TEXT
                }}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="p-4 text-white rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-lg"
                style={{
                  background:
                    isLoading || !input.trim()
                      ? '#9CA3AF'
                      // 💅 Nút gửi màu hồng
                      : `linear-gradient(135deg, ${PRIMARY_PINK} 0%, ${DARK_PINK_GRADIENT} 100%)`,
                }}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-white transition-all duration-300 hover:scale-110 relative overflow-hidden ${
          isOpen ? 'bg-gray-500 hover:bg-gray-600' : ''
        }`}
        style={{
          background: isOpen
            ? undefined
            // 💅 Nút nổi màu hồng
            : `linear-gradient(135deg, ${PRIMARY_PINK} 0%, ${DARK_PINK_GRADIENT} 100%)`,
        }}
      >
        {!isOpen && (
          <>
            <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping"></div>
            <div
              className="absolute top-2 right-2 w-2 h-2 bg-yellow-300 rounded-full animate-pulse"
            ></div>
          </>
        )}

        {isOpen ? (
          <X className="w-6 h-6 relative z-10" />
        ) : (
          <div className="relative z-10 flex items-center justify-center">
            <MessageCircle className="w-6 h-6" />
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 animate-pulse" />
          </div>
        )}
      </button>
    </div>
  );
}