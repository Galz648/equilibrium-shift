/**
 * Minimal DOM JSX factory (no React). TypeScript classic JSX: `"jsx": "react"`, `jsxFactory: "h"`.
 */
export type JsxChild =
    | string
    | number
    | boolean
    | null
    | undefined
    | Node
    | JsxChild[];

export type HtmlProps = {
    children?: JsxChild;
    className?: string;
    style?: Partial<CSSStyleDeclaration> | Record<string, string>;
    dangerouslySetInnerHTML?: { __html: string };
    ref?: (el: HTMLElement) => void;
    /** Maps to the `for` attribute on <label>. */
    htmlFor?: string;
} & Record<string, unknown>;

function appendChild(parent: Node, child: JsxChild): void {
    if (child === null || child === undefined || child === false || child === true) return;
    if (Array.isArray(child)) {
        for (const c of child) appendChild(parent, c);
        return;
    }
    if (typeof child === "string" || typeof child === "number") {
        parent.appendChild(document.createTextNode(String(child)));
        return;
    }
    parent.appendChild(child);
}

export function Fragment(props: { children?: JsxChild } | null): DocumentFragment {
    const f = document.createDocumentFragment();
    const ch = props?.children;
    if (ch !== undefined) appendChild(f, ch);
    return f;
}

export function h(tag: string | typeof Fragment, props: HtmlProps | null, ...children: JsxChild[]): Node {
    if (tag === Fragment) {
        const f = document.createDocumentFragment();
        const ch = props?.children;
        if (ch !== undefined) appendChild(f, ch);
        for (const c of children) appendChild(f, c);
        return f;
    }

    const element = document.createElement(tag as string);
    const p = props ?? {};
    let skipChildAppend = false;

    for (const [key, value] of Object.entries(p)) {
        if (key === "children") continue;
        if (value === undefined || value === false) continue;

        if (key === "className") {
            element.className = String(value);
            continue;
        }
        if (key === "style" && value && typeof value === "object") {
            Object.assign(element.style, value as object);
            continue;
        }
        if (
            key === "dangerouslySetInnerHTML" &&
            value &&
            typeof value === "object" &&
            "__html" in (value as object)
        ) {
            element.innerHTML = String((value as { __html: string }).__html);
            skipChildAppend = true;
            continue;
        }
        if (key === "ref" && typeof value === "function") {
            (value as (el: HTMLElement) => void)(element);
            continue;
        }
        if (key === "htmlFor") {
            element.setAttribute("for", String(value));
            continue;
        }
        if (key === "defaultValue" && element instanceof HTMLInputElement) {
            element.defaultValue = String(value);
            continue;
        }
        if (key === "onChange" && typeof value === "function") {
            element.addEventListener("change", value as EventListener);
            continue;
        }
        if (key === "onInput" && typeof value === "function") {
            element.addEventListener("input", value as EventListener);
            continue;
        }
        if (key.startsWith("on") && key.length > 2 && typeof value === "function") {
            const evt = key.slice(2).toLowerCase();
            element.addEventListener(evt, value as EventListener);
            continue;
        }
        if (value === true) {
            element.setAttribute(key, "");
            continue;
        }
        element.setAttribute(key, String(value));
    }

    if (!skipChildAppend) {
        const fromProps = p.children;
        if (fromProps !== undefined) appendChild(element, fromProps);
        for (const c of children) appendChild(element, c);
    }

    return element;
}

declare global {
    namespace JSX {
        type Element = Node;
        interface IntrinsicElements {
            [elemName: string]: Record<string, unknown>;
        }
    }
}
