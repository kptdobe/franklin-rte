/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import { blockDivToTable, blockTableToDiv } from './blocks.js';

/**
 * Returns the current tab
 * @returns {chrome.tabs.Tab} The current tab
 */
const getCurrentTab = async () => {
  const u = new URL(window.location.href);
  const tabId = parseInt(u.searchParams.get('tabId'), 10);
  const tab = await chrome.tabs.get(tabId);
  return tab;
};

/**
 * Sends a message to the content window
 * @param {Object} message The message to send
 * @returns {Promise<Object} The response result
 */
const sendMessage = async (message) => {
  const tab = await getCurrentTab();
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tab.id, message, resolve);
  });
};

const getEditorElement = () => document.getElementById('editor');

/**
 * Runs the copy (to clipboard...) action
 */
// eslint-disable-next-line no-unused-vars
const copy = async () => {
  const textarea = document.createElement('textarea');
  textarea.value = getEditorElement().innerHTML;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
};

const htmlSourceToEdition = (main, url) => {
  main.querySelectorAll('img').forEach((img) => {
    if (!img.src) return;
    const extension = new URL(window.location.href);
    const content = new URL(url);
    img.src = img.src.replace(extension.origin, content.origin);
  });

  main.querySelectorAll('picture source').forEach((source) => {
    if (!source.srcset) return;
    // const extension = new URL(window.location.href);
    const content = new URL(url);
    if (source.srcset.startsWith('./')) {
      source.srcset = `${content.origin}/${source.srcset.substring(2)}`;
    } else if (source.srcset.startsWith('/')) {
      source.srcset = `${content.origin}${source.srcset}`;
    }
  });

  blockDivToTable(main);
};

const loadEditor = async (tab) => {
  const req = await fetch(tab.url);
  const source = await req.text();

  const doc = new DOMParser().parseFromString(source, 'text/html');
  const main = doc.querySelector('main');

  htmlSourceToEdition(main, tab.url);

  getEditorElement().innerHTML = main.innerHTML;
};

const htmlEditionToSource = () => {
  const editor = getEditorElement();
  const doc = new DOMParser().parseFromString(editor.innerHTML, 'text/html');
  const main = doc.body;

  blockTableToDiv(main);

  return main.innerHTML;
};

const debounce = (func, wait, immed) => {
  let timeout;
  return function () {
    const ctx = this;
    // eslint-disable-next-line prefer-rest-params
    const args = arguments;
    const later = function () {
      timeout = null;
      if (!immed) func.apply(ctx, args);
    };
    const callNow = immed && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(ctx, args);
  };
};

/**
 * Initial setup
 */
const load = async () => {
  const tab = await getCurrentTab();

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['/js/content.js'],
  });

  console.log('current tab', tab);
  loadEditor(tab);

  const editor = getEditorElement();
  editor.addEventListener('input', debounce(() => {
    console.log('editor content has changed');
    sendMessage({ fct: 'setMain', params: { html: htmlEditionToSource() } });
  }, 500));
};

load();
