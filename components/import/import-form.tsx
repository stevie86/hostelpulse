'use client';

import { useActionState, useState } from 'react';
import { ImportActionState } from '@/app/actions/import';

interface ImportFormProps {
  propertyId: string;
  type: 'rooms' | 'bookings' | 'guests';
  action: (
    prevState: ImportActionState,
    formData: FormData
  ) => Promise<ImportActionState>;
}

export function ImportForm({ propertyId, type, action }: ImportFormProps) {
  const [state, formAction, isPending] = useActionState(action, {
    message: null,
    errors: [],
    results: undefined,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleFormAction = (formData: FormData) => {
    if (selectedFile) {
      formData.append('file', selectedFile);
    }
    formAction(formData);
  };

  const templateLink = `/templates/${type}.csv`;

  return (
    <form action={handleFormAction} className="space-y-4 max-w-lg">
      {state.message && (
        <div
          className={`alert ${
            state.results?.failCount === 0 ? 'alert-success' : 'alert-warning'
          }`}
        >
          <span>{state.message}</span>
          {state.results && (
            <p className="text-sm">
              Success: {state.results.successCount}, Failed:{' '}
              {state.results.failCount}
            </p>
          )}
          {state.errors && state.errors.length > 0 && (
            <ul className="text-sm list-disc list-inside">
              {state.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {state.results?.failedRows && state.results.failedRows.length > 0 && (
        <div className="alert alert-error">
          <h4 className="font-bold">Failed Rows:</h4>
          <ul className="text-sm list-disc list-inside">
            {state.results.failedRows.map((row, i) => (
              <li key={i}>
                Row {row.row}: {row.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="form-control">
        <label className="label">
          <span className="label-text">Download {type} CSV Template:</span>
          <a
            href={templateLink}
            download
            className="link link-primary link-hover"
          >
            Download Template
          </a>
        </label>
        <input
          type="file"
          name="file"
          accept=".csv"
          className="file-input file-input-bordered w-full"
          onChange={handleFileChange}
        />
        <label className="label">
          <span className="label-text-alt">
            Upload a CSV file to import {type}.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending || !selectedFile}
        className="btn btn-primary w-full"
      >
        {isPending ? (
          <span className="loading loading-spinner"></span>
        ) : (
          `Import ${type}`
        )}
      </button>
    </form>
  );
}
