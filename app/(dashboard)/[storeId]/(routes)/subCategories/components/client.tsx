"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiAlert } from "@/components/ui/api-alert";

import { columns, SubCategoryColumn } from "./columns";
import { ApiList } from "@/components/ui/api-list";

interface SubCategoriesClientProps {
  data: SubCategoryColumn[];
}

export const SubCategoriesClient: React.FC<SubCategoriesClientProps> = ({
  data,
}) => {
  const params = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`SubCategorias (${data.length})`}
          description="Gestiona las Subcategoria de tu tienda"
        />
        <Button
          onClick={() => router.push(`/${params.storeId}/subCategories/new`)}
        >
          <Plus className="mr-2 h-4 w-4" /> Nueva
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
      <Heading title="API" description="API Calls para SubCategorias" />
      <Separator />
      <ApiList entityName="subCategories" entityIdName="subCategoryId" />
    </>
  );
};
