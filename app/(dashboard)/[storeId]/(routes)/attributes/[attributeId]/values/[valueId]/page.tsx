import prismadb from "@/lib/prismadb";

import { AttributeValueForm } from "./components/attributeValue-form";

const AttibuteValuePage = async ({
  params,
}: {
  params: { attributeId: string; storeId: string; valueId: string };
}) => {
  const atributeValue = await prismadb.attributeValue.findUnique({
    where: {
      id: params.valueId,
    },
  });
  const attributes = await prismadb.attribute.findMany({
    where: {
      id: params.attributeId,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <AttributeValueForm
          initialData={atributeValue}
          attributes={attributes}
        />
      </div>
    </div>
  );
};

export default AttibuteValuePage;
