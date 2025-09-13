import React, { useState } from 'react'
import styled from 'styled-components'
import Button from './Button'
import Input from './Input'

interface CSVImportExportProps {
  type: 'guests' | 'bookings'
  onImportSuccess?: (result: any) => void
}

export default function CSVImportExport({ type, onImportSuccess }: CSVImportExportProps) {
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importResult, setImportResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleExport() {
    setExporting(true)
    setError(null)
    
    try {
      // Try the new export endpoint first, fallback to CSV endpoint
      let response = await fetch(`/api/export/${type}`)
      
      if (!response.ok) {
        response = await fetch(`/api/csv/${type}`)
      }
      
      if (!response.ok) {
        throw new Error('Export failed')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
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
    
    try {
      const text = await file.text()
      
      const response = await fetch(`/api/csv/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ csv: text }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Import failed')
      }
      
      setImportResult(result.message)
      onImportSuccess?.(result)
    } catch (error: any) {
      setError(error.message || 'Import failed. Please check your CSV format.')
    } finally {
      setImporting(false)
      // Reset file input
      event.target.value = ''
    }
  }

  return (
    <Container>
      <Title>CSV {type.charAt(0).toUpperCase() + type.slice(1)}</Title>
      
      <Actions>
        <Button 
          onClick={handleExport} 
          disabled={exporting}
          style={{ marginRight: '1rem' }}
        >
          {exporting ? 'Exporting...' : `Export ${type.charAt(0).toUpperCase() + type.slice(1)}`}
        </Button>
        
        <FileInputWrapper>
          <FileInput
            type="file"
            accept=".csv"
            onChange={handleImport}
            disabled={importing}
            id={`csv-import-${type}`}
          />
          <FileInputLabel htmlFor={`csv-import-${type}`}>
            {importing ? 'Importing...' : `Import ${type.charAt(0).toUpperCase() + type.slice(1)}`}
          </FileInputLabel>
        </FileInputWrapper>
      </Actions>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {importResult && <SuccessMessage>{importResult}</SuccessMessage>}
      
      <Instructions>
        <strong>CSV Format:</strong>
        {type === 'guests' ? (
          <div>name, email, phone, notes</div>
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
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`

const FileInputWrapper = styled.div`
  position: relative;
  overflow: hidden;
  display: inline-block;
`

const FileInput = styled.input`
  position: absolute;
  left: -9999px;
  opacity: 0;
`

const FileInputLabel = styled.label`
  display: inline-block;
  padding: 1rem 2rem;
  background: rgb(var(--primary));
  color: white;
  border-radius: 0.6rem;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
`

const ErrorMessage = styled.div`
  color: #b91c1c;
  font-size: 1.3rem;
  margin-bottom: 1rem;
  padding: 0.8rem;
  background: #fef2f2;
  border-radius: 0.4rem;
  border: 1px solid #fecaca;
`

const SuccessMessage = styled.div`
  color: #059669;
  font-size: 1.3rem;
  margin-bottom: 1rem;
  padding: 0.8rem;
  background: #f0fdf4;
  border-radius: 0.4rem;
  border: 1px solid #bbf7d0;
`

const Instructions = styled.div`
  font-size: 1.2rem;
  opacity: 0.7;
  
  strong {
    display: block;
    margin-bottom: 0.4rem;
    opacity: 1;
  }
`
