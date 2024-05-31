"use client";

import { ColumnDef } from "@tanstack/react-table";

import { CellAction } from "./cell-action";

export type AttributesColumn = {
  id: string;
  name: string;
  values: string[];
  createdAt: string;
};

export const columns: ColumnDef<AttributesColumn>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "values",
    header: "Valores",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        {row.original.values.map((value, index) => (
          <span key={index} className="rounded-md px-2 py-1 text-sm">
            {value}
          </span>
        ))}
      </div>
    ),
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
