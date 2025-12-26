'use client';

import { useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GuestSchema, GuestFormValues } from '@/lib/schemas/guest';
import { ActionState } from '@/app/actions/guests';

// Comprehensive list of countries for nationality dropdown
const COUNTRIES = [
  'Afghanistan',
  'Albania',
  'Algeria',
  'Andorra',
  'Angola',
  'Antigua and Barbuda',
  'Argentina',
  'Armenia',
  'Australia',
  'Austria',
  'Azerbaijan',
  'Bahamas',
  'Bahrain',
  'Bangladesh',
  'Barbados',
  'Belarus',
  'Belgium',
  'Belize',
  'Benin',
  'Bhutan',
  'Bolivia',
  'Bosnia and Herzegovina',
  'Botswana',
  'Brazil',
  'Brunei',
  'Bulgaria',
  'Burkina Faso',
  'Burundi',
  'Cabo Verde',
  'Cambodia',
  'Cameroon',
  'Canada',
  'Central African Republic',
  'Chad',
  'Chile',
  'China',
  'Colombia',
  'Comoros',
  'Congo',
  'Costa Rica',
  'Croatia',
  'Cuba',
  'Cyprus',
  'Czech Republic',
  'Denmark',
  'Djibouti',
  'Dominica',
  'Dominican Republic',
  'Ecuador',
  'Egypt',
  'El Salvador',
  'Equatorial Guinea',
  'Eritrea',
  'Estonia',
  'Eswatini',
  'Ethiopia',
  'Fiji',
  'Finland',
  'France',
  'Gabon',
  'Gambia',
  'Georgia',
  'Germany',
  'Ghana',
  'Greece',
  'Grenada',
  'Guatemala',
  'Guinea',
  'Guinea-Bissau',
  'Guyana',
  'Haiti',
  'Honduras',
  'Hungary',
  'Iceland',
  'India',
  'Indonesia',
  'Iran',
  'Iraq',
  'Ireland',
  'Israel',
  'Italy',
  'Jamaica',
  'Japan',
  'Jordan',
  'Kazakhstan',
  'Kenya',
  'Kiribati',
  'Korea, North',
  'Korea, South',
  'Kuwait',
  'Kyrgyzstan',
  'Laos',
  'Latvia',
  'Lebanon',
  'Lesotho',
  'Liberia',
  'Libya',
  'Liechtenstein',
  'Lithuania',
  'Luxembourg',
  'Madagascar',
  'Malawi',
  'Malaysia',
  'Maldives',
  'Mali',
  'Malta',
  'Marshall Islands',
  'Mauritania',
  'Mauritius',
  'Mexico',
  'Micronesia',
  'Moldova',
  'Monaco',
  'Mongolia',
  'Montenegro',
  'Morocco',
  'Mozambique',
  'Myanmar',
  'Namibia',
  'Nauru',
  'Nepal',
  'Netherlands',
  'New Zealand',
  'Nicaragua',
  'Niger',
  'Nigeria',
  'North Macedonia',
  'Norway',
  'Oman',
  'Pakistan',
  'Palau',
  'Panama',
  'Papua New Guinea',
  'Paraguay',
  'Peru',
  'Philippines',
  'Poland',
  'Portugal',
  'Qatar',
  'Romania',
  'Russia',
  'Rwanda',
  'Saint Kitts and Nevis',
  'Saint Lucia',
  'Saint Vincent and the Grenadines',
  'Samoa',
  'San Marino',
  'Sao Tome and Principe',
  'Saudi Arabia',
  'Senegal',
  'Serbia',
  'Seychelles',
  'Sierra Leone',
  'Singapore',
  'Slovakia',
  'Slovenia',
  'Solomon Islands',
  'Somalia',
  'South Africa',
  'South Sudan',
  'Spain',
  'Sri Lanka',
  'Sudan',
  'Suriname',
  'Sweden',
  'Switzerland',
  'Syria',
  'Taiwan',
  'Tajikistan',
  'Tanzania',
  'Thailand',
  'Timor-Leste',
  'Togo',
  'Tonga',
  'Trinidad and Tobago',
  'Tunisia',
  'Turkey',
  'Turkmenistan',
  'Tuvalu',
  'Uganda',
  'Ukraine',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Uruguay',
  'Uzbekistan',
  'Vanuatu',
  'Vatican City',
  'Venezuela',
  'Vietnam',
  'Yemen',
  'Zambia',
  'Zimbabwe',
].sort();

interface GuestFormProps {
  propertyId: string;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  initialValues?: Partial<GuestFormValues>;
  isEditMode?: boolean;
}

export function GuestForm({
  propertyId,
  action,
  initialValues,
  isEditMode = false,
}: GuestFormProps) {
  const [state, formAction, isPending] = useActionState(action, {
    message: null,
    errors: {},
  });

  const {
    register,
    formState: { errors: clientErrors },
  } = useForm<GuestFormValues>({
    resolver: zodResolver(GuestSchema),
    defaultValues: {
      firstName: initialValues?.firstName || '',
      lastName: initialValues?.lastName || '',
      email: initialValues?.email || '',
      phone: initialValues?.phone || '',
      nationality: initialValues?.nationality || '',
      documentType: initialValues?.documentType || 'passport',
      documentId: initialValues?.documentId || '',
      notes: initialValues?.notes || '',
    },
  });

  return (
    <form action={formAction} className="space-y-4 max-w-lg">
      {state.message && (
        <div className="alert alert-error">
          <span>{state.message}</span>
        </div>
      )}

      <div className="flex gap-4">
        <div className="form-control w-1/2">
          <label className="label">First Name</label>
          <input
            type="text"
            className="input input-bordered w-full"
            {...register('firstName')}
          />
          {clientErrors.firstName && (
            <span className="text-error text-xs">
              {clientErrors.firstName.message}
            </span>
          )}
        </div>
        <div className="form-control w-1/2">
          <label className="label">Last Name</label>
          <input
            type="text"
            className="input input-bordered w-full"
            {...register('lastName')}
          />
          {clientErrors.lastName && (
            <span className="text-error text-xs">
              {clientErrors.lastName.message}
            </span>
          )}
        </div>
      </div>

      <div className="form-control">
        <label className="label">Email</label>
        <input
          type="email"
          className="input input-bordered w-full"
          {...register('email')}
        />
      </div>

      <div className="form-control">
        <label className="label">Phone</label>
        <input
          type="tel"
          className="input input-bordered w-full"
          {...register('phone')}
        />
      </div>

      <div className="flex gap-4">
        <div className="form-control w-1/3">
          <label className="label">Doc Type</label>
          <select
            className="select select-bordered"
            {...register('documentType')}
          >
            <option value="passport">Passport</option>
            <option value="id_card">ID Card</option>
            <option value="driving_license">Driver&apos;s License</option>
          </select>
        </div>
        <div className="form-control w-2/3">
          <label className="label">Document ID</label>
          <input
            type="text"
            className="input input-bordered w-full"
            {...register('documentId')}
          />
        </div>
      </div>

      <div className="form-control">
        <label className="label">Nationality</label>
        <select
          className="select select-bordered w-full"
          {...register('nationality')}
        >
          <option value="">Select nationality...</option>
          {COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="btn btn-primary w-full"
      >
        {isPending ? 'Saving...' : isEditMode ? 'Update Guest' : 'Create Guest'}
      </button>
    </form>
  );
}
