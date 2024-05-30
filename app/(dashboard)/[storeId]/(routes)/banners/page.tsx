import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

import { BannerColumn } from "./components/columns";
import { BannerClient } from "./components/client";

const BannersPage = async ({ params }: { params: { storeId: string } }) => {
  const banners = await prismadb.banner.findMany({
    where: {
      storeId: params.storeId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedBanner: BannerColumn[] = banners.map((item) => ({
    id: item.id,
    heading: item.heading,
    createdAt: format(item.createdAt, "dd-MM-yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BannerClient data={formattedBanner} />
      </div>
    </div>
  );
};

export default BannersPage;
