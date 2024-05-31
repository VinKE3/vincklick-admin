import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

import { AttributesColumn } from "./components/columns";
import { AttributeClient } from "./components/client";

const AttributesPage = async ({ params }: { params: { storeId: string } }) => {
  const attributes = await prismadb.attribute.findMany({
    where: {
      storeId: params.storeId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedAttributes: AttributesColumn[] = attributes.map((item) => ({
    id: item.id,
    name: item.name,
    values: item.values,
    createdAt: format(item.createdAt, "dd-MM-yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <AttributeClient data={formattedAttributes} />
      </div>
    </div>
  );
};

export default AttributesPage;
