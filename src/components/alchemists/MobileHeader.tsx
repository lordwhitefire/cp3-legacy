import React from "react";
import data from "@/data/data.json";

export function MobileHeader() {
  return (
    <>
      <div className="site-overlay"></div>
      <div className="header-mobile clearfix" id="header-mobile">
        <div className="header-mobile__logo">
          <a href={data.site.url} onClick={(e) => e.preventDefault()}>
            <img src={data.mobileHeader.logo.src} alt={data.mobileHeader.logo.alt} className="header-mobile__logo-img" />
          </a>
        </div>
        <div className="header-mobile__inner">
          <a id="header-mobile__toggle" className="burger-menu-icon" aria-label="Open navigation menu">
            <span className="burger-menu-icon__line"></span>
          </a>
          {" "}
          <span className="header-mobile__search-icon" id="header-mobile__search-icon"></span>
        </div>
        <div className="header-search-form">
          <form action={data.site.url} id="mobile-search-form" className="search-form">
            <input type="text" className="form-control header-mobile__search-control" value="" placeholder={data.mobileHeader.searchPlaceholder} />
            {" "}
            <button type="submit" className="header-mobile__search-submit">
              <i className="fas fa-search"></i>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
