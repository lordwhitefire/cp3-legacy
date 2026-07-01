"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import data from "@/data/data.json";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const allSlides = data.mainContent.featuredNews.slides;

const CATEGORY_LABEL: Record<string, string> = {
  "posts__item--category-1": "The Team",
  "posts__item--category-2": "Injuries",
  "posts__item--category-3": "Playoffs",
};

export function FeaturedSlider({ featuredCategory }: { featuredCategory: string }) {
  const slides = useMemo(() => {
    if (featuredCategory === "all") return allSlides;
    const label = CATEGORY_LABEL[featuredCategory];
    return label ? allSlides.filter(s => s.category === label) : allSlides;
  }, [featuredCategory]);

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (current >= slides.length) setCurrent(0);
  }, [slides.length, current]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1 >= slides.length ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goTo = useCallback(
    (index: number) => {
      if (slides.length === 0) return;
      if (index < 0) setCurrent(slides.length - 1);
      else if (index >= slides.length) setCurrent(0);
      else setCurrent(index);
    },
    [slides.length]
  );

  if (slides.length === 0) return null;

  return (
    <ErrorBoundary name="FeaturedSlider">
    <div className="slick posts posts--slider-featured" style={{ position: "relative" }}>
      <button
        className="slick-prev slick-arrow"
        onClick={() => goTo(current - 1)}
        aria-label="Previous"
        type="button"
      >
        Previous
      </button>
      <div className="slick-list" style={{ overflow: "hidden" }}>
        <motion.div
          className="slick-track"
          animate={{ x: `-${current * 100}%` }}
          transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
          style={{ display: "flex", flexWrap: "nowrap" }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`posts__item ${slide.categoryClass} slick-slide${
                i === current ? " slick-current slick-active" : ""
              }`}
              style={{
                width: "100%",
                flex: "0 0 auto",
                float: "none",
                display: "block",
              }}
            >
              <a
                href="/alchemists/index.html#"
                className="posts__link-wrapper"
                onClick={(e) => e.preventDefault()}
              >
                <figure className="posts__thumb">
                  <img
                    src={slide.image}
                    alt=""
                    className="fns-thumb"
                  />
                </figure>
                <div className="posts__inner">
                  <div className="posts__cat">
                    <span className="label posts__cat-label">
                      {slide.category}
                    </span>
                  </div>
                  <h3 className="posts__title">
                    {slide.title}
                    {slide.titleHighlight && (
                      <span className="posts__title-higlight">
                        {slide.titleHighlight}
                      </span>
                    )}
                    {slide.titleEnd || ""}
                  </h3>
                  <div className="post-author">
                    <figure className="post-author__avatar">
                      <img
                        src={slide.author.avatar}
                        alt="Post Author Avatar"
                        className="av-thumb"
                      />
                    </figure>
                    <div className="post-author__info">
                      <h4 className="post-author__name">
                        {slide.author.name}
                      </h4>
                      <time dateTime={slide.dateTime} className="posts__date">
                        {slide.date}
                      </time>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          ))}
        </motion.div>
      </div>
      <button
        className="slick-next slick-arrow"
        onClick={() => goTo(current + 1)}
        aria-label="Next"
        type="button"
      >
        Next
      </button>
    </div>
    </ErrorBoundary>
  );
}
