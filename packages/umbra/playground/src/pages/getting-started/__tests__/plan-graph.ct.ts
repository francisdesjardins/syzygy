import type { Page } from '@playwright/test';
import { expect, test } from '../../../../../src/__tests__/ct-test.js';

/**
 * What the graph *shows*, which every other gate in this repository is blind to.
 *
 * Three defects shipped here and a reader found all three by looking: a note that was true of the
 * boxes beside it and false of the one it sat on, `optional` never drawn at all, and a box widened
 * until the graph stopped fitting the page. Types, lint, budgets and the unit suite were green
 * through every one of them.
 *
 * The decision behind a note is `model/step-note.ts`'s and is unit-tested there. This asserts the
 * drawing: nothing outside its box, nothing on top of anything else, every ending that owes a note
 * carrying one, and the whole thing inside the room it is given.
 */

type Piece = { text: string; left: number; right: number; top: number; bottom: number } | null;
type Box = {
  id: string;
  optional: boolean;
  status: string;
  note: string;
  rect: { left: number; right: number; top: number; bottom: number };
  pieces: { name: string; piece: Piece }[];
};
type Drawing = { boxes: Box[]; drawn: number; room: number };

/** Every switch this page offers, by the label a reader clicks. */
const SWITCHES = [
  'No session',
  'Access service down',
  'Config service down',
  'Preview build',
  'Tags hangs',
] as const;

/**
 * One setting per ending the graph can draw, rather than the 2^5 of them.
 *
 * The combinations were swept once by hand and found nothing these six do not: the notes are a pure
 * function of one trace and its needs, so a second broken service produces no arrangement a first
 * one did not.
 */
const SETTINGS: ReadonlyArray<readonly string[]> = [
  [],
  ['Access service down'],
  ['Config service down'],
  ['Preview build'],
  ['No session'],
  ['Tags hangs'],
];

async function readGraph(page: Page): Promise<Drawing> {
  return page.evaluate(() => {
    const svg = [...document.querySelectorAll('svg')].find((candidate) => {
      return candidate.querySelector('.node-id') !== null;
    });
    if (svg === undefined) {
      return { boxes: [], drawn: 0, room: 0 };
    }
    const scroller = svg.closest('.graph-scroll') ?? svg.parentElement;

    const measure = (group: Element, selector: string) => {
      const found = group.querySelector(selector);
      if (found === null) {
        return null;
      }
      const box = found.getBoundingClientRect();
      return {
        text: found.textContent,
        left: box.left,
        right: box.right,
        top: box.top,
        bottom: box.bottom,
      };
    };

    const boxes = [];
    for (const group of svg.querySelectorAll('g')) {
      const id = group.querySelector('.node-id');
      const rect = group.querySelector('rect');
      if (id === null || rect === null) {
        continue;
      }
      const meta = measure(group, '.node-meta');
      const note = measure(group, '.node-why');
      const optional = measure(group, '.node-optional');
      const frame = rect.getBoundingClientRect();
      boxes.push({
        id: id.textContent,
        optional: optional !== null,
        status: (meta?.text ?? '').split('·').pop()?.trim() ?? '',
        note: note?.text ?? '',
        rect: { left: frame.left, right: frame.right, top: frame.top, bottom: frame.bottom },
        pieces: [
          { name: 'id', piece: measure(group, '.node-id') },
          { name: 'status', piece: meta },
          { name: 'optional', piece: optional },
          { name: 'note', piece: note },
        ],
      });
    }

    return {
      boxes,
      drawn: Math.round(svg.getBoundingClientRect().width),
      room: Math.round(scroller?.clientWidth ?? 0),
    };
  });
}

async function boot(page: Page, on: readonly string[]): Promise<Drawing> {
  for (const label of SWITCHES) {
    const box = page.getByRole('checkbox', { name: new RegExp(`^${label}$`, 'iu') });
    if (on.includes(label)) {
      await box.check();
    } else {
      await box.uncheck();
    }
  }
  await page.getByTestId('boot-again').click();
  await expect(page.locator('svg .node-id').first()).toBeVisible();
  // The boot is asynchronous and the graph redraws from its result rather than from the click.
  await page.waitForTimeout(900);
  return readGraph(page);
}

const overlap = (a: Piece, b: Piece): boolean => {
  return (
    a !== null &&
    b !== null &&
    a.left < b.right - 0.5 &&
    b.left < a.right - 0.5 &&
    a.top < b.bottom - 0.5 &&
    b.top < a.bottom - 0.5
  );
};

test.describe('the step graph draws what it means', () => {
  /*
   * A stated desktop width, because the assertion below needs one to mean anything. `.graph-scroll`
   * carries a role and a label, so scrolling at 1280 is an affordance rather than a defect — what
   * is one is outgrowing an ordinary desktop, which widening a box by 32px did: 1104 against 990.
   */
  test.use({ viewport: { width: 1440, height: 1000 } });

  for (const on of SETTINGS) {
    const where = on.length === 0 ? 'nothing broken' : on.join(' + ');

    test(`with ${where}, every box holds its own text`, async ({ page }) => {
      await page.goto('/getting-started');
      const { boxes, drawn, room } = await boot(page, on);

      expect(boxes.length, 'the graph drew nothing').toBeGreaterThan(5);

      const faults: string[] = [];
      for (const box of boxes) {
        for (const { name, piece } of box.pieces) {
          if (
            piece !== null &&
            (piece.left < box.rect.left - 0.5 || piece.right > box.rect.right + 0.5)
          ) {
            faults.push(`${box.id}: its ${name} runs past the box`);
          }
        }
        const [id, status, optional, note] = box.pieces.map((p) => {
          return p.piece;
        });
        for (const [a, b, said] of [
          [id, optional, 'badge on the id'],
          [status, optional, 'badge on the status'],
          [status, note, 'note on the status'],
          [id, status, 'status on the id'],
        ] as const) {
          if (overlap(a ?? null, b ?? null)) {
            faults.push(`${box.id}: ${said}`);
          }
        }
      }

      expect(faults).toEqual([]);
      // Width is the scarce axis: five columns of it decide whether the page holds the graph.
      expect(
        drawn,
        `the graph is ${String(drawn)}px wide in ${String(room)}px`
      ).toBeLessThanOrEqual(room);
    });

    test(`with ${where}, an ending that owes a reason gives one`, async ({ page }) => {
      await page.goto('/getting-started');
      const { boxes } = await boot(page, on);

      const silent = boxes
        .filter((box) => {
          return box.status === 'skipped' && box.note === '';
        })
        .map((box) => {
          return box.id;
        });
      expect(silent, 'skipped covers three endings and these say which one they are not').toEqual(
        []
      );

      // The two the graph writes itself have to be true of the run they describe.
      const says = (what: string): boolean => {
        return boxes.some((box) => {
          return box.note === what;
        });
      };

      if (says('the run had stopped')) {
        const stopped = boxes.some((box) => {
          return !box.optional && (box.status === 'failed' || box.status === 'timed-out');
        });
        expect(stopped, 'a box blames the run, and nothing required failed').toBe(true);
      }
      if (says('a need did not succeed')) {
        const anythingFailed = boxes.some((box) => {
          return box.status !== 'success' && box.status !== '';
        });
        expect(anythingFailed, 'a box blames a need, and nothing failed').toBe(true);
      }
    });
  }
});
