/** Allow only text formatting tags in job descriptions — no images, embeds, or styles. */
const ALLOWED_TAGS = new Set(["P", "BR", "STRONG", "B", "EM", "I", "UL", "OL", "LI", "DIV"]);

export function sanitizeJobDescriptionHtml(html: string): string {
  if (!html?.trim()) return "";

  if (typeof DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString("<div>" + html + "</div>", "text/html");
    const root = doc.body.firstElementChild;
    if (root) {
      walkAndStrip(root);
      return root.innerHTML.trim();
    }
  }

  return html
    .replace(/<img[\s\S]*?>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?<\/object>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<picture[\s\S]*?<\/picture>/gi, "")
    .replace(/\sstyle="[^"]*"/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "");
}

function walkAndStrip(node: Element) {
  const children = [...node.children];
  for (const child of children) {
    const tag = child.tagName;
    if (!ALLOWED_TAGS.has(tag)) {
      const text = child.textContent || "";
      child.replaceWith(docText(node.ownerDocument!, text));
      continue;
    }
    [...child.attributes].forEach((attr) => child.removeAttribute(attr.name));
    walkAndStrip(child);
  }
}

function docText(doc: Document, text: string) {
  return doc.createTextNode(text);
}

export function plainTextFromHtml(html: string): string {
  if (typeof DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
  }
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
