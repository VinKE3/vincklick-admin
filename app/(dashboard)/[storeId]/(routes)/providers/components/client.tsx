"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui/api-list";

import { columns, ProviderColumn } from "./columns";

interface ProviderClientProps {
  data: ProviderColumn[];
}

export const ProviderClient: React.FC<ProviderClientProps> = ({ data }) => {
  const params = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Proveedores (${data.length})`}
          description="Gestiona los Proveedores principales de la Tienda"
        />
        <Button onClick={() => router.push(`/${params.storeId}/providers/new`)}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="heading" columns={columns} data={data} />
      <Heading title="API" description="API Calls para Proveedores" />
      <Separator />
      <ApiList entityName="providers" entityIdName="providerId" />
    </>
  );
};
