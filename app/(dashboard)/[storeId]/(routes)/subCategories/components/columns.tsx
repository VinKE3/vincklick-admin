"use client";

import { ColumnDef } from "@tanstack/react-table";

import { CellAction } from "./cell-action";

export type SubCategoryColumn = {
  id: string;
  name: string;
  createdAt: string;
};

export const columns: ColumnDef<SubCategoryColumn>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "category",
    header: "Categoría Padre",
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
