"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui/api-list";

import { columns, BannerColumn } from "./columns";

interface BannerClientProps {
  data: BannerColumn[];
}

export const BannerClient: React.FC<BannerClientProps> = ({ data }) => {
  const params = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Banners (${data.length})`}
          description="Gestiona los Banners principales de la Tienda"
        />
        <Button onClick={() => router.push(`/${params.storeId}/banners/new`)}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="heading" columns={columns} data={data} />
      <Heading title="API" description="API Calls para Banners" />
      <Separator />
      <ApiList entityName="banners" entityIdName="bannerId" />
    </>
  );
};
