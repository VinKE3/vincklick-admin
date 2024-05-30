"use client";

import { ColumnDef } from "@tanstack/react-table";

import { CellAction } from "./cell-action";

export type BannerColumn = {
  id: string;
  heading: string;
  createdAt: string;
};

export const columns: ColumnDef<BannerColumn>[] = [
  {
    accessorKey: "heading",
    header: "Título",
  },
  {
    accessorKey: "createdAt",
    header: "Dia de Creacion",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
