"use client";

import { ColumnDef } from "@tanstack/react-table";

import { CellAction } from "./cell-action";

export type CategoryColumn = {
  id: string;
  name: string;
  billboardLabel: string;
  subCategories: string[];
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
  // {
  //   accessorKey: "subcategories",
  //   header: "Subcategorías",
  //   cell: ({ row }) => {
  //     const subcategories = row.original.subCategories

  //     if (subcategories.length === 0) {
  //       return "Sin subcategorías";
  //     } else {
  //       return (
  //         <ul style={{ listStyle: "none", paddingLeft: 0 }}>
  //           {subcategories.map((subcategory) => (
  //             <li key={subcategory.}>{subcategory.name}</li>
  //           ))}
  //         </ul>
  //       );
  //     }
  //   },
  // },
  {
    accessorKey: "createdAt",
    header: "Dia de Creacion",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
