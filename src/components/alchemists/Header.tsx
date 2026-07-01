import React from "react";
import data from "@/data/data.json";

export function Header({ onTogglePushyPanel }: { onTogglePushyPanel?: () => void }) {
  return (
      <header className="header header--layout-1">
        <div className="header__top-bar clearfix">
          <div className="container">
            <div className="header__top-bar-inner">
              <ul className="nav-account">

                <li className="nav-account__item has-children">
                  <span className="main-nav__toggle"></span>
                  <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                    Language:
                    {" "}
                    <span className="highlight">
                      {data.header.topBar.language.selected}
                    </span>
                  </a>
                  <ul className="main-nav__sub">
                    {data.header.topBar.language.options.map((lang, i) => (
                      <li key={i}>
                        <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                          {lang}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>

              </ul>
            </div>
          </div>
        </div>
        <div className="header__secondary">
          <div className="container">
            <div className="header-search-form">
              <form action={data.site.url} id="mobile-search-form" className="search-form">
                <input type="text" className="form-control header-mobile__search-control" value="" placeholder={data.header.searchPlaceholder} />
                {" "}
                <button type="submit" className="header-mobile__search-submit">
                  <i className="fas fa-search"></i>
                </button>
              </form>
            </div>
            <ul className="info-block info-block--header">
              {data.header.infoBlocks.filter(b => b.id === "contact-secondary").map((block, i) => (
                <li key={i} className="info-block__item info-block__item--contact-secondary">
                  <svg role="img" className="df-icon df-icon--basketball">
                    <use xlinkHref="/alchemists/assets/images/icons-basket.svg#basketball" />
                  </svg>
                  <h6 className="info-block__heading">
                    {block.heading}
                  </h6>
                  <a className="info-block__link" href={block.linkHref} onClick={(e) => e.preventDefault()}>
                    {block.linkText}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="header__primary">
          <div className="container">
            <div className="header__primary-inner">
              <div className="header-logo">
                <a href="/alchemists/index.html" onClick={(e) => e.preventDefault()}>
                  <img src="/alchemists/assets/images/logo.png" alt="Alchemists" className="header-logo__img hl-img" />
                </a>
              </div>
              <nav className="main-nav clearfix">
                <ul className="main-nav__list">
                  <div className="header-mobile__logo">
                    <span className="main-nav__back"></span>
                    <a href="/alchemists/index.html" onClick={(e) => e.preventDefault()}>
                      <img src="/alchemists/assets/images/logo.png" alt="Alchemists" className="header-mobile__logo-img hl-img" />
                    </a>
                  </div>
                  <li className="active">
                    <a href="/alchemists/index.html" onClick={(e) => e.preventDefault()}>
                      Home
                    </a>
                  </li>

                  <li className="has-children">
                    <span className="main-nav__toggle"></span>
                    <a href="/alchemists/player-overview.html" onClick={(e) => e.preventDefault()}>
                      Player
                    </a>
                    <ul className="main-nav__sub">
                      <li>
                        <a href="/alchemists/player-overview.html" onClick={(e) => e.preventDefault()}>
                          Overview
                        </a>
                      </li>
                      <li>
                        <a href="/alchemists/player-stats.html" onClick={(e) => e.preventDefault()}>
                          Full Statistics
                        </a>
                      </li>
                      <li>
                        <a href="/alchemists/player-bio.html" onClick={(e) => e.preventDefault()}>
                          Biography
                        </a>
                      </li>
                      <li>
                        <a href="/alchemists/player-news.html" onClick={(e) => e.preventDefault()}>
                          Related News
                        </a>
                      </li>
                      <li>
                        <a href="/alchemists/player-gallery.html" onClick={(e) => e.preventDefault()}>
                          Gallery
                        </a>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <a href="/alchemists/blog-1.html" onClick={(e) => e.preventDefault()}>
                      News
                    </a>
                  </li>

                  <li className="main-nav__item--shopping-cart">
                    <a href="/alchemists/index.html#" className="info-block__link-wrapper" onClick={(e) => e.preventDefault()}>
                      <div className="df-icon-stack df-icon-stack--bag">
                        <svg role="img" className="df-icon df-icon--bag">
                          <use xlinkHref="/alchemists/assets/images/icons-basket.svg#bag" />
                        </svg>
                        {" "}
                        <svg role="img" className="df-icon df-icon--bag-handle">
                          <use xlinkHref="/alchemists/assets/images/icons-basket.svg#bag-handle" />
                        </svg>
                      </div>
                      <h6 className="info-block__heading">
                        Your Bag (8 items)
                      </h6>
                      <span className="info-block__cart-sum">
                        $256,30
                      </span>
                    </a>
                  </li>
                  <li className="nav-account__item">
                    <a href="/alchemists/index.html#" data-toggle="modal" data-target="#modal-login-register" onClick={(e) => e.preventDefault()}>
                      Your Account
                    </a>
                  </li>
                  <li className="nav-account__item nav-account__item--wishlist">
                    <a href="/alchemists/shop-wishlist.html" onClick={(e) => e.preventDefault()}>
                      Wishlist
                      {" "}
                      <span className="highlight">
                        8
                      </span>
                    </a>
                  </li>
                  <li className="nav-account__item has-children">
                    <span className="main-nav__toggle"></span>
                    <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                      Currency:
                      {" "}
                      <span className="highlight">
                        USD
                      </span>
                    </a>
                    <ul className="main-nav__sub">
                      <li>
                        <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                          USD
                        </a>
                      </li>
                      <li>
                        <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                          EUR
                        </a>
                      </li>
                      <li>
                        <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                          GBP
                        </a>
                      </li>
                    </ul>
                  </li>
                  <li className="nav-account__item has-children">
                    <span className="main-nav__toggle"></span>
                    <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                      Language:
                      {" "}
                      <span className="highlight">
                        EN
                      </span>
                    </a>
                    <ul className="main-nav__sub">
                      <li>
                        <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                          English
                        </a>
                      </li>
                      <li>
                        <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                          Spanish
                        </a>
                      </li>
                      <li>
                        <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                          French
                        </a>
                      </li>
                      <li>
                        <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                          German
                        </a>
                      </li>
                    </ul>
                  </li>
                  <li className="nav-account__item nav-account__item--logout">
                    <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                      Logout
                    </a>
                  </li>
                  <li className="info-block__item info-block__item--contact-primary">
                    <svg role="img" className="df-icon df-icon--jersey">
                      <use xlinkHref="/alchemists/assets/images/icons-basket.svg#jersey" />
                    </svg>
                    <h6 className="info-block__heading">
                      Join Our Team!
                    </h6>
                    <a className="info-block__link" href="mailto:tryouts@alchemists.com" onClick={(e) => e.preventDefault()}>
                      tryouts@alchemists.com
                    </a>
                  </li>
                  <li className="info-block__item info-block__item--contact-secondary">
                    <svg role="img" className="df-icon df-icon--basketball">
                      <use xlinkHref="/alchemists/assets/images/icons-basket.svg#basketball" />
                    </svg>
                    <h6 className="info-block__heading">
                      Contact Us
                    </h6>
                    <a className="info-block__link" href="mailto:info@alchemists.com" onClick={(e) => e.preventDefault()}>
                      info@alchemists.com
                    </a>
                  </li>
                  <li className="main-nav__item--social-links">
                    <a href="/alchemists/index.html#" className="social-links__link" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Facebook" onClick={(e) => e.preventDefault()}>
                      <i className="fab fa-facebook"></i>
                    </a>
                    <a href="/alchemists/index.html#" className="social-links__link" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Twitter" onClick={(e) => e.preventDefault()}>
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a href="/alchemists/index.html#" className="social-links__link" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Instagram" onClick={(e) => e.preventDefault()}>
                      <i className="fab fa-instagram"></i>
                    </a>
                  </li>
                </ul>
                <ul className="social-links social-links--inline social-links--main-nav">
                  <li className="social-links__item">
                    <a href="/alchemists/index.html#" className="social-links__link" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Facebook" onClick={(e) => e.preventDefault()}>
                      <i className="fab fa-facebook"></i>
                    </a>
                  </li>
                  <li className="social-links__item">
                    <a href="/alchemists/index.html#" className="social-links__link" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Twitter" onClick={(e) => e.preventDefault()}>
                      <i className="fab fa-twitter"></i>
                    </a>
                  </li>
                  <li className="social-links__item">
                    <a href="/alchemists/index.html#" className="social-links__link" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="Instagram" onClick={(e) => e.preventDefault()}>
                      <i className="fab fa-instagram"></i>
                    </a>
                  </li>
                </ul>
                <a href="#" className="pushy-panel__toggle" aria-label="Toggle navigation panel" onClick={(e) => { e.preventDefault(); onTogglePushyPanel?.(); }}>
                  <span className="pushy-panel__line"></span>
                </a>
              </nav>
            </div>
          </div>
        </div>
      </header>
  );
}
