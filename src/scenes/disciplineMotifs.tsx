/**
 * Schematic motifs for the four disciplines (inline SVG, theme-aware through CSS classes).
 * Diagrams of how the work goes, not outputs or results: no numbers, no scores.
 */
const Label = ({ x, y, children, anchor = 'start' }: { x: number; y: number; children: string; anchor?: 'start' | 'middle' | 'end' }) => (
  <text x={x} y={y} className="mo-text" textAnchor={anchor}>
    {children}
  </text>
);

/** AI/ML: an image split into patches, flattened into tokens, read by a transformer encoder. */
export function VitMotif() {
  const cells = [];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      cells.push(<rect key={`${r}${c}`} x={14 + c * 22} y={34 + r * 22} width={20} height={20} rx={3} className={r === 1 && c === 2 ? 'mo-accfill' : 'mo-cell'} />);
  const tokens = [];
  for (let i = 0; i < 7; i++) tokens.push(<rect key={i} x={132 + i * 13} y={70} width={10} height={20} rx={2} className={i === 0 ? 'mo-secfill' : i === 3 ? 'mo-accfill' : 'mo-cell'} />);
  return (
    <svg viewBox="0 0 320 150" aria-hidden="true" focusable="false">
      {cells}
      <Label x={14} y={24}>patches</Label>
      <path d="M110 80 H124" className="mo-line mo-arrow" />
      {tokens}
      <Label x={132} y={60}>tokens</Label>
      <path d="M228 80 H242" className="mo-line mo-arrow" />
      <rect x={246} y={34} width={62} height={92} rx={10} className="mo-box" />
      <rect x={256} y={46} width={42} height={26} rx={5} className="mo-strongbox" />
      <rect x={256} y={88} width={42} height={26} rx={5} className="mo-strongbox" />
      <path d="M277 72 V88" className="mo-line" />
      <Label x={277} y={24} anchor="middle">encoder</Label>
    </svg>
  );
}

/** Software, MLOps and DevOps: the loop from code to a monitored release, around a model. */
export function PipelineMotif() {
  const steps = [
    { x: 40, y: 75, t: 'code' },
    { x: 110, y: 30, t: 'build' },
    { x: 210, y: 30, t: 'test' },
    { x: 280, y: 75, t: 'ship' },
    { x: 160, y: 124, t: 'monitor' },
  ];
  return (
    <svg viewBox="0 0 320 150" aria-hidden="true" focusable="false">
      <path d="M40 75 L110 30 L210 30 L280 75 L160 124 Z" className="mo-line mo-dash" />
      <g transform="translate(160 78)">
        <path d="M0 -20 L18 -10 L18 10 L0 20 L-18 10 L-18 -10 Z" className="mo-strongbox" />
        <path d="M0 -20 L0 0 M-18 -10 L0 0 L18 -10" className="mo-line" />
        <text x={26} y={4} className="mo-text">model</text>
      </g>
      {steps.map((s, i) => (
        <g key={s.t}>
          <circle cx={s.x} cy={s.y} r={9} className={i === 3 ? 'mo-accfill' : 'mo-node'} />
          <text x={s.x} y={s.y + (s.y > 100 ? 24 : -16)} className="mo-text" textAnchor="middle">
            {s.t}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** UI and UX: grouping by proximity, spacing redlines and a 44 pt minimum touch target (HIG). */
export function DesignMotif() {
  return (
    <svg viewBox="0 0 320 150" aria-hidden="true" focusable="false">
      <rect x={24} y={10} width={96} height={132} rx={16} className="mo-box" />
      {/* two groups: close inside, apart between (Gestalt proximity) */}
      <rect x={36} y={28} width={72} height={10} rx={3} className="mo-cell" />
      <rect x={36} y={42} width={52} height={10} rx={3} className="mo-cell" />
      <rect x={36} y={70} width={72} height={10} rx={3} className="mo-cell" />
      <rect x={36} y={84} width={60} height={10} rx={3} className="mo-cell" />
      <rect x={36} y={112} width={72} height={20} rx={10} className="mo-accfill" />
      {/* redlines */}
      <path d="M128 52 V70" className="mo-acc" />
      <path d="M124 52 H132 M124 70 H132" className="mo-acc" />
      <Label x={138} y={65}>group gap</Label>
      {/* touch target */}
      <rect x={210} y={40} width={44} height={44} rx={10} className="mo-box mo-dash" />
      <circle cx={232} cy={62} r={9} className="mo-accfill" />
      <path d="M210 96 H254 M210 92 V100 M254 92 V100" className="mo-acc" />
      <Label x={232} y={114} anchor="middle">44 pt target</Label>
    </svg>
  );
}

/** Research: field notes clustered into themes (an affinity map), next to a written paper. */
export function ResearchMotif() {
  const notes: [number, number, boolean][] = [
    [22, 30, false], [48, 24, false], [36, 52, false],
    [104, 40, true], [128, 30, true], [118, 62, true],
    [70, 96, false], [96, 104, false],
  ];
  return (
    <svg viewBox="0 0 320 150" aria-hidden="true" focusable="false">
      <ellipse cx={46} cy={50} rx={42} ry={34} className="mo-line mo-dash" />
      <ellipse cx={124} cy={52} rx={40} ry={36} className="mo-acc mo-dash" />
      <ellipse cx={90} cy={110} rx={44} ry={26} className="mo-line mo-dash" />
      {notes.map(([x, y, hot], i) => (
        <rect key={i} x={x} y={y} width={22} height={18} rx={3} className={hot ? 'mo-accfill' : 'mo-cell'} />
      ))}
      <Label x={160} y={140} anchor="middle">themes</Label>
      <path d="M186 80 H204" className="mo-line mo-arrow" />
      <rect x={214} y={22} width={84} height={112} rx={8} className="mo-box" />
      {[40, 52, 64, 76, 96, 108].map((y) => (
        <rect key={y} x={226} y={y} width={y === 76 || y === 108 ? 40 : 60} height={5} rx={2.5} className="mo-cell" />
      ))}
      <Label x={256} y={14} anchor="middle">paper</Label>
    </svg>
  );
}
