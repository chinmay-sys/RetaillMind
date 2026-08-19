import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, User, Bot, MessageSquare, Plus, RefreshCw, Layers, ArrowRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { chatAPI } from '@/lib/api'
import { cn } from '@/lib/utils'

const initialChatHistory = [
  {
    id: 1,
    role: 'assistant' as const,
    content: `Hello! I can help you understand your sales, inventory, pricing, suppliers, forecasts, and customer feedback.

Select a suggested prompt below or type any question to start exploring your business data.`,
    timestamp: '10:00 AM'
  }
]

const chatSuggestions = [
  'Show me the top products by sales.',
  'What are the current inventory risks?',
  'Show supplier performance.',
  'What are our pricing recommendations?',
  'Summarize recent customer reviews.',
  'Why should I reorder this product?'
]

const recentConversations = [
  'Top products analysis',
  'Restocking urgency report',
  'Q4 forecast review',
  'Supplier comparison',
  'Pricing optimization',
]

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  isError?: boolean
  timestamp: string
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>(initialChatHistory)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const sendQueryToBackend = async (question: string) => {
    setIsTyping(true)
    setLastFailedQuery(null)
    try {
      const res = await chatAPI.query(question)
      const data = res.data
      const responseText = data?.response || 'No data found for this query.'

      setMessages(prev => [...prev, {
        id: prev.length + 1,
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      }])
    } catch {
      setLastFailedQuery(question)
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        role: 'assistant',
        content: `**AI Assistant is temporarily unavailable.**\n\nYour dashboard and business data are still accessible. Please verify your connection or try again in a moment.`,
        isError: true,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSend = () => {
    if (!input.trim() || isTyping) return
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

  const handleNewChat = () => {
    setMessages(initialChatHistory)
    setInput('')
    setLastFailedQuery(null)
  }

  const handleRetry = () => {
    if (lastFailedQuery) {
      sendQueryToBackend(lastFailedQuery)
    }
  }

  // Custom Markdown components for rich structured tables, badges, and clean typography
  const markdownComponents = {
    table: ({ children }: any) => (
      <div className="my-3 overflow-x-auto rounded-xl border border-gray-200/90 bg-white shadow-xs">
        <table className="w-full text-xs text-left border-collapse min-w-[340px]">{children}</table>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className="bg-gray-50/95 text-gray-800 font-semibold border-b border-gray-200">{children}</thead>
    ),
    th: ({ children }: any) => (
      <th className="px-3.5 py-2.5 font-semibold text-gray-700 whitespace-nowrap">{children}</th>
    ),
    tr: ({ children }: any) => (
      <tr className="border-b border-gray-100 hover:bg-primary/5 transition-colors even:bg-gray-50/40 last:border-0">{children}</tr>
    ),
    td: ({ children }: any) => (
      <td className="px-3.5 py-2.5 text-foreground/90 leading-normal align-middle">{children}</td>
    ),
    h1: ({ children }: any) => (
      <h1 className="text-base font-bold text-foreground mt-3 mb-2 pb-1 border-b border-gray-100">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-sm font-bold text-foreground mt-3.5 mb-2 flex items-center gap-1.5">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mt-4 mb-2 flex items-center gap-1.5 text-primary">{children}</h3>
    ),
    p: ({ children }: any) => (
      <p className="mb-2 last:mb-0 leading-relaxed text-sm">{children}</p>
    ),
    ul: ({ children }: any) => (
      <ul className="list-disc pl-5 my-2 space-y-1 text-sm">{children}</ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal pl-5 my-2 space-y-1 text-sm">{children}</ol>
    ),
    li: ({ children }: any) => (
      <li className="leading-relaxed">{children}</li>
    ),
    code: ({ inline, children }: any) => (
      inline ? (
        <code className="px-1.5 py-0.5 rounded bg-gray-100 text-primary font-mono text-[11px] border border-gray-200">{children}</code>
      ) : (
        <pre className="p-3 my-2 rounded-xl bg-gray-900 text-gray-100 font-mono text-xs overflow-x-auto">{children}</pre>
      )
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="pl-3 py-1 my-2 border-l-2 border-primary text-muted italic text-xs bg-primary/5 rounded-r-lg">{children}</blockquote>
    ),
    strong: ({ children }: any) => {
      const text = String(children)
      if (['Critical', 'NEGATIVE', 'High Risk', 'Overstock', 'HIGH'].includes(text)) {
        return <Badge variant="danger" className="text-[10px] py-0 px-1.5 mx-0.5">{text}</Badge>
      }
      if (['Warning', 'NEUTRAL', 'Medium Priority', 'Moderate', 'MEDIUM'].includes(text)) {
        return <Badge variant="warning" className="text-[10px] py-0 px-1.5 mx-0.5">{text}</Badge>
      }
      if (['Healthy', 'POSITIVE', 'Approved', 'Ready', 'Active Verified', 'LOW'].includes(text)) {
        return <Badge variant="default" className="text-[10px] py-0 px-1.5 mx-0.5 bg-emerald-600">{text}</Badge>
      }
      return <strong className="font-semibold text-foreground">{children}</strong>
    },
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Clean Chat Sidebar */}
      <div className="hidden lg:flex w-64 border-r border-gray-100 flex-col bg-gray-50/50">
        <div className="p-4">
          <Button onClick={handleNewChat} className="w-full" size="sm">
            <Plus className="w-4 h-4" /> New Chat
          </Button>
        </div>
        <Separator />
        <div className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-medium text-muted uppercase tracking-wider px-2 mb-2">Recent Conversations</p>
          {recentConversations.map((title, i) => (
            <button
              key={i}
              onClick={() => handleSuggestionClick(title)}
              className="w-full text-left px-3 py-2.5 rounded-lg text-xs text-muted hover:bg-white hover:text-foreground transition-colors flex items-center gap-2 group cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0 text-muted group-hover:text-primary" />
              <span className="truncate">{title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Conversation Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Header Title */}
        <div className="px-6 py-3.5 border-b border-gray-100 bg-white/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">RetailMind AI Assistant</h2>
              <p className="text-[11px] text-muted">Conversational business intelligence</p>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={cn('flex gap-3 max-w-4xl mx-auto', msg.role === 'user' ? 'justify-end' : '')}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className={cn(
                'rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-3xl overflow-hidden',
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-xs shadow-xs'
                  : msg.isError
                    ? 'bg-amber-50/70 text-foreground border border-amber-200/80 rounded-bl-xs shadow-xs'
                    : 'bg-white text-foreground border border-gray-200/80 rounded-bl-xs shadow-xs'
              )}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-table:my-2">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                      {msg.content}
                    </ReactMarkdown>

                    {msg.isError && lastFailedQuery && (
                      <div className="mt-3 pt-2 border-t border-amber-200/60">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRetry}
                          className="text-xs h-8 gap-1.5"
                        >
                          <RefreshCw className="w-3 h-3" /> Retry Connection
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}

                <p className={cn(
                  'text-[10px] mt-2',
                  msg.role === 'user' ? 'text-white/70 text-right' : 'text-muted'
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

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 max-w-4xl mx-auto"
            >
              <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200/80 rounded-2xl rounded-bl-xs px-4 py-3 flex items-center gap-2 shadow-xs">
                <div className="flex items-center gap-1">
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0 }} className="w-2 h-2 rounded-full bg-primary" />
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.15 }} className="w-2 h-2 rounded-full bg-primary/70" />
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.3 }} className="w-2 h-2 rounded-full bg-primary/40" />
                </div>
                <span className="text-xs text-muted font-medium ml-1">Analyzing business data...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        {messages.length <= 2 && (
          <div className="px-4 lg:px-6 pb-2 max-w-4xl mx-auto w-full">
            <p className="text-[11px] text-muted mb-2 font-medium">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {chatSuggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1.5 rounded-full border border-gray-200 bg-white text-xs text-muted hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 shadow-2xs cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 inline mr-1 text-primary" />
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 lg:p-6 pt-2 border-t border-gray-100 bg-white/60 backdrop-blur-xs">
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
                placeholder="Ask RetailMind anything..."
                rows={1}
                className="w-full resize-none rounded-xl border border-border bg-white px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-colors shadow-2xs"
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              size="icon"
              className="shrink-0 h-11 w-11 rounded-xl shadow-xs"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-center text-[10px] text-muted/70 mt-2">
            RetailMind AI provides automated business intelligence. Verify critical procurement decisions with your team.
          </p>
        </div>
      </div>
    </div>
  )
}
