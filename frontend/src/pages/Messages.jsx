import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { format } from 'date-fns'
import { Send, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { messageAPI } from '../services/api'
import { getSocket, joinConversation } from '../lib/socket'

export default function Messages() {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const [searchParams, setSearchParams] = useSearchParams()
  const [inbox, setInbox] = useState([])
  const [messages, setMessages] = useState([])
  const [activeUserId, setActiveUserId] = useState(searchParams.get('user') || null)
  const [draft, setDraft] = useState('')
  const [loadingInbox, setLoadingInbox] = useState(true)
  const [loadingChat, setLoadingChat] = useState(false)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    loadInbox()
  }, [])

  useEffect(() => {
    const userId = searchParams.get('user')
    if (userId) {
      openConversation(userId)
    }
  }, [searchParams])

  useEffect(() => {
    if (!token) return

    const socket = getSocket()
    if (!socket) return

    const onNewMessage = (msg) => {
      if (
        activeUserId &&
        (msg.sender_id === Number(activeUserId) || msg.recipient_id === Number(activeUserId))
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev
          return [...prev, msg]
        })
      }
      loadInbox()
    }

    socket.on('new_message', onNewMessage)
    return () => socket.off('new_message', onNewMessage)
  }, [token, activeUserId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadInbox = async () => {
    try {
      const response = await messageAPI.getInbox()
      setInbox(response.data.data || [])
    } catch {
      toast.error('Failed to load inbox')
    } finally {
      setLoadingInbox(false)
    }
  }

  const openConversation = async (userId) => {
    setActiveUserId(String(userId))
    setSearchParams({ user: userId })
    setLoadingChat(true)
    joinConversation(userId)

    try {
      const response = await messageAPI.getConversation(userId)
      setMessages(response.data.data || [])
      loadInbox()
    } catch {
      toast.error('Failed to load conversation')
    } finally {
      setLoadingChat(false)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!draft.trim() || !activeUserId) return

    setSending(true)
    try {
      const response = await messageAPI.send({
        recipient_id: Number(activeUserId),
        content: draft.trim(),
      })
      const msg = response.data.data
      setMessages((prev) => [...prev, msg])
      setDraft('')
      loadInbox()
    } catch {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const activeContact = inbox.find((c) => String(c.other_user_id) === String(activeUserId))

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-secondary mb-6">Messages</h1>

      <div className="card p-0 overflow-hidden flex flex-col md:flex-row min-h-[520px]">
        <aside className="md:w-80 border-b md:border-b-0 md:border-r border-gray-200">
          <div className="p-4 border-b border-gray-200 font-semibold text-secondary">Inbox</div>
          {loadingInbox ? (
            <p className="p-4 text-gray-500 text-sm">Loading...</p>
          ) : inbox.length === 0 ? (
            <p className="p-4 text-gray-500 text-sm">No conversations yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100 max-h-[440px] overflow-y-auto">
              {inbox.map((item) => (
                <li key={item.other_user_id}>
                  <button
                    type="button"
                    onClick={() => openConversation(item.other_user_id)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                      String(activeUserId) === String(item.other_user_id) ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-medium text-secondary">
                        {item.first_name} {item.last_name}
                      </span>
                      {item.unread_count > 0 && (
                        <span className="bg-primary text-white text-xs rounded-full px-2 py-0.5">
                          {item.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-1">{item.last_message}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="flex-1 flex flex-col">
          {!activeUserId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
              <MessageSquare size={48} className="mb-4 text-gray-300" />
              <p>Select a conversation to start chatting</p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-secondary">
                  {activeContact
                    ? `${activeContact.first_name} ${activeContact.last_name}`
                    : `User #${activeUserId}`}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {loadingChat ? (
                  <p className="text-gray-500 text-sm">Loading messages...</p>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.sender_id === user?.id
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                            isMine
                              ? 'bg-primary text-white rounded-br-md'
                              : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p className={`text-xs mt-1 ${isMine ? 'text-white/70' : 'text-gray-400'}`}>
                            {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleSend} className="p-4 border-t border-gray-200 flex gap-2">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message..."
                  className="input-field flex-1"
                />
                <button
                  type="submit"
                  disabled={sending || !draft.trim()}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  <Send size={18} />
                  Send
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
