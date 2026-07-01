"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import data from "@/data/data.json";

const allSlides = data.featuredCarousel.slides;

const CATEGORY_LABEL: Record<string, string> = {
  "posts__item--category-1": "The Team",
  "posts__item--category-2": "Injuries",
  "posts__item--category-3": "Playoffs",
};

export function FeaturedCarousel({ featuredCategory }: { featuredCategory: string }) {
  const slides = useMemo(() => {
    if (featuredCategory === "all") return allSlides;
    const label = CATEGORY_LABEL[featuredCategory];
    return label ? allSlides.filter(s => s.category === label) : allSlides;
  }, [featuredCategory]);

  const [current, setCurrent] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setSlidesToShow(w < 768 ? 1 : w < 992 ? 2 : 3);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const maxIndex = slides.length - slidesToShow;

  useEffect(() => {
    if (current > maxIndex) setCurrent(Math.max(0, maxIndex));
  }, [current, maxIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1 > maxIndex ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [maxIndex]);

  const goTo = useCallback(
    (index: number) => {
      if (index < 0) setCurrent(maxIndex);
      else if (index > maxIndex) setCurrent(0);
      else setCurrent(index);
    },
    [maxIndex]
  );

  const slideWidthPct = 100 / slidesToShow;

  const isCurrent = (i: number) => {
    if (slidesToShow === 1) return i === current;
    const center = current + Math.floor((slidesToShow - 1) / 2);
    return i === Math.min(center, maxIndex);
  };

  return (
    <div
      className="posts posts--carousel-featured featured-carousel"
      ref={containerRef}
      style={{ position: "relative" }}
    >
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
          animate={{ x: `-${current * slideWidthPct}%` }}
          transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
          style={{ display: "flex", flexWrap: "nowrap" }}
        >
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className={`posts__item posts__item--category-1 slick-slide${
                i >= current && i < current + slidesToShow
                  ? " slick-active"
                  : ""
              }${isCurrent(i) ? " slick-current slick-center" : ""}`}
              style={{
                width: `${slideWidthPct}%`,
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
                  <img src={slide.image} alt="" className="fc-thumb" />
                </figure>
                <div className="posts__inner">
                  <div className="posts__cat">
                    <span className="label posts__cat-label">
                      {slide.category}
                    </span>
                  </div>
                  <h3 className="posts__title" role="heading" aria-level="2">{slide.title}</h3>
                  <time dateTime={slide.dateTime} className="posts__date">
                    {slide.date}
                  </time>
                  <ul className="post__meta meta">
                    <li className="meta__item meta__item--views">
                      {slide.views}
                    </li>
                    <li className="meta__item meta__item--likes">
                      <i className="meta-like icon-heart"></i> {slide.likes}
                    </li>
                    <li className="meta__item meta__item--comments">
                      {slide.comments}
                    </li>
                  </ul>
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
  );
}
