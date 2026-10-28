import { describe, expect, test } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { ApplicationForm } from '../../components/forms.jsx';
import ProgrammesPage from './ProgrammesPage.jsx';
import ProgrammeDetailPage from './ProgrammeDetailPage.jsx';
import { mockApi } from '../../test/setup.js';
import { PROGRAMMES, SCHOOLS } from '../../test/fixtures.js';

const renderAt = (url, element, path = '*') => render(
  <MemoryRouter initialEntries={[url]}>
    <Routes><Route path={path} element={element} /></Routes>
  </MemoryRouter>,
);

describe('ApplicationForm', () => {
  test('preselects the programme from ?programme= and shows API field errors', async () => {
    const calls = mockApi({
      '/api/programmes': PROGRAMMES,
      'POST /api/applications': () => [400, { errors: { nrc: 'NRC format: 123456/12/1', phone: 'Enter a valid phone number, e.g. +260 971 234 567.' } }],
    });
    renderAt('/admissions?programme=journalism', <ApplicationForm />);

    const select = screen.getByRole('combobox', { name: /programme/i });
    await waitFor(() => expect(select).toHaveValue('9'));

    await userEvent.type(screen.getByRole('textbox', { name: /full name/i }), 'Test Student');
    await userEvent.click(screen.getByRole('button', { name: /submit application/i }));

    expect(await screen.findByText('NRC format: 123456/12/1')).toBeInTheDocument();
    expect(screen.getByText('Please correct the highlighted fields.')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /nrc number/i })).toHaveClass('invalid');
    expect(calls.at(-1).body).toMatchObject({ programme_id: '9', full_name: 'Test Student' });
  });

  test('shows the success message and clears the form', async () => {
    mockApi({
      '/api/programmes': PROGRAMMES,
      'POST /api/applications': () => [201, { id: 1, message: 'Application received. Our admissions team will contact you shortly.' }],
    });
    renderAt('/admissions', <ApplicationForm />);
    const name = screen.getByRole('textbox', { name: /full name/i });
    await userEvent.type(name, 'Test Student');
    await userEvent.click(screen.getByRole('button', { name: /submit application/i }));
    expect(await screen.findByText(/Application received/)).toBeInTheDocument();
    expect(name).toHaveValue('');
  });
});

describe('ProgrammesPage', () => {
  test('filters by the school in the URL and by search', async () => {
    mockApi({ '/api/schools': SCHOOLS, '/api/programmes': PROGRAMMES });
    renderAt('/programmes?school=education', <ProgrammesPage />);

    expect(await screen.findByText('2 programmes')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Journalism' })).not.toBeInTheDocument();

    await userEvent.type(screen.getByRole('searchbox'), 'primary');
    expect(screen.getByText('1 programme')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Primary Diploma' })).toBeInTheDocument();

    await userEvent.clear(screen.getByRole('searchbox'));
    await userEvent.type(screen.getByRole('searchbox'), 'zzz');
    expect(screen.getByText('No programmes match your search.')).toBeInTheDocument();
  });
});

describe('ProgrammeDetailPage', () => {
  test('shows the programme and related programmes', async () => {
    mockApi({ '/api/programmes/secondary-teaching': { ...PROGRAMMES[0], related: [PROGRAMMES[1]] } });
    renderAt('/programmes/secondary-teaching', <ProgrammeDetailPage />, '/programmes/:slug');

    expect(await screen.findByRole('heading', { level: 1, name: 'Secondary Teaching' })).toBeInTheDocument();
    expect(document.title).toBe('Secondary Teaching | North End College');
    const related = screen.getByRole('heading', { name: 'Related programmes' }).closest('section');
    expect(within(related).getByRole('link', { name: 'Primary Diploma' })).toBeInTheDocument();
  });

  test('shows the not-found state for an unknown programme', async () => {
    mockApi({});
    renderAt('/programmes/nope', <ProgrammeDetailPage />, '/programmes/:slug');
    expect(await screen.findByRole('heading', { level: 1, name: 'Programme not found' })).toBeInTheDocument();
  });
});
