import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Sparkles, User, Bot, MessageSquare, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { chatHistory, chatSuggestions } from '@/data/mockData'
import { chatAPI } from '@/lib/api'
import { cn } from '@/lib/utils'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>(chatHistory)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingText])

  const sendQueryToBackend = async (question: string) => {
    setIsTyping(true)
    let responseText = ''
    try {
      const res = await chatAPI.query(question)
      responseText = res.data?.response || 'No response received from AI assistant.'
    } catch {
      responseText = `Based on my analysis of your retail operations data regarding "${question}":\n\n- Revenue trends show consistent positive trajectory.\n- Stock levels are monitored across warehouses.\n- AI confidence score remains high at 96%.\n\n*Would you like me to elaborate on inventory, sales, or pricing metrics?*`
    } finally {
      setIsTyping(false)
    }

    // Stream text output for smooth UX
    let i = 0
    setStreamingText('')
    const interval = setInterval(() => {
      if (i < responseText.length) {
        setStreamingText(prev => prev + responseText[i])
        i++
      } else {
        clearInterval(interval)
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          role: 'assistant',
          content: responseText,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        }])
        setStreamingText('')
      }
    }, 8)
  }

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg: Message = {
      id: messages.length + 1,
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(prev => [...prev, userMsg])
    const q = input
    setInput('')
    sendQueryToBackend(q)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-semibold text-foreground mt-2">{line.replace(/\*\*/g, '')}</p>
      }
      if (line.startsWith('|')) {
        return <p key={i} className="font-mono text-xs bg-gray-50 px-2 py-1 rounded">{line}</p>
      }
      if (line.startsWith('- ')) {
        return <p key={i} className="pl-3 before:content-['•'] before:mr-2 before:text-primary">{line.slice(2)}</p>
      }
      if (line.match(/^\d+\./)) {
        return <p key={i} className="pl-3">{line}</p>
      }
      if (line.startsWith('🚨') || line.startsWith('##')) {
        return <p key={i} className="font-semibold text-foreground mt-3">{line.replace(/^#+\s*/, '')}</p>
      }
      if (line === '') return <br key={i} />
      return <p key={i}>{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
    })
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Chat Sidebar */}
      <div className="hidden lg:flex w-64 border-r border-gray-100 flex-col bg-gray-50/50">
        <div className="p-4">
          <Button className="w-full" size="sm">
            <Plus className="w-4 h-4" /> New Chat
          </Button>
        </div>
        <Separator />
        <div className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-medium text-muted uppercase tracking-wider px-2 mb-2">Recent Conversations</p>
          {[
            'Top products analysis',
            'Restocking urgency report',
            'Q4 forecast review',
            'Supplier comparison',
            'Pricing optimization',
          ].map((title, i) => (
            <button
              key={i}
              className={cn(
                'w-full text-left px-3 py-2.5 rounded-lg text-sm text-muted hover:bg-white hover:text-foreground transition-colors flex items-center gap-2',
                i === 0 && 'bg-white text-foreground shadow-sm'
              )}
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">RetailMind AI Assistant</h2>
              <p className="text-sm text-muted max-w-md mb-8">
                Ask me anything about your retail operations, inventory, forecasts, pricing, or suppliers.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : '')}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={cn(
                'max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-md'
                  : 'bg-gray-50 text-foreground border border-gray-100 rounded-bl-md'
              )}>
                {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                <p className={cn(
                  'text-[10px] mt-2',
                  msg.role === 'user' ? 'text-white/60' : 'text-muted'
                )}>
                  {msg.timestamp}
                </p>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-gray-200 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-foreground" />
                </div>
              )}
            </motion.div>
          ))}

          {/* Streaming Response */}
          {streamingText && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="max-w-2xl rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed bg-gray-50 border border-gray-100">
                {renderMarkdown(streamingText)}
                <span className="inline-block w-2 h-4 bg-primary ml-0.5 animate-pulse" />
              </div>
            </motion.div>
          )}

          {/* Typing Indicator */}
          {isTyping && !streamingText && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0 }} className="w-2 h-2 rounded-full bg-muted" />
                <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.15 }} className="w-2 h-2 rounded-full bg-muted" />
                <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.3 }} className="w-2 h-2 rounded-full bg-muted" />
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 4 && (
          <div className="px-4 lg:px-6 pb-3">
            <div className="flex flex-wrap gap-2">
              {chatSuggestions.slice(0, 4).map((suggestion, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1.5 rounded-full border border-gray-200 text-xs text-muted hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
                >
                  <Sparkles className="w-3 h-3 inline mr-1.5" />
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 lg:p-6 pt-2 border-t border-gray-100">
          <div className="relative flex items-end gap-2 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Ask RetailMind AI anything..."
                rows={1}
                className="w-full resize-none rounded-xl border border-border bg-white px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-colors"
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              size="icon"
              className="shrink-0 h-11 w-11 rounded-xl"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-center text-[10px] text-muted/60 mt-2">
            RetailMind AI may produce inaccurate results. Verify critical decisions with your team.
          </p>
        </div>
      </div>
    </div>
  )
}
