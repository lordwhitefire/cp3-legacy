import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("data.json structure", () => {
  const raw = fs.readFileSync(
    path.resolve(__dirname, "../../src/data/data.json"),
    "utf-8"
  );
  const data = JSON.parse(raw);

  it("has required top-level sections", () => {
    expect(data).toHaveProperty("_lastUpdated");
    expect(data).toHaveProperty("_source");
    expect(data).toHaveProperty("heroUnit");
    expect(data).toHaveProperty("featuredCarousel");
    expect(data).toHaveProperty("mainContent");
    expect(data).toHaveProperty("footer");
    expect(data).toHaveProperty("pushyPanel");
    expect(data).toHaveProperty("modals");
    expect(data).toHaveProperty("site");
    expect(data).toHaveProperty("header");
    expect(data).toHaveProperty("mobileHeader");
  });

  it("heroUnit has content", () => {
    expect(data.heroUnit.title).toBeTruthy();
    expect(data.heroUnit.image).toBeTruthy();
  });

  it("featuredCarousel has slides", () => {
    expect(data.featuredCarousel.slides.length).toBeGreaterThan(0);
    expect(data.featuredCarousel.slides[0]).toHaveProperty("title");
    expect(data.featuredCarousel.slides[0]).toHaveProperty("image");
  });

  it("mainContent has all sub-sections", () => {
    const mc = data.mainContent;
    expect(mc).toHaveProperty("featuredNews");
    expect(mc).toHaveProperty("latestNews");
    expect(mc).toHaveProperty("popularNews");
    expect(mc).toHaveProperty("trendingNews");
    expect(mc).toHaveProperty("featuredPlayer");
    expect(mc).toHaveProperty("lastGameResult");
    expect(mc).toHaveProperty("standings");
  });

  it("footer has logo", () => {
    expect(data.footer.logo).toHaveProperty("src");
    expect(data.footer.logo).toHaveProperty("alt");
  });

  it("modals has register and login", () => {
    expect(data.modals).toHaveProperty("register");
    expect(data.modals).toHaveProperty("login");
  });
});
