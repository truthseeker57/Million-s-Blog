import { useState, useEffect } from 'react';
import { FaTrash } from "react-icons/fa";
import { BiBookOpen } from "react-icons/bi";
import { AiFillEdit, AiOutlineClose, AiOutlineStar, AiFillStar } from "react-icons/ai";
import DecryptedText from './components/DecryptedText';
import Squares from './components/Squares.jsx';
import ComposerModal from './components/ComposerModal.jsx';
import ReadModal from './components/ReadModal.jsx';
import postServices from './services/posts.js';
import EditModal from './components/EditModal.jsx';
import Drafts from './components/Drafts.jsx'
import Trash from './components/Trash.jsx'
import './App.css';

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
    <span className="path">C:\\LOG&gt;</span>
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


const FeaturedStrip = ({ posts, onRead }) => {
  if (!posts.length) return null;
  return (
    <section className="featured">
      <div className="featured-title">C:\\LOG&gt; featured</div>
      <div className="featured-grid">
        {posts.map(p => (
          <button
            key={p.id}
            className="featured-card"
            onClick={() => onRead(p.id)}
            aria-label={`Open ${p.title}`}
          >
            <div className="featured-header">
              <span className="featured-dot" />
              <span className="featured-dot" />
              <span className="featured-dot" />
            </div>
            <div className="featured-body">
              <div className="featured-name">{p.title}</div>
              <div className="featured-meta">{p.date} · {p.read || '—'}</div>
              <div className="featured-tags">{Array.isArray(p.tags) ? p.tags.join(', ') : ''}</div>
            </div>
          </button>
        ))}
      </div>
      <div className="divider">----------------------------------------------------------------</div>
    </section>
  );
};

