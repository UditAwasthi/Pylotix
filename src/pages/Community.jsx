import React, { useEffect, useState, useRef } from 'react'
import auth from './auth.js'
import './community.css'

const API_BASE = 'http://127.0.0.1:5500/community/posts'

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return 'Just now'
  const intervals = { yr: 31536000, mo: 2592000, day: 86400, hr: 3600, min: 60 }
  for (let i in intervals) {
    const count = Math.floor(seconds / intervals[i])
    if (count > 0) return `${count}${i}`
  }
  return 'Just now'
}

export default function Community() {
  const [posts, setPosts] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [previews, setPreviews] = useState([])
  const fileRef = useRef(null)
  const [commentsMap, setCommentsMap] = useState({})

  useEffect(() => { if (!localStorage.getItem('accessToken')) window.location.href = '/signin'; loadPosts() }, [])

  async function loadPosts() {
    try {
      const res = await fetch(API_BASE, { headers: auth.getHeaders() })
      const result = await res.json()
      if (result.success) setPosts(result.data || [])
    } catch (e) { console.error(e) }
  }

  async function loadComments(postId) {
    try {
      const res = await fetch(`${API_BASE}/${postId}/comments`, { headers: auth.getHeaders() })
      const result = await res.json()
      if (!result.success) return
      // build tree
      const comments = result.data || []
      const map = {}
      comments.forEach(c => map[c._id] = { ...c, children: [] })
      const roots = []
      comments.forEach(c => {
        if (c.parentComment) map[c.parentComment]?.children.push(map[c._id])
        else roots.push(map[c._id])
      })
      setCommentsMap(m => ({ ...m, [postId]: roots }))
    } catch (e) { console.error(e) }
  }

  async function submitComment(postId, content, parentComment = null) {
    try {
      await fetch(`${API_BASE}/${postId}/comments`, {
        method: 'POST',
        headers: auth.getHeaders(),
        body: JSON.stringify({ content, parentComment }),
      })
    } catch (e) { console.error(e) }
  }

  async function handleCreatePost() {
    if (!title.trim() || !content.trim()) return
    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.append('title', title)
      fd.append('content', content)
      Array.from(fileRef.current?.files || []).forEach(f => fd.append('images', f))
      const res = await fetch(API_BASE, { method: 'POST', headers: { Authorization: auth.getHeaders().Authorization }, body: fd })
      if (res.ok) {
        setTitle('')
        setContent('')
        fileRef.current.value = ''
        setPreviews([])
        await loadPosts()
      }
    } catch (e) { console.error(e) }
    setIsUploading(false)
  }

  function handleFilesChange(e) {
    const files = Array.from(e.target.files || [])
    const reads = files.map(f => new Promise(res => {
      const r = new FileReader(); r.onload = (ev) => res(ev.target.result); r.readAsDataURL(f)
    }))
    Promise.all(reads).then(urls => setPreviews(urls))
  }

  function renderCommentTree(nodes, postId) {
    if (!nodes || !nodes.length) return null
    return nodes.map(node => (
      <div key={node._id} className={node.parentComment ? 'thread-line mt-3' : 'mt-2'}>
        <div className="glass-card rounded-2xl p-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] font-bold text-zinc-500 uppercase">USR_{String(node.author||'').slice(-4)}_NODE</span>
            <span className="text-[9px] text-zinc-600 font-medium">{timeAgo(node.createdAt)}</span>
          </div>
          <p className="text-sm text-zinc-300 leading-snug">{node.content}</p>
          <ReplyBox postId={postId} parentId={node._id} onSent={() => loadComments(postId)} />
        </div>
        {renderCommentTree(node.children, postId)}
      </div>
    ))
  }

  return (
    <div className="antialiased min-h-screen pb-20">
      {isUploading && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"><div className="glass-card rounded-3xl p-8 text-center"><div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" /><p className="text-xs font-bold tracking-widest uppercase opacity-50">Synchronizing...</p></div></div>}

      <nav className="flex justify-between items-center px-8 py-5 sticky top-0 z-50 bg-zinc-950/50 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-white to-zinc-400 rounded-lg shadow-lg" />
          <span className="font-bold text-lg tracking-tight">Arclight <span className="text-zinc-500 font-medium">Archive</span></span>
        </div>
        <div className="flex items-center gap-6">
          <button id="logoutBtn" onClick={auth.logout} className="text-xs font-semibold text-zinc-400 hover:text-white">Logout</button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-16">
        <header className="mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight mb-3">Knowledge Base</h1>
          <p className="text-zinc-500 text-sm font-medium">Collective intelligence repository.</p>
        </header>

        <section className="glass-card rounded-[2rem] p-8 mb-16">
          <input id="postTitle" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-transparent text-2xl font-bold outline-none placeholder:text-zinc-700 mb-4" placeholder="Entry Title..." />
          <textarea id="postContent" value={content} onChange={(e) => setContent(e.target.value)} className="w-full bg-transparent text-zinc-400 outline-none resize-none min-h-[120px] placeholder:text-zinc-700 leading-relaxed text-lg" placeholder="What's on your mind?" />

          <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-4">
            <div className="flex items-center gap-3">
              <label htmlFor="imageInput" className="group cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                <svg className="w-4 h-4 text-zinc-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="text-xs font-semibold text-zinc-400 group-hover:text-white">Media</span>
              </label>
              <input id="imageInput" ref={fileRef} onChange={handleFilesChange} type="file" multiple accept="image/*" className="hidden" />
              <div id="imagePreview" className="flex gap-1">{previews.map((p,i)=> <img key={i} src={p} className="w-8 h-8 rounded-lg object-cover border border-white/10" alt="preview" />)}</div>
            </div>
            <button id="createPostBtn" onClick={handleCreatePost} className="btn-primary px-8 py-2.5 rounded-full text-xs uppercase tracking-wider">Commit Post</button>
          </div>
        </section>

        <div id="postsContainer" className="space-y-12">
          {posts.length === 0 ? <div className="h-48 loading-shimmer rounded-[2rem]"></div> : posts.map(post => (
            <article className="group" key={post._id}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">ID_{String(post._id).slice(-4)}</span>
                <span className="text-[10px] text-zinc-700">•</span>
                <span className="text-[10px] font-medium text-zinc-500 uppercase">{timeAgo(post.createdAt)}</span>
              </div>

              <div className="glass-card rounded-[2rem] p-8 mb-6">
                <h3 className="text-2xl font-bold mb-4 tracking-tight">{post.title}</h3>
                <p className="text-zinc-400 leading-relaxed mb-6">{post.content}</p>
                {post.images?.length ? (
                  <div className="grid grid-cols-2 gap-3">{post.images.map((img,i)=>(<img key={i} src={img.url} className="rounded-2xl w-full h-64 object-cover border border-white/5" alt="post"/>))}</div>
                ) : null}
              </div>

              <div className="ml-4">
                <div id={`comments-${post._id}`} className="space-y-4">{renderCommentsForPost(post._id, commentsMap)}</div>
                <div className="mt-6 flex gap-2">
                  <input id={`comment-field-${post._id}`} className="flex-1 input-field rounded-full px-6 py-3 text-sm" placeholder="Write a response..." />
                  <button onClick={async ()=>{ const field = document.getElementById(`comment-field-${post._id}`); if (!field.value.trim()) return; await submitComment(post._id, field.value); field.value=''; await loadComments(post._id);} } className="commentBtn w-12 h-12 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  )

  // helper to render comments map entry
  function renderCommentsForPost(postId, map) {
    const nodes = map[postId]
    if (!nodes) {
      // lazy load
      loadComments(postId)
      return null
    }
    return renderTree(nodes, postId)
  }

  function renderTree(nodes, postId) {
    return nodes.map(node => (
      <div key={node._id} className={node.parentComment ? 'thread-line mt-3' : 'mt-2'}>
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] font-bold text-zinc-500 uppercase">USR_{String(node.author||'').slice(-4)}_NODE</span>
            <span className="text-[9px] text-zinc-600 font-medium">{timeAgo(node.createdAt)}</span>
          </div>
          <p className="text-sm text-zinc-300 leading-snug">{node.content}</p>
          <ReplyBox postId={postId} parentId={node._id} onSent={()=>loadComments(postId)} />
        </div>
        {node.children && node.children.length ? <div className="ml-4">{renderTree(node.children, postId)}</div> : null}
      </div>
    ))
  }
}

function ReplyBox({ postId, parentId, onSent }) {
  const [open, setOpen] = useState(false)
  const [val, setVal] = useState('')
  return (
    <div className="mt-3">
      <button onClick={()=>setOpen(o=>!o)} className="replyToggleBtn text-[9px] font-bold text-zinc-500 mt-2 hover:text-white uppercase tracking-widest">Reply</button>
      {open && (
        <div className="mt-3">
          <div className="flex gap-2">
            <input value={val} onChange={(e)=>setVal(e.target.value)} className="flex-1 input-field rounded-lg px-3 py-1.5 text-xs" placeholder="Type reply..." />
            <button onClick={async ()=>{ if(!val.trim()) return; await fetch(`${API_BASE}/${postId}/comments`, { method: 'POST', headers: auth.getHeaders(), body: JSON.stringify({ content: val, parentComment: parentId }) }); setVal(''); onSent(); }} className="sendReply px-4 py-1.5 bg-zinc-200 text-black rounded-lg text-[10px] font-bold uppercase">Send</button>
          </div>
        </div>
      )}
    </div>
  )
}
