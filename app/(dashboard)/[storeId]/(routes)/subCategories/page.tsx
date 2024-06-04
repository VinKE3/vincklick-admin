import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

import { SubCategoryColumn } from "./components/columns";
import { SubCategoriesClient } from "./components/client";

const SubCategoriesPage = async ({
  params,
}: {
  params: { storeId: string };
}) => {
  const subCategories = await prismadb.subCategory.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedSubCategories: SubCategoryColumn[] = subCategories.map(
    (item) => ({
      id: item.id,
      name: item.name,
      category: item.category.name,
      createdAt: format(item.createdAt, "dd-MM-yyyy"),
    })
  );

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SubCategoriesClient data={formattedSubCategories} />
      </div>
    </div>
  );
};

export default SubCategoriesPage;
