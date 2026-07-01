import React from "react";
import data from "@/data/data.json";

const ft = data.footer;

export function Footer() {
  return (
      <footer id="footer" className="footer">
        <div className="footer-widgets">
          <div className="footer-widgets__inner">
            <div className="container">
              <div className="row">
                <div className="col-sm-12 col-lg-3">
                  <div className="footer-col-inner">
                    <div className="footer-logo">
                      <a href={data.site.url} onClick={(e) => e.preventDefault()}>
                        <img src={ft.logo.src} alt={ft.logo.alt} className="footer-logo__img fl-img" />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="col-sm-4 col-lg-3">
                  <div className="footer-col-inner">
                    <div className="widget widget--footer widget-contact-info">
                      <h4 className="widget__title">
                        {ft.contactInfo.title}
                      </h4>
                      <div className="widget__content">
                        <div className="widget-contact-info__desc">
                          <p>
                            {ft.contactInfo.description}
                          </p>
                        </div>
                        <div className="widget-contact-info__body info-block">
                          {ft.contactInfo.items.map((item, i) => (
                            <div key={i} className="info-block__item">
                              <svg role="img" className={`df-icon df-icon--${item.icon}`}>
                                <use xlinkHref={`/alchemists/assets/images/icons-basket.svg#${item.icon}`} />
                              </svg>
                              <h6 className="info-block__heading">
                                {item.heading}
                              </h6>
                              <a className="info-block__link" href={item.linkHref} onClick={(e) => e.preventDefault()}>
                                {item.linkText}
                              </a>
                            </div>
                          ))}
                          <div className="info-block__item info-block__item--nopadding">
                            <ul className="social-links">
                              {ft.contactInfo.social.map((s, i) => (
                                <li key={i} className="social-links__item">
                                  <a href={s.url} className="social-links__link" onClick={(e) => e.preventDefault()}>
                                    <i className={s.icon}></i>
                                    {" "}
                                    {s.platform}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-4 col-lg-3">
                  <div className="footer-col-inner">
                    <div className="widget widget--footer widget-popular-posts">
                      <h4 className="widget__title">
                        {ft.popularNews.title}
                      </h4>
                      <div className="widget__content">
                        <ul className="posts posts--simple-list">
                          {ft.popularNews.items.map((item, i) => (
                            <li key={i} className={`posts__item posts__item--category-${item.category === "Injuries" ? 2 : 1}`}>
                              <div className="posts__cat">
                                <span className="label posts__cat-label">
                                  {item.category}
                                </span>
                              </div>
                              <h6 className="posts__title posts__title--color-hover">
                                <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                                  {item.title}
                                </a>
                              </h6>
                              <time className="posts__date">
                                {item.date}
                              </time>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-4 col-lg-3">
                  <div className="footer-col-inner">
                    <div className="widget widget--footer widget-instagram">
                      <h4 className="widget__title">
                        {ft.gallery.title}
                      </h4>
                      <div className="widget__content">
                        <ul id="instagram-feed" className="widget-instagram__list">
                          {ft.gallery.images.map((img, i) => (
                            <li key={i} className="widget-instagram__item">
                              <a href="/alchemists/index.html#" className="widget-instagram__link-wrapper" target="_blank" onClick={(e) => e.preventDefault()}>
                                <span className="widget-instagram__plus-sign">
                                  <img src={img} className="widget-instagram__img ig-thumb" alt="" />
                                </span>
                              </a>
                            </li>
                          ))}
                        </ul>
                        <a href={ft.gallery.button.url} className="btn btn-sm btn-instagram btn-icon-right" onClick={(e) => e.preventDefault()}>
                          {ft.gallery.button.text}
                          {" "}
                          <i className="icon-arrow-right"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-secondary footer-secondary--has-decor">
          <div className="container">
            <div className="footer-secondary__inner">
              <div className="row">
                <div className="col-md-10 offset-md-1">
                  <ul className="footer-nav">
                    <li className="footer-nav__item">
                      <a href="/alchemists/index.html" onClick={(e) => e.preventDefault()}>
                        Home
                      </a>
                    </li>
                    <li className="footer-nav__item">
                      <a href="/alchemists/player-overview.html" onClick={(e) => e.preventDefault()}>
                        Player
                      </a>
                    </li>
                    <li className="footer-nav__item">
                      <a href="/alchemists/blog-1.html" onClick={(e) => e.preventDefault()}>
                        News
                      </a>
                    </li>
                    <li className="footer-nav__item">
                      <a href="/privacy">
                        Privacy
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
  );
}
