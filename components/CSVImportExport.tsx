import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import Button from './Button'

interface CSVImportExportProps {
  type: 'guests' | 'bookings'
  onImportSuccess?: (result: any) => void
}

type ImportSummary = {
  totalRows: number
  ready: number
  toInsert: number
  toUpdate: number
  skipped: number
}

type ImportIssue = {
  row: number
  email?: string
  reason: string
}

type PreviewRow = {
  row: number
  name: string
  email: string
  phone?: string
  notes?: string
  action: 'insert' | 'update'
}

export default function CSVImportExport({ type, onImportSuccess }: CSVImportExportProps) {
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importResult, setImportResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<ImportSummary | null>(null)
  const [issues, setIssues] = useState<ImportIssue[]>([])
  const [preview, setPreview] = useState<PreviewRow[]>([])
  const [pendingCsv, setPendingCsv] = useState<string | null>(null)
  const [mode, setMode] = useState<'idle' | 'preview' | 'committed'>('idle')

  const isGuestImport = type === 'guests'

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

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.csv')) {
      setError('Please select a CSV file')
      return
    }
    setImporting(true)
    setError(null)
    setImportResult(null)
    setSummary(null)
    setIssues([])
    setPreview([])
    try {
      const text = await file.text()
      if (isGuestImport) {
        const response = await fetch(`/api/csv/${type}?dryRun=1`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csv: text }),
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Import failed')
        setSummary(result.summary)
        setIssues(result.issues || [])
        setPreview(result.preview || [])
        setImportResult('Preview ready. Review details below, then confirm import.')
        setPendingCsv(text)
        setMode('preview')
      } else {
        const response = await fetch(`/api/csv/${type}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csv: text }),
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Import failed')
        setImportResult(result.message)
        onImportSuccess?.(result)
        setMode('committed')
      }
    } catch (e: any) {
      setError(e.message || 'Import failed. Please check your CSV format.')
      setPendingCsv(null)
      setMode('idle')
    } finally {
      setImporting(false)
      event.target.value = ''
    }
  }

  async function handleConfirmImport() {
    if (!pendingCsv) return
    setImporting(true)
    setError(null)
    try {
      const response = await fetch(`/api/csv/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: pendingCsv }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Import failed')
      setImportResult(result.message || 'Import completed successfully.')
      setSummary(result.summary)
      setIssues(result.issues || [])
      setPreview(result.preview || preview)
      setMode('committed')
      setPendingCsv(null)
      onImportSuccess?.(result)
    } catch (e: any) {
      setError(e.message || 'Import failed. Please check your CSV format.')
    } finally {
      setImporting(false)
    }
  }

  const hasPreview = isGuestImport && preview.length > 0

  const summaryItems = useMemo(() => {
    if (!summary) return []
    return [
      { label: 'Total rows', value: summary.totalRows },
      { label: 'Ready to import', value: summary.ready },
      { label: 'New guests', value: summary.toInsert },
      { label: 'Updates', value: summary.toUpdate },
      { label: 'Skipped', value: summary.skipped },
    ]
  }, [summary])

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
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {importResult && !error && <SuccessMessage>{importResult}</SuccessMessage>}
      {summaryItems.length > 0 && (
        <SummaryGrid>
          {summaryItems.map((item) => (
            <SummaryItem key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </SummaryItem>
          ))}
        </SummaryGrid>
      )}
      {hasPreview && (
        <PreviewTable>
          <thead>
            <tr>
              <th>Row</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Notes</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {preview.map((row) => (
              <tr key={row.row}>
                <td>{row.row}</td>
                <td>{row.name}</td>
                <td>{row.email}</td>
                <td>{row.phone || '—'}</td>
                <td>{row.notes || '—'}</td>
                <td>{row.action === 'insert' ? 'New' : 'Update'}</td>
              </tr>
            ))}
          </tbody>
        </PreviewTable>
      )}
      {issues.length > 0 && (
        <IssuesPanel>
          <strong>Skipped rows:</strong>
          <ul>
            {issues.map((issue, idx) => (
              <li key={`${issue.row}-${idx}`}>
                Row {issue.row}{issue.email ? ` (${issue.email})` : ''}: {issue.reason}
              </li>
            ))}
          </ul>
        </IssuesPanel>
      )}
      {isGuestImport && mode === 'preview' && (
        <Button
          onClick={handleConfirmImport}
          disabled={importing || !pendingCsv}
          style={{ marginTop: '1rem' }}
        >
          {importing ? 'Importing...' : 'Confirm Import'}
        </Button>
      )}
      <Instructions>
        <strong>CSV Format:</strong>
        {type === 'guests' ? (
          <div>
            Columns: <code>name</code>, <code>email</code>, optional <code>phone</code>, <code>notes</code>. Duplicate emails are deduped; missing name/email rows are skipped.
          </div>
        ) : (
          <div>Export only (import coming soon)</div>
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
const ErrorMessage = styled.div` color: #b91c1c; font-size: 1.3rem; margin-bottom: 1rem; padding: 0.8rem; background: #fef2f2; border-radius: 0.4rem; border: 1px solid #fecaca; `
const SuccessMessage = styled.div` color: #059669; font-size: 1.3rem; margin-bottom: 1rem; padding: 0.8rem; background: #f0fdf4; border-radius: 0.4rem; border: 1px solid #bbf7d0; `
const Instructions = styled.div` font-size: 1.2rem; opacity: 0.7; strong { display: block; margin-bottom: 0.4rem; opacity: 1; } `
const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.8rem;
  margin-bottom: 1rem;
`
const SummaryItem = styled.div`
  background: rgb(var(--cardBackground));
  border: 1px solid rgb(var(--border));
  border-radius: 0.6rem;
  padding: 0.8rem;
  display: flex;
  justify-content: space-between;
  font-size: 1.2rem;

  strong {
    font-weight: 600;
  }
`
const PreviewTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  font-size: 1.2rem;

  th, td {
    border: 1px solid rgb(var(--border));
    padding: 0.6rem;
    text-align: left;
  }

  th {
    background: rgba(var(--primary), 0.08);
    font-weight: 600;
  }
`
const IssuesPanel = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.6rem;
  padding: 1rem;
  margin-bottom: 1rem;
  font-size: 1.2rem;

  ul {
    margin: 0.6rem 0 0;
    padding-left: 1.4rem;
  }

  li + li {
    margin-top: 0.2rem;
  }
`
