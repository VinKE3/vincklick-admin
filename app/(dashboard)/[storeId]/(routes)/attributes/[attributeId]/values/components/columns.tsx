"use client";

import { ColumnDef } from "@tanstack/react-table";

import { CellAction } from "./cell-action";

export type AttributeValueColumn = {
  id: string;
  attribute: string;
  value: string;
  createdAt: string;
};

export const columns: ColumnDef<AttributeValueColumn>[] = [
  {
    accessorKey: "attribute",
    header: "Atributo",
  },
  {
    accessorKey: "value",
    header: "Valor",
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
