"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, Send, X, Sparkles, TrendingUp, Car, Zap, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface Message {
  id: string
  role: "user" | "agent"
  content: string
  timestamp: Date
  suggestions?: string[]
}

interface AgentChatProps {
  isOpen: boolean
  onClose: () => void
  onSendMessage?: (message: string) => Promise<{ response: string; suggestions?: string[] }>
}

export function AgentChat({ isOpen, onClose, onSendMessage }: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "agent",
      content: "Hi! I'm your RevvDoctor AI agent. I can help you find healthy cars, analyze deals, and maximize your ROI. What would you like to know?",
      timestamp: new Date(),
      suggestions: [
        "Show me the best deals today",
        "What's my average ROI?",
        "Find BMW under £20k",
        "Analyze this listing",
      ],
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput("")
    setIsLoading(true)

    try {
      // Call the provided onSendMessage handler
      if (onSendMessage) {
        const result = await onSendMessage(currentInput)
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "agent",
          content: result.response,
          timestamp: new Date(),
          suggestions: result.suggestions,
        }
        setMessages((prev) => [...prev, agentMessage])
      } else {
        // Mock response for demo
        setTimeout(() => {
          const agentMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "agent",
            content: getMockResponse(currentInput),
            timestamp: new Date(),
            suggestions: getContextualSuggestions(currentInput),
          }
          setMessages((prev) => [...prev, agentMessage])
          setIsLoading(false)
        }, 1500)
        return
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[700px]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -mr-32 -mt-32" />
            </div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">RevvDoctor AI Agent</h2>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <p className="text-xs text-white/80">Online & Ready</p>
                  </div>
                </div>
              </div>

              <Button
                size="icon"
                variant="ghost"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-slate-50 to-white">
            {messages.map((message, index) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {isLoading && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {!isLoading && messages[messages.length - 1]?.suggestions && (
            <div className="px-6 pb-4">
              <p className="text-xs text-slate-500 mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {messages[messages.length - 1].suggestions?.map((suggestion, idx) => (
                  <Button
                    key={idx}
                    size="sm"
                    variant="outline"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs hover:border-orange-300 hover:bg-orange-50"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-6 border-t border-slate-200 bg-white">
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything about cars or deals..."
                className="flex-1 border-slate-200 focus:border-orange-300 focus:ring-orange-500/20"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Powered by AI • Ask about deals, ROI, or specific cars
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isAgent = message.role === "agent"

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isAgent ? "justify-start" : "justify-end"}`}
    >
      {isAgent && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-md">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isAgent
            ? "bg-white border border-slate-200 shadow-sm"
            : "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
        }`}
      >
        <p className={`text-sm ${isAgent ? "text-slate-900" : "text-white"}`}>
          {message.content}
        </p>
        <p
          className={`text-xs mt-1 ${
            isAgent ? "text-slate-400" : "text-white/70"
          }`}
        >
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      {!isAgent && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
          <span className="text-white text-sm font-bold">U</span>
        </div>
      )}
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex gap-3"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-md">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
        <div className="flex gap-1">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
            className="w-2 h-2 bg-slate-400 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
            className="w-2 h-2 bg-slate-400 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
            className="w-2 h-2 bg-slate-400 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Floating Agent Button (for triggering chat)
 */
export function AgentButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-full shadow-2xl shadow-orange-500/50 flex items-center justify-center z-40 group"
    >
      <MessageCircle className="w-6 h-6 text-white" />
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />

      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 right-0 px-3 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        Talk to AI Agent
      </div>
    </motion.button>
  )
}

// Mock response generator (replace with actual API call)
function getMockResponse(input: string): string {
  const lower = input.toLowerCase()

  if (lower.includes("deal") || lower.includes("best")) {
    return "Based on today's scans, I found 3 excellent deals:\n\n• 2019 BMW 3 Series - £18,500 (£3,500 ROI potential)\n• 2020 Mercedes C-Class - £22,900 (£4,200 ROI potential)\n• 2018 Audi A4 - £15,800 (£2,800 ROI potential)\n\nWould you like details on any of these?"
  }

  if (lower.includes("roi") || lower.includes("profit")) {
    return "Your average ROI potential this week is £3,200 per vehicle. You've viewed 12 healthy cars with a total profit potential of £38,400. Keep up the great work!"
  }

  if (lower.includes("bmw") || lower.includes("find")) {
    return "I found 5 BMW vehicles under £20k that passed our AI health check:\n\n• 2019 BMW 3 Series - £18,500\n• 2018 BMW 5 Series - £19,200\n• 2017 BMW X3 - £16,800\n\nWould you like me to analyze any specific one?"
  }

  return "I can help you with that! I have access to all your scraped vehicles, AI classifications, and ROI data. What specific information would you like to know?"
}

function getContextualSuggestions(input: string): string[] {
  const lower = input.toLowerCase()

  if (lower.includes("bmw") || lower.includes("find")) {
    return [
      "Show me the BMW 3 Series details",
      "Find Mercedes under £25k",
      "What's the mileage on these?",
    ]
  }

  if (lower.includes("deal") || lower.includes("best")) {
    return [
      "Analyze the BMW deal",
      "Show me vehicles by ROI",
      "Any concerns with these cars?",
    ]
  }

  return [
    "Show me today's scans",
    "Find luxury cars under £30k",
    "What's my best ROI this week?",
  ]
}
