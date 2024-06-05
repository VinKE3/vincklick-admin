"use client";

import { ColumnDef } from "@tanstack/react-table";

import { CellAction } from "./cell-action";

export type subCategoryType = {
  id: string;
  name: string;
};

export type CategoryColumn = {
  id: string;
  name: string;
  billboardLabel: string;
  subCategories: subCategoryType[];
  createdAt: string;
};

export const columns: ColumnDef<CategoryColumn>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "billboard",
    header: "Banner",
    cell: ({ row }) => row.original.billboardLabel,
  },
  {
    accessorKey: "subcategories",
    header: "Subcategorías",
    cell: ({ row }) => {
      const subcategories = row.original.subCategories;
      if (subcategories.length === 0) {
        return "Sin subcategorías";
      } else {
        const subcategoriesString = subcategories
          .map((subcategory) => subcategory.name)
          .join(", ");
        return <div>{subcategoriesString}</div>;
      }
    },
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
