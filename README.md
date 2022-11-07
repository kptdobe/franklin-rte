# Franklin Real Time Editor

Playground so far.

## Usage

### As an unpacked Chrome extension

```
git clone https://github.com/kptdobe/franklin-rte
```

Load the extension as an local unpacked extension - see [instructions here](https://developer.chrome.com/docs/extensions/mv3/getstarted/#unpacked)

## Patch your project

Add the follwing event listener to your scripts.js file for the project you want to enable the Real Time Editing for:

```js
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'refresh-main') {
    const main = document.querySelector('main');
    main.innerHTML = event.data.html;
    decorateMain(main);
    loadBlocks(main);
  }
});
```

The extension sends the message with the new main html. This code is responsible for updating the main div and "re-decorating" it.
