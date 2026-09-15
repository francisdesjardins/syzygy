import type { BootstrapPlan } from 'antumbra/react';
import type { StepTrace } from 'antumbra/react';

const BOX_W = 152;
const BOX_H = 46;
const GAP_X = 46;
const GAP_Y = 14;

type Node = {
  id: string;
  level: number;
  slot: number;
  phase: string;
};

/**
 * The graph, drawn as a graph.
 *
 * The library's whole claim is that you wrote dependencies and it derived the parallelism, and a
 * list of levels asks the reader to picture that themselves. Boxes in columns with the edges drawn
 * say it in one look: anything sharing a column goes out together, and the arrows are the reason.
 *
 * Positions are computed rather than measured. Every box is the same size, so the geometry is
 * arithmetic — no refs, no layout effect, no frame where the edges point at where the boxes used to
 * be.
 */
export function PlanGraph(props: {
  plan: BootstrapPlan | undefined;
  needsOf: Readonly<Record<string, readonly string[]>>;
  scopeOf: Readonly<Record<string, string>>;
  timeline: readonly StepTrace[];
}) {
  if (props.plan === undefined) {
    return null;
  }

  const nodes: Node[] = props.plan.levels.flatMap((level) => {
    return level.ids.map((id, slot) => {
      return { id: String(id), level: level.level, slot, phase: level.phase };
    });
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
    return (props.needsOf[node.id] ?? []).some((need) => {
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

  const statusOf = (id: string): string | undefined => {
    return props.timeline.find((trace) => {
      return String(trace.id) === id;
    })?.status;
  };

  return (
    <div className="graph-scroll">
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
          return (props.needsOf[node.id] ?? []).flatMap((need) => {
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
          const status = statusOf(node.id);
          return (
            <g key={node.id} transform={`translate(${String(x(node))}, ${String(y(node))})`}>
              <rect
                width={BOX_W}
                height={BOX_H}
                rx={8}
                className={`node node-${status ?? 'idle'} node-phase-${node.phase}`}
              />
              <text x={12} y={19} className="node-id">
                {node.id}
              </text>
              <text x={12} y={35} className="node-meta">
                {node.phase === 'mounted' ? 'mounted' : (props.scopeOf[node.id] ?? 'app')}
                {status === undefined ? '' : ` · ${status}`}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
