// ==UserScript==
// @name        GitHub open file raw
// @namespace   https://github.com/rtk0c
// @match       https://github.com/*
// @grant       none
// @version     1.0
// @author      rtk0c
// @description Open files in raw.githubusercontent.com by holding alt
// @run-at      document-idle
// ==/UserScript==

const targets = [
    // We can't just use String.replace(), beacuse "blob" is a valid repo name
    { cl: 'a.Link--primary', regex: /^(.+)\/(.+)\/blob\/(.+)/, method: url => { window.location.href = url } },
    // FIXME why this locates no elements?
    { cl: 'a.rgh-quick-file-edit', regex: /^(.+)\/(.+)\/edit\/(.+)/, method: window.open },
]

for (const target of targets) {
    for (const n of document.querySelectorAll(target.cl)) {
        const matches = n.href.replace(/^https?:\/\/github\.com\//, '').match(target.regex)
        if (!matches)
            continue

            // FIXME: this is not good for accesibility
            n.title = 'alt-click to open the file in raw.githubusercontent.com'

            n.addEventListener('click', e => {
                if (e.altKey) {
                    e.preventDefault()
                    const [_, user, repo, path] = matches
                    target.method(`https://raw.githubusercontent.com/${user}/${repo}/refs/heads/${path}`)
                }
            })
    }
}
