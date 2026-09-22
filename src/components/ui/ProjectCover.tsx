import type { Project } from "@/data/content";
import { asset } from "@/lib/asset";

/** Generated cover art for a project (swapped for a real screenshot when `cover` is set). */
export default function ProjectCover({ project, className = "" }: { project: Project; className?: string }) {
  const c = project.color;
  if (project.cover) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={asset(project.cover)} alt="" className={`h-full w-full object-cover ${className}`} />;
  }
  const isMobile = project.category === "Mobile App";
  return (
    <div
      aria-hidden="true"
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(120% 90% at 85% 10%, ${c}55, transparent 55%), radial-gradient(80% 70% at 10% 100%, ${c}22, transparent 60%), #07060f`,
      }}
    >
      <div className="absolute inset-0 bg-grid opacity-60" />
      <div
        className="absolute -right-6 bottom-[-12%] select-none font-display text-[7rem] font-black leading-none opacity-15"
        style={{ color: c }}
      >
        {project.title.slice(0, 2).toUpperCase()}
      </div>
      {isMobile ? (
        <div className="absolute left-1/2 top-[14%] flex -translate-x-1/2 gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-36 w-[4.5rem] rounded-xl border bg-black/60 p-1.5"
              style={{ borderColor: `${c}66`, transform: `translateY(${i === 1 ? -10 : 6}px)` }}
            >
              <div className="h-8 rounded-md" style={{ background: `${c}aa` }} />
              <div className="mt-1.5 space-y-1">
                {[0, 1, 2, 3].map((k) => (
                  <div key={k} className="h-3 rounded-sm bg-white/10" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="absolute left-[10%] right-[10%] top-[14%] rounded-md border bg-black/60 p-2" style={{ borderColor: `${c}66` }}>
          <div className="mb-2 flex gap-1">
            {[0, 1, 2].map((k) => (
              <span key={k} className="h-1.5 w-1.5 rounded-full bg-white/25" />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <div className="col-span-2 h-14 rounded-sm" style={{ background: `${c}99` }} />
            <div className="h-14 rounded-sm bg-white/10" />
            <div className="h-6 rounded-sm bg-white/10" />
            <div className="h-6 rounded-sm bg-white/10" />
            <div className="h-6 rounded-sm" style={{ background: `${c}55` }} />
          </div>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#07060f] to-transparent" />
    </div>
  );
}
