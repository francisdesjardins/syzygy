import type { BootstrapPlan } from 'umbra/react';
import type { StepTrace } from 'umbra/react';
import { fitNote, stepNote } from '@/pages/getting-started/model/step-note';

// The width is the scarce one: five columns of it decide whether the graph fits the page at all,
// so everything a box has to say is paid for in height instead.
const BOX_W = 152;
// Four lines: the id, what it is, whether it was ever required, and — for the endings that need
// one — why. Most boxes leave the last two blank and the height is uniform anyway, because the
// geometry below is arithmetic.
const BOX_H = 78;
const GAP_X = 46;
const GAP_Y = 14;

type Node = {
  id: string;
  level: number;
  slot: number;
  phase: string;
  needs: readonly string[];
  scope: string;
  optional: boolean;
};

/**
 * The graph, drawn as a graph.
 *
 * The library's whole claim is that you wrote dependencies and it derived the parallelism, and a
 * list of levels asks the reader to picture that themselves. Boxes in columns with the edges drawn
 * say it in one look: anything sharing a column goes out together, and the arrows are the reason.
 *
 * Positions are computed rather than measured. Every box is the same size, so the geometry is
 * arithmetic — no refs, no layout effect, no frame where the edges point where the boxes are not.
 */
export function PlanGraph(props: {
  plan: BootstrapPlan | undefined;
  timeline: readonly StepTrace[];
}) {
  if (props.plan === undefined) {
    return null;
  }

  // The slot is the only thing the drawing adds: where in its column a box sits. Everything else —
  // the level, the phase, the edges, the scope — is the plan's, which is why this takes one prop.
  const slotOf = new Map<string, number>();
  for (const level of props.plan.levels) {
    level.ids.forEach((id, slot) => {
      slotOf.set(String(id), slot);
    });
  }

  const nodes: Node[] = props.plan.nodes.map((node) => {
    return {
      id: String(node.id),
      level: node.level,
      slot: slotOf.get(String(node.id)) ?? 0,
      phase: node.phase,
      needs: node.needs.map((need) => {
        return String(need);
      }),
      scope: node.scope,
      optional: node.optional,
    };
  });

  const byId = new Map(
    nodes.map((node) => {
      return [node.id, node];
    })
  );

  const columns = props.plan.levels.length;
  const rows = Math.max(
    ...props.plan.levels.map((level) => {
      return level.ids.length;
    })
  );
  const width = columns * BOX_W + (columns - 1) * GAP_X;
  const content = rows * BOX_H + (rows - 1) * GAP_Y;

  /**
   * An edge that spans more than one column has to cross a column full of boxes, and a straight run
   * across it disappears behind one — which is exactly what it did. Those edges take a lane under
   * the graph instead, where there is nothing to hide behind.
   */
  const spans = nodes.some((node) => {
    return node.needs.some((need) => {
      const from = byId.get(need);
      return from !== undefined && node.level - from.level > 1;
    });
  });
  const laneY = content + 20;
  const height = spans ? laneY + 10 : content;

  const x = (node: Node): number => {
    return node.level * (BOX_W + GAP_X);
  };
  const y = (node: Node): number => {
    return node.slot * (BOX_H + GAP_Y);
  };

  const traceOf = (id: string): StepTrace | undefined => {
    return props.timeline.find((trace) => {
      return String(trace.id) === id;
    });
  };

  return (
    <div className="graph-scroll" tabIndex={0} role="group" aria-label="Step graph, scrollable">
      <svg
        className="plan-graph"
        width={width}
        height={height}
        viewBox={`0 0 ${String(width)} ${String(height)}`}
        role="img"
        aria-label="The step graph, one column per level"
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="7"
            markerHeight="7"
            orient="auto"
          >
            <path d="M 0 1 L 7 4 L 0 7 z" className="edge-head" />
          </marker>
        </defs>

        {nodes.flatMap((node) => {
          return node.needs.flatMap((need) => {
            const from = byId.get(need);
            if (from === undefined) {
              return [];
            }
            const x1 = x(from) + BOX_W;
            const y1 = y(from) + BOX_H / 2;
            const x2 = x(node);
            const y2 = y(node) + BOX_H / 2;
            const mid = x1 + (x2 - x1) / 2;
            const long = node.level - from.level > 1;
            const d = long
              ? `M ${String(x1)} ${String(y1)} C ${String(x1 + 26)} ${String(y1)}, ${String(x1 + 26)} ${String(laneY)}, ${String(x1 + 52)} ${String(laneY)} L ${String(x2 - 52)} ${String(laneY)} C ${String(x2 - 26)} ${String(laneY)}, ${String(x2 - 26)} ${String(y2)}, ${String(x2 - 2)} ${String(y2)}`
              : `M ${String(x1)} ${String(y1)} C ${String(mid)} ${String(y1)}, ${String(mid)} ${String(y2)}, ${String(x2 - 2)} ${String(y2)}`;
            return [
              <path
                key={`${need}->${node.id}`}
                className={long ? 'edge edge-long' : 'edge'}
                markerEnd="url(#arrow)"
                d={d}
              />,
            ];
          });
        })}

        {nodes.map((node) => {
          const trace = traceOf(node.id);
          const status = trace?.status;
          const reason = stepNote({
            trace,
            needs: node.needs,
            statusOf: (id) => {
              return traceOf(id)?.status;
            },
          });
          return (
            <g key={node.id} transform={`translate(${String(x(node))}, ${String(y(node))})`}>
              <title>
                {status === undefined
                  ? node.id
                  : `${status}${reason === undefined ? '' : `: ${reason}`}`}
              </title>
              <rect
                width={BOX_W}
                height={BOX_H}
                rx={8}
                className={[
                  'node',
                  `node-${status ?? 'idle'}`,
                  `node-phase-${node.phase}`,
                  // Only the step that decided carries a reason; that is the whole difference.
                  trace?.reason === undefined ? '' : 'node-decided',
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
              <text x={12} y={19} className="node-id">
                {node.id}
              </text>

              <text x={12} y={35} className="node-meta">
                {node.phase === 'hosted' ? 'hosted' : node.scope}
                {status === undefined ? '' : ` · ${status}`}
              </text>
              {/*
                The one word that explains why two failures do not end the same way: a required step
                stops the run, a tolerated one does not. Its own line, because the id line is full at
                `projects:reference` and the status line is full at `instance · timed-out`.
              */}
              {node.optional ? (
                <text x={12} y={51} className="node-optional">
                  optional
                </text>
              ) : null}
              {reason === undefined ? null : (
                <text x={12} y={67} className="node-why">
                  {fitNote(reason)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
