// ==UserScript==
// @name        The Old New Thing link unfucker
// @description Replace broken URLs to The Old New Thing when the page loads
// @version     5
// @grant       none
// @match       https://blogs.msdn.com/*
// @match       https://blogs.msdn.microsoft.com/*
// ==/UserScript==

// Adapted from
// https://ahti.space/git/nortti/oldnewthing-link-unfucker/src/branch/main/oldnewthing-link-unfucker.user.js#
// https://greasyfork.org/en/scripts/507179-the-old-new-thing-comments

function strip(s, prefix) {
    if (s.startsWith(prefix))
        return s.substring(prefix.length)
        return null
}

// Despite what Raymond says in https://devblogs.microsoft.com/oldnewthing/20160118-01/?p=92872
// the correct correspondence seems to be the opposite (according to some google searches):
//   blogs.msdn.com/b/oldnewthing/archive/yyyy/MM/dd/nnnn.aspx
//   blogs.msdn.microsoft.com/oldnewthing/archive/yyyyMMdd-xx/?p=yyyy

const url = window.location.href
let rest
if url.startsWith('https://blogs.msdn.com/') {
    const m = rest.match(/^(?:\/b)?\/oldnewthing\/archive\/([0-9]{4})\/([0-9]{2})\/([0-9]{2})/)
    // Either this, or https://devblogs.microsoft.com/oldnewthing/yyyyMMdd-00 works
    window.location.href = `https://devblogs.microsoft.com/oldnewthing/${m[1]}/${m[2]}/${m[3]}`
} else if (rest = url.startsWith('https://blogs.msdn.microsoft.com/')) {
    window.location.href = 'https://devblogs.microsoft.com/oldnewthing/' + rest
}
