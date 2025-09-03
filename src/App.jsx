import { useState, useEffect } from 'react';
import { FaTrash } from "react-icons/fa"
import { BiBookOpen } from "react-icons/bi";
import { AiFillEdit } from "react-icons/ai";
import './App.css';
import DecryptedText from './components/DecryptedText';
import Squares from './components/Squares.jsx';
import ComposerModal from './components/ComposerModal.jsx'
import ReadModal from './components/ReadModal.jsx'
import postServices from './services/posts.js'
import EditModal from './components/EditModal.jsx';



const Navigation = () => {
  return (
    <nav className="nav">
      <span className="path">C:\\BLOG&gt;</span>
      <a href="#">posts</a>
      <a href="#">archive</a>
      <a href="#">shower_thoughts</a>
      <a href="#">about</a>
    </nav>
  );
};

const Search = ({ onChange }) => {
  return (
    <div className="search">
      <input
        className="search-input"
        placeholder="/ Search posts..."
        onChange={onChange}
      />
      <span className="hint">/</span>
      <span className="hint">Ctrl+K</span>
    </div>
  );
};

const PostItem = ({ posts, onDelete, onRead, onEdit }) => {
  return (
    <div>
      {posts.map((post) => (
        <div className="post-block" key={post.id}>
          <div className="post-header">
            <DecryptedText text={post.title} /> &nbsp; &nbsp; &nbsp; &nbsp;
            {post.date} &nbsp; {post.time} &nbsp; {post.read} &nbsp;
          </div>
          <div className="divider">----------------------------------------------------------------</div>
          <p className="post-excerpt">{post.excerpt}</p>
          <div className="meta">
            Tags : {post.tags.join(', ')} <br />
            Likes: ♥ {post.likes} &nbsp; Comments: {post.comments}
          </div>
          <div className="divider">----------------------------------------------------------------</div>

          {/* delete button now at bottom-right */}
          <div className="post-actions">
            <button className="post-action-btn read" onClick={() => onRead(post.id)} aria-label="Read post">
              <BiBookOpen />
            </button>

            <button className="post-action-btn edit" onClick={() => onEdit(post.id)} aria-label="Edit post">
              <AiFillEdit />
            </button>

            <button className="post-action-btn del" onClick={() => onDelete(post.id)} aria-label="Delete post">
              <FaTrash />
            </button>
          </div>
        </div>

      ))}
    </div>
  );
};

/* ---------- App ---------- */

export default function App() {
  const [posts, setPosts] = useState([])
  const [query, setQuery] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [isReadModalOpen, setIsReadModalOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState({})
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    tags: '',
    content: '',
  })

  useEffect(() => {
    postServices.getAll().then(initialPosts => {
      setPosts(initialPosts)
    })
  }, [])

  const handleSearch = (event) => {
    const searchedItem = event.target.value.toLowerCase();
    setQuery(searchedItem);
    const filtered = posts.filter(post =>
      post.title.toLowerCase().includes(searchedItem)
    );
    setPosts(filtered);
  }


  const readPost = (id) => {
    setSelectedPost(posts.find(post => post.id == id))
    setIsReadModalOpen(true)
  }

  const deletePost = (id) => {
    postServices.deletePost(id).then(response => {
      setPosts((prev) => prev.filter((post) => post.id !== id))
    })
  }

  const editPost = (id) => {
    setIsComposerOpen(true)
    const post = posts.find(post => post.id === id)
    setSelectedPost(post)
  }

  const handleNewPost = () => {
    setIsComposerOpen(true)
    setFormData({
      title: '',
      excerpt: '',
      tags: '',
      content: '',
    })
  }

  const handleModalClose = () => {
    setIsComposerOpen(false)
    setIsReadModalOpen(false)
    setSelectedPost({})
  }

  const handleModalSubmit = (e) => {
    e.preventDefault()

    const now = new Date()
    const date = now.toLocaleDateString('en-US')
    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })

    const words = formData.content.trim().split(/\s+/).length / 225
    const read = `${Math.max(1, Math.ceil(words / 200))}MIN`

    const tagArray = (formData.tags || '')
      .split('.')
      .map(i => i.trim())
      .filter(Boolean)
      .map(i => i.toUpperCase())

    const tags = Array.from(new Set(tagArray))

    const newPost = {
      id: now,
      title: formData.title || 'Untitled',
      date: date,
      time: time,
      read: read,
      excerpt: formData.excerpt || formData.content.slice(0, 250),
      content: formData.content,
      tags: tags,
      likes: 0,
      comments: 0
    }

    postServices.createPost(newPost).then(response => {
      setPosts(prev => ([...prev, response]))
    })

    setIsComposerOpen(false)
  }

  return (
    <>
      <ComposerModal isOpen={isComposerOpen} onClose={handleModalClose} formData={formData} setFormData={setFormData} onSubmit={handleModalSubmit} />
      <ReadModal isOpen={isReadModalOpen} onClose={handleModalClose} post={selectedPost} />
      <EditModal isOpen={isComposerOpen} onClose={handleModalClose} formData={formData} setFormData={setFormData} onSubmit={handleModalSubmit} post={selectedPost} />

      {/* animated background */}
      <div className="bg">
        <Squares
          speed={0.5}
          squareSize={40}
          direction="diagonal"   // 'up' | 'down' | 'left' | 'right' | 'diagonal'
          borderColor="#21571fff"
        />
      </div>
      <header className="topbar">
        <h2 className="brand">
          <DecryptedText
            text={`C:\\\\Million's log> dir`}
          />
        </h2>
        <div className="toolbar">
          <Navigation />
          <Search onChange={handleSearch} />
        </div>
      </header>

      <main className="container">
        <div className="post-toolbar">
          <div className="post-action new-post" onClick={handleNewPost}>
            <span className="new-icon">+</span> New
          </div>
          <div className="post-action">Drafts</div>
          <div className="post-action">Trash</div>
          <div className="post-action">Export</div>
        </div>
        <PostItem posts={posts} onDelete={deletePost} onRead={readPost} onEdit={editPost} />
        {posts.length === 0 && (
          <p className="empty">No matches for “{query}”.</p>
        )}
      </main>
    </>
  );
}
