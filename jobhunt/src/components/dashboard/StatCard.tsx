type StatColor = 'primary' | 'accent' | 'danger' | 'default';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext: string;
  color?: StatColor;
}

const colorMap: Record<StatColor, string> = {
  primary: 'text-primary',
  accent: 'text-accent',
  danger: 'text-danger',
  default: 'text-[#151C24] dark:text-white',
};

export default function StatCard({ label, value, subtext, color = 'default' }: StatCardProps) {
  return (
    <div className="bg-surface dark:bg-surface-dark rounded-2xl p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral">
        {label}
      </p>
      <p className={`text-3xl font-bold mt-2 ${colorMap[color]}`}>
        {value}
      </p>
      <p className="text-xs text-neutral mt-2">
        {subtext}
      </p>
    </div>
  );
}