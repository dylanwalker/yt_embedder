![configuring yt_embedder](https://github.com/dylanwalker/yt_embedder/blob/main/yt_embedder1.gif)

![running yt_embedder](https://github.com/dylanwalker/yt_embedder/blob/main/yt_embedder1.gif)

# What is youtube embedder?

It's a chromium-compatible web extension that can create a youtube video as an overlay when you hover over a specific element on any webpage. You specify a URL site pattern, xpath expression and text extraction function for websites that you visit regularly to complement them with relevant youtube videos. 

# Why is youtube embedder?

Suppose you regularly go to a site that provides ranking for different genres of movies and always find yourself searching for those movie trailers on youtube.  With this extension, you can hover over a movie link to get a quick youtube video of the movie trailer as an overlay without leaving that site or opening up a new tab.

# How does it work?

To make it work on any site, you have to specify three things:

1) A URL pattern the specifies which sites/pages you want to add a yt overlay on e.g., `*://letterboxd.com/*`
2) An xpath for the elements you want to get your search text from, e.g., `//a[@data-original-title]`
3) A text extraction function that specifies how the youtube search text should be extracted from the web element e.g., 
```javascript
return element.getAttribute('data-original-title');
```

For each site pattern, you can specify the rules (which elements you want to have pull up a video when you hover over them; how the text taken from those elements is altered before being shoved into a YT search). Only the first YT video from the search results is displayed as an overlay.   

*I have not bug tested what happens if you specify overlapping site patterns, so don't do that.*

