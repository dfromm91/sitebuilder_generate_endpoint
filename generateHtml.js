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

  // Tracking element positions for merging
  const mergedElements = {};
  const individualElements = [];

  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      const key = layout[i][j];

      if (!key) continue; // Skip empty cells

      const [tag] = key.split(".");
      tagSet.add(tag);

      const top = i * cellHeight;
      const left = j * cellWidth;

      // Elements that should be merged (header, footer, nav, etc.)
      if (tag === "header" || tag === "footer" || tag === "nav") {
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
      } else {
        // Elements that appear multiple times, like <p>, should remain separate
        individualElements.push({
          tag,
          innerContent: content[key] || "",
          styles: styles[key] || "",
          top,
          left,
          width: cellWidth,
          height: cellHeight,
        });
      }
    }
  }

  // Generate merged elements (headers, footers, etc.)
  for (let key in mergedElements) {
    const el = mergedElements[key];

    const top = el.minRow * cellHeight;
    const left = el.minCol * cellWidth;
    const width = (el.maxCol - el.minCol + 1) * cellWidth; // Corrected width span
    const height = (el.maxRow - el.minRow + 1) * cellHeight; // Corrected height span

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

  // Generate individual elements (paragraphs, divs, etc.)
  for (const el of individualElements) {
    const elStyles = `
      position: absolute;
      top: ${el.top}px;
      left: ${el.left}px;
      width: ${el.width}px;
      height: ${el.height}px;
      margin: 0;
      display: block;
      ${el.styles}
    `;

    elementsHtml += `<${el.tag} style="${elStyles}">${el.innerContent}</${el.tag}>`;
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
}

module.exports = generateHtmlDoc;
