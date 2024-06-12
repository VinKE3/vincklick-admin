"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiAlert } from "@/components/ui/api-alert";

import { columns, BrandColumn } from "./columns";
import { ApiList } from "@/components/ui/api-list";

interface BrandsClientProps {
  data: BrandColumn[];
}

export const BrandsClient: React.FC<BrandsClientProps> = ({ data }) => {
  const params = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Marcas (${data.length})`}
          description="Gestiona las marcas de tu tienda"
        />
        <Button onClick={() => router.push(`/${params.storeId}/brands/new`)}>
          <Plus className="mr-2 h-4 w-4" /> Nueva
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
      <Heading title="API" description="API Calls for Brands" />
      <Separator />
      <ApiList entityName="brands" entityIdName="brandId" />
    </>
  );
};
