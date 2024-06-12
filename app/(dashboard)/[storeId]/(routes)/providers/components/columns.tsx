"use client";

import { ColumnDef } from "@tanstack/react-table";

import { CellAction } from "./cell-action";

export type ProviderColumn = {
  id: string;
  name: string;
  createdAt: string;
};

export const columns: ColumnDef<ProviderColumn>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Teléfono",
  },
  {
    accessorKey: "address",
    header: "Direccion",
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
