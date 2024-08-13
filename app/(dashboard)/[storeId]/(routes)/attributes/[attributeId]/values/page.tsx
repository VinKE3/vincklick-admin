import { format } from "date-fns";

import prismadb from "@/lib/prismadb";
import { AttributeValueColumn } from "./components/columns";
import { AttibutesValuesClient } from "./components/client";
const AttributesValuesPage = async ({
  params,
}: {
  params: { storeId: string };
}) => {
  const valuesAttributes = await prismadb.attributeValue.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      attribute: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const formattedValuesAttributes: AttributeValueColumn[] =
    valuesAttributes.map((item) => ({
      id: item.id,
      attribute: item.attribute.name,
      value: item.value,
      createdAt: format(item.createdAt, "dd-MM-yyyy"),
    }));
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <AttibutesValuesClient data={formattedValuesAttributes} />
      </div>
    </div>
  );
};

export default AttributesValuesPage;
