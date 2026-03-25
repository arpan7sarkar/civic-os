"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    Search,
    X,
    FileDown,
    FileText,
    ChevronRight,
    LayoutDashboard,
    ClipboardList,
    Map,
    Settings,
    LogOut,
    Plus,
    RefreshCw,
    Loader2,
    ShieldAlert,
    CheckCircle,
    Clock,
    AlertCircle,
    Menu,
    User,
    XCircle,
    Filter,
    Hash,
    Calendar,
    Building2,
    MapPin,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { getServerProfileAction, UserProfile } from "@/app/actions/profile";
import { getMyGrievancesPaginatedAction } from "@/app/actions/grievance";
import { getComplaints, syncGrievances } from "@/lib/store";
import { Complaint } from "@/lib/types";
import { generateGrievancePDF } from "@/lib/pdf";

// ─── Status helpers ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
    Pending: {
        label: "Pending",
        bg: "bg-amber-50",
        text: "text-amber-700",
        icon: <Clock className="w-3 h-3" />,
    },
    "In Progress": {
        label: "In Progress",
        bg: "bg-blue-50",
        text: "text-blue-700",
        icon: <RefreshCw className="w-3 h-3" />,
    },
    Resolved: {
        label: "Resolved",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        icon: <CheckCircle className="w-3 h-3" />,
    },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? {
        label: status,
        bg: "bg-slate-100",
        text: "text-slate-500",
        icon: <AlertCircle className="w-3 h-3" />,
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${cfg.bg} ${cfg.text}`}>
            {cfg.icon}
            {cfg.label}
        </span>
    );
}

// ─── Skeleton row ──────────────────────────────────────────────────────────────

function SkeletonRow() {
    return (
        <tr className="animate-pulse border-b border-slate-50">
            {[...Array(6)].map((_, i) => (
                <td key={i} className="px-4 py-5">
                    <div className="h-3 bg-slate-100 rounded-full w-3/4" />
                </td>
            ))}
        </tr>
    );
}

function SkeletonCard() {
    return (
        <div className="animate-pulse p-4 border-b border-slate-50">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-100 rounded-full w-1/2" />
                    <div className="h-2 bg-slate-100 rounded-full w-1/3" />
                    <div className="h-2 bg-slate-100 rounded-full w-1/4 mt-2" />
                </div>
                <div className="h-5 bg-slate-100 rounded-full w-16" />
            </div>
        </div>
    );
}

// ─── Sidebar link ──────────────────────────────────────────────────────────────

function SidebarLink({ icon, label, href, active = false }: { icon: React.ReactNode; label: string; href: string; active?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                active ? "bg-gov-blue/5 text-gov-blue shadow-inner" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
        >
            <span className={active ? "text-gov-blue" : "text-slate-400"}>{icon}</span>
            {label}
        </Link>
    );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function MyReportsPage() {
    const router = useRouter();

    // ── State ──
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isInitLoading, setIsInitLoading] = useState(true);

    // Paginated items from cloud
    const [items, setItems] = useState<Complaint[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isFirstFetch, setIsFirstFetch] = useState(true); // skeleton on first load

    // Search (client-side, no re-fetch per keystroke)
    const [searchTerm, setSearchTerm] = useState("");
    const searchRef = useRef<HTMLInputElement>(null);

    // Error banner
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Mobile sidebar
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    // ── Fetch first page ──
    const fetchFirstPage = useCallback(async () => {
        setIsFirstFetch(true);
        setFetchError(null);
        try {
            const res = await getMyGrievancesPaginatedAction({ limit: 25 });
            if (!res.success) throw new Error(res.error ?? "FETCH_ERROR");

            const grievances = ((res.grievances ?? []) as any[]).map(normalizeGrievance);
            // Also merge with local cache for offline-first
            if (userProfile) syncGrievances(grievances, userProfile.userId);

            // Merge local-only unsynced entries
            const localAll = userProfile ? getComplaints(userProfile.userId) : [];
            const merged = mergeWithLocal(grievances, localAll);

            setItems(merged);
            setCursor((res as any).nextCursor ?? null);
            setHasMore(!!(res as any).hasMore);
        } catch (err: any) {
            console.error("[MY_REPORTS] fetchFirstPage error:", err);
            // Fallback: use local store
            if (userProfile) {
                const local = getComplaints(userProfile.userId);
                setItems(local);
            }
            setFetchError("Could not load cloud data. Showing cached reports.");
        } finally {
            setIsFirstFetch(false);
        }
    }, [userProfile]);

    // ── Load more ──
    const handleLoadMore = async () => {
        if (!cursor || isLoadingMore) return;
        setIsLoadingMore(true);
        setFetchError(null);
        try {
            const res = await getMyGrievancesPaginatedAction({ cursor, limit: 25 });
            if (!res.success) throw new Error(res.error ?? "FETCH_ERROR");

            const newItems = ((res.grievances ?? []) as any[]).map(normalizeGrievance);
            setItems(prev => mergeWithLocal([...prev, ...newItems], prev));
            setCursor((res as any).nextCursor ?? null);
            setHasMore(!!(res as any).hasMore);
        } catch (err: any) {
            setFetchError("Failed to load more. Please try again.");
        } finally {
            setIsLoadingMore(false);
        }
    };

    // ── Init: resolve profile then fetch ──
    useEffect(() => {
        let cancelled = false;

        const init = async () => {
            try {
                const result = await getServerProfileAction();
                if (cancelled) return;

                if (!result.success || !result.profile) {
                    router.replace("/auth");
                    return;
                }
                if (result.profile.role === "authority") {
                    router.replace("/authority");
                    return;
                }
                setUserProfile(result.profile);
            } catch {
                router.replace("/auth");
            } finally {
                if (!cancelled) setIsInitLoading(false);
            }
        };
        init();
        return () => { cancelled = true; };
    }, [router]);

    // Fetch data after profile resolves
    useEffect(() => {
        if (userProfile) fetchFirstPage();
    }, [userProfile, fetchFirstPage]);

    // ── Filtered view (client-side, no cloud re-fetch) ──
    const filtered = searchTerm.trim()
        ? items.filter(c => {
              const term = searchTerm.toLowerCase();
              return (
                  (c.id ?? "").toLowerCase().includes(term) ||
                  (c.category ?? "").toLowerCase().includes(term) ||
                  (c.ward ?? "").toLowerCase().includes(term) ||
                  (c.description ?? "").toLowerCase().includes(term) ||
                  (c.status ?? "").toLowerCase().includes(term)
              );
          })
        : items;

    const handleLogout = async () => {
        await logoutAction();
        router.push("/");
    };

    // ── Loading gate ──
    if (isInitLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-gov-blue animate-spin" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading My Reports…</p>
                </div>
            </div>
        );
    }

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            {/* Mobile sidebar overlay */}
            {showMobileSidebar && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setShowMobileSidebar(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <aside
                className={`w-64 bg-white border-r border-slate-100 flex flex-col fixed inset-y-0 z-50 transition-transform duration-300 lg:translate-x-0 ${
                    showMobileSidebar ? "translate-x-0" : "-translate-x-full"
                } lg:z-20`}
            >
                <div className="p-6 flex items-center justify-between border-b border-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10">
                            <Image src="/logo1.png" alt="MCD Logo" fill className="object-contain" sizes="40px" />
                        </div>
                        <div>
                            <h1 className="text-sm font-black text-slate-800 leading-none">Govt. of India</h1>
                            <p className="text-[10px] text-gov-blue font-black mt-1 uppercase tracking-widest">CivicOS National</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowMobileSidebar(false)}
                        className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 lg:hidden"
                        id="close-sidebar-btn"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <SidebarLink icon={<LayoutDashboard className="w-4 h-4" />} label="Overview" href="/dashboard" />
                    <SidebarLink icon={<ClipboardList className="w-4 h-4" />} label="My Reports" href="/dashboard/my-reports" active />
                    <SidebarLink icon={<Map className="w-4 h-4" />} label="Local Map" href="/map" />
                    <SidebarLink icon={<ShieldAlert className="w-4 h-4" />} label="Emergency" href="/dashboard" />
                    <div className="pt-8 pb-2 px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Support</div>
                    <SidebarLink icon={<Settings className="w-4 h-4" />} label="Preferences" href="/dashboard" />
                    <div className="pt-4">
                        <button
                            onClick={handleLogout}
                            id="sidebar-logout-btn"
                            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
                        >
                            <LogOut className="w-4 h-4 text-red-400" />
                            <span>Logout Session</span>
                        </button>
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-50">
                    <Link
                        href="/report"
                        className="w-full py-3 bg-gov-blue text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-gov-blue/10 flex items-center justify-center gap-2 group transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>New Report</span>
                    </Link>
                </div>
            </aside>

            {/* ── Main content ── */}
            <main className="flex-1 lg:ml-64 p-4 md:p-8 pb-32 lg:pb-8">
                {/* Header */}
                <header className="flex items-center gap-3 mb-6 md:mb-8 bg-white/50 backdrop-blur-md p-2 md:p-4 rounded-2xl md:rounded-3xl border border-white/50 shadow-sm sticky top-0 md:top-4 z-10">
                    <button
                        onClick={() => setShowMobileSidebar(true)}
                        id="mobile-menu-btn"
                        className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 lg:hidden flex-shrink-0"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Breadcrumb */}
                    <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400">
                        <Link href="/dashboard" className="hover:text-gov-blue transition-colors">Overview</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-slate-700">My Reports</span>
                    </div>

                    <div className="flex-1" />

                    {/* User pill */}
                    <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                        <div className="w-8 h-8 rounded-xl overflow-hidden shadow bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                            {userProfile?.profileImageUrl ? (
                                <Image
                                    src={userProfile.profileImageUrl.startsWith("http")
                                        ? userProfile.profileImageUrl
                                        : `https://sgp.cloud.appwrite.io/v1/storage/buckets/profile-images/files/${userProfile.profileImageUrl}/view?project=civicos-app`}
                                    alt="Avatar"
                                    fill
                                    className="object-cover"
                                    sizes="32px"
                                    unoptimized={!userProfile.profileImageUrl.startsWith("http")}
                                />
                            ) : (
                                <User className="w-4 h-4" />
                            )}
                        </div>
                        <p className="text-sm font-black text-slate-800 hidden sm:block leading-none truncate max-w-[120px]">
                            {userProfile?.name ?? "Citizen"}
                        </p>
                    </div>
                </header>

                {/* Page title + search */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800">My Grievance History</h1>
                        <p className="text-sm text-slate-400 font-medium mt-1">
                            All reports you have submitted — newest first
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                ref={searchRef}
                                id="my-reports-search"
                                type="text"
                                placeholder="Search ID, category, ward…"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-gov-blue/10 shadow-sm transition-all"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    id="clear-search-btn"
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                                >
                                    <XCircle className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Refresh */}
                        <button
                            onClick={fetchFirstPage}
                            id="refresh-reports-btn"
                            disabled={isFirstFetch}
                            className="flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-100 text-gov-blue rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${isFirstFetch ? "animate-spin" : ""}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Error banner */}
                {fetchError && (
                    <div className="mb-4 flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700 text-xs font-bold">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span className="flex-1">{fetchError}</span>
                        <button
                            onClick={fetchFirstPage}
                            id="retry-fetch-btn"
                            className="underline underline-offset-2 flex-shrink-0"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* ── Main card ── */}
                <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">

                    {/* Summary bar */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {isFirstFetch ? "Loading…" : `${filtered.length} ${searchTerm ? "matching" : "loaded"} report${filtered.length !== 1 ? "s" : ""}`}
                            </span>
                            {searchTerm && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-gov-blue/5 text-gov-blue text-[10px] font-black rounded-full">
                                    <Filter className="w-2.5 h-2.5" />
                                    Filtered
                                </span>
                            )}
                        </div>
                        <Link
                            href="/map"
                            className="flex items-center gap-1.5 text-[10px] font-black text-gov-blue uppercase tracking-widest hover:underline"
                        >
                            <MapPin className="w-3 h-3" />
                            View on Map
                        </Link>
                    </div>

                    {/* ─── Desktop table ─── */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left min-w-[760px]">
                            <thead>
                                <tr className="border-b border-slate-50 bg-slate-50/40">
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><Hash className="w-3 h-3" />Ticket ID</span>
                                    </th>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />Ward</span>
                                    </th>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><Building2 className="w-3 h-3" />Assigned To</span>
                                    </th>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />Date</span>
                                    </th>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isFirstFetch ? (
                                    [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                                ) : filtered.length > 0 ? (
                                    filtered.map(item => (
                                        <tr key={item.id} className="group hover:bg-slate-50/60 transition-colors">
                                            <td className="px-5 py-5 text-xs font-black text-slate-500">
                                                #{item.id?.slice(0, 10)}
                                            </td>
                                            <td className="px-5 py-5">
                                                <span className="text-sm font-bold text-slate-800">{item.category}</span>
                                            </td>
                                            <td className="px-5 py-5">
                                                <p className="text-sm font-bold text-slate-800 leading-snug">{item.ward}</p>
                                            </td>
                                            <td className="px-5 py-5">
                                                <StatusBadge status={item.status} />
                                            </td>
                                            <td className="px-5 py-5 text-sm font-medium text-slate-600">
                                                {item.assignedTo || "Department Review"}
                                            </td>
                                            <td className="px-5 py-5 text-xs font-medium text-slate-500 whitespace-nowrap">
                                                {formatDate(item.createdAt)}
                                            </td>
                                            <td className="px-5 py-5 text-right">
                                                <button
                                                    onClick={() => generateGrievancePDF(item)}
                                                    title="Download PDF Receipt"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-500 hover:text-gov-blue hover:bg-gov-blue/5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors"
                                                >
                                                    <FileDown className="w-3.5 h-3.5" />
                                                    <span>PDF</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-16 text-center">
                                            <EmptyState searched={!!searchTerm} />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ─── Mobile card list ─── */}
                    <div className="block md:hidden divide-y divide-slate-50">
                        {isFirstFetch ? (
                            [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
                        ) : filtered.length > 0 ? (
                            filtered.map(item => (
                                <div key={item.id} className="p-4 flex items-start justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex-shrink-0 flex items-center justify-center text-slate-400 border border-slate-100">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-bold text-slate-800 truncate">{item.category}</h3>
                                            <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400 mt-0.5">
                                                <span>#{item.id?.slice(0, 10)}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                <span className="truncate max-w-[100px]">{item.ward}</span>
                                            </div>
                                            <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                                <StatusBadge status={item.status} />
                                                <span className="text-[10px] text-slate-400">{formatDate(item.createdAt)}</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-500 mt-1">
                                                {item.assignedTo || "Department Review"}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => generateGrievancePDF(item)}
                                        title="Download PDF"
                                        className="p-2 hover:bg-gov-blue/5 rounded-lg text-slate-400 hover:text-gov-blue transition-colors flex-shrink-0"
                                    >
                                        <FileDown className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="p-8">
                                <EmptyState searched={!!searchTerm} />
                            </div>
                        )}
                    </div>

                    {/* ─── Footer: load more / search note ─── */}
                    {!isFirstFetch && (
                        <div className="border-t border-slate-50 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                            {searchTerm ? (
                                <p className="text-[11px] font-bold text-slate-400">
                                    Showing {filtered.length} result{filtered.length !== 1 ? "s" : ""} from {items.length} loaded reports.{" "}
                                    {hasMore && <span>Load more to search further.</span>}
                                </p>
                            ) : (
                                <p className="text-[11px] font-bold text-slate-400">
                                    {items.length} report{items.length !== 1 ? "s" : ""} loaded.
                                </p>
                            )}

                            {hasMore && (
                                <button
                                    onClick={handleLoadMore}
                                    disabled={isLoadingMore}
                                    id="load-more-btn"
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gov-blue text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-gov-blue/10 hover:bg-gov-blue/90 active:scale-95 transition-all disabled:opacity-60 disabled:scale-100"
                                >
                                    {isLoadingMore ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            Loading…
                                        </>
                                    ) : (
                                        <>
                                            Load more reports
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function normalizeGrievance(doc: any): Complaint {
    return {
        id: doc.$id || doc.id,
        userId: doc.userId,
        description: doc.description,
        category: doc.category,
        priority: doc.priority,
        department: doc.department,
        ward: doc.ward,
        lat: doc.lat,
        lng: doc.lng,
        status: doc.status || "Pending",
        assignedTo: doc.assignedTo,
        createdAt: doc.createdAt || doc.$createdAt,
        citizenPhoto: doc.citizenPhoto,
        repairPhoto: doc.repairPhoto,
    } as Complaint;
}

/** Merge newItems into existing, deduplicating by id — newItems win */
function mergeWithLocal(newItems: Complaint[], existing: Complaint[]): Complaint[] {
    const record: Record<string, Complaint> = {};
    existing.forEach((c: Complaint) => { record[c.id] = c; });
    newItems.forEach((c: Complaint) => { record[c.id] = c; }); // new wins
    return Object.values(record).sort(
        (a: Complaint, b: Complaint) =>
            new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()
    );
}

function formatDate(iso?: string): string {
    if (!iso) return "—";
    try {
        return new Intl.DateTimeFormat("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

function EmptyState({ searched }: { searched: boolean }) {
    return (
        <div className="flex flex-col items-center gap-3 text-slate-300">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                <FileText className="w-8 h-8" />
            </div>
            <div className="text-center">
                <p className="text-sm font-black text-slate-400">
                    {searched ? "No matching reports found" : "No reports submitted yet"}
                </p>
                <p className="text-[11px] font-medium text-slate-300 mt-1">
                    {searched
                        ? "Try a different search term or clear the filter."
                        : "Your grievance history will appear here once you submit a report."}
                </p>
            </div>
            {!searched && (
                <Link
                    href="/report"
                    className="mt-2 px-5 py-2.5 bg-gov-blue text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-gov-blue/10 hover:bg-gov-blue/90 active:scale-95 transition-all"
                >
                    Submit First Report
                </Link>
            )}
        </div>
    );
}
