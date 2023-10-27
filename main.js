import {
  isValidHex,
  convertToSixDigitHex,
  hexToRgb,
  rgbToHex,
  rgbToCmyk,
  rgbToHsl,
  rgbStringToHex,
  randomHexColor,
  generateShade,
  generateTone,
  generateTint,
} from "./utility.js"
import { getOptimalTextColor } from "./contrast.js"

/* ================= USABILITY FUNCTIONS ================= */

function debounce(func, wait) {
  /* The debounce function is a higher-order function that limits the rate at which a function can fire. This is especially useful for events that can fire at a high rate, such as the input or resize events. By using a debounce function, you can ensure that the actual function you want to run will only execute once after waiting for a specified amount of time since the last time it was invoked. */
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

function captureScreen() {
  const elementToCapture = document.querySelector(".clr-container")

  // Options for html2canvas to ignore specific elements
  const options = {
    ignoreElements: (element) => {
      // Return true for any element you want to ignore
      return (
        element.classList.contains("settings-modal") ||
        element.classList.contains("options-button-container") ||
        element.classList.contains("clr-bar") ||
        element.classList.contains("footer")
      )
    },
  }

  // Use html2canvas to take the screenshot with the provided options
  html2canvas(elementToCapture, options).then((canvas) => {
    // Convert the canvas to a data URL
    const imgURL = canvas.toDataURL("image/png")

    // Create a download link and trigger the download
    const downloadLink = document.createElement("a")
    downloadLink.href = imgURL
    downloadLink.download = "paletteshot.png"
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  })
}

/* ================= UI HANDLING ================= */

function setCopyrightYear() {
  const copyrightYear = document.getElementById("copyright-year")
  const year = new Date().getFullYear()

  copyrightYear.innerHTML = ""
  copyrightYear.innerHTML = year
}

/* update displayed color codes on main color box */
function updateColorDisplay(hexValue) {
  /* DOM Elements */
  const mainClrBox = document.getElementById("main-clr-box")
  const hexDisplayName = document.getElementById("hex-display-name")
  const rgbDisplayName = document.getElementById("rgb-display-name")
  const cmykDisplayName = document.getElementById("cmyk-display-name")
  const hslDisplayName = document.getElementById("hsl-display-name")

  /* ================= VALIDATION & CONVERTING ================= */
  if (isValidHex(hexValue)) {
    const convertedHex = convertToSixDigitHex(hexValue)
    const { r, g, b } = hexToRgb(convertedHex)
    const { c, m, y, k } = rgbToCmyk(r, g, b)
    const { h, s, l } = rgbToHsl(r, g, b)

    /* change backgroundColor of the main color box */
    mainClrBox.style.backgroundColor = convertedHex

    // Calculate the contrast color based on the background color
    const contrastColor = getOptimalTextColor(r, g, b)

    // Select all the text elements inside mainClrBox
    const textElements = mainClrBox.querySelectorAll("h2, p, .colorDetail span")

    // Loop through each text element and apply the contrast color
    textElements.forEach((element) => {
      element.style.color = contrastColor
    })

    /* return the input as 6-digit valid hex for display */
    hexDisplayName.innerHTML = ""
    hexDisplayName.innerHTML = convertedHex.toUpperCase().slice(1)

    /* return the rgb values for rgb display */
    rgbDisplayName.innerHTML = ""
    rgbDisplayName.innerHTML = `${r}, ${g}, ${b}`

    /* return the cmyk values for cmyk display */
    cmykDisplayName.innerHTML = ""
    cmykDisplayName.innerHTML = `${c}%, ${m}%, ${y}%, ${k}%`

    /* return the hsl values for HSL display */
    hslDisplayName.innerHTML = ""
    hslDisplayName.innerHTML = `${h}°, ${s}%, ${l}%`
  }
}

function generateVariationElements(hexValue, type) {
  const settingAmount = parseInt(
    document.getElementById(`${type}-setting-amount`).value,
    10
  )

  // Clear existing variation boxes first
  const existingVariationBoxes = document.querySelectorAll(
    `.${type}-variation-box`
  )
  existingVariationBoxes.forEach((box) => box.remove())

  if (isValidHex(hexValue)) {
    const convertedHex = convertToSixDigitHex(hexValue)
    const rgbValues = hexToRgb(convertedHex)

    let lastVariationHex = null // To keep track of the last generated variation

    for (let i = 0; i < settingAmount; i++) {
      const percentage = ((settingAmount - i) / settingAmount) * 100
      let variationRgb
      switch (type) {
        case "shade":
          variationRgb = generateShade(rgbValues, percentage)
          break
        case "tone":
          variationRgb = generateTone(rgbValues, percentage)
          break
        case "tint":
          variationRgb = generateTint(rgbValues, percentage)
          break
      }
      const variationHex = rgbToHex(
        variationRgb.r,
        variationRgb.g,
        variationRgb.b
      )

      if (variationHex === lastVariationHex) continue // Skip if it's the same as the last variation

      // create DOM element for variations
      const variationBox = document.createElement("div")
      variationBox.classList.add(`${type}-variation-box`)
      variationBox.style.backgroundColor = variationHex

      const hexCodeSpan = document.createElement("span")
      hexCodeSpan.textContent = variationHex

      // Calculate the contrast color for the current variation box
      const contrastColor = getOptimalTextColor(
        variationRgb.r,
        variationRgb.g,
        variationRgb.b
      )
      // Apply the contrast color to the hex code text
      hexCodeSpan.style.color = contrastColor

      variationBox.appendChild(hexCodeSpan)

      // Append the new div to the parent
      const variationSection = document.querySelector(
        `#${type}s-section .color-section-title`
      )
      variationSection.insertAdjacentElement("afterend", variationBox)

      lastVariationHex = variationHex // Update the last variation
    }
  }
}

/* ================= COPY HEXCODE - CLR BOX ================= */

// Function to handle click event on color box
function handleColorBoxClick(event) {
  // Get the background color of the clicked box
  const rgbColor = window.getComputedStyle(event.target).backgroundColor

  // Convert RGB to Hex
  const hexColor = rgbStringToHex(rgbColor)

  // Copy the hex color to clipboard
  navigator.clipboard
    .writeText(hexColor)
    .then(() => {
      console.log(`${hexColor} copied to clipboard`)
    })
    .catch((err) => {
      console.error("Could not copy text to clipboard", err)
    })

  /* Visual Feedback for User  */
  let copiedMessage = document.getElementById("copiedMessage")

  // If the element doesn't exist, recreate it
  if (!copiedMessage) {
    copiedMessage = document.createElement("div")
    copiedMessage.id = "copiedMessage"
    copiedMessage.className = "copied-message"
    copiedMessage.textContent = "Copied!"
    document.body.appendChild(copiedMessage)
  }

  event.target.style.position = "relative"
  event.target.appendChild(copiedMessage)
  copiedMessage.style.display = "block"

  // Add the clicked class to the clicked box
  event.target.classList.add("clicked")

  setTimeout(() => {
    copiedMessage.style.display = "none"
    // Remove the clicked class after the copied message disappears
    event.target.classList.remove("clicked")
  }, 2000)
}

/* ================= SETTINGS VARIABLES ================= */

function updateVariablePreview() {
  console.log("updating...")
  const clrName = document.getElementById("clr-setting-name").value || "primary"
  const shadeName =
    document.getElementById("shade-setting-name").value || "shade"
  const toneName = document.getElementById("tone-setting-name").value || "tone"
  const tintName = document.getElementById("tint-setting-name").value || "tint"

  const shadePreview = document.getElementById("shade-setting-variable-preview")
  const tonePreview = document.getElementById("tone-setting-variable-preview")
  const tintPreview = document.getElementById("tint-setting-variable-preview")

  shadePreview.textContent = `--${clrName}-${shadeName}10`
  tonePreview.textContent = `--${clrName}-${toneName}20`
  tintPreview.textContent = `--${clrName}-${tintName}10`
}

/* ================= GENERATE CSS VARIABLES f. EXPORT ================= */

function generateCSSVariables() {
  const clrName = document.getElementById("clr-setting-name").value || "primary"
  const shadeName =
    document.getElementById("shade-setting-name").value || "shade"
  const toneName = document.getElementById("tone-setting-name").value || "tone"
  const tintName = document.getElementById("tint-setting-name").value || "tint"

  const mainClrBox = document.getElementById("main-clr-box")
  const mainColor = window.getComputedStyle(mainClrBox).backgroundColor

  let cssVariables = `:root {\n  --${clrName}: ${rgbStringToHex(mainColor)};\n`

  const shades = document.querySelectorAll(".shade-variation-box")
  shades.forEach((shade, index) => {
    const color = window.getComputedStyle(shade).backgroundColor
    cssVariables += `  --${clrName}-${shadeName}${
      (index + 1) * 10
    }: ${rgbStringToHex(color)};\n`
  })

  const tones = document.querySelectorAll(".tone-variation-box")
  tones.forEach((tone, index) => {
    const color = window.getComputedStyle(tone).backgroundColor
    cssVariables += `  --${clrName}-${toneName}${
      (index + 1) * 10
    }: ${rgbStringToHex(color)};\n`
  })

  const tints = document.querySelectorAll(".tint-variation-box")
  tints.forEach((tint, index) => {
    const color = window.getComputedStyle(tint).backgroundColor
    cssVariables += `  --${clrName}-${tintName}${
      (index + 1) * 10
    }: ${rgbStringToHex(color)};\n`
  })

  cssVariables += "}"

  return cssVariables
}

/* ================= EVENT LISTENER ================= */

document.addEventListener("DOMContentLoaded", function () {
  /* ================= DOM - ELEMENTS ================= */
  const hexClrInput = document.getElementById("clr-input")
  const reloadButton = document.getElementById("reload-color")

  const clrSettingName = document.getElementById("clr-setting-name")
  const clrDisplayName = document.getElementById("clr-display-name")

  const settingsModal = document.querySelector(".settings-modal")
  const settingsButton = document.querySelector(".fa-gear").parentNode
  const closeButton = document.querySelector(".fa-xmark").parentNode

  /* setting Elements */
  const shadeSettingAmountInput = document.getElementById(
    "shade-setting-amount"
  )
  const toneSettingAmountInput = document.getElementById("tone-setting-amount")
  const tintSettingAmountInput = document.getElementById("tint-setting-amount")

  /* ================= RANDOM COLOR ================= */

  const randomColor = randomHexColor()
  hexClrInput.value = randomColor.slice(1).toUpperCase()

  /* ================= INITIAL ================= */

  // Call the function for initialization
  updateColorDisplay(randomColor)
  generateVariationElements(hexClrInput.value, "shade")
  generateVariationElements(hexClrInput.value, "tone")
  generateVariationElements(hexClrInput.value, "tint")
  updateVariablePreview()
  setCopyrightYear()

  /* ================= EVENTLISTENER ================= */

  reloadButton.addEventListener("click", () => {
    const randomColor = randomHexColor()
    hexClrInput.value = randomColor.slice(1).toUpperCase()

    updateColorDisplay(hexClrInput.value)
    generateVariationElements(hexClrInput.value, "shade")
    generateVariationElements(hexClrInput.value, "tone")
    generateVariationElements(hexClrInput.value, "tint")
  })

  document.addEventListener("keydown", (event) => {
    // Check if the pressed key is the spacebar
    if (event.code === "Space") {
      // Prevent the default behavior (e.g., page scrolling)
      event.preventDefault()

      const randomColor = randomHexColor()
      hexClrInput.value = randomColor.slice(1).toUpperCase()

      updateColorDisplay(hexClrInput.value)
      generateVariationElements(hexClrInput.value, "shade")
      generateVariationElements(hexClrInput.value, "tone")
      generateVariationElements(hexClrInput.value, "tint")
    }
  })

  hexClrInput.addEventListener(
    "input",
    debounce(() => {
      updateColorDisplay(hexClrInput.value)
      generateVariationElements(hexClrInput.value, "shade")
      generateVariationElements(hexClrInput.value, "tone")
      generateVariationElements(hexClrInput.value, "tint")
    }, 300)
  )

  shadeSettingAmountInput.addEventListener("input", () => {
    generateVariationElements(hexClrInput.value, "shade")
  })

  toneSettingAmountInput.addEventListener("input", () => {
    generateVariationElements(hexClrInput.value, "tone")
  })

  tintSettingAmountInput.addEventListener("input", () => {
    generateVariationElements(hexClrInput.value, "tint")
  })

  clrSettingName.addEventListener("input", () => {
    const name = clrSettingName.value
    if (name === "") {
      clrDisplayName.innerHTML = ""
    } else {
      clrDisplayName.innerHTML = ""
      clrDisplayName.innerHTML = `( ${name} )`
    }
  })

  /* Eventlistener for updating the Variables */
  document
    .getElementById("clr-setting-name")
    .addEventListener("input", updateVariablePreview)
  document
    .getElementById("shade-setting-name")
    .addEventListener("input", updateVariablePreview)
  document
    .getElementById("tone-setting-name")
    .addEventListener("input", updateVariablePreview)
  document
    .getElementById("tint-setting-name")
    .addEventListener("input", updateVariablePreview)

  settingsButton.addEventListener("click", function () {
    settingsModal.classList.add("active")
  })

  closeButton.addEventListener("click", function () {
    settingsModal.classList.remove("active")
  })

  document.getElementById("landscape-button").addEventListener("click", () => {
    const colorVarSection = document.querySelector(".color-variations-section")
    const colorSections = document.querySelectorAll(".color-section")

    const maxIcon = document.getElementById("maximize-icon")
    const minIcon = document.getElementById("minimize-icon")

    colorVarSection.classList.toggle("landscape")
    colorSections.forEach((section) => {
      section.classList.toggle("landscape")
    })

    maxIcon.classList.toggle("hidden")
    minIcon.classList.toggle("hidden")
  })

  /*
   * Event delegation for color variation boxes.
   *
   * Instead of attaching individual event listeners to each color box,
   * a single event listener is attached to their parent container ('color-variations-section').
   * When a color box is clicked, the event bubbles up to the parent container,
   * where it's determined if the clicked element was a color box (shade, tone, or tint).
   * If it was, the handleColorBoxClick function is invoked.
   */
  document
    .querySelector(".color-variations-section")
    .addEventListener("click", function (event) {
      // Check if the clicked element is a color box
      if (
        event.target.classList.contains("shade-variation-box") ||
        event.target.classList.contains("tone-variation-box") ||
        event.target.classList.contains("tint-variation-box")
      ) {
        handleColorBoxClick(event)
      }
    })

  /* EventListener to save palette as picture */
  document
    .getElementById("save-as-image")
    .addEventListener("click", captureScreen)

  /* Eventlistener for export of CSS variables */
  document
    .getElementById("export-variables-button")
    .addEventListener("click", function () {
      const cssVariables = generateCSSVariables()
      navigator.clipboard
        .writeText(cssVariables)
        .then(() => {
          console.log("CSS Variables copied to clipboard!")

          // Show the tooltip within the settings modal
          const settingsModal = document.querySelector(".settings-modal")
          const tooltip = document.querySelector(".export-success-tooltip")
          settingsModal.appendChild(tooltip)
          tooltip.style.display = "block"

          // Hide the tooltip after 2 seconds
          setTimeout(() => {
            tooltip.style.display = "none"
          }, 3000)
        })
        .catch((err) => {
          console.error("Could not copy CSS to clipboard", err)
        })
    })
})
