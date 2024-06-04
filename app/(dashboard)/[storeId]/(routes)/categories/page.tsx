import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

import { CategoryColumn } from "./components/columns";
import { CategoriesClient } from "./components/client";

const CategoriesPage = async ({ params }: { params: { storeId: string } }) => {
  const categories = await prismadb.category.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      billboard: true,
      subcategories: {
        // Cargamos subcategorías en una sola consulta
        select: {
          // Solo seleccionamos los campos necesarios de las subcategorías
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedCategories: CategoryColumn[] = categories.map((item) => ({
    id: item.id,
    name: item.name,
    billboardLabel: item.billboard.label,
    subCategories: item.subcategories.map((sub) => sub.name), // Array de nombres de subcategorías
    createdAt: format(item.createdAt, "dd-MM-yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CategoriesClient data={formattedCategories} />
      </div>
    </div>
  );
};

export default CategoriesPage;
