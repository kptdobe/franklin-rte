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

/**
 * Creates the application popup for the given tab id.
 * @param {String} id The tab id
 */
const openPopup = async (id) => {
  chrome.windows.create({
    url: chrome.runtime.getURL(`/index.html?tabId=${id}`),
    type: 'popup',
    width: 740,
    height: 1200,
  });
};

// adds the listener to open the popup when clicking on the extension button
chrome.action.onClicked.addListener((tab) => {
  openPopup(tab.id);
});

// adds the listener to open the popup when navigated page contains
// the view-doc-source=true query parameter
chrome.webNavigation.onCompleted.addListener((details) => {
  const u = new URL(details.url);
  const vds = u.searchParams.get('view-doc-source');
  if (vds && vds === 'true') {
    openPopup(details.tabId);
  }
});
