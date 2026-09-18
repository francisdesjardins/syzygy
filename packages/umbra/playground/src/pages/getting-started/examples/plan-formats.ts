import type { BootstrapPlan, PlanNode } from 'umbra';

/**
 * The same plan, written three ways, none of which the library ships.
 *
 * `plan().nodes` carries the edges, so a format is a few lines over it — and those few lines are
 * the argument for leaving them here. Each emitter below knows something about its target that
 * umbra has no business knowing: what Mermaid accepts as a node id, how DOT quotes a label, what a
 * diff should and should not consider a change.
 */

/**
 * Mermaid node ids are identifiers; a step id is any string this project felt like using, and the
 * demo declares `projects:reference`. So the id is sanitised into a key and the real one is the
 * label — written the other way round, the diagram does not parse.
 */
const key = (id: PropertyKey): string => {
  return `n${String(id).replace(/\W/g, '_')}`;
};

const edgesOf = (nodes: readonly PlanNode[]) => {
  return nodes.flatMap((node) => {
    return node.needs.map((need) => {
      return { from: need, to: node.id };
    });
  });
};

/** GitHub renders this inline in a README, which is most of why anyone wants it. */
export function toMermaid(plan: BootstrapPlan): string {
  return [
    'graph LR',
    ...plan.nodes.map((node) => {
      return `  ${key(node.id)}["${String(node.id)}"]`;
    }),
    ...edgesOf(plan.nodes).map((edge) => {
      return `  ${key(edge.from)} --> ${key(edge.to)}`;
    }),
  ].join('\n');
}

/**
 * Graphviz, for the cases Mermaid is bad at: a hundred steps, or a print-quality SVG.
 *
 * DOT takes a quoted string as an id, so no sanitising — only escaping, which is the same knowledge
 * in the other shape and the reason this is not one emitter with a flag.
 */
export function toDot(plan: BootstrapPlan): string {
  const quote = (id: PropertyKey): string => {
    return `"${String(id).replace(/["\\]/g, '\\$&')}"`;
  };

  return [
    'digraph boot {',
    '  rankdir=LR;',
    '  node [shape=box, style=rounded];',
    ...plan.nodes.map((node) => {
      return `  ${quote(node.id)}${node.phase === 'hosted' ? ' [style="rounded,dashed"]' : ''};`;
    }),
    ...edgesOf(plan.nodes).map((edge) => {
      return `  ${quote(edge.from)} -> ${quote(edge.to)};`;
    }),
    '}',
  ].join('\n');
}

/**
 * The graph as a golden file: commit it, and a `needs` nobody meant to add becomes a review comment
 * instead of a mystery three sprints later.
 *
 * Sorted, and levels deliberately left out. A step moving from level 2 to level 3 is a consequence
 * of an edge that changed, so recording both would report one change twice — and adding an
 * unrelated step at the front would rewrite every line under it for nothing.
 */
export function toGoldenFile(plan: BootstrapPlan): string {
  return [...plan.nodes]
    .map((node) => {
      const needs = [...node.needs].map(String).sort().join(', ');
      return `${String(node.id)} [${node.phase}, ${node.scope}] <- ${needs === '' ? '(nothing)' : needs}`;
    })
    .sort()
    .join('\n');
}
