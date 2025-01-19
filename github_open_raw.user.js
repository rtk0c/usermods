// ==UserScript==
// @name        GitHub open file raw
// @namespace   https://github.com/rtk0c
// @match       https://github.com/*
// @grant       none
// @version     2.0
// @author      rtk0c
// @description Open files in raw.githubusercontent.com by holding alt
// @run-at      document-idle
// ==/UserScript==

for (const n of document.querySelectorAll('a.Link--primary')) {
    const matches = n.href.match(/^https?:\/\/github\.com\/(.+)\/(.+)\/blob\/(.+)/)
    // Directories don't have raw resources
    // they won't match beacuse URL will be /tree/ instead of /blob/
    if (!matches)
        continue
        const [_, user, repo, path] = matches
        const targetHref = `https://raw.githubusercontent.com/${user}/${repo}/refs/heads/${path}`

        // FIXME: this is not good for accesibility
        n.title = 'alt-click to open the file in raw.githubusercontent.com'

        n.addEventListener('click', e => {
            if (e.altKey) {
                e.preventDefault()
                window.location.href = targetHref
            }
        })
        n.addEventListener('auxclick', e => {
            if (e.altKey) {
                e.preventDefault()
                window.open(targetHref)
            }
        })
}
