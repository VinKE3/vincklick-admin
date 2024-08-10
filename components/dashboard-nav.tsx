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
      href: `/${params.storeId}/providers`,
      title: "Proveedores",
      label: "Proveedores",
      icon: "user",
      active: pathname === `/${params.storeId}/providers`,
    },
    {
      href: `/${params.storeId}/colors`,
      title: "Colores Tienda",
      label: "Colores Tienda",
      icon: "palette",
      active: pathname === `/${params.storeId}/colors`,
    },
    {
      href: `/${params.storeId}/billboards`,
      title: "Banners",
      label: "Banners",
      icon: "galleryVertical",
      active: pathname === `/${params.storeId}/billboards`,
    },
    {
      href: `/${params.storeId}/categories`,
      title: "Categorias",
      label: "Categorias",
      icon: "copyPlus",
      active: pathname === `/${params.storeId}/categories`,
    },
    {
      href: `/${params.storeId}/subCategories`,
      title: "SubCategorias",
      label: "SubCategorias",
      icon: "layers",
      active: pathname === `/${params.storeId}/subCategories`,
    },
    {
      href: `/${params.storeId}/brands`,
      title: "Marcas",
      label: "Marcas",
      icon: "dices",
      active: pathname === `/${params.storeId}/brands`,
    },
    {
      href: `/${params.storeId}/banners`,
      title: "Banner Principal",
      label: "Banner Principal",
      icon: "galleryThumbnails",
      active: pathname === `/${params.storeId}/banners`,
    },
    {
      href: `/${params.storeId}/attributes`,
      title: "Atributos de los productos",
      label: "Atributos de los productos",
      icon: "ruler",
      active: pathname === `/${params.storeId}/attributes`,
    },
    {
      href: `/${params.storeId}/products`,
      title: "Productos",
      label: "Productos",
      icon: "monitor",
      active: pathname === `/${params.storeId}/products`,
    },
    {
      href: `/${params.storeId}/productsVariants`,
      title: "Variaciones de Productos",
      label: "Variaciones de Productos",
      icon: "monitor",
      active: pathname === `/${params.storeId}/productsVariants`,
    },
    {
      href: `/${params.storeId}/orders`,
      title: "Ordenes",
      label: "Ordenes",
      icon: "listOrdered",
      active: pathname === `/${params.storeId}/orders`,
    },
    {
      href: `/${params.storeId}/settings`,
      title: "Configuración",
      label: "Configuración",
      icon: "settings",
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
