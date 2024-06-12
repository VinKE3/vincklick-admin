import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

import { ProviderColumn } from "./components/columns";
import { ProviderClient } from "./components/client";

const ProvidersPage = async ({ params }: { params: { storeId: string } }) => {
  const providers = await prismadb.provider.findMany({
    where: {
      storeId: params.storeId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedProvider: ProviderColumn[] = providers.map((item) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone,
    address: item.address,
    createdAt: format(item.createdAt, "dd-MM-yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProviderClient data={formattedProvider} />
      </div>
    </div>
  );
};

export default ProvidersPage;
