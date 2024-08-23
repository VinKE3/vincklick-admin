"use client";

import { ArrowLeft, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { columns, AttributeValueColumn } from "./columns";
import { ApiListValuesAttribute } from "@/components/ui/api-list-valuesAttributes";
import { useState } from "react";

interface SubCategoriesClientProps {
  data: AttributeValueColumn[];
}

export const AttibutesValuesClient: React.FC<SubCategoriesClientProps> = ({
  data,
}) => {
  const params = useParams();
  const router = useRouter();
  const [active, setActive] = useState(false);
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Valores (${data.length})`}
          description="Gestiona los valores de los atributos de tu tienda"
        />
        <div className="space-y-2 space-x-0 sm:space-x-4">
          <Button
            onClick={() =>
              router.push(`/${params.storeId}/attributes/${params.attributeId}`)
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Ver Atributo
          </Button>
        </div>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
      <Separator />
      <div className="items-top flex space-x-2">
        <Checkbox
          id="apis"
          checked={active}
          onCheckedChange={() => setActive(!active)}
        />
        <div className="grid gap-1.5 leading-none">
          <label
            htmlFor="terms1"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Mostrar API CALLS
          </label>
          <p className="text-sm text-muted-foreground">
            Permite ver las distintas rutas
          </p>
        </div>
      </div>
      {active && (
        <>
          <Heading title="API" description="API Calls para Valores" />
          <Separator />
          <ApiListValuesAttribute entityName="values" entityIdName="valueId" />
        </>
      )}
    </>
  );
};
