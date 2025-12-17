import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1449760294829162496',
})

enum ActivityAssets {
  Logo = 'https://i.imgur.com/STuSvM6.png',
  Settings = 'https://i.imgur.com/9CpeAQq.png',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const { pathname, href, search } = document.location
  const showButtons = await presence.getSetting<boolean>('buttons')
  const params = new URLSearchParams(search)

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    details: 'Browsing Comix',
    smallImageKey: Assets.Search,
  }

  // Title or Chapter pages
  if (pathname.startsWith('/title/')) {
    const title = document.querySelector<HTMLHeadingElement>('.comic-info .title')?.textContent?.trim()
      || document.querySelector<HTMLHeadingElement>('h1.title')?.textContent?.trim()
    const poster = document.querySelector<HTMLImageElement>('.poster img')?.src
      || document.querySelector<HTMLImageElement>('img[itemProp="image"]')?.src

    const pathSegments = pathname.split('/').filter(Boolean)
    const isChapterPage = pathSegments.length >= 3 // /title/slug/chapter-id

    if (isChapterPage) {
      const chapterText = document.querySelector<HTMLDivElement>('.number.me-2')?.textContent?.trim()
      const chapterNumber = chapterText?.match(/Ch\.\s*(\d+)/)?.[1]

      if (chapterNumber) {
        presenceData.details = `Reading Chapter ${chapterNumber}`
        presenceData.smallImageKey = Assets.Reading
        if (title)
          presenceData.state = title
        if (poster)
          presenceData.largeImageKey = poster
        if (showButtons)
          presenceData.buttons = [{ label: 'Read Chapter', url: href }]
      }
    }
    else if (title) {
      presenceData.details = 'Viewing Details'
      presenceData.state = title
      presenceData.smallImageKey = Assets.Viewing
      if (poster)
        presenceData.largeImageKey = poster
      if (showButtons)
        presenceData.buttons = [{ label: 'View Manga', url: href }]
    }
  }
  else {
    if (pathname.startsWith('/groups/')) {
      presenceData.details = 'Viewing Popular Scanlation Groups'
      presenceData.smallImageKey = Assets.Viewing
    }
    else {
      switch (pathname) {
        case '/filter': {
          presenceData.details = 'Managing Filter Settings'
          presenceData.smallImageKey = ActivityAssets.Settings
          break
        }
        case '/browser': {
          if (params.toString())
            presenceData.details = 'Browsing With Filters'
          break
        }
        case '/user': {
          presenceData.details = 'Managing User Profile'
          presenceData.smallImageKey = ActivityAssets.Settings
          break
        }
        case '/user/history': {
          presenceData.details = 'Managing Reading History'
          presenceData.smallImageKey = Assets.Viewing
          break
        }
        case '/user/settings': {
          presenceData.details = 'Managing User Settings'
          presenceData.smallImageKey = ActivityAssets.Settings
          break
        }
        case '/groups/popular': {
          presenceData.details = 'Viewing Popular Scanlation Groups'
          presenceData.smallImageKey = Assets.Viewing
          break
        }
        case '/genres': {
          presenceData.details = 'Browsing Genres'
          presenceData.smallImageKey = Assets.Search
          break
        }
        case '/user/bookmarks': {
          const tab = params.get('tab')
          switch (tab) {
            case 'import': {
              presenceData.details = 'Importing List'
              presenceData.smallImageKey = Assets.Uploading
              break
            }
            case 'export': {
              presenceData.details = 'Exporting List'
              presenceData.smallImageKey = Assets.Downloading
              break
            }
            case 'folder': {
              presenceData.details = 'Managing User Folders'
              presenceData.smallImageKey = ActivityAssets.Settings
              break
            }
            default: {
              presenceData.details = 'Managing Bookmarks'
              presenceData.smallImageKey = ActivityAssets.Settings
              break
            }
          }
          break
        }
        default: {
          break
        }
      }
    }
  }

  presence.setActivity(presenceData)
})
