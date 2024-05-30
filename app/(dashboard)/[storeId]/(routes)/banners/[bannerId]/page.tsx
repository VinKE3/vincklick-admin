import prismadb from "@/lib/prismadb";
import { BannerForm } from "./components/banner-form";

const BannerPage = async ({
  params,
}: {
  params: { bannerId: string; storeId: string };
}) => {
  const banner = await prismadb.banner.findUnique({
    where: {
      id: params.bannerId,
    },
  });
  const colors = await prismadb.color.findMany({
    where: {
      storeId: params.storeId,
    },
  });
  const categories = await prismadb.category.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BannerForm
          initialData={banner}
          colors={colors}
          categories={categories}
        />
      </div>
    </div>
  );
};

export default BannerPage;
