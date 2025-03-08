const fs = require("fs");

function generateHtmlDoc(data) {
  const { layout, content, styles = {}, resolution } = data;

  if (!resolution || !resolution.width || !resolution.height) {
    throw new Error(
      "Missing resolution information. Please provide { width, height }."
    );
  }

  const { width: screenWidth, height: screenHeight } = resolution;

  const numRows = layout.length;
  const numCols = layout[0].length;

  // Calculate fixed cell size based on provided resolution
  const cellHeight = Math.floor(screenHeight / numRows);
  const cellWidth = Math.floor(screenWidth / numCols);

  // Compute bounding boxes for each unique element
  const elements = {};
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      const key = layout[i][j];
      if (!elements[key]) {
        elements[key] = { minRow: i, maxRow: i, minCol: j, maxCol: j };
      } else {
        elements[key].minRow = Math.min(elements[key].minRow, i);
        elements[key].maxRow = Math.max(elements[key].maxRow, i);
        elements[key].minCol = Math.min(elements[key].minCol, j);
        elements[key].maxCol = Math.max(elements[key].maxCol, j);
      }
    }
  }

  let elementsHtml = "";
  const tagSet = new Set();

  for (let key in elements) {
    const pos = elements[key];
    const top = pos.minRow * cellHeight;
    const left = pos.minCol * cellWidth;
    const height = (pos.maxRow - pos.minRow + 1) * cellHeight;
    const width = (pos.maxCol - pos.minCol + 1) * cellWidth;

    // Base styles (Fixed absolute positioning using provided resolution)
    const baseStyles = `
        position: absolute;
        top: ${top}px;
        left: ${left}px;
        width: ${width}px;
        height: ${height}px;
        margin: 0;
        display: block;
      `;

    // Append custom styles
    const customStyles = styles[key] || "";
    const finalStyles = baseStyles + customStyles;

    // Extract tag name (e.g., "h2" from "h2.0")
    const [tag] = key.split(".");
    tagSet.add(tag);
    const innerContent = content[key] || "";

    elementsHtml += `<${tag} style="${finalStyles}">${innerContent}</${tag}>`;
  }

  // Ensure all custom elements display correctly
  const customTagsRule = Array.from(tagSet).join(", ") + " { display: block; }";

  // Construct final HTML document
  const htmlDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fixed Monitor Layout</title>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            width: ${screenWidth}px;
            height: ${screenHeight}px;
          }
          .container {
            position: fixed;
            top: 0;
            left: 0;
            width: ${screenWidth}px;
            height: ${screenHeight}px;
          }
          ${customTagsRule}
        </style>
      </head>
      <body>
        <div class="container">
          ${elementsHtml}
        </div>
      </body>
    </html>
    `;

  return htmlDoc;
}
module.exports = generateHtmlDoc;
