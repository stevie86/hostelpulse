import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import Button from './Button'
import { parseCSV, stringifyCSV } from '../utils/csv'

interface CSVImportExportProps {
  type: 'guests' | 'bookings'
  onImportSuccess?: (result: any) => void
}

export default function CSVImportExport({ type, onImportSuccess }: CSVImportExportProps) {
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importResult, setImportResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<{ rows: string[][]; deduped: string[][]; duplicates: number } | null>(null)

  async function handleExport() {
    setExporting(true)
    setError(null)
    try {
      let response = await fetch(`/api/export/${type}`)
      if (!response.ok) response = await fetch(`/api/csv/${type}`)
      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch {
      setError('Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.csv')) {
      setError('Please select a CSV file')
      return
    }
    ;(async () => {
      setError(null)
      setImportResult(null)
      try {
        const text = await file.text()
        const rows = parseCSV(text)
        if (!rows.length) throw new Error('Empty CSV')
        const header = rows[0].map(h => h.trim().toLowerCase())
        // Build a set of unique keys to dedupe within the uploaded file
        const seen = new Set<string>()
        const keep: string[][] = [rows[0]]
        let duplicates = 0
        for (let i = 1; i < rows.length; i++) {
          const r = rows[i]
          if (!r || r.every(c => (c ?? '').trim() === '')) continue
          let key = ''
          if (type === 'guests') {
            const emailIdx = header.indexOf('email')
            const email = (emailIdx >= 0 ? r[emailIdx] : '').trim().toLowerCase()
            key = `guest:${email}`
          } else {
            const H = (k: string) => header.indexOf(k)
            const guest = (H('guest_email') >= 0 ? r[H('guest_email')] : '').trim().toLowerCase()
            const room = (H('room_name') >= 0 ? r[H('room_name')] : '').trim().toLowerCase()
            const bed = (H('bed_name') >= 0 ? r[H('bed_name')] : '').trim().toLowerCase()
            const ci = (H('check_in') >= 0 ? r[H('check_in')] : '').trim()
            const co = (H('check_out') >= 0 ? r[H('check_out')] : '').trim()
            const st = (H('status') >= 0 ? r[H('status')] : 'confirmed').trim().toLowerCase()
            key = `booking:${guest}|${room}|${bed}|${ci}|${co}|${st}`
          }
          if (key && seen.has(key)) { duplicates++; continue }
          if (key) seen.add(key)
          keep.push(r)
        }
        setPreview({ rows, deduped: keep, duplicates })
      } catch (e: any) {
        setError(e.message || 'Failed to parse CSV')
      } finally {
        event.target.value = ''
      }
    })()
  }

  async function confirmImport() {
    if (!preview) return
    setImporting(true)
    setError(null)
    setImportResult(null)
    try {
      const csv = stringifyCSV(preview.deduped)
      const response = await fetch(`/api/csv/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Import failed')
      setImportResult(result.message)
      setPreview(null)
      onImportSuccess?.(result)
    } catch (e: any) {
      setError(e.message || 'Import failed. Please check your CSV format.')
    } finally {
      setImporting(false)
    }
  }

  return (
    <Container>
      <Title>CSV {type.charAt(0).toUpperCase() + type.slice(1)}</Title>
      <Actions>
        <Button onClick={handleExport} disabled={exporting} style={{ marginRight: '1rem' }}>
          {exporting ? 'Exporting...' : `Export ${type.charAt(0).toUpperCase() + type.slice(1)}`}
        </Button>
        <FileInputWrapper>
          <FileInput type="file" accept=".csv" onChange={handleImport} disabled={importing} id={`csv-import-${type}`} />
          <FileInputLabel htmlFor={`csv-import-${type}`}>
            {importing ? 'Importing...' : `Import ${type.charAt(0).toUpperCase() + type.slice(1)}`}
          </FileInputLabel>
        </FileInputWrapper>
      </Actions>
      {preview && (
        <PreviewBox>
          <strong>Preview</strong>
          <div>{`Rows: ${preview.rows.length - 1} (excluding header)`}</div>
          <div>{`Duplicates removed in file: ${preview.duplicates}`}</div>
          <PreviewTable>
            <thead>
              <tr>
                {preview.deduped[0].map((h, i) => (<th key={i}>{h}</th>))}
              </tr>
            </thead>
            <tbody>
              {preview.deduped.slice(1, 11).map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, ci) => (<td key={ci}>{c}</td>))}
                </tr>
              ))}
            </tbody>
          </PreviewTable>
          <PreviewActions>
            <Button as="button" onClick={confirmImport} disabled={importing}>Confirm import</Button>
            <Button as="button" onClick={() => setPreview(null)} style={{ background: 'transparent', color: 'inherit', border: '1px solid var(--border)' }}>Cancel</Button>
          </PreviewActions>
        </PreviewBox>
      )}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {importResult && <SuccessMessage>{importResult}</SuccessMessage>}
      <Instructions>
        <strong>CSV Format:</strong>
        {type === 'guests' ? (
          <div>name, email, phone, notes</div>
        ) : (
          <div>guest_email, room_name, bed_name, check_in, check_out, status, notes</div>
        )}
      </Instructions>
    </Container>
  )
}

const Container = styled.div`
  padding: 1.5rem;
  background: rgb(var(--cardBackground));
  border-radius: 0.8rem;
  border: 1px solid rgb(var(--border));
`
const Title = styled.h3`
  margin: 0 0 1rem;
  font-size: 1.6rem;
  font-weight: 600;
`
const Actions = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  @media (max-width: 480px) { flex-direction: column; }
`
const FileInputWrapper = styled.div` position: relative; overflow: hidden; display: inline-block; `
const FileInput = styled.input` position: absolute; left: -9999px; opacity: 0; `
const FileInputLabel = styled.label`
  display: inline-block; padding: 1rem 2rem; background: rgb(var(--primary)); color: white; border-radius: 0.6rem; cursor: pointer; font-weight: 500; transition: opacity 0.2s;
  &:hover { opacity: 0.9; }
`
const PreviewBox = styled.div` border:1px solid rgb(var(--border)); border-radius:.6rem; padding: 1rem; margin-bottom: 1rem; `
const PreviewTable = styled.table` width:100%; border-collapse: collapse; margin-top: .6rem; th, td { border:1px solid rgb(var(--border)); padding:.4rem; font-size:1.2rem; } th { background: rgba(0,0,0,.03); text-align:left; } `
const PreviewActions = styled.div` display:flex; gap:.6rem; margin-top: .8rem; `
const ErrorMessage = styled.div` color: #b91c1c; font-size: 1.3rem; margin-bottom: 1rem; padding: 0.8rem; background: #fef2f2; border-radius: 0.4rem; border: 1px solid #fecaca; `
const SuccessMessage = styled.div` color: #059669; font-size: 1.3rem; margin-bottom: 1rem; padding: 0.8rem; background: #f0fdf4; border-radius: 0.4rem; border: 1px solid #bbf7d0; `
const Instructions = styled.div` font-size: 1.2rem; opacity: 0.7; strong { display: block; margin-bottom: 0.4rem; opacity: 1; } `
