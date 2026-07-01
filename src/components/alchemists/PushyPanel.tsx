import React, { useEffect, useRef } from "react";
import data from "@/data/data.json";

const panel = data.pushyPanel;
const site = data.site;

const CATEGORY_LABEL: Record<string, string> = {
  "posts__item--category-1": "The Team",
  "posts__item--category-2": "Injuries",
  "posts__item--category-3": "Playoffs",
};

function isHidden(category: string | undefined, filter: string): boolean {
  if (filter === "all") return false;
  if (!category) return false;
  return category !== CATEGORY_LABEL[filter];
}

export function PushyPanel({ isOpen, onClose, featuredCategory }: { isOpen: boolean; onClose: () => void; featuredCategory: string }) {
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!panelRef.current) return;
    if (isOpen) {
      panelRef.current.focus();
    }
  }, [isOpen]);

  return (
      <aside ref={panelRef} tabIndex={-1} className={`pushy-panel${isOpen ? " pushy-panel--active" : ""}`} aria-label="Side panel">
        <div className="pushy-panel__inner">
          <header className="pushy-panel__header">
            <div className="pushy-panel__logo">
              <a href={site.url} onClick={(e) => e.preventDefault()}>
                <img src={panel.logo} alt={site.name} />
              </a>
            </div>
          </header>
          <div className="pushy-panel__content">
            <aside className="widget widget--side-panel">
              <div className="widget__content">
                <ul className="posts posts--simple-list posts--simple-list--lg">
                  {panel.posts.map((post, i) => (
                    <li key={i} className={`posts__item ${post.category === "The Team" ? "posts__item--category-1" : "posts__item--category-2"}`} style={{ display: isHidden(post.category, featuredCategory) ? "none" : undefined }}>
                      <div className="posts__inner">
                        <div className="posts__cat">
                          <span className="label posts__cat-label">
                            {post.category}
                          </span>
                        </div>
                        <h6 className="posts__title">
                          <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                            {post.title}
                          </a>
                        </h6>
                        <time className="posts__date">
                          {post.date}
                        </time>
                        <div className="posts__excerpt">
                          {post.excerpt}
                        </div>
                      </div>
                      <footer className="posts__footer card__footer">
                        <div className="post-author">
                          <figure className="post-author__avatar">
                            <img src={post.author.avatar} alt="Post Author Avatar" />
                          </figure>
                          <div className="post-author__info">
                            <h4 className="post-author__name">
                              {post.author.name}
                            </h4>
                          </div>
                        </div>
                        <ul className="post__meta meta">
                          <li className="meta__item meta__item--likes">
                            <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                              <i className="meta-like meta-like--active icon-heart"></i>
                              {" "}
                              {post.likes}
                            </a>
                          </li>
                          <li className="meta__item meta__item--comments">
                            <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                              {post.comments}
                            </a>
                          </li>
                        </ul>
                      </footer>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
            <aside className="widget widget--side-panel widget-tagcloud">
              <div className="widget__title">
                <h4>
                  {panel.tagCloud.title}
                </h4>
              </div>
              <div className="widget__content">
                <div className="tagcloud">
                  {panel.tagCloud.tags.map((tag, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <span>{" "}</span>}
                      <a href="/alchemists/index.html#" className="btn btn-primary btn-xs btn-outline btn-sm" onClick={(e) => e.preventDefault()}>
                        {tag}
                      </a>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </aside>
            <aside className="widget widget--side-panel widget-banner">
              <div className="widget__content">
                <figure className="widget-banner__img">
                  <a href={panel.banner.url} onClick={(e) => e.preventDefault()}>
                    <img src={panel.banner.image} alt="Banner" />
                  </a>
                </figure>
              </div>
            </aside>
          </div>
          <a href="#" className="pushy-panel__back-btn" onClick={(e) => { e.preventDefault(); onClose(); }}></a>
        </div>
      </aside>
  );
}
