
# YouTube Embedder
![configuring yt_embedder](https://github.com/dylanwalker/yt_embedder/blob/main/images/yt_embedder.png)
## Config for any site
![configuring yt_embedder](https://github.com/dylanwalker/yt_embedder/blob/main/images/yt_embedder1.gif)

## Automatically search and embed YT videos in an overlay
![running yt_embedder](https://github.com/dylanwalker/yt_embedder/blob/main/images/yt_embedder2.gif)

## How to install
You can load an unpacked extension into chrome or edge by:
1) Clone this repo
2) Enable developer mode in edge/chrome (Manage Extensions-> Developer Mode toggle)
3) In Extensions section of your browser, click "load unpacked" and select `./src/`.

I've also packed the extension into a .crx file (see `./extension/` ), which can be dropped onto your browser to install, but edge/chrome will disable any .crx files manually installed (as opposed to install from the chrome webstore or edge add-ins) unless you [whitelist them](https://techjourney.net/chrome-edge-disables-crx-installed-extensions-workarounds-to-turn-on/). If there is sufficient interest, I will release on chrome webstore / edge addin.

## What is YouTube Embedder?

It's a chromium-compatible web extension that can create a youtube video as an overlay when you hover over a specific element on any webpage. You specify a URL site pattern, xpath expression and text extraction function for websites that you visit regularly to complement them with relevant youtube videos. 

## Why is YouTube Embedder?

Suppose you regularly go to a site that provides ranking for different genres of movies and always find yourself searching for those movie trailers on youtube.  With this extension, you can hover over a movie link to get a quick youtube video of the movie trailer as an overlay without leaving that site or opening up a new tab.

## How does it work?

To make it work on any site, you have to specify three things:

1) A URL pattern the specifies which sites/pages you want to add a yt overlay on e.g., `*://letterboxd.com/*`
2) An xpath for the elements you want to get your search text from, e.g., `//a[@data-original-title]`
3) A text extraction function that specifies how the youtube search text should be extracted from the web element e.g., 
```javascript
return element.getAttribute('data-original-title');
```

For each site pattern, you can specify the rules (which elements you want to have pull up a video when you hover over them; how the text taken from those elements is altered before being shoved into a YT search). Only the first YT video from the search results is displayed as an overlay.   

*I have not bug tested what happens if you specify overlapping site patterns, so don't do that.*

