"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

import { columns, AttributeValueColumn } from "./columns";
import { ApiListValuesAttribute } from "@/components/ui/api-list-valuesAttributes";

interface SubCategoriesClientProps {
  data: AttributeValueColumn[];
}

export const AttibutesValuesClient: React.FC<SubCategoriesClientProps> = ({
  data,
}) => {
  const params = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Valores (${data.length})`}
          description="Gestiona los valores de los atributos de tu tienda"
        />
        <Button
          onClick={() =>
            router.push(
              `/${params.storeId}/attributes/${params.attributeId}/values/new`
            )
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Nueva
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
      <Heading title="API" description="API Calls para Valores" />
      <Separator />
      <ApiListValuesAttribute entityName="values" entityIdName="valueId" />
    </>
  );
};
