const STARTS_WITH_THREE_DIGITS = /^\d{3}/;

const CR = '\r';
const LF = '\n';
const EOL = CR + LF;

export function formatReply(code: number, lines: string[]): string {
  if (lines.length <= 1) {
    return [code, ...lines].join(' ') + EOL;
  }

  const formattedLines = lines.reduce((message, line, i) => {
    const seperator = lines.length -1 === i ? ' ' : '-';

    let prefix = '';
    if (i === 0) {
      prefix = `${code}${seperator}`;
    } else if (i === lines.length -1) {
      prefix = `${code} `
    } else if (STARTS_WITH_THREE_DIGITS.test(line)) {
      prefix = `  `;
    }

    return [
      ...message,
      `${prefix}${line}`
    ];
  }, []);

  const message = formattedLines.join(EOL);
  return message + EOL;
}
