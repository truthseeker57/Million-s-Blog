import { useEffect } from "react";

const EditModal = ({ isOpen, onClose, formData, setFormData, post, onSubmit, setShowNotif, addToDrafts }) => {
  if (!isOpen) return null;


  useEffect(() => {
    if (isOpen && post) {
      setFormData({
        id: post.id ?? formData?.id ?? undefined,
        title: post.title ?? "",
        tags: Array.isArray(post.tags) ? post.tags.join(", ") : (post.tags ?? ""),
        excerpt: post.excerpt ?? "",
        content: post.content ?? "",
      });
    }

  }, [isOpen, post]);

  const handleChange = (key) => (e) =>
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));


  const previewTags =
    (formData?.tags ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  return (
    <>

      <div className="modal-backdrop" onClick={onClose} />


      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="composer-title"
        onClick={(e) => e.stopPropagation()}
      >
        <form id="composer-form" onSubmit={onSubmit}>
          <div className="modal__header">
            <h3 id="composer-title" className="modal__title">
              {formData?.title || "Edit Post"}
            </h3>
            <div className="modal__actions">
              <button className="btn btn--primary" type="submit">
                Publish
              </button>
              <button className="btn btn--danger" type="button" onClick={()=> {onClose();  setShowNotif(true); addToDrafts(formData)}}>
                Discard
              </button>
            </div>
          </div>


          <div className="modal__body">
            <section className="composer">
              <div className="field">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  className="input"
                  type="text"
                  value={formData?.title ?? ""}
                  onChange={handleChange("title")}
                />
              </div>

              <div className="field">
                <label htmlFor="tags">Tags (comma-separated)</label>
                <input
                  id="tags"
                  className="input"
                  type="text"
                  value={formData?.tags ?? ""}
                  onChange={handleChange("tags")}
                />
              </div>

              <div className="field">
                <label htmlFor="excerpt">Excerpt</label>
                <input
                  id="excerpt"
                  className="input"
                  type="text"
                  value={formData?.excerpt ?? ""}
                  onChange={handleChange("excerpt")}
                />
              </div>

              <div className="field">
                <label htmlFor="content">Content</label>
                <textarea
                  id="content"
                  className="textarea"
                  value={formData?.content ?? ""}
                  onChange={handleChange("content")}
                />
              </div>
            </section>


            <aside className="preview">
              <h2 className="preview__title">{formData?.title || "Untitled"}</h2>
              <div className="preview__meta">
                {previewTags.map((t, i) => (
                  <span key={`${t}-${i}`} className="tag">
                    {t.toUpperCase()}
                  </span>
                ))}
              </div>
              <div className="preview__content">
                {formData?.content || "Start typing your post…"}
              </div>
            </aside>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditModal;
