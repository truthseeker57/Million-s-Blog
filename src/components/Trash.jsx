import { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";

const Trash = ({
  isOpen,
  onClose,
  trashedPosts = [],
  onRestore,
  onDelete,
  clear,
}) => {
  const [query, setQuery] = useState("");

  const [confirming, setConfirming] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();
  const filtered = !q
    ? trashedPosts
    : trashedPosts.filter((p) => {
      const title = (p.title || "").toLowerCase();
      const excerpt = (p.excerpt || "").toLowerCase();
      const tags = Array.isArray(p.tags)
        ? p.tags.join(" ").toLowerCase()
        : String(p.tags || "").toLowerCase();
      return title.includes(q) || excerpt.includes(q) || tags.includes(q);
    });


  const askConfirmDelete = (post) => {
    setConfirming({ id: post.id, title: post.title });
  };


  const confirmDelete = () => {
    if (confirming && onDelete) {
      onDelete(confirming.id);
    }
    setConfirming(null);
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div
        className="trash-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="trash-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="trash-header">
          <h2 id="trash-title" className="trash-title">
            Trash <span className="trash-count">{filtered.length}</span>
          </h2>
          <div className="trash-tools">
            <input
              className="trash-search"
              placeholder="Search trash..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="icon-btn trash-close" onClick={onClose} aria-label="Close">
              <AiOutlineClose size={18} />
            </button>
          </div>
        </header>

        <div className="trash-body">
          {filtered.length === 0 ? (
            <p className="trash-empty">No items in Trash.</p>
          ) : (
            <ul className="trash-list">
              {filtered.map((post) => (
                <li key={post.id} className="trash-item">
                  <div className="trashed-item__main">
                    <div className="trashed-item__title">{post.title || "Untitled"}</div>
                    <div className="trashed-item__meta">
                      {post.date && <span className="trashed-item__date">{post.date}</span>}
                      {post.time && <span className="trashed-item__time">{post.time}</span>}
                    </div>
                    {Array.isArray(post.tags) && post.tags.length > 0 && (
                      <div className="trashed-item__tags">
                        {post.tags.map((t, i) => (
                          <span key={i} className="trashed-tag">{String(t).toUpperCase()}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="trashed-item__actions">
                    <button
                      className="btn btn-restore"
                      onClick={() => { if (onRestore) onRestore(post.id); }}
                    >
                      Restore
                    </button>
                    <button
                      className="btn btn-delete"
                      onClick={() => askConfirmDelete(post)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="draft-clear">
            <button className="btn btn--danger" onClick={clear}>Clear</button>
          </div>
        </div>
      </div>

      {confirming && (
        <>
          <div className="confirm-backdrop" onClick={() => setConfirming(null)} />
          <div
            className="confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="confirm-title" className="confirm-title">Permanently delete?</h3>
            <p className="confirm-text">
              Are you sure you want to permanently delete "{confirming.title || "this post"}"?
              This cannot be undone.
            </p>
            <div className="confirm-actions">
              <button className="btn" onClick={() => setConfirming(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Trash;
