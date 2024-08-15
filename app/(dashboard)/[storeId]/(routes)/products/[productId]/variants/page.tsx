import { format } from "date-fns";

import prismadb from "@/lib/prismadb";
import { formatter } from "@/lib/utils";

import { ProductsVariantsClient } from "./components/client";
import { ProductVariantColumn } from "./components/columns";

const ProductsVariantsPage = async ({
  params,
}: {
  params: { storeId: string };
}) => {
  const productsVariants = await prismadb.productVariant.findMany({
    where: {
      storeId: params.storeId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedProductsVariants: ProductVariantColumn[] =
    productsVariants.map((item) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      stock: item.stock ? item.stock.toString() : "No definido",
      price: item.price
        ? formatter.format(item.price.toNumber())
        : "Sin precio",
      isArchived: item.isArchived,
      createdAt: format(item.createdAt, "MMMM do, yyyy"),
    }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductsVariantsClient data={formattedProductsVariants} />
      </div>
    </div>
  );
};

export default ProductsVariantsPage;
