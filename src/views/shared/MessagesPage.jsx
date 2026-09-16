'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import DashboardNav from '@/components/DashboardNav'
import { supabase } from '@/lib/supabase/client'
import './MessagesPage.css'

// ─── Attachment type config ───────────────────────────────────────────────────
const ATTACH_TYPES = [
  { id: 'image',    label: 'Photo / Video', icon: '🖼️',  accept: 'image/*,video/*' },
  { id: 'document', label: 'Document',      icon: '📄',  accept: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function formatFullTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function isImageUrl(url) {
  return /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url)
}
function isVideoUrl(url) {
  return /\.(mp4|mov|webm|ogg)(\?|$)/i.test(url)
}

function fileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Emoji catalog ────────────────────────────────────────────────────────────
const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    name: 'Smileys & Emotion',
    icon: '😊',
    emojis: [
      '😀','😃','😄','😁','😆','😅','😂','🤣','🥲','☺️','😊','😇','🙂','🙃','😉',
      '😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓',
      '😎','🥸','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫',
      '😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰',
      '😥','😓','🤗','🤔','🤭','🤫','🤥','😶','😐','😑','😬','🙄','😯','😦','😧',
      '😮','😲','🥱','😴','🤤','😪','😵','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕'
    ]
  },
  {
    id: 'gestures',
    name: 'Gestures & People',
    icon: '👍',
    emojis: [
      '👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈',
      '👉','👆','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝',
      '🙏','✍️','💅','🤳','💪','👀','👁️','🧠','🫀','🫁','🦷','🦴','🗣️','👤','👥'
    ]
  },
  {
    id: 'hearts',
    name: 'Hearts & Vibes',
    icon: '❤️',
    emojis: [
      '❤️','🧡','💛','💚','💙','💜','🤎','🖤','🤍','💔','❤️‍🔥','❤️‍🩹','❣️','💕','💞',
      '💓','💗','💖','💘','💝','💟','🔥','✨','🌟','💫','💥','💯','💢','💬','👁️‍🗨️'
    ]
  },
  {
    id: 'celebrate',
    name: 'Celebration & Fun',
    icon: '🎉',
    emojis: [
      '🎉','🎊','🎈','🎂','🎁','🏆','🥇','🥈','🥉','🏅','🎖️','🎫','🎟️','🎪','🤹',
      '🎭','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🎷','🎺','🎸','🎲','🎯','🎳','🎮'
    ]
  },
  {
    id: 'food',
    name: 'Food & Drinks',
    icon: '☕',
    emojis: [
      '☕','🍵','🧃','🥤','🧋','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧉','🍾',
      '🍿','🍩','🍪','🎂','🍰','🧁','🥧','🍫','🍬','🍭','🍕','🍔','🍟','🌭','🥪'
    ]
  },
  {
    id: 'objects',
    name: 'Objects & Ideas',
    icon: '💡',
    emojis: [
      '💡','🔦','📱','📲','💻','🖥️','⌨️','🖱️','📷','📸','📹','🎥','📽️','🎞️','📞',
      '☎️','⏱️','⏰','⏳','💸','💵','💰','💳','💎','🔑','🔒','🔓','🔔','📣','📢','🚀'
    ]
  }
]

const QUICK_REACTIONS = ['👍', '❤️', '🔥', '😂', '🎉', '👏', '😮', '🙌']
const QUICK_INPUT_EMOJIS = ['🔥', '❤️', '👍', '😂', '🎉', '🙌', '✨', '👏', '💯', '😍', '🚀', '🙏', '☕', '💡']

