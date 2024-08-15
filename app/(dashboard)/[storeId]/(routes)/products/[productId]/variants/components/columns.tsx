"use client";

import { ColumnDef } from "@tanstack/react-table";

import { CellAction } from "./cell-action";

export type ProductVariantColumn = {
  id: string;
  name: string;
  sku: string;
  stock: string;
  price: string;
  isArchived: boolean;
  createdAt: string;
};

export const columns: ColumnDef<ProductVariantColumn>[] = [
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
    accessorKey: "sku",
    header: "SKU",
  },
  {
    accessorKey: "price",
    header: "Precio",
  },
  {
    accessorKey: "stock",
    header: "Stock",
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
