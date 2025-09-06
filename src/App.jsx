import { useState, useEffect } from 'react';
import { FaTrash } from "react-icons/fa";
import { BiBookOpen } from "react-icons/bi";
import { AiFillEdit, AiOutlineClose } from "react-icons/ai"; 
import './App.css';
import DecryptedText from './components/DecryptedText';
import Squares from './components/Squares.jsx';
import ComposerModal from './components/ComposerModal.jsx';
import ReadModal from './components/ReadModal.jsx';
import postServices from './services/posts.js';
import EditModal from './components/EditModal.jsx';
import Trash from './components/Trash.jsx'

const ensureTagArray = (tags) => {
  if (Array.isArray(tags)) return tags;
  if (tags == null) return [];
  return String(tags)
    .split(/[.,]/)
    .map(t => t.trim())
    .filter(Boolean)
    .map(t => t.toUpperCase());
};

const Navigation = () => (
  <nav className="nav">
    <span className="path">C:\\BLOG&gt;</span>
    <a href="#">posts</a>
    <a href="#">archive</a>
    <a href="#">shower_thoughts</a>
    <a href="#">about</a>
  </nav>
);

const Search = ({ onChange }) => (
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

const PostItem = ({ posts, onDelete, onRead, onEdit }) => (
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
          Tags : {Array.isArray(post.tags) ? post.tags.join(', ') : ''} <br />
          Likes: ♥ {post.likes} &nbsp; Comments: {post.comments}
        </div>
        <div className="divider">----------------------------------------------------------------</div>

        <div className="post-actions">
          <button className="post-action-btn read" onClick={() => onRead(post.id)} aria-label="Read post">
            <BiBookOpen />
          </button>

          <button className="post-action-btn edit" onClick={() => onEdit(post.id)} aria-label="Edit post">
            <AiFillEdit />
          </button>
          <button className="post-action-btn del" onClick={() => onDelete(post.id)} aria-label="Move post to Trash">
            <FaTrash />
          </button>
        </div>
      </div>
    ))}
  </div>
);


export default function App() {
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isReadModalOpen, setIsReadModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [trashedPosts, setTrashedPosts] = useState([]);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() =>
      setShowNotif(false), 4000)
    return () => clearTimeout(timer)
  }
    , [showNotif])

      useEffect(() => {
    if (!showNotif) return;
    const timer = setTimeout(() => setShowNotif(false), 4000);
    return () => clearTimeout(timer);
  }, [showNotif]);

