/**
 * PDF Report Generation and Download utilities
 */

import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

/**
 * Generate PDF from HTML element
 */
export async function generatePDFFromHTML(elementId, fileName = 'report.pdf') {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`)
    }

    // Convert HTML to canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })

    // Create PDF
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const imgWidth = 210 // A4 width in mm
    const pageHeight = 295 // A4 height in mm
    let imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 0

    // Add images to PDF (multiple pages if needed)
    while (heightLeft >= 0) {
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      position = heightLeft

      if (heightLeft > 0) {
        pdf.addPage()
      }
    }

    // Download
    pdf.save(fileName)
  } catch (err) {
    console.error('PDF generation failed:', err)
    throw err
  }
}

/**
 * Download PDF file from URL
 */
export function downloadPDFFile(blob, fileName = 'report.pdf') {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Generate summary data for PDF
 */
export function generateReportData(analysisResult, userProfile = {}) {
  return {
    user: {
      name: userProfile.name || 'User',
      email: userProfile.email || 'Not provided',
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    analysis: analysisResult,
    sections: {
      overview: true,
      conditions: true,
      recommendations: true,
      routine: true
    }
  }
}

/**
 * Share report via social media or email
 */
export function shareReport(title, text, url = '') {
  if (navigator.share) {
    navigator.share({
      title: title || 'DermAI Skin Report',
      text: text || 'Check out my skin analysis report from DermAI',
      url: url || window.location.href
    }).catch(err => console.log('Share failed:', err))
  } else {
    // Fallback: copy to clipboard
    const shareText = text || 'DermAI Skin Report'
    navigator.clipboard.writeText(shareText).then(() => {
      console.log('Text copied to clipboard')
    })
  }
}

export default {
  generatePDFFromHTML,
  downloadPDFFile,
  generateReportData,
  shareReport
}
