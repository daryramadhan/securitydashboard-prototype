import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInCalendarDays, parseISO, format, isValid } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates remaining days and formatted label based on PRD Section 4.1 C & D
 * Examples:
 * - "45 days remaining"
 * - "7 days remaining"
 * - "Ends today"
 * - "End date passed"
 * - "End date not set"
 */
export function getProjectDurationInfo(endDateStr?: string | null): {
  label: string;
  daysRemaining: number | null;
  status: 'active' | 'warning' | 'urgent' | 'ended' | 'unset';
} {
  if (!endDateStr) {
    return {
      label: "End date not set",
      daysRemaining: null,
      status: "unset",
    };
  }

  const end = parseISO(endDateStr);
  if (!isValid(end)) {
    return {
      label: "Invalid date",
      daysRemaining: null,
      status: "unset",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = differenceInCalendarDays(end, today);

  if (diffDays < 0) {
    return {
      label: `End date passed (${Math.abs(diffDays)}d ago)`,
      daysRemaining: diffDays,
      status: "ended",
    };
  } else if (diffDays === 0) {
    return {
      label: "Ends today",
      daysRemaining: 0,
      status: "urgent",
    };
  } else if (diffDays <= 7) {
    return {
      label: `${diffDays} days remaining`,
      daysRemaining: diffDays,
      status: "urgent",
    };
  } else if (diffDays <= 30) {
    return {
      label: `${diffDays} days remaining`,
      daysRemaining: diffDays,
      status: "warning",
    };
  } else {
    return {
      label: `${diffDays} days remaining`,
      daysRemaining: diffDays,
      status: "active",
    };
  }
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "-";
  const date = parseISO(dateString);
  if (!isValid(date)) return dateString;
  return format(date, "dd MMM yyyy");
}

/**
 * Client-side CSV Exporter according to PRD Section 4.7
 */
export function exportToCsv(filename: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]) {
  const sanitize = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(sanitize).join(","),
    ...rows.map((row) => row.map(sanitize).join(",")),
  ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${format(new Date(), "yyyyMMdd_HHmm")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