const PostItem = ({ posts, onDelete, onRead, onEdit, onToggleFeatured, setShowNotif }) => (
  <div>
    {posts.map((post) => (
      <div className="post-block" key={post.id}>
        <div className="post-header">
          {post.title}&nbsp; &nbsp; &nbsp; &nbsp;
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

          <button
            className={`post-action-btn ${post.featured ? 'starred' : 'star'}`}
            onClick={() => onToggleFeatured(post)}
            aria-label={post.featured ? 'Unfeature post' : 'Feature post'}
            title={post.featured ? 'Unfeature' : 'Feature'}
          >
            {post.featured ? <AiFillStar /> : <AiOutlineStar />}
          </button>

          <button className="post-action-btn del" onClick={() => { onDelete(post.id); setShowNotif(true) }} aria-label="Move post to Trash">
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
  const [draftedPosts, setDraftedPost] = useState([])
  const [isDraftsOpen, setIsDraftOpen] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [existed, setExisted] = useState(false)
  const [notifMessage, setNotifMessage] = useState('')

  useEffect(() => {
    const timer = setTimeout(() =>
      setShowNotif(false), 4000)
    return () => clearTimeout(timer)
  }, [showNotif])

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    tags: '',
    content: '',
  });

  const loadPosts = () => {
    postServices.getAll('posts').then(initial => {
      setPosts(initial.map(p => ({ ...p, tags: ensureTagArray(p.tags), featured: !!p.featured })));
    });
    postServices.getAll('trash').then(initial => {
      setTrashedPosts(initial.map(p => ({ ...p, tags: ensureTagArray(p.tags), featured: !!p.featured })))
    })
    postServices.getAll('draft').then(initial => {
      setDraftedPost(initial.map(p => ({...p, tags: ensureTagArray(p.tags), featured: !!p.featured})))
    })
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleSearch = (event) => {
    const searchedItem = event.target.value.toLowerCase();
    setQuery(searchedItem);
    postServices.getAll('posts').then(all =>
      setPosts(
        all
          .map(p => ({ ...p, tags: ensureTagArray(p.tags), featured: !!p.featured }))
          .filter(post => (post.title || '').toLowerCase().includes(searchedItem))
      )
    );
  };

  const readPost = (id) => {
    setSelectedPost(posts.find(post => post.id === id));
    setIsReadModalOpen(true);
  };

  const moveToTrash = (id) => {
    setNotifMessage("Post has been moved to trash.")
    const post = posts.find(p => p.id === id);
    if (!post) return;

    postServices.createPost('trash', post).then(() => {
      postServices.deletePost('posts', id).then(() => {
        setPosts(prev => prev.filter(p => p.id !== id));
        setTrashedPosts(prev => [{ ...post }, ...prev]);
      })
    })
  };

  const purgePost = (id) => {
    postServices.deletePost('trash', id).then(() => {
      setTrashedPosts(prev => prev.filter(p => p.id !== id));
      postServices.deletePost?.('posts', id).catch(() => { });
    })
  };

  const getMeta = (formData) => {
    const now = new Date();
    const date = now.toLocaleDateString('en-US');
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const words = (formData.content.trim() ? formData.content.trim().split(/\s+/).length : 0);
    const read = `${Math.max(1, Math.ceil(words / 200))}MIN`;
    return { now, date, time, read }
  }

  const addToDrafts = (formData) => {
    setNotifMessage("Post has been moved to drafts.")
    let draft = draftedPosts.find(post => post.id === formData.id)

    if (draft) {
      draft = {
        ...draft,
        title: formData.title || 'Untitled',
        date: getMeta(formData).date,
        time: getMeta(formData).time,
        read: getMeta(formData).read,
        excerpt: formData.excerpt || formData.content.slice(0, 250),
        content: formData.content,
        tags: tagAssembler(formData.tags)
      }
      postServices.createPost('draft', draft).then(() => {
        postServices.deletePost('draft', draft.id).then(() => {
            setDraftedPost(prev => prev.map(post => post.id === formData.id ? draft : post))
        })
      })
    }
    else {
      const newPost = {
        id: String(getMeta(formData).now.getTime()),
        title: formData.title || 'Untitled',
        date: getMeta(formData).date,
        time: getMeta(formData).time,
        read: getMeta(formData).read,
        excerpt: formData.excerpt || formData.content.slice(0, 250),
        content: formData.content,
        tags: tagAssembler(formData.tags),
        likes: 0,
        comments: 0,
        featured: false,
      };
      postServices.createPost('draft', newPost).then(() => {
        setDraftedPost([...draftedPosts, newPost])
      })
    }
  }

  const continueDraft = (id) => {
    const post = draftedPosts.find(post => post.id === id)
    setSelectedPost(post)
    setIsEditorOpen(true)
    setIsDraftOpen(false)
    setExisted(true)
  }

  const restorePost = (id) => {
    const post = trashedPosts.find(p => p.id === id);
    if (!post) return;

    postServices.deletePost('trash', id).then(() => {
      postServices.createPost('posts', post).then(() => {
        setTrashedPosts(prev => prev.filter(p => p.id !== id));
        setPosts(prev => [post, ...prev]);
      })
    })

  };

  const editPost = (id) => {
    const post = posts.find(p => p.id === id);
    setSelectedPost(post);
    setIsEditorOpen(true);
  }

  const clearDraft = () => {
    postServices.deleteAll('draft').then(() => {
      setDraftedPost([])
    })

  }

  const clearTrash = () => {
    postServices.deleteAll('trash').then(() => {
      setTrashedPosts([])
    })

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
    setIsDraftOpen(false)
    setIsTrashOpen(false);
    setSelectedPost(null);
  };

  const handleContentUpdate = async (e) => {
    e.preventDefault();
    if (!selectedPost) return;

    const id = selectedPost.id;
    const original = posts.find(p => p.id === id) || {};
    const meta = getMeta(formData);

    if (!existed) {
      const updatedPost = {
        ...original,
        title: formData.title,
        excerpt: formData.excerpt || formData.content.slice(0, 250),
        tags: tagAssembler(formData.tags),
        content: formData.content
      };

      try {
        const data = await postServices.editPost('posts', id, updatedPost);
        if (data) {
          setPosts(prev =>
            prev.map(p =>
              p.id === id ? { ...data, tags: ensureTagArray(data.tags) } : p
            )
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsEditorOpen(false);
        setSelectedPost(null);
      }
    } else {
      const newPost = {
        id: String(meta.now.getTime()),
        title: formData.title || 'Untitled',
        date: meta.date,
        time: meta.time,
        read: meta.read,
        excerpt: formData.excerpt || formData.content.slice(0, 250),
        tags: tagAssembler(formData.tags),
        content: formData.content,
        likes: 0,
        comments: 0,
        featured: false,
      };

      try {
        const created = await postServices.createPost('posts', newPost);
        setPosts(prev => [...prev, { ...created, tags: ensureTagArray(created.tags) }]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsEditorOpen(false);
        setSelectedPost(null);
        setExisted(false);
        setDraftedPost(prev => prev.filter(p => p.id !== id));
      }
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setShowNotif(true)
    setNotifMessage("Post has been published.")
    const newPost = {
      id: String(getMeta(formData).now.getTime()),
      title: formData.title || 'Untitled',
      date: getMeta(formData).date,
      time: getMeta(formData).time,
      read: getMeta(formData).read,
      excerpt: formData.excerpt || formData.content.slice(0, 250),
      content: formData.content,
      tags: tagAssembler(formData.tags),
      likes: 0,
      comments: 0,
      featured: false,
    };

    const created = await postServices.createPost('posts', newPost);
    const normalized = { ...created, tags: ensureTagArray(created.tags), featured: !!created.featured };
    setPosts(prev => [...prev, normalized]);
    setIsComposerOpen(false);
  };


  const toggleFeatured = async (post) => {
    const updated = { ...post, featured: !post.featured };
    setPosts(prev => prev.map(p => p.id === post.id ? updated : p));
    try {
      const data = await postServices.editPost('posts', post.id, updated);
      if (data) {
        setPosts(prev => prev.map(p => p.id === post.id ? { ...data, tags: ensureTagArray(data.tags), featured: !!data.featured } : p));
      }
    } catch (e) {
      setPosts(prev => prev.map(p => p.id === post.id ? post : p));
      console.error(e);
    }
  };

  const featuredPosts = posts.filter(p => p.featured);

  return (
    <>
      {showNotif && <div className="notification">{notifMessage}</div>}

      {isComposerOpen && (
        <ComposerModal
          isOpen
          onClose={handleModalClose}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleModalSubmit}
          setShowNotif={setShowNotif}
          addToDrafts={addToDrafts}
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
          setShowNotif={setShowNotif}
          addToDrafts={addToDrafts}
        />
      )}

      {isDraftsOpen && (<Drafts
        isOpen={isDraftsOpen}
        onClose={() => setIsDraftOpen(false)}
        draftedPosts={draftedPosts}
        onContinueDraft={continueDraft}
        clear={clearDraft}
      />)}

      {isTrashOpen && (
        <Trash
          isOpen={isTrashOpen}
          onClose={() => setIsTrashOpen(false)}
          trashedPosts={trashedPosts}
          onRestore={restorePost}
          onDelete={purgePost}
          clear={clearTrash}
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
        <div className="layout">
          <aside className="featured-col">
            <FeaturedStrip posts={featuredPosts} onRead={readPost} />
          </aside>

          <section className="content-col">
            <div className="post-toolbar">
              <div className="post-action new-post" onClick={handleNewPost}>
                <DecryptedText text={`+ New`} />
              </div>
              <div className="post-action" onClick={() => setIsDraftOpen(true)}>
                <DecryptedText text={`Drafts`} /><span className="trash-count">{draftedPosts?.length < 999 ? draftedPosts?.length : '999+'}</span>
              </div>
              <div className="post-action" onClick={() => setIsTrashOpen(true)}>
                <DecryptedText text={`Trash`} /><span className="trash-count">{trashedPosts?.length < 999 ? trashedPosts.length : '999+'}</span>
              </div>
              <div className="post-action"><DecryptedText text={`Export`} /></div>
            </div>

            <PostItem
              posts={posts}
              onDelete={moveToTrash}
              onRead={readPost}
              onEdit={editPost}
              onToggleFeatured={toggleFeatured}
              setShowNotif={setShowNotif}
            />

            {posts.length === 0 && (
              <p className="empty">No matches for “{query}”.</p>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
