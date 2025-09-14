// Minimal CSV parser that supports:
// - Commas inside quoted fields
// - Double quote escaping ("") inside quoted fields
// - CRLF or LF newlines
// Returns an array of rows; each row is an array of string cells
export function parseCSV(input: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let i = 0
  const s = input
  const n = s.length
  let inQuotes = false

  while (i < n) {
    const ch = s[i]

    if (inQuotes) {
      if (ch === '"') {
        // Lookahead for escaped quote
        if (i + 1 < n && s[i + 1] === '"') {
          cell += '"'
          i += 2
          continue
        } else {
          inQuotes = false
          i++
          continue
        }
      } else {
        cell += ch
        i++
        continue
      }
    } else {
      if (ch === '"') {
        inQuotes = true
        i++
        continue
      }
      if (ch === ',') {
        row.push(cell)
        cell = ''
        i++
        continue
      }
      if (ch === '\n' || ch === '\r') {
        // Finish cell and row
        row.push(cell)
        cell = ''
        // Skip paired CRLF/LFCR
        if (ch === '\r' && i + 1 < n && s[i + 1] === '\n') i++
        if (ch === '\n' && i + 1 < n && s[i + 1] === '\r') i++
        rows.push(row)
        row = []
        i++
        continue
      }
      cell += ch
      i++
    }
  }

  // Push last cell/row
  row.push(cell)
  rows.push(row)

  // Trim any trailing empty last row caused by terminal newline
  if (rows.length && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') {
    rows.pop()
  }
  return rows
}

