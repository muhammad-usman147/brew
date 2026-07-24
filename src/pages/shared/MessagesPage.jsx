import { useState, useRef, useEffect } from 'react'
import DashboardNav from '../../components/DashboardNav'


const conversations = [
  { id:1, name:'Sarah Mitchell', avatar:'https://i.pravatar.cc/150?img=33', time:'10:45 AM', lastMsg:"Thanks! I'll get started on the content this week...", unread:2 },
  { id:2, name:'Tech with Jason', avatar:'https://i.pravatar.cc/150?img=14', time:'Yesterday', lastMsg:'The review video is ready for your approval', unread:1 },
  { id:3, name:"Emma's Kitchen", avatar:'https://i.pravatar.cc/150?img=45', time:'2 days ago', lastMsg:'You: Great! Looking forward to the content' },
  { id:4, name:'Wellness with Maya', avatar:'https://i.pravatar.cc/150?img=27', time:'3 days ago', lastMsg:'Would love to collaborate again!', unread:2 },
  { id:5, name:'Alex Rodriguez', avatar:'https://i.pravatar.cc/150?img=68', time:'1 week ago', lastMsg:'Thank you for the opportunity' },
]

const initialMessages = [
  { id:1, type:'received', avatar:'https://i.pravatar.cc/150?img=33', text:"Hi Marcus! I reviewed the campaign brief and I'm excited to work on this project!", time:'10:30 AM' },
  { id:2, type:'sent', text:"Great to hear! Can you share some ideas on how you'd approach the content?", time:'10:35 AM' },
  { id:3, type:'received', avatar:'https://i.pravatar.cc/150?img=33', text:"I'm thinking of creating a series of Instagram posts focusing on the sustainable aspects of your fashion line. I'll also include behind-the-scenes stories.", time:'10:42 AM' },
  { id:4, type:'received', avatar:'https://i.pravatar.cc/150?img=33', text:"Thanks! I'll get started on the content this week and send you drafts for approval before posting.", time:'10:45 AM' },
]

export default function MessagesPage({ role = 'client' }) {
  const [convos, setConvos] = useState(conversations)
  const [activeId, setActiveId] = useState(1)
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const active = convos.find(c => c.id === activeId)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const selectConversation = id => {
    setActiveId(id)
    setConvos(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c))
  }

  const sendMessage = () => {
    if (!input.trim()) return
    const now = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    setMessages(prev => [...prev, { id: Date.now(), type: 'sent', text: input.trim(), time: now }])
    setInput('')
    setIsTyping(true)
    setTimeout(() => setIsTyping(false), 2500)
  }

  const filteredConvos = convos.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="dashboard-body">
      <DashboardNav role={role} />
      <div className="messages-container">
        <div className="conversations-panel glass">
          <div className="panel-header">
            <h2>Messages</h2>
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations..." />
            </div>
          </div>
          <div className="conversations-list">
            {filteredConvos.map(c => (
              <div key={c.id} className={`conversation-item${activeId === c.id ? ' active' : ''}`} onClick={() => selectConversation(c.id)}>
                <img src={c.avatar} alt={c.name} className="conversation-avatar" />
                <div className="conversation-info">
                  <div className="conversation-header-row">
                    <h4>{c.name}</h4>
                    <span className="time">{c.time}</span>
                  </div>
                  <p className="last-message">{c.lastMsg}</p>
                  {c.unread > 0 && <span className="unread-badge">{c.unread}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-panel glass">
          <div className="chat-header">
            <div className="chat-header-info">
              <img src={active?.avatar} alt={active?.name} className="chat-avatar" />
              <div><h3>{active?.name}</h3><span className="status">Online</span></div>
            </div>
            <button className="btn-more">⋯</button>
          </div>

          <div className="chat-messages">
            <div className="date-separator"><span>Today</span></div>
            {messages.map(m => (
              <div key={m.id} className={`message ${m.type}`}>
                {m.type === 'received' && <img src={m.avatar} alt="avatar" className="message-avatar" />}
                <div className="message-content">
                  <p>{m.text}</p>
                  <span className="message-time">{m.time}</span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message received typing-indicator">
                <img src={active?.avatar} alt="avatar" className="message-avatar" />
                <div className="typing-dots"><span /><span /><span /></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <button className="btn-attachment">📎</button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
            />
            <button className="btn-send" onClick={sendMessage}>📤</button>
          </div>
        </div>
      </div>
    </div>
  )
}
