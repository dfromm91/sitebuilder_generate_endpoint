function generateHtmlDoc(data) {
  const { layout, content, styles = {}, resolution } = data;

  if (!resolution || !resolution.width || !resolution.height) {
    throw new Error("Missing resolution information. Please provide { width, height }.");
  }

  const { width: screenWidth, height: screenHeight } = resolution;
  const numRows = layout.length;
  const numCols = layout[0].length;

  // Calculate fixed cell size based on resolution
  const cellHeight = Math.floor(screenHeight / numRows);
  const cellWidth = Math.floor(screenWidth / numCols);

  let elementsHtml = "";
  const tagSet = new Set();
  const mergedElements = {};

  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      const key = layout[i][j];

      if (!key) continue; // Skip empty cells

      const [tag] = key.split(".");
      tagSet.add(tag);

      // Track the bounding box for merged elements
      if (!mergedElements[key]) {
        mergedElements[key] = {
          minRow: i,
          maxRow: i,
          minCol: j,
          maxCol: j,
          tag,
          innerContent: content[key] || "",
          styles: styles[key] || "",
        };
      } else {
        mergedElements[key].maxRow = Math.max(mergedElements[key].maxRow, i);
        mergedElements[key].maxCol = Math.max(mergedElements[key].maxCol, j);
      }
    }
  }

  // Generate merged elements
  for (let key in mergedElements) {
    const el = mergedElements[key];

    const top = el.minRow * cellHeight;
    const left = el.minCol * cellWidth;
    const width = (el.maxCol - el.minCol + 1) * cellWidth;
    const height = (el.maxRow - el.minRow + 1) * cellHeight;

    const mergedStyles = `
      position: absolute;
      top: ${top}px;
      left: ${left}px;
      width: ${width}px;
      height: ${height}px;
      margin: 0;
      display: block;
      ${el.styles}
    `;

    elementsHtml += `<${el.tag} style="${mergedStyles}">${el.innerContent}</${el.tag}>`;
  }

  // Ensure custom elements display properly
  const customTagsRule = Array.from(tagSet).join(", ") + " { display: block; }";

  // Construct final HTML document
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>generate html api test</title>
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
}

module.exports = generateHtmlDoc;
