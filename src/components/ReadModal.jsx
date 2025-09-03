import { AiOutlineClose } from "react-icons/ai"; // Ant Design


const ReadModal = ({ onClose, isOpen, post }) => {
    if (!isOpen) return null

    return (
        <>
            {/* Backdrop */}
            <div className="modal-backdrop" onClick={onClose} />


            {/* Reading Modal panel */}
            <div
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="read-title"
                onClick={(e) => e.stopPropagation()}
            >
  <button className="modal__close icon-btn" onClick={onClose} aria-label="Close"> <AiOutlineClose size={18} /> </button>
                <section>
                    <h2 id="read-title" className="read__title">{post.title || 'Untitled'}</h2>

                    <div className="read__datetime">
                        {post.date && <span className="read__date">{post.date}</span>}
                        {post.time && <span className="read__time">{post.time}</span>}
                    </div>




                    <div className="read__tags">
                        {(post.tags || '')
                            .map((p, i) => <span key={i} className="tag">{p.toUpperCase()}</span>)}
                    </div>

                    <div className="read-content">
                        {post.content}
                    </div>
                </section>
            </div>
        </>
    )
}


export default ReadModal