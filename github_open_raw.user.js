// ==UserScript==
// @name        GitHub open file raw
// @namespace   https://github.com/rtk0c
// @match       https://github.com/*
// @grant       none
// @version     3.0
// @author      rtk0c
// @description Open files in raw.githubusercontent.com by holding alt
// @run-at      document-idle
// ==/UserScript==

function altKeyAction(action, href, ev) {
    if (ev.altKey) {
        ev.preventDefault()
        // For the file tree, GitHub's link nav code is somewhere not on the individual element, make them stop
        ev.stopPropagation()
        action(href)
    }
}

const openHere = href => { window.location.href = href }
const openInNewTab = href => { window.open(href) }

for (const n of document.querySelectorAll('a.Link--primary')) {
    const matches = n.href.match(/^https?:\/\/github\.com\/([^\/]*)\/([^\/]*)\/blob\/(.*)/)
    if (!matches)
        continue // is a directory (href will have /tree/ instead of /blob/)

        const [_, user, repo, path] = matches
        const targetHref = `https://raw.githubusercontent.com/${user}/${repo}/refs/heads/${path}`

        // FIXME: this is not good for accesibility
        n.title = 'alt-click to open the file in raw.githubusercontent.com'

        n.addEventListener('click', altKeyAction.bind(null, openHere, targetHref))
        n.addEventListener('auxclick', altKeyAction.bind(null, openInNewTab, targetHref))
}

// Both these work immediately: GitHub SSR made this a whole lot easier
//console.log(document.getElementById('repos-file-tree'))
//console.log(document.getElementsByClassName('PRIVATE_TreeView-item'))

function removeSuffix(s, suffix) {
    if (s.endsWith(suffix))
        return s.substring(0, s.length - suffix.length)
        return null
}

const [_, user, repo, branch] = window.location.href.match(/^https?:\/\/github\.com\/([^\/]*)\/([^\/]*)\/(?:[^\/]*)\/([^\/]*)\//)
function hookFileTreeItem(item) {
    if (item.tagName !== 'LI')
        return
        if (item.getElementsByClassName('PRIVATE_TreeView-item-toggle').length > 0)
            return // is a directory

            // No <a> element available anywhere, but the id is <path/to/file>-item
            const path = removeSuffix(item.id, '-item')
            const targetHref = `https://raw.githubusercontent.com/${user}/${repo}/refs/heads/${branch}/${path}`

            // FIXME: this is not good for accesibility
            item.title = 'alt-click to open the file in raw.githubusercontent.com'

            item.addEventListener('click', altKeyAction.bind(null, openHere, targetHref))
            item.addEventListener('auxclick', altKeyAction.bind(null, openInNewTab, targetHref))
}

function hookSidebar() {
    const fileTree = document.getElementById('repos-file-tree')
    if (!fileTree)
        return false

        // Existing items
        for (const item of fileTree.getElementsByClassName('PRIVATE_TreeView-item')) {
            hookFileTreeItem(item)
        }

        // New items as they load
        // Yes, GitHub's code loads the subdirectory and inserts <ul> and then <li> one by one
        new MutationObserver(mutationList => {
            for (const m of mutationList) {
                if (m.target.tagName !== 'UL')
                    continue
                    for (const item of m.addedNodes) {
                        hookFileTreeItem(item)
                    }
            }
        }).observe(fileTree, { subtree: true, childList: true })

        return true
}

if (!hookSidebar()) {
    // Sidebar collapsed right now, wait until user clicks the expand button to try again
    const btn = document.querySelector('button[class^="ExpandFileTreeButton-"]')
    btn.addEventListener('click', e => {
        // Do this after all GitHub's js runs
        setTimeout(0, hookSidebar)
    }, { once: true })
}
