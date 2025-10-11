import { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_FORM = { title: "", tags: "", excerpt: "", content: "" }; 

const sanitizeHtml = (html) => {
  const template = document.createElement("template");
  template.innerHTML = html;

  const ALLOWED_BLOCKS = new Set(["P","DIV","H1","H2","H3","BLOCKQUOTE","UL","OL","LI","HR"]);
  const ALLOWED_INLINE = new Set(["STRONG","EM","CODE","A","SPAN","BR"]);
  const ALLOWED = new Set([...ALLOWED_BLOCKS, ...ALLOWED_INLINE, "#text"]);

  const walk = (node) => {
    for (let i = node.childNodes.length - 1; i >= 0; i--) {
      const child = node.childNodes[i];
      const name = child.nodeType === 3 ? "#text" : child.nodeName;
      if (!ALLOWED.has(name)) {
        while (child.firstChild) child.parentNode.insertBefore(child.firstChild, child);
        child.remove();
        continue;
      }
      if (child.nodeName === "A") {
        const href = child.getAttribute("href") || "";
        if (!/^https?:\/\//i.test(href)) child.setAttribute("href", "https://" + href);
        child.setAttribute("rel", "noopener noreferrer");
        child.setAttribute("target", "_blank");
      }
      walk(child);
    }
  };
  walk(template.content);
  return template.innerHTML;
};

const ComposerModal = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  setShowNotif,
  addToDrafts,
}) => {
  const [tagsInput, setTagsInput] = useState("");
  const editorRef = useRef(null);
  const form = formData ?? DEFAULT_FORM;

  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => document.getElementById("title-input")?.focus(), 0);
  }, [isOpen]);


  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
      if (!isMod) return;
      const ed = editorRef.current;
      if (!ed) return;

      if (e.key.toLowerCase() === "b") { e.preventDefault(); document.execCommand("bold"); ed.focus(); }
      if (e.key.toLowerCase() === "i") { e.preventDefault(); document.execCommand("italic"); ed.focus(); }
      if (e.key.toLowerCase() === "k") {
        e.preventDefault();
        const url = prompt("Link URL:", "https://") || "";
        if (url) { document.execCommand("createLink", false, url); ed.focus(); }
      }
      if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        const html = sanitizeHtml(editorRef.current.innerHTML);
        setFormData((f) => ({ ...f, content: html }));
        document.getElementById("composer-form")?.requestSubmit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, setFormData, onClose]);

  const onEditorInput = () => {
    const html = sanitizeHtml(editorRef.current.innerHTML);
    setFormData({ ...form, content: html });
  };


  useEffect(() => {
    if (!isOpen) return;
    if (editorRef.current && form.content) {
      editorRef.current.innerHTML = form.content;
    } else if (editorRef.current && !form.content) {
      editorRef.current.innerHTML = "";
    }
  }, [isOpen]);

  const stats = useMemo(() => {
    const txt = editorRef.current?.innerText || "";
    const words = (txt.trim().match(/\S+/g) || []).length;
    const chars = txt.length;
    return { words, chars };
  }, [form.content]);

  const tags = useMemo(() => {
    const base = form.tags || "";
    const all = base.split(",").map((t) => t.trim()).filter(Boolean);
    return Array.from(new Set(all));
  }, [form.tags]);

  if (!isOpen) return null;


  const exec = (cmd, val) => { document.execCommand(cmd, false, val); editorRef.current?.focus(); };
  const applyHeading = (level) => exec("formatBlock", "H" + level);
  const applyBlockquote = () => exec("formatBlock", "BLOCKQUOTE");
  const applyUL = () => exec("insertUnorderedList");
  const applyOL = () => exec("insertOrderedList");
  const applyHR = () => exec("insertHorizontalRule");
  const applyLink = () => {
    const url = prompt("Link URL:", "https://") || "";
    if (url) exec("createLink", url);
  };
  const applyInlineCode = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return;
    const code = document.createElement("code");
    range.surroundContents(code);
    editorRef.current?.focus();
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div
        className="modal modal--flat"
        role="dialog"
        aria-modal="true"
        aria-labelledby="composer-title"
        onClick={(e) => e.stopPropagation()}
      >
        <form
          id="composer-form"
          onSubmit={(e) => {

            const html = sanitizeHtml(editorRef.current.innerHTML);
            setFormData({ ...form, content: html });
            onSubmit?.(e);
          }}
        >
          <div className="modal__header">
            <h3 id="composer-title" className="modal__title">NEW_POST.TXT</h3>
            <div className="modal__actions">
              <button className="btn btn--ghost" type="button" onClick={onClose}>Close</button>
              <button className="btn btn--primary" type="submit" title="Ctrl/⌘+S">Publish</button>
              <button
                className="btn btn--danger"
                type="button"
                onClick={() => { onClose(); setShowNotif?.(true); addToDrafts?.(form); }}
              >Discard</button>
            </div>
          </div>

          <div className="modal__body modal__body--stack">
            <div className="row">
              <div className="field">
                <label htmlFor="title-input">Title</label>
                <input
                  id="title-input"
                  className="input"
                  type="text"
                  value={form.title ?? ""}
                  onChange={(e) => setFormData({ ...form, title: e.target.value })}
                  placeholder="Give it a sharp title…"
                />
              </div>
            </div>

            <div className="row row--split">
              <div className="field">
                <label>Tags</label>
                <div className="tags-input">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="chip"
                      onClick={() => {
                        const filtered = tags.filter((x) => x !== t).join(", ");
                        setFormData({ ...form, tags: filtered });
                      }}
                      title="Click to remove"
                    >#{t}</span>
                  ))}
                  <input
                    className="input input--bare"
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (["Enter", ","].includes(e.key)) {
                        e.preventDefault();
                        const next = (form.tags ? form.tags + ", " : "") + tagsInput.trim();
                        setFormData({ ...form, tags: next });
                        setTagsInput("");
                      } else if (e.key === "Backspace" && !tagsInput && tags.length) {
                        const rest = tags.slice(0, -1).join(", ");
                        setFormData({ ...form, tags: rest });
                      }
                    }}
                    placeholder="add tag…"
                  />
                </div>
              </div>

              <div className="field">
                <label>Excerpt</label>
                <input
                  className="input"
                  type="text"
                  value={form.excerpt ?? ""}
                  onChange={(e) => setFormData({ ...form, excerpt: e.target.value })}
                  placeholder="One-liner summary…"
                />
              </div>
            </div>

            <div className="editor">
              <div className="toolbar" role="toolbar" aria-label="editor toolbar">
                <button type="button" className="tbtn" onClick={() => exec("bold")}>B</button>
                <button type="button" className="tbtn" onClick={() => exec("italic")}>I</button>
                <button type="button" className="tbtn" onClick={applyInlineCode}>``</button>
                <button type="button" className="tbtn" onClick={applyLink}>🔗</button>
                <span className="tsep" />
                <button type="button" className="tbtn" onClick={() => applyHeading(1)}>H1</button>
                <button type="button" className="tbtn" onClick={() => applyHeading(2)}>H2</button>
                <button type="button" className="tbtn" onClick={() => applyHeading(3)}>H3</button>
                <span className="tsep" />
                <button type="button" className="tbtn" onClick={applyBlockquote}>❝</button>
                <button type="button" className="tbtn" onClick={applyUL}>•</button>
                <button type="button" className="tbtn" onClick={applyOL}>1.</button>
                <span className="tsep" />
                <button type="button" className="tbtn" onClick={applyHR}>──</button>

                <div className="toolbar__spacer" />
                <div className="counter">{stats.words} words · {stats.chars} chars</div>
              </div>

              <div
                ref={editorRef}
                className="rte"
                contentEditable
                suppressContentEditableWarning
                data-placeholder="Write your log…"
                onInput={onEditorInput}
              />
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default ComposerModal;
