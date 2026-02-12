"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PageLoader } from "@/components/ui/preloader";
import { buildApiUrl, getCurrentUser } from "@/lib/api-client";

interface Dream {
  id: string;
  title: string;
  content: string;
  status: string;
  createdAt: string;
}

export default function DreamsPage() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status");
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  const filteredDreams = useMemo(() => {
    if (!statusFilter || statusFilter === "total") return dreams;
    return dreams.filter((d) => d.status === statusFilter);
  }, [dreams, statusFilter]);

  useEffect(() => {
    const fetchDreams = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push("/auth/login");
          return;
        }
        const userRole = currentUser.profile?.role ?? "dreamer";
        setRole(userRole);

        const endpoint =
          userRole === "interpreter"
            ? "/dreams/assigned"
            : userRole === "admin" || userRole === "super_admin"
              ? "/dreams"
              : "/dreams/my-dreams";

        const response = await fetch(buildApiUrl(endpoint), {
          method: "GET",
          credentials: "include",
        });

        if (response.status === 401) {
          router.push("/auth/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch dreams");
        }

        const data = await response.json();
        setDreams(data);
      } catch (err) {
        console.error("[Dreams] Error fetching dreams:", err);
        setError("فشل تحميل الرؤى");
      } finally {
        setLoading(false);
      }
    };

    fetchDreams();
  }, [router]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      new: { label: "جديدة", className: "bg-sky-100 text-sky-700" },
      pending_inquiry: {
        label: "قيد الاستفسار",
        className: "bg-amber-100 text-amber-700",
      },
      pending_interpretation: {
        label: "قيد التفسير",
        className: "bg-indigo-100 text-indigo-700",
      },
      interpreted: {
        label: "تم التفسير",
        className: "bg-emerald-100 text-emerald-700",
      },
      returned: { label: "مرجعة", className: "bg-rose-100 text-rose-600" },
    };
    return (
      statusMap[status] || {
        label: status,
        className: "bg-slate-100 text-slate-600",
      }
    );
  };

  if (loading) {
    return <PageLoader message="جاري تحميل رؤاك..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24">
        <Card className="p-6 max-w-md mx-auto text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            إعادة المحاولة
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 pb-28">
      <header className="rounded-b-[2rem] bg-gradient-to-br from-sky-600 via-sky-500 to-amber-300 px-4 py-10 text-center text-white shadow-xl">
        <h1 className="text-3xl font-bold">
          {role === "interpreter"
            ? "المُعيَّنة لي"
            : role === "admin" || role === "super_admin"
              ? "تعيين الرؤى"
              : "رؤاي"}
        </h1>
        <p className="mt-2 text-sm text-white/80">
          {role === "interpreter"
            ? "الرؤى المُكلَّفة إليك لتفسيرها."
            : role === "admin" || role === "super_admin"
              ? "جميع الرؤى لتعيينها للمفسرين."
              : "سجل جميع الرؤى التي تود تفسيرها واحتفظ بسجل كامل لها."}
        </p>
      </header>

      <main className="mx-auto mt-6 flex w-full max-w-3xl flex-col gap-6 px-4">
        {role === "dreamer" && (
          <section className="rounded-3xl border border-sky-100 bg-white/95 p-5 shadow-lg backdrop-blur">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  أرسل رؤيا جديدة
                </h2>
                <p className="text-sm text-slate-500">
                  استعن بمفسرينا المعتمدين لتفسير رؤاك بدقة وسرية تامة.
                </p>
              </div>
              <Link href="/dreams/new" className="w-full md:w-auto">
                <Button className="w-full rounded-full bg-gradient-to-r from-sky-500 via-sky-400 to-amber-300 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-xl">
                  شارك رؤيا جديدة
                </Button>
              </Link>
            </div>
          </section>
        )}

        {filteredDreams.length === 0 ? (
          <Card className="flex flex-col items-center gap-4 rounded-3xl border border-sky-100 bg-white/95 p-8 text-center shadow-md">
            <p className="text-slate-600">
              {statusFilter
                ? "لا توجد رؤى في هذه الفئة."
                : role === "interpreter"
                  ? "لا توجد رؤى مُعيَّنة لك حالياً."
                  : role === "admin" || role === "super_admin"
                    ? "لا توجد رؤى لتعيينها حالياً."
                    : "لم تشارك أي رؤى بعد."}
            </p>
            {role === "dreamer" && (
              <Link href="/dreams/new">
                <Button className="rounded-full bg-gradient-to-r from-sky-500 to-amber-300 px-6 py-3 font-semibold text-white shadow-md">
                  شارك رؤيتك الآن
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="space-y-3">
            {statusFilter && (
              <p className="text-sm text-slate-500 text-center">
                عرض الرؤى:{" "}
                {statusFilter === "new" && "جديدة"}
                {statusFilter === "pending_payment" && "بانتظار الدفع"}
                {statusFilter === "pending_inquiry" && "قيد الاستفسار"}
                {statusFilter === "pending_interpretation" && "قيد التفسير"}
                {statusFilter === "interpreted" && "تم التفسير"}
                {statusFilter === "returned" && "مرجعة"}
                {" — "}
                <Link href="/dreams" className="text-sky-600 underline">
                  عرض الكل
                </Link>
              </p>
            )}
            {filteredDreams.map((dream) => {
              const statusInfo = getStatusBadge(dream.status);
              const isUnpaid = dream.status === "pending_payment";
              // Only dreamers go to plans to pay; interpreters and admins always open dream detail
              const href =
                isUnpaid && role === "dreamer"
                  ? `/plans?dreamId=${dream.id}&letterCount=${Array.from(dream.title + dream.content).length}`
                  : `/dream/${dream.id}`;

              return (
                <Link
                  key={dream.id}
                  href={href}
                >
                  <Card
                    className={`group relative overflow-hidden rounded-3xl border ${isUnpaid ? "border-amber-200 bg-amber-50/30" : "border-sky-100 bg-white/95"} p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg`}
                  >
                    <div
                      className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${isUnpaid ? "from-amber-400 to-orange-400" : "from-sky-500 to-amber-300"} opacity-70 transition group-hover:opacity-100`}
                    />
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-slate-900">
                            {dream.title}
                          </h3>
                          {isUnpaid && (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] py-0 px-1.5 h-4 flex items-center justify-center">
                              بانتظار الدفع
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {new Date(dream.createdAt).toLocaleDateString(
                            "ar-SA",
                            { day: "numeric", month: "long", year: "numeric" },
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          variant="outline"
                          className={`${statusInfo.className} border-none rounded-full px-3 py-1 text-xs font-semibold`}
                        >
                          {statusInfo.label}
                        </Badge>
                        {isUnpaid && (
                          <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                            انقر لإكمال الدفع
                            <svg
                              className="w-2.5 h-2.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
