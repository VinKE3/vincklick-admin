"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction } from "react";
import { useSidebar } from "@/hooks/useSidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface DashboardNavProps {
  setOpen?: Dispatch<SetStateAction<boolean>>;
  isMobileNav?: boolean;
}

export function DashboardNav({
  setOpen,
  isMobileNav = false,
}: DashboardNavProps) {
  const pathname = usePathname();
  const params = useParams();
  const { isMinimized } = useSidebar();

  const routes = [
    {
      href: `/${params.storeId}`,
      title: "Dashboard",
      label: "General",
      icon: "dashboard",
      active: pathname === `/${params.storeId}`,
    },
    {
      href: `/${params.storeId}/billboards`,
      title: "Banners",
      label: "Banners",
      icon: "dashboard",
      active: pathname === `/${params.storeId}/billboards`,
    },
    {
      href: `/${params.storeId}/categories`,
      title: "Categorias",
      label: "Categorias",
      icon: "dashboard",
      active: pathname === `/${params.storeId}/categories`,
    },
    {
      href: `/${params.storeId}/sizes`,
      title: "Tamaños",
      label: "Tamaños",
      icon: "dashboard",
      active: pathname === `/${params.storeId}/sizes`,
    },
    {
      href: `/${params.storeId}/colors`,
      title: "Colores",
      label: "Colores",
      icon: "dashboard",
      active: pathname === `/${params.storeId}/colors`,
    },
    {
      href: `/${params.storeId}/products`,
      title: "Productos",
      label: "Productos",
      icon: "dashboard",
      active: pathname === `/${params.storeId}/products`,
    },
    {
      href: `/${params.storeId}/orders`,
      title: "Ordenes",
      label: "Ordenes",
      icon: "dashboard",
      active: pathname === `/${params.storeId}/orders`,
    },
    {
      href: `/${params.storeId}/settings`,
      title: "Configuración",
      label: "Configuración",
      icon: "dashboard",
      active: pathname === `/${params.storeId}/settings`,
    },
  ];

  type IconName = keyof typeof Icons;
  return (
    <nav className="grid items-start gap-2">
      <TooltipProvider>
        {routes.map(({ label, title, href, icon = "", active }) => {
          const Icon = Icons[icon as IconName] || Icons["arrowRight"];
          return (
            href && (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <Link
                    href={active ? "/" : href}
                    className={cn(
                      "flex items-center gap-2 overflow-hidden rounded-md py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                      pathname === href ? "bg-accent" : "transparent",
                      active && "cursor-not-allowed opacity-80"
                    )}
                    onClick={() => {
                      if (setOpen) setOpen(false);
                    }}
                  >
                    <Icon className={`ml-3 size-5`} />

                    {isMobileNav || (!isMinimized && !isMobileNav) ? (
                      <span className="mr-2 truncate">{title}</span>
                    ) : (
                      ""
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  align="center"
                  side="right"
                  sideOffset={8}
                  className={!isMinimized ? "hidden" : "inline-block"}
                >
                  {title}
                </TooltipContent>
              </Tooltip>
            )
          );
        })}
      </TooltipProvider>
    </nav>
  );
}
