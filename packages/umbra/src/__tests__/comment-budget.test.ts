import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { commentBudget, NARRATING, OVER_BUDGET } from 'gnomon/comment-budget';

/**
 * Comments have a budget, for the reason `CLAUDE.md` states and nothing enforced: **why, not what**,
 * **never the past**, **one dense sentence beats a paragraph**.
 *
 * The scanner is `gnomon/comment-budget`, shared with antumbra, and its doc carries how the
 * public-API exception is read. What stays here is what this package can honestly disagree about:
 * the trees, and the floors that keep a pass from being vacuous.
 *
 * No past-tense exemption, where antumbra needs one: its domain is named after a phrase the HTML
 * spec writes in that tense, and nothing here is. The word cannot be spelled in this file either,
 * which is the gate reading its own doc comment and being right about it.
 */
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

const found = commentBudget({ root: REPO_ROOT, roots: ['src', 'playground/src'] });

test.describe('comments have a budget', () => {
  test('no comment block is over its own', () => {
    expect(found.over, `${OVER_BUDGET} — see this file’s doc comment.`).toEqual([]);
  });

  test('no comment narrates the past', () => {
    expect(found.narrating, NARRATING).toEqual([]);
  });

  test('the scan reads whole files, so a pass is not vacuous', () => {
    // A floor on both, because every way this gate has to fail is by finding nothing: a broken
    // walk, a scanner that stops at the first construct it cannot read.
    expect(found.blocks).toBeGreaterThan(400);
    expect(found.files).toBeGreaterThan(90);
  });
});
