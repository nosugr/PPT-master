"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FolderOpen, LayoutTemplate, Plus, Globe, Sun, KeyRound, Moon, Monitor, Settings, ChevronDown, LayoutDashboard } from "lucide-react";
import { useTranslation, LOCALE_OPTIONS, type Locale } from "@/lib/i18n";
import { projects } from "@/lib/api";

export function AppSidebar() {
  const pathname = usePathname();
  const { t, locale, setLocale } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [projectCount, setProjectCount] = useState<number | null>(null);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    projects.list().then((list) => setProjectCount(list.length)).catch(() => {});
  }, []);

  const themeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  const ThemeIcon = themeIcon;

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between px-2 py-2">
          <Link href="/about" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              P
            </div>
            <span className="font-semibold text-lg">PPT Master</span>
          </Link>
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.navigation")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Main nav items */}
              {[
                { title: t("dashboard.title"), href: "/dashboard", icon: LayoutDashboard, badge: null },
                { title: t("nav.projects"), href: "/projects", icon: FolderOpen, badge: projectCount },
                { title: t("nav.newProject"), href: "/projects/new", icon: Plus, badge: null },
                { title: t("nav.templates"), href: "/templates", icon: LayoutTemplate, badge: null },
              ].map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={pathname === item.href || (item.href !== "/projects/new" && item.href !== "/dashboard" && pathname.startsWith(item.href + "/"))}
                  >
                    <item.icon className="size-4" />
                    <span className="flex-1">{item.title}</span>
                    {item.badge != null && item.badge > 0 && (
                      <span className="ml-auto text-[10px] font-medium bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                        {item.badge}
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* API Key — below Templates */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/settings" />}
                  isActive={pathname === "/settings"}
                >
                  <KeyRound className="size-4" />
                  <span>{t("nav.apiKey")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Separator className="mb-1" />
        <div className="px-2 pb-2">
          {/* Settings toggle button */}
          <button
            type="button"
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="flex items-center justify-between w-full px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50"
          >
            <span className="flex items-center gap-2">
              <Settings className="size-3.5" />
              {t("nav.settings")}
            </span>
            <ChevronDown className={`size-3.5 transition-transform ${settingsOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Expanded: theme + language */}
          {settingsOpen && (
            <div className="mt-2 space-y-2 pl-1">
              {/* Theme */}
              <div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <ThemeIcon className="size-3" />
                  <span>{t("nav.theme")}</span>
                </div>
                {mounted ? (
                  <Select value={theme || "system"} onValueChange={(v) => { if (v) setTheme(v); }}>
                    <SelectTrigger className="w-full h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">{t("nav.light")}</SelectItem>
                      <SelectItem value="dark">{t("nav.dark")}</SelectItem>
                      <SelectItem value="system">{t("nav.system")}</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="h-7 w-full rounded-md border bg-muted/30" />
                )}
              </div>

              {/* Language */}
              <div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <Globe className="size-3" />
                  <span>{t("nav.language")}</span>
                </div>
                <Select value={locale} onValueChange={(v) => setLocale((v ?? "en") as Locale)}>
                  <SelectTrigger className="w-full h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCALE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebarWrapper />
      <MainContent>{children}</MainContent>
    </SidebarProvider>
  );
}

function AppSidebarWrapper() {
  const pathname = usePathname();
  if (pathname === "/about") return null;
  return <AppSidebar />;
}

function MainContent({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar();
  const pathname = usePathname();
  const isAbout = pathname === "/about";

  if (isAbout) {
    return (
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-auto relative border-l">
      {state === "collapsed" && (
        <div className="fixed top-0 left-0 bottom-0 w-10 z-40 flex items-start justify-center pt-3 border-r bg-background">
          <SidebarTrigger />
        </div>
      )}
      <div className={state === "collapsed" ? "pl-10" : ""}>
        <div className="p-6">{children}</div>
      </div>
    </main>
  );
}
