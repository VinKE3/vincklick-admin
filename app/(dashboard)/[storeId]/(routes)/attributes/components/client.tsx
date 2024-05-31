"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui/api-list";

import { columns, AttributesColumn } from "./columns";

interface AttributeClientProps {
  data: AttributesColumn[];
}

export const AttributeClient: React.FC<AttributeClientProps> = ({ data }) => {
  const params = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Atributos (${data.length})`}
          description="Gestione los atrubutos de los productos de la tienda."
        />
        <Button
          onClick={() => router.push(`/${params.storeId}/attributes/new`)}
        >
          <Plus className="mr-2 h-4 w-4" /> Nuevo
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
      <Heading title="API" description="API Calls para Atributos" />
      <Separator />
      <ApiList entityName="attributes" entityIdName="attributeId" />
    </>
  );
};
