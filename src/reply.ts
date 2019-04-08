const NEW_LINE = '\r\n';

export type ReplyCode = 100
| 110
| 120
| 125
| 150
| 200
| 202
| 211
| 212
| 213
| 214
| 215
| 220
| 221
| 225
| 226
| 227
| 230
| 232
| 234
| 250
| 257
| 331
| 332
| 350
| 421
| 425
| 426
| 450
| 451
| 452
| 500
| 501
| 502
| 503
| 504
| 530
| 532
| 533
| 536
| 550
| 551
| 552
| 553;

export function formatReply(code: ReplyCode, ...lines: string[]) {
    if (lines.length === 0) {
        return `${code}${NEW_LINE}`;
    }

    if (lines.length === 1) {
        return `${code} ${lines[0]}${NEW_LINE}`;
    }

    const [firstLine, ...remainingLines] = lines;
    const lastLine = remainingLines.pop();

    const startsWithNumbers = /^\d+/;
    const formattedLines = remainingLines.map((line) => {
        if (startsWithNumbers.test(line)) {
            return `\t${line}`
        } else {
            return line;
        }
    });

    const reply = [
        `${code}-${firstLine}`,
        ...formattedLines,
        `${code} ${lastLine}`
    ];
    return `${reply.join(NEW_LINE)}${NEW_LINE}`;
}