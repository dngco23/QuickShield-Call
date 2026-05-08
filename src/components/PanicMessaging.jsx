import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronDown, Lock, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function PanicMessaging({ emergencyContact, emergencyName, isVisible }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load initial messages
  useEffect(() => {
    if (!emergencyContact || !isVisible) return;

    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const response = await base44.functions.invoke('panicModeMessaging', {
          action: 'list',
          to: emergencyContact,
        });
        setMessages(response.data.messages || []);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();

    // Poll for new messages every 3 seconds
    pollIntervalRef.current = setInterval(loadMessages, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [emergencyContact, isVisible]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !emergencyContact) return;

    setIsSending(true);
    try {
      const response = await base44.functions.invoke('panicModeMessaging', {
        action: 'send',
        message: newMessage,
        to: emergencyContact,
      });

      // Add message to UI immediately
      setMessages([
        ...messages,
        {
          id: response.data.message.id,
          content: newMessage,
          direction: 'outgoing',
          timestamp: new Date().toISOString(),
        },
      ]);

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  if (!isVisible || !emergencyContact) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border/50 rounded-lg overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" />
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Encrypted Chat</p>
            <p className="text-xs text-muted-foreground">{emergencyName || emergencyContact}</p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Messages */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/50 flex flex-col"
          >
            {/* Message List */}
            <div className="h-40 overflow-y-auto p-3 space-y-2 bg-muted/20">
              {isLoading && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-xs text-muted-foreground text-center">
                    No messages yet.<br />Emergency contact can reply here.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id || msg.timestamp}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`px-3 py-1.5 rounded-lg max-w-xs text-xs font-body ${
                        msg.direction === 'outgoing'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className="text-[10px] opacity-70 mt-0.5">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="border-t border-border/50 p-3 space-y-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type encrypted message..."
                maxLength={160}
                className="w-full px-2 py-1.5 bg-muted border border-border rounded text-xs font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{newMessage.length}/160</span>
                <Button
                  type="submit"
                  disabled={isSending || !newMessage.trim()}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 h-7"
                >
                  {isSending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Send className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}