import test from 'node:test';
import assert from 'node:assert/strict';
import { formatExamConditionPasteResult, matchesExamConditionDestination } from './examConditionPasteResult.js';

const copiedConditions = [
  {
    SessionID: 26, ExamID: 1, SubClassID: 1,
    Session: { SessionName: '২০২৬ ইং' },
    Exam: { ExamName: 'বার্ষিক পরীক্ষা' },
    SubClass: { SubClass: 'নাযেরা' },
  },
  {
    SessionID: 26, ExamID: 1, SubClassID: 2,
    Session: { SessionName: '২০২৬ ইং' },
    Exam: { ExamName: 'বার্ষিক পরীক্ষা' },
    SubClass: { SubClass: 'দাওরায়ে হাদীস' },
  },
];

const response = {
  succeeded: 1, failed: 1,
  target: { SessionID: 27, SessionName: '২০২৭ ইং', ExamID: 2, ExamName: 'অর্ধবার্ষিক পরীক্ষা' },
  results: copiedConditions.map(({ SessionID, ExamID, SubClassID }, index) => ({
    source: { SessionID, ExamID, SubClassID },
    SessionID: 27, ExamID: 2, SubClassID,
    status: index === 0 ? 'success' : 'error',
    ...(index === 1 ? { code: 'ALREADY_EXISTS', message: 'Destination already exists' } : {}),
  })),
};

test('success and conflict labels show the destination year and exam with the copied class names', () => {
  const result = formatExamConditionPasteResult(response, copiedConditions);
  assert.equal(result.sessionName, '২০২৭ ইং');
  assert.equal(result.examName, 'অর্ধবার্ষিক পরীক্ষা');
  assert.deepEqual(result.results.map((row) => row.label), [
    '২০২৭ ইং / অর্ধবার্ষিক পরীক্ষা / নাযেরা',
    '২০২৭ ইং / অর্ধবার্ষিক পরীক্ষা / দাওরায়ে হাদীস',
  ]);
  assert.equal(result.results[1].code, 'ALREADY_EXISTS');
  assert.equal(result.results[1].message, 'Destination already exists');
  assert.equal(result.succeeded, 1);
  assert.equal(result.failed, 1);
  assert.equal(result.results[0].source.SessionID, 26);
  assert.equal(response.results[0].label, undefined);
});

test('missing destination names fall back to destination IDs instead of source names', () => {
  const result = formatExamConditionPasteResult({ ...response, target: undefined }, copiedConditions);
  assert.equal(result.sessionName, 27);
  assert.equal(result.examName, 2);
  assert.equal(result.results[0].label, '27 / 2 / নাযেরা');
});

test('results still identify the destination and class when copied rows are unavailable', () => {
  const result = formatExamConditionPasteResult(response, []);
  assert.equal(result.results[0].label, '২০২৭ ইং / অর্ধবার্ষিক পরীক্ষা / 1');
});

test('rejects the reported old API response that ignores the destination session', () => {
  const oldResponse = {
    total: 2, succeeded: 0, failed: 2,
    results: [5, 6].map((ExamID) => ({
      source: { SessionID: 3, ExamID, SubClassID: 24 },
      ExamID: 5, status: 'error', code: 'ALREADY_EXISTS',
    })),
  };
  assert.equal(matchesExamConditionDestination(oldResponse, 7, 5), false);
  assert.equal(matchesExamConditionDestination(response, 27, 2), true);
});

test('rejects results for another session even when target metadata claims the selected session', () => {
  const mismatched = {
    ...response,
    results: response.results.map((item) => ({ ...item, SessionID: 26 })),
  };
  assert.equal(matchesExamConditionDestination(mismatched, 27, 2), false);
  assert.equal(matchesExamConditionDestination(response, 26, 2), false);
});
