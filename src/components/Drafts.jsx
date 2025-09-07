import { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";


const Drafts = ({
    isOpen,
    onClose,
    draftedPosts = [],
    onContinueDraft
}) => {
    const [query, setQuery] = useState('')

    useEffect(() => {
        if (!isOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'none';
        return () => {
            document.body.style.overflow = prev;
        }
    }, [isOpen])

    if(!isOpen) return null;

    const q = query.trim().toLowerCase()

console.log("DRAFTED POSTS", draftedPosts);
console.log("Type of draftedPosts:", typeof draftedPosts);
console.log("Is draftedPosts an array?", Array.isArray(draftedPosts));

const filtered = !q
  ? draftedPosts
  : draftedPosts.filter((post) => {
      const title = (post.title || "").toLowerCase();
      const excerpt = (post.excerpt || "").toLowerCase();
      const tags = Array.isArray(post.tags)
        ? post.tags.join(" ").toLowerCase()
        : String(post.tags || "").toLowerCase();

      return (
        title.includes(q) || excerpt.includes(q) || tags.includes(q)
      );
    });

console.log("FILTERED", filtered);
console.log("Type of filtered:", typeof filtered);
console.log("Is filtered an array?", Array.isArray(filtered));


    return (
        <>
            <div className="modal-backdrop" onClick={onClose}></div>

            <div
                className="draft-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="draft-title"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="draft-header">
                    <h2 className="draft-title" id="draft-title">Drafts <span className="draft-count">{filtered.length}</span></h2>


                    <div className="draft-tools">
                        <input className="draft-search"
                            value={query}
                            placeholder="Search drafts..."
                            onChange={() => setQuery(e.target.value)} />

                        <button className="icon-btn draft-close" onClick={onClose} aria-label="Close">
                            <AiOutlineClose size={18} />
                        </button>
                    </div>
                </header>

                <div className = "draft-body">
                    {filtered.length === 0 ? (<p className='draft-empty'>No items in drafts.</p>) : (
                    
                    <ul className="draft-list">
                        {filtered.map(post => (
                            <li key = {post.id} className="draft-item">
                                <div className="drafted-item__main">
                                    <div className="drafted-item__title">{post.title || "Untitled"}</div>
                                    <div className ="drafted-item__meta">
                                        {post.date && <span className="drafted-item__date">{post.date}</span>}
                                        {post.time && <span className="drafted-item__time">{post.time}</span>}
                                    </div>
                                        {Array.isArray(post.tags) && post.tags.length > 0 && (
                      <div className="drafted-item__tags">
                        {post.tags.map((t, i) => (
                            <span key={i} className="drafted-tag">{String(t).toUpperCase()}</span>
                        ))}
                      </div>
                                        )}
                                    </div>

                                    <div className="drafted-item__actions">
                                        <button className="btn btn-edit" onClick={() => onContinueDraft(post.id)}>Continue</button>
                                        </div>
                            </li>
                        ))}

                    </ul>
            
                )

                    }
                </div>

            </div>
        </>
    )

}
    export default Drafts