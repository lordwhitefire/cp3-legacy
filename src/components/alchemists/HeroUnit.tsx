import Image from "next/image";
import React from "react";
import data from "@/data/data.json";

export function HeroUnit() {
  return (
      <div className="hero-unit">
        <div className="container hero-unit__container">
          <div className="hero-unit__content hero-unit__content--left-center">
            <span className="hero-unit__decor">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
            </span>
            <h5 className="hero-unit__subtitle">
              {data.heroUnit.subtitle}
            </h5>
            <h1 className="hero-unit__title">
              {data.heroUnit.title}
              {" "}
              <span className="text-primary">
                {data.heroUnit.titleHighlight}
              </span>
            </h1>
            <div className="hero-unit__desc">
              {data.heroUnit.description}
            </div>
            <a href={data.heroUnit.button.url} className="btn btn-inverse btn-sm btn-outline btn-icon-right btn-condensed hero-unit__btn" onClick={(e) => e.preventDefault()}>
              {data.heroUnit.button.text}
              {" "}
              <i className="fas fa-plus text-primary"></i>
            </a>
          </div>
          <figure className="hero-unit__img">
            <Image
              src={data.heroUnit.image}
              alt="Hero Unit Image"
              priority
              width={5504}
              height={8256}
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </figure>
        </div>
      </div>
  );
}
