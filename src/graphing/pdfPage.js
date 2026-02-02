const d3 = require('d3')

const getMonthYear = () => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const now = new Date()
  return `${months[now.getMonth()]} ${now.getFullYear()}`
}

const addPdfCoverTitle = (title) => {
  const dateStr = getMonthYear()
  d3.select('main #pdf-cover-page .pdf-title').text('Technology Radar')
  d3.select('main #pdf-cover-page .pdf-subtitle').text(title || '')
  d3.select('main #pdf-cover-page .pdf-date').text(dateStr)
}

const addRadarLinkInPdfView = () => {
  d3.select('#generated-radar-link').attr('href', window.location.href)
}

const addQuadrantNameInPdfView = (order, quadrantName) => {
  d3.select(`.quadrant-table.${order}`)
    .insert('div', ':first-child')
    .attr('class', 'quadrant-table__name')
    .text(quadrantName)
}

const cloneRadarForPdf = () => {
  const radarPlot = document.querySelector('#radar-plot')
  const pdfRadarContainer = document.querySelector('#pdf-index-page .pdf-radar-snapshot')

  if (radarPlot && pdfRadarContainer) {
    // Clone the radar SVG
    const radarClone = radarPlot.cloneNode(true)
    radarClone.removeAttribute('id')
    radarClone.setAttribute('class', 'pdf-radar-clone')

    // Reset all quadrant transforms to show full radar
    const quadrantGroups = radarClone.querySelectorAll('.quadrant-group')
    quadrantGroups.forEach(group => {
      group.style.opacity = '1'
      group.style.transform = ''
      group.removeAttribute('transform')
      // Remove any inline style transforms
      group.style.cssText = 'opacity: 1 !important;'
    })

    // Make all blips visible
    const blipLinks = radarClone.querySelectorAll('.blip-link')
    blipLinks.forEach(blip => {
      blip.style.opacity = '1'
    })

    // Ensure SVG has proper dimensions for print
    const width = radarClone.getAttribute('width') || radarClone.viewBox?.baseVal?.width || 800
    const height = radarClone.getAttribute('height') || radarClone.viewBox?.baseVal?.height || 800
    radarClone.style.width = '100%'
    radarClone.style.height = 'auto'
    radarClone.style.maxWidth = '500px'

    pdfRadarContainer.innerHTML = ''
    pdfRadarContainer.appendChild(radarClone)
  }
}

const generatePdfIndexPage = () => {
  // First clone the radar visualization
  cloneRadarForPdf()

  const indexContainer = d3.select('#pdf-index-page .pdf-index-content')
  indexContainer.html('')

  const quadrantOrder = ['first', 'second', 'third', 'fourth']
  const quadrantClasses = {
    first: 'quadrant-techniques',
    second: 'quadrant-platforms',
    third: 'quadrant-tools',
    fourth: 'quadrant-languages'
  }

  quadrantOrder.forEach((order) => {
    const quadrantTable = d3.select(`.quadrant-table.${order}`)
    if (quadrantTable.empty()) return

    const quadrantName = quadrantTable.select('.quadrant-table__name').text()
    if (!quadrantName) return

    const quadrantDiv = indexContainer.append('div')
      .attr('class', 'pdf-index-quadrant')

    quadrantDiv.append('h3')
      .attr('class', quadrantClasses[order])
      .text(quadrantName)

    // Get all rings in this quadrant
    const rings = quadrantTable.selectAll('.quadrant-table__ring-name')
    rings.each(function() {
      const ringElement = d3.select(this)
      const ringName = ringElement.text()
      const ringList = ringElement.node().nextElementSibling

      if (!ringList || ringList.tagName !== 'UL') return

      const blipItems = d3.select(ringList).selectAll('.blip-list__item-container')
      if (blipItems.empty()) return

      const ringDiv = quadrantDiv.append('div')
        .attr('class', 'pdf-index-ring')

      ringDiv.append('h4').text(ringName)

      const itemList = ringDiv.append('ul')

      blipItems.each(function() {
        const blipContainer = d3.select(this)
        const blipId = blipContainer.attr('data-blip-id')
        const nameElement = blipContainer.select('.blip-list__item-container__name-value')
        const blipName = nameElement.text()

        if (blipName) {
          const listItem = itemList.append('li')
          listItem.append('a')
            .attr('href', `#blip-description-${blipId}`)
            .text(blipName.replace(/^\d+\.\s*/, ''))
        }
      })
    })
  })
}

const loadThemesContent = async () => {
  try {
    const response = await fetch('/files/themes.csv')
    if (!response.ok) {
      console.warn('themes.csv not found, using default content')
      return
    }
    const csvText = await response.text()
    const themes = d3.csvParse(csvText)

    const themesContainer = d3.select('#pdf-themes-page .pdf-themes-content')
    themesContainer.html('')

    themes.forEach((theme, index) => {
      const themeDiv = themesContainer.append('div')
        .attr('class', 'pdf-theme-item')

      themeDiv.append('h3')
        .attr('class', 'pdf-theme-title')
        .text(`${index + 1}. ${theme.title}`)

      themeDiv.append('p')
        .attr('class', 'pdf-theme-description')
        .text(theme.description)
    })
  } catch (error) {
    console.warn('Error loading themes.csv:', error)
  }
}

const loadAboutContent = async () => {
  try {
    const response = await fetch('/files/about.csv')
    if (!response.ok) {
      console.warn('about.csv not found, using default content')
      return
    }
    const csvText = await response.text()
    const sections = d3.csvParse(csvText)

    const aboutContainer = d3.select('#pdf-about-page .pdf-about-content')
    aboutContainer.html('')

    sections.forEach((section) => {
      const sectionDiv = aboutContainer.append('div')
        .attr('class', 'pdf-about-section')

      sectionDiv.append('h3')
        .attr('class', 'pdf-about-section-title')
        .text(section.section)

      sectionDiv.append('p')
        .attr('class', 'pdf-about-section-content')
        .text(section.content)
    })
  } catch (error) {
    console.warn('Error loading about.csv:', error)
  }
}

const initializePdfContent = async () => {
  await Promise.all([
    loadThemesContent(),
    loadAboutContent()
  ])
}

module.exports = {
  addPdfCoverTitle,
  addQuadrantNameInPdfView,
  addRadarLinkInPdfView,
  initializePdfContent,
  loadThemesContent,
  loadAboutContent,
  generatePdfIndexPage
}
