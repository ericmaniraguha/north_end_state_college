import { describe, expect, test } from 'vitest';
import { applicantMessage, applicationStats, filterApplications, pageNumbers } from './applications.js';
import { toCsv } from './csv.js';
import { applicationRef, groupBySchool, initials, plural } from './format.js';
import { activeNavIndex } from '../layouts/SiteHeader.jsx';
import { APPLICATIONS, PROGRAMMES } from '../test/fixtures.js';

describe('filterApplications', () => {
  const names = (list) => list.map((a) => a.full_name);

  test('matches name, NRC, email and reference', () => {
    expect(names(filterApplications(APPLICATIONS, { q: 'taonga' }))).toEqual(['Taonga Zulu']);
    expect(names(filterApplications(APPLICATIONS, { q: '298102' }))).toEqual(['Chisomo Phiri']);
    expect(names(filterApplications(APPLICATIONS, { q: 'mwamba@' }))).toEqual(['Mwamba Chilufya']);
    expect(names(filterApplications(APPLICATIONS, { q: 'NEC-00002' }))).toEqual(['Chisomo Phiri']);
  });

  test('a local number finds the stored +260 number', () => {
    expect(names(filterApplications(APPLICATIONS, { q: '0971 234' }))).toEqual(['Mwamba Chilufya']);
  });

  test('filters by status and programme', () => {
    expect(names(filterApplications(APPLICATIONS, { status: 'accepted' }))).toEqual(['Chisomo Phiri']);
    expect(filterApplications(APPLICATIONS, { programme: '9' })).toHaveLength(2);
    expect(filterApplications(APPLICATIONS, { programme: '9', status: 'pending' })).toHaveLength(1);
  });
});

test('applicationStats counts statuses and decisions', () => {
  expect(applicationStats(APPLICATIONS)).toMatchObject({ total: 3, pending: 1, accepted: 1, rejected: 1, decided: 2 });
});

test('pageNumbers adds gaps for long lists', () => {
  expect(pageNumbers(1, 3)).toEqual([1, 2, 3]);
  expect(pageNumbers(6, 12)).toEqual([1, '…', 5, 6, 7, '…', 12]);
  expect(pageNumbers(1, 12)).toEqual([1, 2, '…', 12]);
});

test('applicantMessage depends on the status', () => {
  const [pending, accepted, rejected] = APPLICATIONS;
  expect(applicantMessage(pending)).toMatch(/Please send a photo of your Grade 12 results/);
  expect(applicantMessage(accepted)).toMatch(/^Hello Chisomo, congratulations!/);
  expect(applicantMessage(rejected)).toMatch(/cannot offer you a place.*NEC-00001/);
});

describe('toCsv', () => {
  test('quotes cells, escapes quotes and starts with a BOM', () => {
    expect(toCsv(['A', 'B'], [['say "hi"', null]])).toBe('﻿"A","B"\r\n"say ""hi""",""');
  });

  test('neutralises formulas but keeps phone numbers', () => {
    const csv = toCsv(['x'], [['=HYPERLINK("bad")'], ['+260971234567'], ['@sum'], ['-1+2']]);
    expect(csv).toContain(`"'=HYPERLINK(""bad"")"`);
    expect(csv).toContain('"+260971234567"');
    expect(csv).toContain(`"'@sum"`);
    expect(csv).toContain(`"'-1+2"`);
  });
});

test('format helpers', () => {
  expect(applicationRef(12)).toBe('NEC-00012');
  expect(initials('mwamba chilufya banda')).toBe('MC');
  expect(plural(1, 'address', 'addresses')).toBe('1 address');
  expect(plural(2, 'application')).toBe('2 applications');
  expect(groupBySchool(PROGRAMMES).map(([school, list]) => [school, list.length]))
    .toEqual([['School of Education', 2], ['School of Media and Communication', 1]]);
});

test('activeNavIndex highlights the right menu', () => {
  expect(activeNavIndex('/')).toBe(0);
  expect(activeNavIndex('/about')).toBe(1);
  expect(activeNavIndex('/admissions')).toBe(2);
  expect(activeNavIndex('/programmes/journalism')).toBe(3);
  expect(activeNavIndex('/news')).toBe(4);
  expect(activeNavIndex('/contact')).toBe(5); // not "About > Our Campus"
  expect(activeNavIndex('/nowhere')).toBe(-1);
});
