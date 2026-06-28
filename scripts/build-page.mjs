import { readFileSync, writeFileSync } from 'fs';

// Read generated JSX content
const jsxContent = readFileSync('/home/lordwhitefire/current-project/cp/extracted_jsx.txt', 'utf8');

// Replace any instances of unescaped & in text nodes or attribute values that could break JSX
// For instance, "Wishlist <span className="highlight">8</span>" or "Alchemists Basketball Club & Sports News"
// In JSX: "Alchemists Basketball Club & Sports News" -> "Alchemists Basketball Club &amp; Sports News"
// Or wrap it in quotes: {"Alchemists Basketball Club & Sports News"}
let cleanedJsx = jsxContent
  // escape & in text nodes (not inside tags)
  .replace(/>([^<]*&[^<]*)</g, (match, text) => {
    return `>${text.replace(/&/g, '&amp;')}<`;
  })
  // clean tabindex to tabIndex
  .replace(/tabindex="([0-9-]+)"/gi, (match, val) => `tabIndex={${val}}`)
  .replace(/tabIndex="([0-9-]+)"/gi, (match, val) => `tabIndex={${val}}`)
  .replace(/tabindex=/g, 'tabIndex=')
  // clean crossOrigin
  .replace(/crossorigin=/g, 'crossOrigin=')
  .replace(/crossorigin=""/g, 'crossOrigin="anonymous"')
  // clean frameborder
  .replace(/frameborder=/g, 'frameBorder=')
  // clean class to className (just in case any missed)
  .replace(/class=/g, 'className=')
  // clean xlink:href to xlinkHref
  .replace(/xlink:href=/g, 'xlinkHref=')
  .replace(/xlinkHref=/g, 'xlinkHref=')
  // clean SVG attributes to camelCase
  .replace(/stroke-width=/g, 'strokeWidth=')
  .replace(/stroke-linecap=/g, 'strokeLinecap=')
  .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
  .replace(/fill-rule=/g, 'fillRule=')
  .replace(/clip-rule=/g, 'clipRule=')
  // clean colspan to colSpan
  .replace(/colspan="([0-9]+)"/gi, (match, val) => `colSpan={${val}}`)
  .replace(/colSpan="([0-9]+)"/gi, (match, val) => `colSpan={${val}}`)
  .replace(/colspan=/g, 'colSpan=')
  // clean rowspan to rowSpan
  .replace(/rowspan="([0-9]+)"/gi, (match, val) => `rowSpan={${val}}`)
  .replace(/rowSpan="([0-9]+)"/gi, (match, val) => `rowSpan={${val}}`)
  .replace(/rowspan=/g, 'rowSpan=')
  // clean autoplay to autoPlay
  .replace(/autoplay=/g, 'autoPlay=')
  // clean viewbox to viewBox
  .replace(/viewbox=/g, 'viewBox=')
  ;

const pageCode = `"use client";

import React from 'react';

export default function Home() {
  return (
    <div className="site-wrapper clearfix">
      <div className="site-overlay"></div>
      ${cleanedJsx}
    </div>
  );
}
`;

writeFileSync('/home/lordwhitefire/current-project/cp/cp-legacy-frontend/app/page.tsx', pageCode);
console.log('Successfully wrote generated page.tsx!');
