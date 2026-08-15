const REPO = 'SciGeoLight/dsh-desktop'
const RELEASE_API = `https://api.github.com/repos/${REPO}/releases/latest`
const RELEASE_PAGE = `https://github.com/${REPO}/releases/latest`
const STAR_URL = `https://github.com/${REPO}`

/** @type {Record<string, string>} */
const fallbackLinks = {
  windows: `${RELEASE_PAGE}/download/DSH-Desktop-1.0.0-windows-x64.exe`,
  windowsZip: `${RELEASE_PAGE}/download/DSH-Desktop-1.0.0-windows-x64.zip`,
  'mac-arm64': `${RELEASE_PAGE}/download/DSH-Desktop-1.0.0-mac-arm64.dmg`,
  'mac-x64': `${RELEASE_PAGE}/download/DSH-Desktop-1.0.0-mac-x64.dmg`,
}

/** @type {Record<string, string>} */
let downloadLinks = { ...fallbackLinks }

/** @type {string} */
let pendingPlatform = 'windows'

const labels = {
  windows: 'Windows x64 (.exe / .zip)',
  'mac-arm64': 'macOS Apple Silicon (.dmg)',
  'mac-x64': 'macOS Intel (.dmg)',
}

function detectPlatform() {
  const ua = navigator.userAgent || ''
  const platform = navigator.userAgentData?.platform || navigator.platform || ''
  const hay = `${ua} ${platform}`.toLowerCase()
  if (hay.includes('win')) return 'windows'
  if (hay.includes('mac')) {
    if (hay.includes('arm') || hay.includes('aarch64')) return 'mac-arm64'
    return 'mac-arm64'
  }
  return 'windows'
}

function openModal(platform) {
  pendingPlatform = platform
  const modal = document.getElementById('modal')
  const hint = document.getElementById('modal-hint')
  hint.textContent = `将下载：${labels[platform] || platform}`
  modal.hidden = false
  document.body.style.overflow = 'hidden'
}

function closeModal() {
  document.getElementById('modal').hidden = true
  document.body.style.overflow = ''
}

function startDownload(platform) {
  const url =
    downloadLinks[platform] ||
    (platform === 'windows' ? downloadLinks.windowsZip : '') ||
    RELEASE_PAGE
  const a = document.createElement('a')
  a.href = url
  a.rel = 'noreferrer'
  a.target = '_blank'
  document.body.appendChild(a)
  a.click()
  a.remove()
}

function matchAsset(name, platform) {
  const n = name.toLowerCase()
  if (platform === 'windows') {
    return n.includes('windows') && n.endsWith('.exe')
  }
  if (platform === 'windowsZip') {
    return n.includes('windows') && n.endsWith('.zip')
  }
  if (platform === 'mac-arm64') {
    return (n.includes('arm64') || n.includes('aarch64')) && n.endsWith('.dmg')
  }
  if (platform === 'mac-x64') {
    return (n.includes('x64') || n.includes('intel') || n.includes('amd64')) &&
      n.endsWith('.dmg') &&
      !n.includes('arm64')
  }
  return false
}

async function loadLatestRelease() {
  try {
    const res = await fetch(RELEASE_API, {
      headers: { Accept: 'application/vnd.github+json' },
    })
    if (!res.ok) return
    const data = await res.json()
    const assets = Array.isArray(data.assets) ? data.assets : []
    for (const platform of Object.keys(fallbackLinks)) {
      const asset = assets.find((item) => matchAsset(item.name || '', platform))
      if (asset?.browser_download_url) {
        downloadLinks[platform] = asset.browser_download_url
      }
    }
    if (!assets.find((item) => matchAsset(item.name || '', 'windows'))) {
      const zip = assets.find((item) => matchAsset(item.name || '', 'windowsZip'))
      if (zip?.browser_download_url) downloadLinks.windows = zip.browser_download_url
    }
  } catch {
    // keep fallbacks
  }
}

function bindUi() {
  document.getElementById('download-btn')?.addEventListener('click', () => {
    openModal(detectPlatform())
  })

  document.querySelectorAll('[data-platform]').forEach((el) => {
    el.addEventListener('click', () => openModal(el.getAttribute('data-platform') || 'windows'))
  })

  document.getElementById('modal-close')?.addEventListener('click', closeModal)
  document.getElementById('modal')?.addEventListener('click', (event) => {
    if (event.target === event.currentTarget) closeModal()
  })

  document.getElementById('try-btn')?.addEventListener('click', () => {
    startDownload(pendingPlatform)
    closeModal()
  })

  document.getElementById('star-btn')?.addEventListener('click', () => {
    // Open star page, then still offer download shortly after.
    window.setTimeout(() => startDownload(pendingPlatform), 600)
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal()
  })
}

bindUi()
loadLatestRelease()
