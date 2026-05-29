import { cn } from "@/lib/utils";

export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">{eyebrow}</p> : null}
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-slate-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
