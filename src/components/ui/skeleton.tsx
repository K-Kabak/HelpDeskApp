/**
 * Reusable skeleton loading components
 */

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="h-3 w-16 bg-slate-200 rounded animate-pulse"></div>
        <div className="flex gap-2">
          <div className="h-5 w-12 bg-slate-200 rounded-full animate-pulse"></div>
          <div className="h-5 w-16 bg-slate-200 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div className="h-5 w-full bg-slate-200 rounded mb-2 animate-pulse"></div>
      <div className="h-4 w-3/4 bg-slate-200 rounded mb-2 animate-pulse"></div>
      <div className="h-3 w-24 bg-slate-200 rounded mb-1 animate-pulse"></div>
      <div className="h-3 w-32 bg-slate-200 rounded animate-pulse"></div>
    </div>
  );
}

export function SkeletonTicketCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="h-3 w-16 bg-slate-200 rounded animate-pulse"></div>
        <div className="flex gap-2">
          <div className="h-5 w-12 bg-slate-200 rounded-full animate-pulse"></div>
          <div className="h-5 w-16 bg-slate-200 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-5 w-full bg-slate-200 rounded animate-pulse"></div>
        <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse"></div>
      </div>
      <div className="mt-3 space-y-1">
        <div className="h-3 w-24 bg-slate-200 rounded animate-pulse"></div>
        <div className="h-3 w-32 bg-slate-200 rounded animate-pulse"></div>
      </div>
      <div className="mt-2 h-3 w-40 bg-slate-200 rounded animate-pulse"></div>
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4">
        <div className="h-4 w-20 bg-slate-200 rounded mb-2 animate-pulse"></div>
        <div className="h-8 w-3/4 bg-slate-200 rounded mb-3 animate-pulse"></div>
        <div className="h-4 w-48 bg-slate-200 rounded animate-pulse"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full bg-slate-200 rounded animate-pulse"></div>
        <div className="h-4 w-full bg-slate-200 rounded animate-pulse"></div>
        <div className="h-4 w-5/6 bg-slate-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

export function SkeletonComment() {
  return (
    <div className="relative flex gap-3 pl-12">
      <div className="absolute left-0 top-0 h-10 w-10 bg-slate-200 rounded-full animate-pulse"></div>
      <div className="w-full rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-3 w-24 bg-slate-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-200 rounded animate-pulse"></div>
          <div className="h-4 w-5/6 bg-slate-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <tr className="border-b border-slate-200">
      {[1, 2, 3, 4].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
        </td>
      ))}
    </tr>
  );
}

