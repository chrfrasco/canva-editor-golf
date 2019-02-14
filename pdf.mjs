import { Element } from './design';
import { colors } from './colors';

const EOL = Buffer.from([0x0d, 0x0a]).toString();
const lines = (...text) => text.join(EOL) + EOL;

const HIGH_BIT_CHARS = Buffer.from([0xc2, 0xa5, 0xc2, 0xb1, 0xc3, 0xab]).toString();

const pxToPt = px => ~~((px * 72) / 96);

const FONT_SIZE_PT = pxToPt(16);

const RgColorSpace = {
  from(color) {
    let hex = colors[color];
    if (hex == null) {
      hex = '#000000';
    }

    const [r, g, b] = RgColorSpace.fromHex(hex);
    // `rg` command sets the color space to r,g,b
    return `${r} ${g} ${b} rg`;
  },
  fromHex(hex) {
    if (hex.length !== 7) {
      throw new Error('hex string should be length 7');
    }

    const digitRegex = /#(..)(..)(..)/;
    const [_, r, g, b] = digitRegex.exec(hex);

    return [r, g, b].map(c => parseInt(c, 16) / 0xff); // 0.0 -> 1.0
  },
};

const Stream = {
  for(element, designHeight) {
    switch (element.type) {
      case 'text':
        return Stream.text(element, designHeight);
      case 'rect':
        return Stream.rect(element, designHeight);
      default:
        throw new Error(`unrecognized element type "${element.type}"`);
    }
  },
  text(element, designHeight) {
    return `BT
  0 0 0 rg
  /F1 ${FONT_SIZE_PT} Tf
  ${pxToPt(element.attrs.x)} ${pxToPt(designHeight - element.attrs.y - FONT_SIZE_PT)} Td
  (${element.attrs.text}) Tj
ET`;
  },
  rect(element, designHeight) {
    const { color, width, height, x, y } = element.attrs;
    return lines(
      RgColorSpace.from(color),
      // `re` command takes "x y width height" as args and constructs a rectangular path
      `${pxToPt(x)} ${pxToPt(designHeight - y - height)} ${pxToPt(width)} ${pxToPt(height)} re`,
      // `f` command fills the path with the color (determined by the color space)
      'f',
    );
  },
};

const PdfObject = {
  from(element, num, designHeight) {
    const stream = Stream.for(element, designHeight);
    const streamLength = Buffer.from(stream).length;

    const body = `${num} 0 obj
<< /Length ${streamLength} >>
stream
${stream}
endstream
endobj`;

    return { body, num };
  },
};

export const Pdf = {
  from(design) {
    const numBuiltinObjects = 4; // object 0, catalog, pages, & page
    const objects = design.elements.map((element, i) =>
      PdfObject.from(element, i + numBuiltinObjects, design.dimensions.height),
    );
    return lines(
      // header
      '%PDF-1.1',
      `%${HIGH_BIT_CHARS}`,

      // catalog dictionary
      '  1 0 obj',
      '    << /Type /Catalog',
      '       /Pages 2 0 R', // the root pages object is object 2, gen 0
      '    >>',
      '  endobj',

      // pages dictionary
      '  2 0 obj',
      '    << /Type /Pages',
      '       /Kids [3 0 R]', // the array of pages is object 3, gen 0
      '       /Count 1', // one page in the document
      `       /MediaBox [0 0 ${pxToPt(design.dimensions.width)} ${pxToPt(design.dimensions.height)}]`, // global page size, measured bottom left to top right
      '    >>',
      '  endobj',

      // page 1 dictionary
      '3 0 obj',
      '  <<  /Type /Page',
      '      /Parent 2 0 R', // link back to the parent "pages" dict
      '      /Resources',
      '      << /Font',
      '          << /F1',
      '              << /Type /Font',
      '                  /Subtype /Type1',
      '                  /BaseFont /Times-Roman', // you can have any font you want, as long as it's times new roman
      '              >>',
      '          >>',
      '      >>',
      `      /Contents [ ${lines(...objects.map(({ num }) => `${num} 0 R`))}      ]`,
      '  >>',
      'endobj',

      lines(...objects.map(({ body }) => body)),

      'xref',
      `0 ${objects.length + numBuiltinObjects}`,
      '0000000000 65535 f ', // the cross-reference for the mysterious object 0

      /**
       * there's meant to be more rows in the "cross reference table" (xref) that
       * tells the PDF interpreter where to find indirect objects in the document.
       * they're really annoying to calculate & chrome, preview and spotlight all
       * render PDFs perfectly without them so :yolo:
       */

      'trailer',
      '  << /Root 1 0 R',
      `     /Size ${objects.length + numBuiltinObjects}`,
      '  >>',
      'startxref',
      '0', // this is mean to be the number of bytes till the xref table, but it's annoying to calculate so, again, :yolo:
      '%%EOF',
    );
  },
};

const design = {
  dimensions: {
    width: 750,
    height: 400,
  },
  elements: [Element.new('rect'), Element.new('text')],
};

console.log(Pdf.from(design));
