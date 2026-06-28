import { readFileSync, writeFileSync } from 'fs';
import * as cheerio from 'cheerio';

// Helper to clean HTML to JSX
function cleanHtmlToJsx(html) {
  if (!html) return '';
  return html
    .replace(/class=/g, 'className=')
    .replace(/xlink:href=/g, 'xlinkHref=')
    .replace(/for=/g, 'htmlFor=')
    .replace(/autocomplete=/g, 'autoComplete=')
    .replace(/autofocus=/g, 'autoFocus=')
    .replace(/value=""/g, 'defaultValue=""')
    .replace(/datetime=/g, 'dateTime=')
    // self-closing tags
    .replace(/<img([^>]*)(?<!\/)>/g, '<img$1 />')
    .replace(/<input([^>]*)(?<!\/)>/g, '<input$1 />')
    .replace(/<br([^>]*)(?<!\/)>/g, '<br$1 />')
    .replace(/<hr([^>]*)(?<!\/)>/g, '<hr$1 />')
    .replace(/<meta([^>]*)(?<!\/)>/g, '<meta$1 />')
    .replace(/<link([^>]*)(?<!\/)>/g, '<link$1 />')
    // Comments
    .replace(/<!--/g, '{/*')
    .replace(/-->/g, '*/}')
    // Clean inline styles
    .replace(/style="display: block;"/g, 'style={{ display: "block" }}')
    .replace(/style="display: none;"/g, 'style={{ display: "none" }}')
    .replace(/style="opacity: 1;[^"]*"/g, 'style={{ opacity: 1 }}')
    .replace(/style="[^"]*"/g, ''); // strip other complex inline styles
}

const htmlContent = readFileSync('/home/lordwhitefire/current-project/cp/extracted_homepage.html', 'utf8');
const $ = cheerio.load(htmlContent);

// Remove scripts
$('script').remove();

const headerMobile = cleanHtmlToJsx($('.header-mobile').html());
const headerDesktop = cleanHtmlToJsx($('.header--layout-1').html());
const pushyPanel = cleanHtmlToJsx($('.pushy-panel').html());
const heroUnit = cleanHtmlToJsx($('.hero-unit').html());
const featuredCarousel = cleanHtmlToJsx($('.posts--carousel-featured').html());
const siteContent = cleanHtmlToJsx($('.site-content').html());
const footer = cleanHtmlToJsx($('footer.footer').length ? $('footer.footer').html() : $('footer').html());

const jsxOutput = `
{/* HEADER MOBILE */}
<div className="header-mobile clearfix" id="header-mobile">
  ${headerMobile}
</div>

{/* HEADER DESKTOP */}
<header className="header header--layout-1">
  ${headerDesktop}
</header>

{/* PUSHY PANEL */}
<aside className="pushy-panel">
  ${pushyPanel}
</aside>

{/* HERO UNIT */}
<div className="hero-unit">
  ${heroUnit}
</div>

{/* FEATURED CAROUSEL */}
<div className="posts posts--carousel-featured featured-carousel slick-initialized slick-slider">
  ${featuredCarousel}
</div>

{/* MAIN CONTENT */}
<div className="site-content">
  ${siteContent}
</div>

{/* FOOTER */}
<footer className="footer" id="footer">
  ${footer}
</footer>
`;

writeFileSync('/home/lordwhitefire/current-project/cp/extracted_jsx.txt', jsxOutput);
console.log('Successfully generated JSX blocks in /home/lordwhitefire/current-project/cp/extracted_jsx.txt');
