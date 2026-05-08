import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { translateStaticText } from "../../i18n/config";

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "TEXTAREA", "CODE", "PRE"]);
const originalTextByNode = new WeakMap<Text, string>();

const getOriginalText = (node: Text) => {
  const existingOriginal = originalTextByNode.get(node);

  if (existingOriginal !== undefined) {
    return existingOriginal;
  }

  const originalText = node.textContent || "";
  originalTextByNode.set(node, originalText);
  return originalText;
};

const translateTextNode = (node: Text, language: string) => {
  const parent = node.parentElement;

  if (!parent || SKIP_TAGS.has(parent.tagName)) {
    return;
  }

  const originalText = getOriginalText(node);
  const translatedText = translateStaticText(originalText, language);

  if (translatedText !== originalText.trim()) {
    node.textContent = originalText.replace(originalText.trim(), translatedText);
  } else if (node.textContent !== originalText) {
    node.textContent = originalText;
  }
};

const translateAttributes = (element: HTMLElement, language: string) => {
  ["placeholder", "aria-label", "title"].forEach((attribute) => {
    const currentValue = element.getAttribute(attribute);

    if (!currentValue) {
      return;
    }

    const dataKey = `i18nOriginal${attribute.replace(/(^|-)([a-z])/g, (_, __, letter) => letter.toUpperCase())}`;
    const originalValue = element.dataset[dataKey] || currentValue;
    const translatedValue = translateStaticText(originalValue, language);

    if (translatedValue !== originalValue || element.dataset[dataKey]) {
      element.dataset[dataKey] = originalValue;
      element.setAttribute(attribute, translatedValue);
    }
  });
};

const walkAndTranslate = (root: ParentNode, language: string) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let currentNode = walker.nextNode();

  while (currentNode) {
    textNodes.push(currentNode as Text);
    currentNode = walker.nextNode();
  }

  textNodes.forEach((node) => translateTextNode(node, language));

  if (root instanceof HTMLElement) {
    translateAttributes(root, language);
  }

  root.querySelectorAll?.("[placeholder], [aria-label], [title]").forEach((element) => {
    translateAttributes(element as HTMLElement, language);
  });
};

export default function PageTranslator() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const language = i18n.language;
    let frameId = window.requestAnimationFrame(() => {
      walkAndTranslate(document.body, language);
    });

    const observer = new MutationObserver((mutations) => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              translateTextNode(node as Text, language);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              walkAndTranslate(node as HTMLElement, language);
            }
          });

          if (mutation.type === "characterData" && mutation.target.nodeType === Node.TEXT_NODE) {
            translateTextNode(mutation.target as Text, language);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [i18n.language]);

  return null;
}
