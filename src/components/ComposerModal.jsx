const ComposerModal = ({ isOpen, onClose, formData, setFormData, onSubmit, setShowNotif }) => {

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="modal-backdrop" onClick={onClose} />


            {/* Modal panel */}
            <div
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="composer-title"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ONE form that wraps header + body + footer */}
                <form id="composer-form" onSubmit={onSubmit}>

                    <div className="modal__header">
                        <h3 id="composer-title" className="modal__title">NEW_POST.TXT</h3>
                        <div className="modal__actions">
                            <button className="btn btn--primary" type="submit">Publish</button>
                            <button className="btn btn--danger" type="button" onClick={() => { onClose(); setShowNotif(true); }}>Discard</button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="modal__body">
                        <section className="composer">
                            <div className="field">
                                <label>Title</label>
                                <input
                                    className="input"
                                    type="text"
                                    value={formData.title ?? ''}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="field">
                                <label>Tags (comma-separated)</label>
                                <input
                                    className="input"
                                    type="text"
                                    value={formData.tags ?? ''}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                />
                            </div>

                            <div className="field">
                                <label>Excerpt</label>
                                <input
                                    className="input"
                                    type="text"
                                    value={formData.excerpt ?? ''}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                />
                            </div>

                            <div className="field">
                                <label>Content</label>
                                <textarea
                                    className="textarea"
                                    value={formData.content ?? ''}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                />
                            </div>
                        </section>

                        {/* Preview */}
                        <aside className="preview">
                            <h2 className="preview__title">{formData.title || 'Untitled'}</h2>
                            <div className="preview__meta">
                                {(formData.tags || '')
                                    .split(',')
                                    .map(t => t.trim())
                                    .filter(Boolean)
                                    .map((t, i) => <span key={i} className="tag">{t.toUpperCase()}</span>)}
                            </div>
                            <div className="preview__content">
                                {formData.content || 'Start typing your post…'}
                            </div>
                        </aside>
                    </div>
                </form>
            </div>
        </>
    );
};

export default ComposerModal;
