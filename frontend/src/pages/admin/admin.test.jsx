import { describe, expect, test } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import AdminRoutes from '../../routes/AdminRoutes.jsx';
import { mockApi } from '../../test/setup.js';
import { APPLICATIONS, PROGRAMMES, SUMMARY } from '../../test/fixtures.js';

const renderAdmin = (url) => render(
  <MemoryRouter initialEntries={[url]}>
    <Routes><Route path="/admin/*" element={<AdminRoutes />} /></Routes>
  </MemoryRouter>,
);

const signedIn = () => sessionStorage.setItem('adminToken', 'test-token');

describe('admin sign-in', () => {
  test('a wrong token shows an error', async () => {
    mockApi({ '/api/admin/summary': () => [401, { error: 'Unauthorized' }] });
    renderAdmin('/admin');
    await userEvent.type(screen.getByLabelText(/admin token/i), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText('That token is not correct.')).toBeInTheDocument();
  });

  test('protected pages send you to sign in', async () => {
    mockApi({});
    renderAdmin('/admin/applications');
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  });
});

describe('applications page', () => {
  function setup(extra = {}) {
    signedIn();
    return mockApi({
      '/api/admin/summary': SUMMARY,
      '/api/admin/applications': APPLICATIONS,
      '/api/programmes': PROGRAMMES,
      ...extra,
    });
  }

  test('lists applications with counts, and the cards filter by status', async () => {
    setup();
    renderAdmin('/admin/applications');
    const table = await screen.findByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(4); // header + 3

    await userEvent.click(screen.getByRole('button', { name: /^pending/i }));
    const rows = within(screen.getByRole('table')).getAllByRole('row');
    expect(rows).toHaveLength(2);
    expect(rows[1]).toHaveTextContent('Taonga Zulu');
    expect(screen.getByRole('combobox', { name: /filter by status/i })).toHaveValue('pending');
  });

  test('search finds an applicant by local phone number', async () => {
    setup();
    renderAdmin('/admin/applications');
    await screen.findByRole('table');
    await userEvent.type(screen.getByPlaceholderText(/search by name, nrc/i), '0971234567');
    const rows = within(screen.getByRole('table')).getAllByRole('row');
    expect(rows).toHaveLength(2);
    expect(rows[1]).toHaveTextContent('Mwamba Chilufya');
  });

  test('bulk accept sends the selected ids', async () => {
    const calls = setup({ 'PATCH /api/admin/applications': { updated: 1 } });
    renderAdmin('/admin/applications');
    await screen.findByRole('table');
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select Taonga Zulu' }));
    expect(screen.getByText('1 application selected')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Accept' }));
    expect(calls.find((c) => c.method === 'PATCH').body).toEqual({ ids: [3], status: 'accepted' });
    expect(await screen.findByText('Taonga Zulu marked accepted')).toBeInTheDocument();
  });

  test('the review drawer opens from the URL and saves notes', async () => {
    const calls = setup({ 'PATCH /api/admin/applications/3': { ...APPLICATIONS[0], notes: 'Results received' } });
    renderAdmin('/admin/applications?open=3');
    const drawer = await screen.findByRole('dialog', { name: 'Taonga Zulu' });
    expect(within(drawer).getByRole('link', { name: /whatsapp/i })).toHaveAttribute('href', expect.stringContaining('wa.me/260955432109'));
    await userEvent.type(within(drawer).getByRole('textbox', { name: /internal notes/i }), 'Results received');
    await userEvent.click(within(drawer).getByRole('button', { name: /save notes/i }));
    expect(calls.find((c) => c.method === 'PATCH').body).toEqual({ notes: 'Results received' });
    expect(await screen.findByText('Notes saved')).toBeInTheDocument();
  });

  test('the sidebar shows pending and unread counts', async () => {
    setup();
    renderAdmin('/admin/applications');
    const nav = await screen.findByRole('navigation');
    expect(await within(nav).findByTitle('1 pending review')).toBeInTheDocument();
    expect(within(nav).getByTitle('1 unread')).toBeInTheDocument();
  });
});
