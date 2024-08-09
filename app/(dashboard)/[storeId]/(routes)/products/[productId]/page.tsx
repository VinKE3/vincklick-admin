import prismadb from "@/lib/prismadb";

import { ProductForm } from "./components/product-form";

const ProductPage = async ({
  params,
}: {
  params: { productId: string; storeId: string };
}) => {
  const product = await prismadb.product.findUnique({
    where: {
      id: params.productId,
    },
    include: {
      images: true,
      variants: true,
    },
  });

  const categories = await prismadb.category.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      subcategories: true,
    },
  });

  const subCategories = await prismadb.subCategory.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  const brands = await prismadb.brand.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  const providers = await prismadb.provider.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductForm
          categories={categories}
          subCategories={subCategories}
          brands={brands}
          providers={providers}
          initialData={product}
        />
      </div>
    </div>
  );
};

export default ProductPage;
