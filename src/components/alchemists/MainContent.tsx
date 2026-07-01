import React, { useState } from "react";
import { FeaturedSlider } from "./FeaturedSlider";
import data from "@/data/data.json";

const mc = data.mainContent;

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

export function MainContent({ featuredCategory, onCategoryChange }: { featuredCategory: string; onCategoryChange: (slug: string) => void }) {
  const [activeTab, setActiveTab] = useState(0);
  return (
      <div className="site-content" id="main-content">
        <div className="container">
          <div className="row">
            <div className="content col-lg-8">
              <div className="card card--clean">
                <header className="card__header card__header--has-filter">
                  <h4>
                    {mc.featuredNews.title}
                  </h4>
                  <ul className="category-filter category-filter--featured">
                    {mc.featuredNews.categories.map((cat, i) => (
                      <li key={i} className="category-filter__item">
                        <a
                          href="#"
                          className={`category-filter__link${cat.slug === featuredCategory ? " category-filter__link--active" : ""}${cat.slug === "all" ? " category-filter__link--reset" : ""}`}
                          onClick={(e) => { e.preventDefault(); onCategoryChange(cat.slug); }}
                        >
                          {cat.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </header>
                <div className="card__content">
                  <FeaturedSlider featuredCategory={featuredCategory} />
                </div>
              </div>
              <div className="posts posts--cards post-grid row">
                {mc.postCards.row1.map((post, i) => (
                  <div key={i} className="post-grid__item col-sm-6" style={{ display: isHidden(post.category, featuredCategory) ? "none" : undefined }}>
                    <div className="posts__item posts__item--card posts__item--category-1 card">
                      <figure className="posts__thumb">
                        <div className="posts__cat">
                          <span className="label posts__cat-label">
                            {post.category}
                          </span>
                        </div>
                        <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                          <img src={post.image} alt="" className="pc-thumb" />
                        </a>
                      </figure>
                      <div className="posts__inner card__content">
                        <a href="/alchemists/index.html#" className="posts__cta" onClick={(e) => e.preventDefault()}></a>
                        {" "}
                        <time dateTime={post.dateTime} className="posts__date">
                          {post.date}
                        </time>
                        <h6 className="posts__title">
                          <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                            {post.title}
                          </a>
                        </h6>
                        <div className="posts__excerpt">
                          {post.excerpt}
                        </div>
                      </div>
                      <footer className="posts__footer card__footer">
                        <div className="post-author">
                          <figure className="post-author__avatar">
                            <img src={post.author.avatar} alt="Post Author Avatar" className="av-thumb" />
                          </figure>
                          <div className="post-author__info">
                            <h4 className="post-author__name">
                              {post.author.name}
                            </h4>
                          </div>
                        </div>
                        <ul className="post__meta meta">
                          <li className="meta__item meta__item--views">
                            {post.views}
                          </li>
                          <li className="meta__item meta__item--likes">
                            <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                              <i className="meta-like icon-heart"></i>
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
                    </div>
                  </div>
                ))}
              </div>
              <div className="posts posts--cards post-grid row">
                <div className="col-sm-6">
                    <div className="posts posts--cards post-grid">
                    <div className="post-grid__item" style={{ display: isHidden(mc.postCards.row2.card.category, featuredCategory) ? "none" : undefined }}>
                      <div className="posts__item posts__item--card posts__item--category-1 card">
                        <figure className="posts__thumb">
                          <div className="posts__cat">
                            <span className="label posts__cat-label">
                              {mc.postCards.row2.card.category}
                            </span>
                          </div>
                          <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                            <img src={mc.postCards.row2.card.image} alt="" className="pc-thumb" />
                          </a>
                        </figure>
                        <div className="posts__inner card__content">
                          <a href="/alchemists/index.html#" className="posts__cta" onClick={(e) => e.preventDefault()}></a>
                          {" "}
                          <time dateTime={mc.postCards.row2.card.dateTime} className="posts__date">
                            {mc.postCards.row2.card.date}
                          </time>
                          <h6 className="posts__title">
                            <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                              {mc.postCards.row2.card.title}
                            </a>
                          </h6>
                          <div className="posts__excerpt">
                            {mc.postCards.row2.card.excerpt}
                          </div>
                        </div>
                        <footer className="posts__footer card__footer">
                          <div className="post-author">
                            <figure className="post-author__avatar">
                              <img src={mc.postCards.row2.card.author.avatar} alt="Post Author Avatar" className="av-thumb" />
                            </figure>
                            <div className="post-author__info">
                              <h4 className="post-author__name">
                                {mc.postCards.row2.card.author.name}
                              </h4>
                            </div>
                          </div>
                          <ul className="post__meta meta">
                            <li className="meta__item meta__item--views">
                              {mc.postCards.row2.card.views}
                            </li>
                            <li className="meta__item meta__item--likes">
                              <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                                <i className="meta-like icon-heart"></i>
                                {" "}
                                {mc.postCards.row2.card.likes}
                              </a>
                            </li>
                            <li className="meta__item meta__item--comments">
                              <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                                {mc.postCards.row2.card.comments}
                              </a>
                            </li>
                          </ul>
                        </footer>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="card">
                    <div className="card__content">
                      <ul className="posts posts--simple-list posts--simple-list--lg">
                        {mc.postCards.row2.simpleList.map((item, i) => (
                          <li key={i} className={`posts__item posts__item--category-${item.category === "Playoffs" ? 3 : 1}`} style={{ display: isHidden(item.category, featuredCategory) ? "none" : undefined }}>
                            <div className="posts__inner">
                              <div className="posts__cat">
                                <span className="label posts__cat-label">
                                  {item.category}
                                </span>
                              </div>
                              <h6 className="posts__title">
                                <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                                  {item.title}
                                </a>
                              </h6>
                              <time dateTime={item.dateTime} className="posts__date">
                                {item.date}
                              </time>
                              <div className="posts__excerpt">
                                {item.excerpt}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="main-news-banner main-news-banner--img-left" style={{ display: isHidden(mc.postCards.mainBanner.category, featuredCategory) ? "none" : undefined }}>
                <figure className="main-news-banner__img">
                  <img src={mc.postCards.mainBanner.image} alt="" className="mnb-thumb" />
                </figure>
                <div className="main-news-banner__inner">
                  <div className="posts posts--simple-list posts--simple-list--xlg">
                    <div className="posts__item posts__item--category-1">
                      <div className="posts__inner">
                        <div className="posts__cat">
                          <span className="label posts__cat-label">
                            {mc.postCards.mainBanner.category}
                          </span>
                        </div>
                        <h6 className="posts__title">
                          <a href={mc.postCards.mainBanner.button.url} onClick={(e) => e.preventDefault()}>
                            {mc.postCards.mainBanner.title}
                            {" "}
                            <span className="text-primary">
                              {mc.postCards.mainBanner.titleHighlight}
                            </span>
                            {" "}
                            {mc.postCards.mainBanner.titleEnd}
                          </a>
                        </h6>
                        <time dateTime={mc.postCards.mainBanner.dateTime} className="posts__date">
                          {mc.postCards.mainBanner.date}
                        </time>
                        <div className="posts__excerpt">
                          {mc.postCards.mainBanner.excerpt}
                        </div>
                        <div className="posts__more">
                          <a href={mc.postCards.mainBanner.button.url} className="btn btn-inverse btn-sm btn-outline btn-icon-right btn-condensed" onClick={(e) => e.preventDefault()}>
                            {mc.postCards.mainBanner.button.text}
                            {" "}
                            <i className="fas fa-plus text-primary"></i>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="posts posts--cards post-grid row">
                {mc.postCards.row3.map((post, i) => (
                  <div key={i} className="post-grid__item col-sm-6" style={{ display: isHidden(post.category, featuredCategory) ? "none" : undefined }}>
                    <div className={`posts__item posts__item--card posts__item--category-${post.category === "Injuries" ? 2 : 1} card`}>
                      <figure className="posts__thumb">
                        <div className="posts__cat">
                          <span className="label posts__cat-label">
                            {post.category}
                          </span>
                        </div>
                        <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                          <img src={post.image} alt="" className="pc-thumb" />
                        </a>
                      </figure>
                      <div className="posts__inner card__content">
                        <a href="/alchemists/index.html#" className="posts__cta" onClick={(e) => e.preventDefault()}></a>
                        {" "}
                        <time dateTime={post.dateTime} className="posts__date">
                          {post.date}
                        </time>
                        <h6 className="posts__title">
                          <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                            {post.title}
                          </a>
                        </h6>
                      </div>
                      <footer className="posts__footer card__footer">
                        <div className="post-author">
                          <figure className="post-author__avatar">
                            <img src={post.author.avatar} alt="Post Author Avatar" className="av-thumb" />
                          </figure>
                          <div className="post-author__info">
                            <h4 className="post-author__name">
                              {post.author.name}
                            </h4>
                          </div>
                        </div>
                        <ul className="post__meta meta">
                          <li className="meta__item meta__item--views">
                            {post.views}
                          </li>
                          <li className="meta__item meta__item--likes">
                            <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                              <i className="meta-like icon-heart"></i>
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
                    </div>
                  </div>
                ))}
              </div>
              <div className="card card--clean">
                <header className="card__header card__header--has-btn">
                  <h4>
                    {mc.latestNews.title}
                  </h4>
                  <a href={mc.latestNews.seeAllUrl} className="btn btn-default btn-outline btn-xs card-header__button" onClick={(e) => e.preventDefault()}>
                    See All Posts
                  </a>
                </header>
                <div className="card__content">
                  <div className="posts posts--cards posts--cards-thumb-left post-list">
                    {mc.latestNews.items.map((item, i) => (
                      <div key={i} className="post-list__item" style={{ display: isHidden(item.category, featuredCategory) ? "none" : undefined }}>
                        <div className="posts__item posts__item--card posts__item--category-1 card card--block">
                          <figure className="posts__thumb">
                            <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                              <img src={item.image} alt="" className="ln-thumb" />
                            </a>
                            <a href="/alchemists/index.html#" className="posts__cta" onClick={(e) => e.preventDefault()}></a>
                          </figure>
                          <div className="posts__inner">
                            <div className="card__content">
                              <div className="posts__cat">
                                <span className="label posts__cat-label">
                                  {item.category}
                                </span>
                              </div>
                              <h6 className="posts__title">
                                <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                                  {item.title}
                                </a>
                              </h6>
                              <time dateTime={item.dateTime} className="posts__date">
                                {item.date}
                              </time>
                              <div className="posts__excerpt">
                                {item.excerpt}
                              </div>
                            </div>
                            <footer className="posts__footer card__footer">
                              <div className="post-author">
                                <figure className="post-author__avatar">
                                  <img src={item.author.avatar} alt="Post Author Avatar" className="av-thumb" />
                                </figure>
                                <div className="post-author__info">
                                  <h4 className="post-author__name">
                                    {item.author.name}
                                  </h4>
                                </div>
                              </div>
                              <ul className="post__meta meta">
                                <li className="meta__item meta__item--views">
                                  {item.views}
                                </li>
                                <li className="meta__item meta__item--likes">
                                  <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                                    <i className="meta-like icon-heart"></i>
                                    {" "}
                                    {item.likes}
                                  </a>
                                </li>
                                <li className="meta__item meta__item--comments">
                                  <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                                    {item.comments}
                                  </a>
                                </li>
                              </ul>
                            </footer>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div id="sidebar" className="sidebar col-lg-4">
              <aside className="widget card widget--sidebar widget-standings">
                <div className="widget__title card__header card__header--has-btn">
                  <h4>
                    {mc.standings.title}
                  </h4>
                  <a href={mc.standings.seeAllUrl} className="btn btn-default btn-outline btn-xs card-header__button" onClick={(e) => e.preventDefault()}>
                    Full Stats
                  </a>
                </div>
                <div className="widget__content card__content">
                  <div className="table-responsive">
                    <table className="table table-hover table-standings">
                      <thead>
                        <tr>
                          {mc.standings.headers.map((h, i) => (
                            <th key={i}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {mc.standings.seasons.map((s, i) => (
                          <tr key={i}>
                            <td>
                              <div className="team-meta">
                                <div className="team-meta__info">
                                  <h6 className="team-meta__name">
                                    {s.label}
                                  </h6>
                                  <span className="team-meta__place">
                                    {s.team}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>{s.ppg}</td>
                            <td>{s.apg}</td>
                            <td>{s.rpg}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </aside>
              <aside className="widget widget--sidebar widget-social">
                {mc.socialWidget.map((s, i) => (
                  <a key={i} href={s.url} className={`btn-social-counter ${s.counterClass}`} target="_blank" onClick={(e) => e.preventDefault()}>
                    <div className="btn-social-counter__icon">
                      <i className={s.icon}></i>
                    </div>
                    <h6 className="btn-social-counter__title">
                      {s.title}
                    </h6>
                    <span className="btn-social-counter__count">
                      <span className="btn-social-counter__count-num">{s.count}</span>
                      {" "}
                      {s.countLabel}
                    </span>
                    {" "}
                    <span className="btn-social-counter__add-icon"></span>
                  </a>
                ))}
              </aside>
              <aside className="widget widget--sidebar card widget-popular-posts">
                <div className="widget__title card__header">
                  <h4>
                    {mc.popularNews.title}
                  </h4>
                </div>
                <div className="widget__content card__content">
                  <ul className="posts posts--simple-list">
                    {mc.popularNews.items.map((item, i) => (
                      <li key={i} className={`posts__item posts__item--category-${item.category === "Injuries" ? 2 : 1}`} style={{ display: isHidden(item.category, featuredCategory) ? "none" : undefined }}>
                        <figure className="posts__thumb">
                          <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                            <img src={item.image} alt="" className="pn-thumb" />
                          </a>
                        </figure>
                        <div className="posts__inner">
                          <div className="posts__cat">
                            <span className="label posts__cat-label">
                              {item.category}
                            </span>
                          </div>
                          <h6 className="posts__title">
                            <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                              {item.title}
                            </a>
                          </h6>
                          <time dateTime={item.dateTime} className="posts__date">
                            {item.date}
                          </time>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
              <aside className="widget card widget--sidebar widget-player">
                <div className="widget__content card__content">
                  <div className="widget-player__team-logo">
                    <img src={mc.featuredPlayer.teamLogo} alt="" className="fp-logo" />
                  </div>
                  <figure className="widget-player__photo">
                    <img src={mc.featuredPlayer.photo} alt="" className="fp-photo" />
                  </figure>
                  <header className="widget-player__header clearfix">
                    <div className="widget-player__number">
                       {mc.featuredPlayer.number}
                     </div>
                     <h4 className="widget-player__name">
                       <span className="widget-player__first-name">
                         {mc.featuredPlayer.firstName}
                       </span>
                       {" "}
                       <span className="widget-player__last-name">
                         {mc.featuredPlayer.lastName}
                       </span>
                    </h4>
                  </header>
                  <div className="widget-player__content">
                    <div className="widget-player__content-inner">
                      {mc.featuredPlayer.stats.map((stat, i) => (
                        <div key={i} className={`widget-player__stat widget-player__${stat.label.toLowerCase()}`}>
                          <h6 className="widget-player__stat-label">
                            {stat.label}
                          </h6>
                          <div className="widget-player__stat-number">
                            {stat.value}
                          </div>
                          <div className="widget-player__stat-legend">
                            {stat.unit}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <footer className="widget-player__footer">
                    <span className="widget-player__footer-txt">
                      <i className="fas fa-star"></i>
                      {" "}
                      {mc.featuredPlayer.footerLabel}
                    </span>
                  </footer>
                </div>
              </aside>
              <aside className="widget card widget--sidebar widget-game-result">
                <div className="widget__title card__header card__header--has-btn">
                  <h4>
                    {mc.lastGameResult.title}
                  </h4>
                  <button className="btn btn-default btn-outline btn-xs card-header__button js-switch-toggle">
                    <span className="js-switch-txt" data-text-expand="Expand Stats" data-text-shrink="Shrink Stats">
                      Expand Stats
                    </span>
                  </button>
                </div>
                <div className="widget__content card__content">
                  <div className="widget-game-result__section">
                    <div className="widget-game-result__section-inner">
                      <header className="widget-game-result__header">
                        <h3 className="widget-game-result__title">
                          {mc.lastGameResult.match.title}
                        </h3>
                        <time className="widget-game-result__date" dateTime={mc.lastGameResult.match.dateTime}>
                          {mc.lastGameResult.match.date}
                        </time>
                      </header>
                      <div className="widget-game-result__main">
                        <div className="widget-game-result__team widget-game-result__team--first">
                          <figure className="widget-game-result__team-logo">
                            <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                              <img src={mc.lastGameResult.match.team1.logo} alt="" className="gr-alchemists" />
                            </a>
                          </figure>
                          <div className="widget-game-result__team-info">
                            <h5 className="widget-game-result__team-name">
                              {mc.lastGameResult.match.team1.name}
                            </h5>
                            <div className="widget-game-result__team-desc">
                              {mc.lastGameResult.match.team1.desc}
                            </div>
                          </div>
                        </div>
                        <div className="widget-game-result__score-wrap">
                          <div className="widget-game-result__score">
                            <span className="widget-game-result__score-result widget-game-result__score-result--winner">
                              {mc.lastGameResult.match.scoreWinner}
                            </span>
                            {" "}
                            <span className="widget-game-result__score-dash">
                              -
                            </span>
                            {" "}
                            <span className="widget-game-result__score-result widget-game-result__score-result--loser">
                              {mc.lastGameResult.match.scoreLoser}
                            </span>
                          </div>
                          <div className="widget-game-result__score-label">
                            {mc.lastGameResult.match.scoreLabel}
                          </div>
                        </div>
                        <div className="widget-game-result__team widget-game-result__team--second">
                          <figure className="widget-game-result__team-logo">
                            <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                              <img src={mc.lastGameResult.match.team2.logo} alt="" className="gr-sharks" />
                            </a>
                          </figure>
                          <div className="widget-game-result__team-info">
                            <h5 className="widget-game-result__team-name">
                              {mc.lastGameResult.match.team2.name}
                            </h5>
                            <div className="widget-game-result__team-desc">
                              {mc.lastGameResult.match.team2.desc}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="widget-game-result__section">
                    <div className="widget-game-result__table-stats">
                      <div className="table-responsive">
                        <table className="table table__cell-center table-thead-color">
                          <thead>
                            <tr>
                              {mc.lastGameResult.match.quarters.header.map((h, i) => (
                                <th key={i}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <th>{mc.lastGameResult.match.team1.name}</th>
                              {mc.lastGameResult.match.quarters.team1Quarters.map((q, i) => (
                                <td key={i}>{q}</td>
                              ))}
                              <td>{mc.lastGameResult.match.quarters.team1Total}</td>
                            </tr>
                            <tr>
                              <th>{mc.lastGameResult.match.team2.name}</th>
                              {mc.lastGameResult.match.quarters.team2Quarters.map((q, i) => (
                                <td key={i}>{q}</td>
                              ))}
                              <td>{mc.lastGameResult.match.quarters.team2Total}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div className="widget-game-result__section">
                    <header className="widget-game-result__subheader card__subheader card__subheader--sm card__subheader--nomargins">
                      <h5 className="widget-game-result__subtitle">
                        Game Statistics
                      </h5>
                    </header>
                    <div className="widget-game-result__section-inner">
                      {mc.lastGameResult.match.stats.map((stat, i) => (
                        <div key={i} className="progress-double-wrapper">
                          <h6 className="progress-title">
                            {stat.label}
                          </h6>
                          <div className="progress-inner-holder">
                            <div className="progress__digit progress__digit--left">
                              {stat.team1Value}
                            </div>
                            <div className="progress__double">
                              <div className="progress">
                                <div className={`progress__bar ${stat.team1Bar}`} role="progressbar" aria-valuenow={stat.team1Bar.split("-")[2]} aria-valuemin="0" aria-valuemax="100"></div>
                              </div>
                              <div className="progress">
                                <div className={`progress__bar progress__bar--info ${stat.team2Bar}`} role="progressbar" aria-valuenow={stat.team2Bar.split("-")[2]} aria-valuemin="0" aria-valuemax="100"></div>
                              </div>
                            </div>
                            <div className="progress__digit progress__digit--right progress__digit--highlight">
                              {stat.team2Value}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="widget-game-result__extra-stats">
                    <div className="widget-game-result__section">
                      <header className="widget-game-result__subheader card__subheader card__subheader--sm card__subheader--nomargins">
                        <h5 className="widget-game-result__subtitle">
                          Game MVP
                        </h5>
                      </header>
                      <div className="widget-game-result__section-inner">
                        <div className="player-details">
                          <div className="player-details__info">
                            <figure className="player-details__photo">
                              <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                                <img src={mc.lastGameResult.match.mvp.photo} alt="" className="mvp-photo" />
                              </a>
                            </figure>
                            <div className="player-details__info-holder">
                              <h5 className="player-details__name">
                                <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                                  {mc.lastGameResult.match.mvp.name}
                                </a>
                              </h5>
                              <span className="player-details__position">
                                {mc.lastGameResult.match.mvp.position}
                              </span>
                            </div>
                          </div>
                          <div className="player-details__stats">
                            {mc.lastGameResult.match.mvp.stats.map((mstat, i) => (
                              <div key={i} className="player-details__circular circular">
                                <div className="circular__bar" data-percent={mstat.percent}>
                                  <span className="circular__percents">
                                    {mstat.value}
                                    <small>
                                      {mstat.unit}
                                    </small>
                                  </span>
                                  <canvas height="90" width="90"></canvas>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
              <aside className="widget widget--sidebar card widget-tabbed">
                <div className="widget__title card__header">
                  <h4>
                    {mc.trendingNews.title}
                  </h4>
                </div>
                <div className="widget__content card__content">
                  <div className="widget-tabbed__tabs">
                    <ul className="nav nav-tabs nav-justified widget-tabbed__nav" role="tablist">
                      {mc.trendingNews.tabs.map((tab, i) => (
                        <li key={i} className="nav-item">
                          <a
                            href="#"
                            className={`nav-link${activeTab === i ? " active" : ""}`}
                            aria-controls={tab.id}
                            role="tab"
                            onClick={(e) => { e.preventDefault(); setActiveTab(i); }}
                          >
                            {tab.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                    <div className="tab-content widget-tabbed__tab-content">
                      {mc.trendingNews.tabs.map((tab, i) => (
                        <div
                          key={i}
                          role="tabpanel"
                          className={`tab-pane fade${activeTab === i ? " show active" : ""}`}
                          id={tab.id}
                        >
                          <ul className="posts posts--simple-list">
                            {tab.items.map((item, j) => (
                              <li key={j} className={`posts__item posts__item--category-${item.category === "Playoffs" ? 3 : 1}`} style={{ display: isHidden(item.category, featuredCategory) ? "none" : undefined }}>
                                <div className="posts__inner">
                                  <div className="posts__cat">
                                    <span className="label posts__cat-label">
                                      {item.category}
                                    </span>
                                  </div>
                                  <h6 className="posts__title">
                                    <a href="/alchemists/index.html#" onClick={(e) => e.preventDefault()}>
                                      {item.title}
                                    </a>
                                  </h6>
                                  <time dateTime={item.dateTime} className="posts__date">
                                    {item.date}
                                  </time>
                                  <div className="posts__excerpt">
                                    {item.excerpt}
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>
              <aside className="widget card widget--sidebar widget-banner">
                <div className="widget__title card__header">
                  <h4>
                    {mc.advertisement.title}
                  </h4>
                </div>
                <div className="widget__content card__content">
                  <figure className="widget-banner__img">
                    <a href={mc.advertisement.url} onClick={(e) => e.preventDefault()}>
                      <img src={mc.advertisement.image} alt="Banner" className="ad-thumb" />
                    </a>
                  </figure>
                </div>
              </aside>
              <aside className="widget widget--sidebar card widget-newsletter">
                <div className="widget__title card__header">
                  <h4>
                    {mc.newsletter.title}
                  </h4>
                </div>
                <div className="widget__content card__content">
                  <h5 className="widget-newsletter__subtitle">
                    {mc.newsletter.subtitle}
                  </h5>
                  <div className="widget-newsletter__desc">
                    <p>
                      {mc.newsletter.description}
                    </p>
                  </div>
                  <form action="https://alchemists.dan-fisher.dev/basketball-dark/index.html#" id="newsletter" className="inline-form">
                    <div className="input-group">
                      <input type="email" className="form-control" placeholder={mc.newsletter.placeholder} />
                      {" "}
                      <span className="input-group-append">
                        <button className="btn btn-lg btn-default" type="button">
                          {mc.newsletter.buttonText}
                        </button>
                      </span>
                    </div>
                  </form>
                </div>
              </aside>
              <aside className="widget widget--sidebar card widget-preview">
                <div className="widget__title card__header">
                  <h4>
                    {mc.nextMatch.title}
                  </h4>
                </div>
                <div className="widget__content card__content">
                  <div className="match-preview">
                    <section className="match-preview__body">
                      <header className="match-preview__header">
                        <h3 className="match-preview__title">
                          {mc.nextMatch.matchTitle}
                        </h3>
                        <time className="match-preview__date" dateTime={mc.nextMatch.dateTime}>
                          {mc.nextMatch.date}
                        </time>
                      </header>
                      <div className="match-preview__content">
                        <div className="match-preview__team match-preview__team--first">
                          <figure className="match-preview__team-logo">
                            <img src={mc.nextMatch.team1.logo} alt="" className="mp-alchemists" />
                          </figure>
                          <h5 className="match-preview__team-name">
                            {mc.nextMatch.team1.name}
                          </h5>
                          <div className="match-preview__team-info">
                            {mc.nextMatch.team1.info}
                          </div>
                        </div>
                        <div className="match-preview__vs">
                          <div className="match-preview__conj">
                            VS
                          </div>
                          <div className="match-preview__match-info">
                            <time className="match-preview__match-time" dateTime={mc.nextMatch.matchTime}>
                              {mc.nextMatch.matchTime}
                            </time>
                            <div className="match-preview__match-place">
                              {mc.nextMatch.matchPlace}
                            </div>
                          </div>
                        </div>
                        <div className="match-preview__team match-preview__team--second">
                          <figure className="match-preview__team-logo">
                            <img src={mc.nextMatch.team2.logo} alt="" className="mp-clovers" />
                          </figure>
                          <h5 className="match-preview__team-name">
                            {mc.nextMatch.team2.name}
                          </h5>
                          <div className="match-preview__team-info">
                            {mc.nextMatch.team2.info}
                          </div>
                        </div>
                      </div>
                      <div className="match-preview__action">
                        <a href="/alchemists/index.html#" className="btn btn-default btn-block" onClick={(e) => e.preventDefault()}>
                          {mc.nextMatch.buttonText}
                        </a>
                      </div>
                    </section>
                    <section className="match-preview__countdown countdown">
                      <h4 className="countdown__title">
                        {mc.nextMatch.countdownTitle}
                      </h4>
                      <div className="countdown__content">
                        <div className="countdown-counter" data-date={mc.nextMatch.countdownDate}>
                          <div className="countdown-counter__item countdown-counter__item--days">
                            00
                            {" "}
                            <span className="countdown-counter__label">
                              days
                            </span>
                          </div>
                          <div className="countdown-counter__item countdown-counter__item--hours">
                            00
                            {" "}
                            <span className="countdown-counter__label">
                              hours
                            </span>
                          </div>
                          <div className="countdown-counter__item countdown-counter__item--mins">
                            00
                            {" "}
                            <span className="countdown-counter__label">
                              mins
                            </span>
                          </div>
                          <div className="countdown-counter__item countdown-counter__item--secs">
                            00
                            {" "}
                            <span className="countdown-counter__label">
                              secs
                            </span>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
  );
}
