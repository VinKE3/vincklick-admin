"use client";

import { ColumnDef } from "@tanstack/react-table";

import { CellAction } from "./cell-action";

export type ProductColumn = {
  id: string;
  name: string;
  price: string;
  category: string;
  createdAt: string;
  isFeatured: boolean;
  isArchived: boolean;
};

export const columns: ColumnDef<ProductColumn>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "isArchived",
    header: "Archivado",
    cell: ({ row }) => {
      return row.original.isArchived ? (
        <div className="text-green-600">Sí</div>
      ) : (
        <div className="text-red-600">No</div>
      );
    },
  },
  {
    accessorKey: "isFeatured",
    header: "Destacado",
    cell: ({ row }) => {
      return row.original.isFeatured ? (
        <div className="text-green-600">Sí</div>
      ) : (
        <div className="text-red-600">No</div>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Precio",
  },
  {
    accessorKey: "category",
    header: "Categoría",
  },
  {
    accessorKey: "createdAt",
    header: "Creado el",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
