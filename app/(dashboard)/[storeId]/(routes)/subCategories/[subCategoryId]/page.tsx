import prismadb from "@/lib/prismadb";

import { SubCategoryForm } from "./components/subCategory-form";

const SubCategoryPage = async ({
  params,
}: {
  params: { subCategoryId: string; storeId: string; categoryId: string };
}) => {
  const SubCategory = await prismadb.subCategory.findUnique({
    where: {
      id: params.subCategoryId,
    },
  });
  const categories = await prismadb.category.findMany({
    where: {
      id: params.categoryId,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SubCategoryForm initialData={SubCategory} categories={categories} />
      </div>
    </div>
  );
};

export default SubCategoryPage;