console.log(showNotif)
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    tags: '',
    content: '',
  });

  useEffect(() => {
    postServices.getAll().then(initialPosts => {
      setPosts(initialPosts.map(p => ({ ...p, tags: ensureTagArray(p.tags) })));
    });
  }, []);

  const handleSearch = (event) => {
    const searchedItem = event.target.value.toLowerCase();
    setQuery(searchedItem);
    postServices.getAll().then(all =>
      setPosts(
        all
          .map(p => ({ ...p, tags: ensureTagArray(p.tags) }))
          .filter(post => (post.title || '').toLowerCase().includes(searchedItem))
      )
    );
  };

  const readPost = (id) => {
    setSelectedPost(posts.find(post => post.id === id));
    setIsReadModalOpen(true);
  };

  const moveToTrash = (id) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    setPosts(prev => prev.filter(p => p.id !== id));
    setTrashedPosts(prev => [{ ...post }, ...prev]);

    postServices.trashPost?.(id).catch(() => { });
  };

  const purgePost = (id) => {
    setTrashedPosts(prev => prev.filter(p => p.id !== id));
    postServices.deletePost?.(id).catch(() => { });
  };

  const restorePost = (id) => {
    const post = trashedPosts.find(p => p.id === id);
    if (!post) return;
    setTrashedPosts(prev => prev.filter(p => p.id !== id));
    setPosts(prev => [post, ...prev]);
    postServices.restorePost?.(id).catch(() => { });
  };

  const editPost = (id) => {
    const post = posts.find(p => p.id === id);
    setSelectedPost(post);
    setIsEditorOpen(true);
  }

  const handleNewPost = () => {
    setSelectedPost(null);
    setFormData({
      title: '',
      excerpt: '',
      tags: '',
      content: '',
    });
    setIsComposerOpen(true);
  };

  const tagAssembler = (tagString) => ensureTagArray(tagString);

  const handleModalClose = () => {
    setIsComposerOpen(false);
    setIsEditorOpen(false);
    setIsReadModalOpen(false);
    setIsTrashOpen(false); 
    setSelectedPost(null);
  };

  const handleContentUpdate = async (e) => {
    e.preventDefault();
    if (!selectedPost) return;

    const id = selectedPost.id;
    const original = posts.find(p => p.id === id) || {}

    const updatedPost = {
      ...original,
      title: formData.title,
      excerpt: formData.excerpt,
      tags: tagAssembler(formData.tags),
      content: formData.content,
    }

    setPosts(prev => prev.map(p => (p.id === id ? updatedPost : p)));

    try {
      const resp = await postServices.editPost(id, updatedPost);
      if (resp?.data) {
        setPosts(prev => prev.map(p => (p.id === id ? resp.data : p)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEditorOpen(false);
      setSelectedPost(null);
    }
  }

  const handleModalSubmit = (e) => {
    e.preventDefault();

    const now = new Date();
    const date = now.toLocaleDateString('en-US');
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const words = (formData.content.trim() ? formData.content.trim().split(/\s+/).length : 0);
    const read = `${Math.max(1, Math.ceil(words / 200))}MIN`;

    const newPost = {
      id: String(now.getTime()),
      title: formData.title || 'Untitled',
      date,
      time,
      read,
      excerpt: formData.excerpt || formData.content.slice(0, 250),
      content: formData.content,
      tags: tagAssembler(formData.tags),
      likes: 0,
      comments: 0
    };

    postServices.createPost(newPost).then(response => {
      const created = { ...response, tags: ensureTagArray(response.tags) };
      setPosts(prev => [...prev, created]);
    });

    setIsComposerOpen(false);
  };

  return (
    <>

      {showNotif && <div className="notification">Post has been saved in Drafts.</div>}




      {isComposerOpen && (
        <ComposerModal
          isOpen
          onClose={handleModalClose}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleModalSubmit}
          setShowNotif={setShowNotif}
        />
      )}

      {isReadModalOpen && (
        <ReadModal
          isOpen
          onClose={handleModalClose}
          post={selectedPost}
        />
      )}

      {isEditorOpen && selectedPost && (
        <EditModal
          isOpen
          onClose={handleModalClose}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleContentUpdate}
          post={selectedPost}
        />
      )}

      {/* NEW: Trash modal mount */}
      {isTrashOpen && (
        <Trash
          isOpen={isTrashOpen}
          onClose={() => setIsTrashOpen(false)}
          trashedPosts={trashedPosts}
          onRestore={restorePost}
          onDelete={purgePost}
        />
      )}

      <div className="bg">
        <Squares
          speed={0.5}
          squareSize={40}
          direction="diagonal"
          borderColor="#21571fff"
        />
      </div>

      <header className="topbar">
        <h2 className="brand">
          <DecryptedText text={`C:\\\\Million's log> dir`} />
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

          <div className="post-action" onClick={() => setIsTrashOpen(true)}>Trash <span className="trash-count">{trashedPosts.length < 999 ? trashedPosts.length : '999+'}</span></div>

          <div className="post-action">Export</div>
        </div>

        <PostItem
          posts={posts}
          onDelete={moveToTrash}
          onRead={readPost}
          onEdit={editPost}
        />

        {posts.length === 0 && (
          <p className="empty">No matches for “{query}”.</p>
        )}
      </main>
    </>
  );
}