// ─── Interactive Emoji Picker Popover ──────────────────────────────────────────
function EmojiPicker({ onSelect, onClose }) {
  const [activeTab, setActiveTab] = useState('smileys')
  const [searchQuery, setSearchQuery] = useState('')
  const pickerRef = useRef(null)

  useEffect(() => {
    const handleOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [onClose])

  const filteredEmojis = searchQuery.trim()
    ? EMOJI_CATEGORIES.flatMap(c => c.emojis).filter(em => em.includes(searchQuery.trim()))
    : (EMOJI_CATEGORIES.find(c => c.id === activeTab)?.emojis || [])

  return (
    <div className="msg-emoji-picker-popover glass" ref={pickerRef}>
      <div className="msg-emoji-picker-header">
        <div className="msg-emoji-search-wrap">
          <span className="msg-emoji-search-icon">🔍</span>
          <input
            type="text"
            className="msg-emoji-search-input"
            placeholder="Search emojis…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button className="msg-emoji-search-clear" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>
        <button className="msg-emoji-picker-close" onClick={onClose} title="Close">✕</button>
      </div>

      {!searchQuery && (
        <div className="msg-emoji-categories-tabs">
          {EMOJI_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`msg-emoji-tab-btn${activeTab === cat.id ? ' active' : ''}`}
              onClick={() => setActiveTab(cat.id)}
              title={cat.name}
            >
              <span>{cat.icon}</span>
            </button>
          ))}
        </div>
      )}

      <div className="msg-emoji-grid-scroll">
        <div className="msg-emoji-category-title">
          {searchQuery ? `Search Results (${filteredEmojis.length})` : EMOJI_CATEGORIES.find(c => c.id === activeTab)?.name}
        </div>
        <div className="msg-emoji-grid">
          {filteredEmojis.map((emoji, idx) => (
            <button
              key={`${emoji}-${idx}`}
              className="msg-emoji-item-btn"
              onClick={() => onSelect(emoji)}
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({
  m,
  isMine,
  otherAvatar,
  myProfile,
  reactions = {},
  onToggleReaction,
  onOpenEmojiPickerForMsg
}) {
  const att = m.attachment

  const renderAttachment = () => {
    if (!att) return null
    const { url, name, size, mime_type } = att

    if (isImageUrl(url) || mime_type?.startsWith('image/')) {
      return (
        <a href={url} target="_blank" rel="noreferrer" className="msg-img-link">
          <img src={url} alt={name || 'image'} className="msg-img" />
        </a>
      )
    }
    if (isVideoUrl(url) || mime_type?.startsWith('video/')) {
      return (
        <video src={url} controls className="msg-video" />
      )
    }
    // Generic file
    return (
      <a href={url} target="_blank" rel="noreferrer" className="msg-file">
        <span className="msg-file-icon">📎</span>
        <div className="msg-file-info">
          <span className="msg-file-name">{name || 'File'}</span>
          {size && <span className="msg-file-size">{fileSize(size)}</span>}
        </div>
        <span className="msg-file-dl">↓</span>
      </a>
    )
  }

  // Active reactions for this message: { '👍': ['user1', 'user2'] }
  const msgReactions = reactions[m.id] || {}
  const reactionEntries = Object.entries(msgReactions).filter(([_, users]) => users && users.length > 0)

  return (
    <div className={`message ${isMine ? 'sent' : 'received'}`}>
      {!isMine && (
        <img
          src={otherAvatar || `https://i.pravatar.cc/36?u=x`}
          alt=""
          className="message-avatar"
        />
      )}
      <div className="message-wrapper">
        {/* Floating Quick Reaction Toolbar on Hover */}
        <div className="msg-reaction-toolbar">
          {QUICK_REACTIONS.map(emoji => {
            const hasReacted = msgReactions[emoji]?.includes(myProfile?.id)
            return (
              <button
                key={emoji}
                className={`msg-reaction-quick-btn${hasReacted ? ' active' : ''}`}
                onClick={() => onToggleReaction(m.id, emoji)}
                title={`React ${emoji}`}
              >
                {emoji}
              </button>
            )
          })}
          <button
            className="msg-reaction-more-btn"
            onClick={() => onOpenEmojiPickerForMsg(m.id)}
            title="More emojis"
          >
            ➕
          </button>
        </div>

        <div className="message-content">
          {renderAttachment()}
          {m.content && <p>{m.content}</p>}
          <span className="message-time">
            {formatFullTime(m.sent_at)}
            {isMine && (
              <span className="read-tick">{m.read_at ? ' ✓✓' : ' ✓'}</span>
            )}
          </span>
        </div>

        {/* Reaction Badges / Pills */}
        {reactionEntries.length > 0 && (
          <div className="msg-reaction-pills-row">
            {reactionEntries.map(([emoji, userIds]) => {
              const hasReacted = userIds.includes(myProfile?.id)
              return (
                <button
                  key={emoji}
                  className={`msg-reaction-pill${hasReacted ? ' reacted-by-me' : ''}`}
                  onClick={() => onToggleReaction(m.id, emoji)}
                  title={hasReacted ? `You reacted with ${emoji} (click to remove)` : `Reacted with ${emoji}`}
                >
                  <span className="msg-pill-emoji">{emoji}</span>
                  <span className="msg-pill-count">{userIds.length}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Profile panel ─────────────────────────────────────────────────────────────
function ProfilePanel({ other, role, mediaMessages, onClose }) {
  // filter images from messages
  const mediaImgs = mediaMessages.filter(m =>
    m.attachment && (isImageUrl(m.attachment.url) || m.attachment.mime_type?.startsWith('image/'))
  )

  return (
    <aside className="profile-panel glass">
      <div className="pp-header">
        <span className="pp-title">User Profile</span>
        <button className="pp-close" onClick={onClose} title="Hide profile panel">✕</button>
      </div>

      {/* Avatar + name */}
      <div className="pp-identity">
        <div className="pp-avatar-wrap">
          <img
            src={other?.avatar_url || `https://i.pravatar.cc/120?u=${other?.id}`}
            alt={other?.name}
            className="pp-avatar"
          />
          <span className="pp-online-dot" />
        </div>
        <h3 className="pp-name">{other?.name}</h3>
        {other?.company_name && <p className="pp-company">{other.company_name}</p>}
        {other?.bio && <p className="pp-bio">{other.bio}</p>}
      </div>

      {/* Quick info */}
      <div className="pp-info-grid">
        {other?.email && (
          <div className="pp-info-row">
            <span className="pp-info-icon">✉️</span>
            <span className="pp-info-val">{other.email}</span>
          </div>
        )}
        {other?.industry && (
          <div className="pp-info-row">
            <span className="pp-info-icon">🏢</span>
            <span className="pp-info-val">{other.industry}</span>
          </div>
        )}
        {other?.website && (
          <div className="pp-info-row">
            <span className="pp-info-icon">🌐</span>
            <a href={other.website} target="_blank" rel="noreferrer" className="pp-info-link">
              {other.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
        {other?.phone && (
          <div className="pp-info-row">
            <span className="pp-info-icon">📞</span>
            <span className="pp-info-val">{other.phone}</span>
          </div>
        )}
      </div>

      {/* Shared media */}
      {mediaImgs.length > 0 && (
        <div className="pp-media">
          <div className="pp-section-label">Shared Media ({mediaImgs.length})</div>
          <div className="pp-media-grid">
            {mediaImgs.slice(0, 9).map((m, i) => (
              <a key={i} href={m.attachment.url} target="_blank" rel="noreferrer" className="pp-media-thumb">
                <img src={m.attachment.url} alt="" />
              </a>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}

// ─── Typing indicator ──────────────────────────────────────────────────────────
function TypingBubble({ avatar }) {
  return (
    <div className="message received typing-message">
      <img src={avatar || `https://i.pravatar.cc/36?u=typing`} alt="" className="message-avatar" />
      <div className="message-wrapper">
        <div className="message-content typing-content">
          <div className="typing-dots">
            <span /><span /><span />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function MessagesPage({ role = 'client' }) {
  const searchParams = useSearchParams()
  const deepLinkId   = searchParams.get('connection')

  const [connections,      setConnections]      = useState([])
  const [activeConnection, setActiveConnection] = useState(null)
  const [messages,         setMessages]         = useState([])
  const [reactions,        setReactions]        = useState({}) // { [msgId]: { [emoji]: [userId1, userId2] } }
  const [lastMsgMap,       setLastMsgMap]       = useState({})
  const [unreadMap,        setUnreadMap]        = useState({})
  const [input,            setInput]            = useState('')
  const [search,           setSearch]           = useState('')
  const [myProfile,        setMyProfile]        = useState(null)
  const [loading,          setLoading]          = useState(true)
  const [sending,          setSending]          = useState(false)
  const [showProfile,      setShowProfile]      = useState(true)
  const [isTyping,         setIsTyping]         = useState(false)
  // attachment preview queue before send
  const [pendingFiles,     setPendingFiles]     = useState([]) // [{file, preview, type}]
  const [uploading,        setUploading]        = useState(false)
  const [showAttachMenu,   setShowAttachMenu]   = useState(false)
  const [showEmojiPicker,  setShowEmojiPicker]  = useState(false)
  const [reactingMsgId,    setReactingMsgId]    = useState(null) // for opening full emoji picker on message reaction

  const messagesEndRef   = useRef(null)
  const activeChannelRef = useRef(null)
  const activeConnRef    = useRef(null)
  const typingTimerRef   = useRef(null)
  const fileInputRef     = useRef(null)
  const textInputRef     = useRef(null)
  const attachMenuRef    = useRef(null)
  const emojiBtnRef      = useRef(null)
  const myProfileRef     = useRef(null)

  // keep myProfile ref in sync for use inside realtime callbacks
  useEffect(() => { myProfileRef.current = myProfile }, [myProfile])

  // ── Scroll to bottom ────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // ── Close attach menu on outside click ──────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target)) {
        setShowAttachMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Load profile + connections ───────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const res = await fetch(`/api/auth/profile?email=${encodeURIComponent(user.email)}`)
      const { profile } = await res.json()
      if (!profile) return
      setMyProfile(profile)

      const connRes = await fetch(
        `/api/connections?${role === 'client' ? 'client_id' : 'influencer_id'}=${profile.id}`
      )
      const payload = await connRes.json()
      const activeConns = (payload.data || []).filter(c => c.status === 'active')
      setConnections(activeConns)

      if (activeConns.length === 0) { setLoading(false); return }

      // Load last message for every connection for sidebar previews
      const lastMsgs = await Promise.all(
        activeConns.map(async c => {
          const { data } = await supabase
            .from('messages')
            .select('id, content, sent_at, sender_id, read_at, attachment')
            .eq('connection_id', c.id)
            .order('sent_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          return [c.id, data]
        })
      )
      const lmap = {}, umap = {}
      for (const [cid, msg] of lastMsgs) {
        lmap[cid] = msg
        if (msg && msg.sender_id !== profile.id && !msg.read_at) {
          umap[cid] = (umap[cid] || 0) + 1
        }
      }
      setLastMsgMap(lmap)
      setUnreadMap(umap)

      const target = deepLinkId
        ? activeConns.find(c => c.id === deepLinkId) || activeConns[0]
        : activeConns[0]

      doSelectConnection(target, profile)
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role])

  // ── Select conversation ──────────────────────────────────────────────────────
  const doSelectConnection = useCallback(async (conn, profile) => {
    if (activeChannelRef.current) {
      await supabase.removeChannel(activeChannelRef.current)
      activeChannelRef.current = null
    }

    setActiveConnection(conn)
    activeConnRef.current = conn.id
    setMessages([])
    setIsTyping(false)
    setPendingFiles([])
    setShowEmojiPicker(false)
    setReactingMsgId(null)

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('connection_id', conn.id)
      .order('sent_at', { ascending: true })

    if (!error) setMessages(data || [])
    setUnreadMap(prev => ({ ...prev, [conn.id]: 0 }))

    // Mark incoming messages as read
    const prof = profile || myProfileRef.current
    if (prof) {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('connection_id', conn.id)
        .neq('sender_id', prof.id)
        .is('read_at', null)
    }

    // Realtime: new messages + typing + live emoji reactions
    const channel = supabase
      .channel(`chat:${conn.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `connection_id=eq.${conn.id}`
      }, payload => {
        const newMsg = payload.new
        setMessages(prev => {
          // deduplicate by id
          if (prev.some(m => m.id === newMsg.id)) return prev
          return [...prev, newMsg]
        })
        setLastMsgMap(prev => ({ ...prev, [conn.id]: newMsg }))
        setIsTyping(false)
        if (activeConnRef.current !== conn.id) {
          setUnreadMap(prev => ({ ...prev, [conn.id]: (prev[conn.id] || 0) + 1 }))
        }
      })
      // Broadcast channel for typing indicator
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        const prof = myProfileRef.current
        if (payload.sender_id !== prof?.id) {
          setIsTyping(true)
          clearTimeout(typingTimerRef.current)
          typingTimerRef.current = setTimeout(() => setIsTyping(false), 3000)
        }
      })
      // Broadcast channel for live emoji reactions
      .on('broadcast', { event: 'reaction' }, ({ payload }) => {
        const { messageId, emoji, userId, action } = payload
        if (!messageId || !emoji || !userId) return

        setReactions(prev => {
          const currentMsgReactions = { ...(prev[messageId] || {}) }
          const currentUsers = [...(currentMsgReactions[emoji] || [])]

          if (action === 'remove') {
            const filtered = currentUsers.filter(id => id !== userId)
            if (filtered.length > 0) {
              currentMsgReactions[emoji] = filtered
            } else {
              delete currentMsgReactions[emoji]
            }
          } else {
            if (!currentUsers.includes(userId)) {
              currentMsgReactions[emoji] = [...currentUsers, userId]
            }
          }

          return { ...prev, [messageId]: currentMsgReactions }
        })
      })
      .subscribe()

    activeChannelRef.current = channel
  }, [])

  // ── Broadcast typing ─────────────────────────────────────────────────────────
  const broadcastTyping = useCallback(() => {
    if (!activeChannelRef.current || !myProfile) return
    activeChannelRef.current.send({
      type: 'broadcast', event: 'typing',
      payload: { sender_id: myProfile.id }
    })
  }, [myProfile])

  // ── Toggle Reaction on a Message ─────────────────────────────────────────────
  const toggleReaction = useCallback((msgId, emoji) => {
    if (!myProfile || !activeChannelRef.current) return

    const userId = myProfile.id
    let action = 'add'

    setReactions(prev => {
      const currentMsgReactions = { ...(prev[msgId] || {}) }
      const currentUsers = [...(currentMsgReactions[emoji] || [])]

      if (currentUsers.includes(userId)) {
        action = 'remove'
        const filtered = currentUsers.filter(id => id !== userId)
        if (filtered.length > 0) {
          currentMsgReactions[emoji] = filtered
        } else {
          delete currentMsgReactions[emoji]
        }
      } else {
        action = 'add'
        currentMsgReactions[emoji] = [...currentUsers, userId]
      }

      return { ...prev, [msgId]: currentMsgReactions }
    })

    // Broadcast reaction to other party in real time
    activeChannelRef.current.send({
      type: 'broadcast',
      event: 'reaction',
      payload: { messageId: msgId, emoji, userId, action }
    })
  }, [myProfile])

  // ── Upload a file to Supabase Storage ────────────────────────────────────────
  const uploadFile = async (file) => {
    const ext      = file.name.split('.').pop()
    const path     = `messages/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage
      .from('message-attachments')
      .upload(path, file, { contentType: file.type, upsert: false })
    if (error) throw error
    const { data: urlData } = supabase.storage
      .from('message-attachments')
      .getPublicUrl(path)
    return { url: urlData.publicUrl, name: file.name, size: file.size, mime_type: file.type }
  }

  // ── Handle file pick ──────────────────────────────────────────────────────────
  const handleFilePick = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const previews = files.map(f => ({
      file: f,
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
      type: f.type.startsWith('image/') || f.type.startsWith('video/') ? 'media' : 'doc',
    }))
    setPendingFiles(prev => [...prev, ...previews])
    setShowAttachMenu(false)
    e.target.value = ''
  }

  const removePending = (idx) => {
    setPendingFiles(prev => {
      const updated = [...prev]
      if (updated[idx].preview) URL.revokeObjectURL(updated[idx].preview)
      updated.splice(idx, 1)
      return updated
    })
  }

  // ── Send ──────────────────────────────────────────────────────────────────────
  const sendMessage = async (overrideText) => {
    const msgText = typeof overrideText === 'string' ? overrideText : input
    const hasText  = msgText.trim().length > 0
    const hasFiles = pendingFiles.length > 0
    if (!hasText && !hasFiles) return
    if (!activeConnection || !myProfile || sending || uploading) return

    const text = msgText.trim()
    setInput('')
    setShowEmojiPicker(false)
    setSending(true)

    if (hasFiles) {
      setUploading(true)
      for (const pf of pendingFiles) {
        try {
          const att = await uploadFile(pf.file)
          await supabase.from('messages').insert({
            connection_id: activeConnection.id,
            sender_id:     myProfile.id,
            sender_role:   role,
            type:          pf.type === 'media' ? (pf.file.type.startsWith('video/') ? 'video' : 'image') : 'document',
            content:       null,
            attachment:    att,
          })
        } catch (err) {
          console.error('Upload failed', err)
        }
      }
      setUploading(false)
      setPendingFiles([])
    }

    if (hasText) {
      const { data: newMsg, error } = await supabase.from('messages').insert({
        connection_id: activeConnection.id,
        sender_id:     myProfile.id,
        sender_role:   role,
        type:          'text',
        content:       text,
      }).select().single()

      if (!error) {
        setLastMsgMap(prev => ({ ...prev, [activeConnection.id]: newMsg }))
      } else {
        console.error('Send error:', error.message)
        setInput(text)
      }
    }

    setSending(false)
    textInputRef.current?.focus()
  }

  // ── Insert emoji into input ──────────────────────────────────────────────────
  const handleEmojiSelect = (emoji) => {
    if (reactingMsgId) {
      toggleReaction(reactingMsgId, emoji)
      setReactingMsgId(null)
      setShowEmojiPicker(false)
      return
    }

    setInput(prev => prev + emoji)
    textInputRef.current?.focus()
  }

  // ── Quick emoji click from bottom bar ─────────────────────────────────────────
  const handleQuickEmojiClick = (emoji) => {
    setInput(prev => prev + emoji)
    textInputRef.current?.focus()
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (activeChannelRef.current) supabase.removeChannel(activeChannelRef.current)
      clearTimeout(typingTimerRef.current)
    }
  }, [])

  // ── Derived ───────────────────────────────────────────────────────────────────
  const getOtherParty = (conn) => role === 'client' ? conn.influencers : conn.clients
  const filteredConns  = connections.filter(c => {
    const other = getOtherParty(c)
    return !search || other?.name?.toLowerCase().includes(search.toLowerCase())
  })
  const activeOther = activeConnection ? getOtherParty(activeConnection) : null

  const groupedMessages = messages.reduce((groups, msg) => {
    const key = new Date(msg.sent_at).toDateString()
    if (!groups[key]) groups[key] = []
    groups[key].push(msg)
    return groups
  }, {})

  const mediaMessages = messages.filter(m => m.attachment)
  const totalUnread   = Object.values(unreadMap).reduce((a, b) => a + b, 0)

  const lastMsgPreview = (c) => {
    const last = lastMsgMap[c.id]
    if (!last) return 'No messages yet'
    const mine = last.sender_id === myProfile?.id
    if (last.attachment) return (mine ? 'You: ' : '') + '📎 ' + (last.attachment.name || 'Attachment')
    return (mine ? 'You: ' : '') + last.content
  }

  return (
    <div className="dashboard-body msg-page-root">
      <DashboardNav role={role} />
      <div className={`msg-layout${showProfile && activeConnection ? ' with-profile' : ''}`}>

        {/* ══ LEFT: Conversations list ══════════════════════════════════════════ */}
        <aside className="msg-sidebar glass">
          <div className="msg-sidebar-header">
            <div className="msg-sidebar-title">
              <span className="msg-logo-icon">💬</span>
              <h2>Messages</h2>
              {totalUnread > 0 && (
                <span className="msg-total-unread">{totalUnread > 99 ? '99+' : totalUnread}</span>
              )}
            </div>
          </div>

          <div className="msg-search">
            <span className="msg-search-icon">🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations…"
            />
          </div>

          <div className="msg-conv-list">
            {loading && (
              <div className="msg-empty-list">
                <div className="msg-empty-icon">⏳</div>
                <p>Loading…</p>
              </div>
            )}
            {!loading && filteredConns.length === 0 && (
              <div className="msg-empty-list">
                <div className="msg-empty-icon">💬</div>
                <p>{role === 'client' ? 'Connect with influencers first' : 'Accept requests to start chatting'}</p>
              </div>
            )}
            {filteredConns.map(c => {
              const other    = getOtherParty(c)
              const unread   = unreadMap[c.id] || 0
              const lastMsg  = lastMsgMap[c.id]
              const isActive = activeConnection?.id === c.id

              return (
                <div
                  key={c.id}
                  className={`msg-conv-item${isActive ? ' active' : ''}${unread > 0 ? ' has-unread' : ''}`}
                  onClick={() => doSelectConnection(c, myProfile)}
                >
                  <div className="msg-conv-avatar-wrap">
                    <img
                      src={other?.avatar_url || `https://i.pravatar.cc/56?u=${other?.id}`}
                      alt={other?.name}
                      className="msg-conv-avatar"
                    />
                    <span className="msg-online-dot" />
                    {unread > 0 && (
                      <span className="msg-unread-badge">{unread > 9 ? '9+' : unread}</span>
                    )}
                  </div>
                  <div className="msg-conv-info">
                    <div className="msg-conv-top">
                      <span className={`msg-conv-name${unread > 0 ? ' bold' : ''}`}>
                        {other?.name || 'Unknown'}
                      </span>
                      <span className="msg-conv-time">{formatTime(lastMsg?.sent_at)}</span>
                    </div>
                    <p className={`msg-conv-preview${unread > 0 ? ' bold' : ''}`}>
                      {lastMsgPreview(c)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </aside>

        {/* ══ CENTER: Chat area ═════════════════════════════════════════════════ */}
        <main className="msg-chat glass">
          {!activeConnection ? (
            <div className="msg-no-chat">
              <div className="msg-no-chat-icon">💬</div>
              <h3>Select a conversation</h3>
              <p>Pick a contact from the left panel to start messaging</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="msg-chat-header">
                <div className="msg-chat-header-left">
                  <div className="msg-chat-avatar-wrap">
                    <img
                      src={activeOther?.avatar_url || `https://i.pravatar.cc/48?u=${activeOther?.id}`}
                      alt={activeOther?.name}
                      className="msg-chat-avatar"
                    />
                    <span className="msg-online-dot" />
                  </div>
                  <div className="msg-chat-header-text">
                    <h3>{activeOther?.name}</h3>
                    <span className="msg-chat-status">
                      {isTyping ? '✍️ typing…' : '🟢 Online'}
                    </span>
                  </div>
                </div>
                <div className="msg-chat-header-actions">
                  <button
                    className={`msg-hdr-btn${showProfile ? ' active' : ''}`}
                    title={showProfile ? 'Hide profile panel' : 'Show profile panel'}
                    onClick={() => setShowProfile(p => !p)}
                  >
                    {showProfile ? '✕ Hide Info' : '👤 Profile Info'}
                  </button>
                </div>
              </div>

              {/* Message area */}
              <div className="msg-messages-area">
                {Object.keys(groupedMessages).length === 0 && !loading && (
                  <div className="msg-no-messages">
                    <div>👋</div>
                    <p>No messages yet — say hello!</p>
                  </div>
                )}

                {Object.entries(groupedMessages).map(([dateKey, msgs]) => (
                  <div key={dateKey}>
                    <div className="msg-date-sep">
                      <span>
                        {new Date(dateKey).toDateString() === new Date().toDateString()
                          ? 'Today'
                          : new Date(dateKey).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    {msgs.map(m => (
                      <MessageBubble
                        key={m.id}
                        m={m}
                        isMine={m.sender_id === myProfile?.id}
                        otherAvatar={activeOther?.avatar_url || `https://i.pravatar.cc/36?u=${activeOther?.id}`}
                        myProfile={myProfile}
                        reactions={reactions}
                        onToggleReaction={toggleReaction}
                        onOpenEmojiPickerForMsg={(id) => {
                          setReactingMsgId(id)
                          setShowEmojiPicker(true)
                        }}
                      />
                    ))}
                  </div>
                ))}

                {isTyping && (
                  <TypingBubble avatar={activeOther?.avatar_url || `https://i.pravatar.cc/36?u=${activeOther?.id}`} />
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Pending file previews */}
              {pendingFiles.length > 0 && (
                <div className="msg-pending-files">
                  {pendingFiles.map((pf, i) => (
                    <div key={i} className="msg-pending-item">
                      {pf.preview
                        ? <img src={pf.preview} alt="" className="msg-pending-thumb" />
                        : <span className="msg-pending-doc-icon">📄</span>
                      }
                      <span className="msg-pending-name">{pf.file.name}</span>
                      <button className="msg-pending-remove" onClick={() => removePending(i)}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Interactive Quick Emojis Bar */}
              <div className="msg-quick-emojis-bar">
                <span className="msg-quick-emojis-label">✨ Quick:</span>
                <div className="msg-quick-emojis-list">
                  {QUICK_INPUT_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      className="msg-quick-emoji-btn"
                      onClick={() => handleQuickEmojiClick(emoji)}
                      title={`Add ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input bar */}
              <div className="msg-input-bar">
                {/* Attachment button */}
                <div className="msg-attach-wrap" ref={attachMenuRef}>
                  <button
                    type="button"
                    className="msg-icon-btn"
                    title="Attach photo, video or document"
                    onClick={() => setShowAttachMenu(p => !p)}
                  >
                    📎
                  </button>
                  {showAttachMenu && (
                    <div className="msg-attach-menu glass">
                      {ATTACH_TYPES.map(at => (
                        <button
                          key={at.id}
                          className="msg-attach-option"
                          onClick={() => {
                            fileInputRef.current.accept = at.accept
                            fileInputRef.current.click()
                          }}
                        >
                          <span>{at.icon}</span>
                          <span>{at.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="msg-file-input-hidden"
                    onChange={handleFilePick}
                  />
                </div>

                {/* Text input */}
                <input
                  ref={textInputRef}
                  className="msg-text-input"
                  value={input}
                  onChange={e => {
                    setInput(e.target.value)
                    broadcastTyping()
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder="Type a message or pick an emoji…"
                  disabled={sending || uploading}
                />

                {/* Interactive Emoji picker button & popover */}
                <div className="msg-emoji-wrap" ref={emojiBtnRef}>
                  <button
                    type="button"
                    className={`msg-icon-btn msg-emoji-toggle-btn${showEmojiPicker ? ' active' : ''}`}
                    title="Choose emoji"
                    onClick={() => {
                      if (showEmojiPicker) {
                        setShowEmojiPicker(false)
                        setReactingMsgId(null)
                      } else {
                        setReactingMsgId(null)
                        setShowEmojiPicker(true)
                      }
                    }}
                  >
                    😊
                  </button>

                  {showEmojiPicker && (
                    <EmojiPicker
                      onSelect={handleEmojiSelect}
                      onClose={() => {
                        setShowEmojiPicker(false)
                        setReactingMsgId(null)
                      }}
                    />
                  )}
                </div>

                {/* Send button */}
                <button
                  type="button"
                  className="msg-send-btn"
                  onClick={() => sendMessage()}
                  disabled={(!input.trim() && pendingFiles.length === 0) || sending || uploading}
                  title="Send message"
                >
                  {sending || uploading ? (
                    <span className="msg-send-spinner" />
                  ) : (
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                  )}
                </button>
              </div>
            </>
          )}
        </main>

        {/* ══ RIGHT: Profile panel ══════════════════════════════════════════════ */}
        {showProfile && activeConnection && activeOther && (
          <ProfilePanel
            other={activeOther}
            role={role}
            mediaMessages={mediaMessages}
            onClose={() => setShowProfile(false)}
          />
        )}

      </div>
    </div>
  )
}
