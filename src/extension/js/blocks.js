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

export const classNameToBlockType = (className) => {
  let blockType = className.shift();
  blockType = blockType.charAt(0).toUpperCase() + blockType.slice(1).toLowerCase();
  if (className.length) {
    const options = className.map((cls) => cls.split('-').join(' '));
    blockType += ` (${options.join(', ')})`;
  } else {
    blockType = blockType.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).join(' ');
  }
  return blockType;
};

export const toBlockCSSClassNames = (text) => {
  if (!text) {
    return [];
  }
  const names = [];
  const idx = text.lastIndexOf('(');
  if (idx >= 0) {
    names.push(text.substring(0, idx));
    names.push(...text.substring(idx + 1).split(','));
  } else {
    names.push(text);
  }

  return names.map((name) => name
    .toLowerCase()
    .replace(/[^0-9a-z]+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, ''))
    .filter((name) => !!name);
};

export const blockDivToTable = (main) => {
  main.querySelectorAll('div[class]').forEach((div) => {
    const table = document.createElement('table');
    let maxCols = 0;
    const thead = document.createElement('thead');
    const th = document.createElement('th');
    th.innerHTML = classNameToBlockType(Array.from(div.classList));
    thead.appendChild(th);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    Array.from(div.children).forEach((row) => {
      if (row.tagName === 'DIV') {
        const rowElement = document.createElement('tr');
        tbody.appendChild(rowElement);
        let numCols = 0;
        Array.from(row.children).forEach((cell) => {
          if (cell.tagName === 'DIV') {
            const cellElement = document.createElement('td');
            rowElement.appendChild(cellElement);
            cellElement.innerHTML = cell.innerHTML;
            numCols += 1;
          }
          maxCols = Math.max(maxCols, numCols);
        });
      }
    });
    th.colSpan = maxCols;

    div.replaceWith(table);
  });
};

export const blockTableToDiv = (main) => {
  main.querySelectorAll('table').forEach((table) => {
    const div = document.createElement('div');
    div.classList.add(...toBlockCSSClassNames(table.querySelector('th').innerHTML));
    table.querySelectorAll('tbody tr').forEach((row) => {
      const rowDiv = document.createElement('div');
      div.appendChild(rowDiv);
      row.querySelectorAll('td').forEach((cell) => {
        const cellDiv = document.createElement('div');
        rowDiv.appendChild(cellDiv);
        cellDiv.innerHTML = cell.innerHTML;
      });
    });
    table.replaceWith(div);
  });
};

export const createSectionBreaks = (main) => {
  const divs = main.querySelectorAll(':scope > div');
  divs.forEach((div, index) => {
    if (index < divs.length - 1) {
      const hr = document.createElement('hr');
      div.append(hr);
    }
  });
};

export const removeSectionBreaks = (main) => {
  main.querySelectorAll('hr').forEach((hr) => {
    hr.remove();
  });
};
