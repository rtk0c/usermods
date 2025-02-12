// ==UserScript==
// @name        GitHub open file raw
// @namespace   https://github.com/rtk0c
// @match       https://github.com/*
// @grant       none
// @version     4.0
// @author      rtk0c
// @description Open files in raw.githubusercontent.com by holding alt
// @run-at      document-idle
// ==/UserScript==

const theTooltip = 'alt-click to open the file in raw.githubusercontent.com'

// All of these work immediately upon page load: GitHub SSR made this a whole lot easier
//   document.querySelectorAll('a.Link--primary')
//   document.getElementById('repos-file-tree')
//   document.getElementsByClassName('PRIVATE_TreeView-item')

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

  n.title = theTooltip // Inaccesible
  n.addEventListener('click', altKeyAction.bind(null, openHere, targetHref))
  n.addEventListener('auxclick', altKeyAction.bind(null, openInNewTab, targetHref))
}

function removeSuffix(s, suffix) {
  if (s.endsWith(suffix))
    return s.substring(0, s.length - suffix.length)
  return null
}

// FIXME internal navigation in the sidebar (clicking on any file or directory) is SPA,
//       replacing main file list DOM nodes without triggering refresh, so the above code doesn't run on the new files

const [_, user, repo, branch] = window.location.href.match(/^https?:\/\/github\.com\/([^\/]*)\/([^\/]*)\/(?:[^\/]*)\/([^\/]*)\//)
function hookFileTreeItem(item) {
  if (item.getElementsByClassName('PRIVATE_TreeView-item-toggle').length > 0)
    return // is a directory

  // No <a> element available anywhere, but the id is <path/to/file>-item
  const path = removeSuffix(item.id, '-item')
  const targetHref = `https://raw.githubusercontent.com/${user}/${repo}/refs/heads/${branch}/${path}`

  item.title = theTooltip // Inaccesible
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
      for (const item of m.addedNodes) {
        if (item.tagName === 'LI') {
          // Inserted by arrow expand
          hookFileTreeItem(item)
        } else if (item.tagName === 'UL') {
          // Inserted by click to nav into directory
          for (const li of item.children) {
            hookFileTreeItem(li)
          }
        }
      }
    }
  }).observe(fileTree, { subtree: true, childList: true })

  return true
}

if (!hookSidebar()) {
  // Sidebar collapsed right now, wait until user clicks the expand button to try again
  const btn = document.querySelector('button[class*="ExpandFileTreeButton-"]')
  btn.addEventListener('click', e => {
    // Do this after all GitHub's js runs
    setTimeout(hookSidebar, 0)
  }, { once: true })
}
