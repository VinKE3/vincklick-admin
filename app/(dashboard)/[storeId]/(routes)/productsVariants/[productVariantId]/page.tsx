import prismadb from "@/lib/prismadb";

import { ProductVariantForm } from "./components/product-variant-form";

const ProductVariantPage = async ({
  params,
}: {
  params: { productVariantId: string; storeId: string };
}) => {
  const productVariant = await prismadb.productVariant.findUnique({
    where: {
      id: params.productVariantId,
    },
  });
  const products = await prismadb.product.findMany({
    where: {
      id: params.storeId,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductVariantForm products={products} initialData={productVariant} />
      </div>
    </div>
  );
};

export default ProductVariantPage;
