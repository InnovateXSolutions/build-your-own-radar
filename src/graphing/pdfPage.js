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
  d3.select('.pdf-page-footer .footer-date').text(dateStr)
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
  loadAboutContent
}
