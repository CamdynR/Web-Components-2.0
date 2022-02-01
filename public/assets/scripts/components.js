function init() {
  Array.from(document.querySelectorAll("link[rel='import']")).forEach(
    (link) => {
      fetch(link.getAttribute("href")).then((response) => {
        response.text().then((html) => {
          mountComponentFromHTML(html);
        });
      });
    }
  );
}

init();

// We can take the HTML, parse it, extract parts and re-assemble it inside the CustomElement.
function mountComponentFromHTML(html) {
  let dom = new DOMParser().parseFromString(html, "text/html");

  // We use the <title> of the HTML as the name for the component
  let name = dom.head.querySelector("title").innerText;

  // We get the attributes from the <body> tag
  let namedAttributes = Array.from(dom.head.querySelectorAll('meta[name]'));

  let attributes = [];
  namedAttributes.forEach(metaElem => {
    attributes.push(`"${metaElem.name}"`);
  });
  attributes = `[${attributes}]`;

  // We will inject the <head> into the Shadow DOM so that external resources like fonts are loaded
  let headText = dom.head.innerHTML;

  // We will later inject the script (this demo assumes only a one script tag per file)
  let script = dom.body.querySelector("script");
  let scriptText = script.innerText;

  // We will later inject the style (this demo assumes only a one style tag per file)
  let style = dom.body.querySelector("style");
  let styleText = style.innerText;

  // In order to get raw "template", we’ll remove the style and script tags.
  // This is a limitation / convention of this demo.
  script.remove();
  style.remove();

  // The <body> is our template
  let template = dom.body.outerHTML;

  let construct = `customElements.define(
    '${name}',
    class HTMLComponent extends HTMLElement {
      constructor() {
        super();

        var shadow = this.attachShadow({ mode: "open" });

        let head = document.createElement("head");
        head.innerHTML = \`${headText}\`;
        shadow.appendChild(head);

        let body = document.createElement("body");
        body.innerHTML = \`${template}\`;
        shadow.appendChild(body);

        let style = document.createElement("style");
        style.innerText = \`${styleText}\`;
        body.appendChild(style);

        new Function("document", "attributes", \`${scriptText}\`)(
          this.shadowRoot,
          this.attributes
        );
      }
      
      static get observedAttributes() {
        return ${attributes};
      }

      attributeChangedCallback(name, oldValue, newValue) {
        const meta = this.shadowRoot.querySelector('meta[name="'+name+'"]');
        meta.setAttribute('content', newValue);
        this.shadowRoot.dispatchEvent(
          new CustomEvent("attribute.changed", {
            composed: true,
            detail: { name, oldValue, newValue, value: newValue }
          })
        );
      }
    }
  );
  `;
  new Function(construct)();
}