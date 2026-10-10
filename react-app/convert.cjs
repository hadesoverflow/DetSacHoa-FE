const fs = require('fs');

const html = fs.readFileSync('d:/unseen.co/index.html', 'utf8');

// Get body content
let bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
if (!bodyMatch) process.exit(1);

let body = bodyMatch[1];

// Strip out scripts and styles inside body
body = body.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
body = body.replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '');
body = body.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

// Convert class to className
body = body.replace(/class=/g, 'className=');

// Convert SVG attributes and JSX specific DOM properties
body = body.replace(/viewBox=/g, 'viewBox=');
body = body.replace(/clip-path=/g, 'clipPath=');
body = body.replace(/stroke-width=/g, 'strokeWidth=');
body = body.replace(/stroke-miterlimit=/g, 'strokeMiterlimit=');
body = body.replace(/xmlns:xlink=/g, 'xmlnsXlink=');
body = body.replace(/xlink:href=/g, 'xlinkHref=');
body = body.replace(/xml:space=/g, 'xmlSpace=');
body = body.replace(/fill-rule=/g, 'fillRule=');
body = body.replace(/clip-rule=/g, 'clipRule=');
body = body.replace(/stroke-dasharray=/g, 'strokeDasharray=');
body = body.replace(/stroke-dashoffset=/g, 'strokeDashoffset=');
body = body.replace(/enable-background=/g, 'enableBackground=');

// Fix specific DOM properties
body = body.replace(/\bitemscope\b(?!=)/g, 'itemScope');
body = body.replace(/itemprop=/g, 'itemProp=');
body = body.replace(/\basscroll-container\b(?!=)/g, 'asscroll-container="true"');
body = body.replace(/\basscroll\b(?!\-)(?!=)/g, 'asscroll="true"');

// Fix self closing tags
const voidTags = ['img', 'br', 'hr', 'input', 'meta', 'link', 'source', 'ellipse', 'circle', 'path', 'rect', 'polygon'];
voidTags.forEach(tag => {
    const regex = new RegExp(`<${tag}\\b([^>]*?)(?<!/)>`, 'gi');
    body = body.replace(regex, (match, attrs) => {
        if(attrs.trim().endsWith('/')) return match;
        return `<${tag}${attrs} />`;
    });
    // Remove dangling closing tags
    body = body.replace(new RegExp(`</${tag}>`, 'gi'), '');
});

// Fix inline styles
body = body.replace(/style="([^"]*)"/g, (match, p1) => {
    const styles = p1.split(';').filter(s => s.trim() !== '').map(s => {
        const [key, ...valParts] = s.split(':');
        if (!key) return null;
        const val = valParts.join(':');
        if(!val) return null;
        const camelKey = key.trim().replace(/-([a-z])/g, (m, c) => c.toUpperCase());
        return `${camelKey}: '${val.trim()}'`;
    }).filter(Boolean).join(', ');
    return `style={{ ${styles} }}`;
});

// Fix for=
body = body.replace(/ for=/g, ' htmlFor=');
body = body.replace(/ tabindex=/gi, ' tabIndex=');

// Remove HTML comments
body = body.replace(/<!--[\s\S]*?-->/g, '');

const appJsx = `import React from 'react';
import './index.css';

export default function App() {
  return (
    <>
      ${body}
    </>
  );
}
`;

fs.writeFileSync('d:/unseen.co/react-app/src/App.jsx', appJsx);
console.log('App.jsx generated!');
