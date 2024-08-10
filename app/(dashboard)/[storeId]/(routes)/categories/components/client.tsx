"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

import { columns, CategoryColumn } from "./columns";
import { ApiList } from "@/components/ui/api-list";

interface CategoriesClientProps {
  data: CategoryColumn[];
}

export const CategoriesClient: React.FC<CategoriesClientProps> = ({ data }) => {
  const params = useParams();
  const router = useRouter();
  const [active, setActive] = useState(false);
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Categorias (${data.length})`}
          description="Gestiona las categoria de tu tienda"
        />
        <Button
          onClick={() => router.push(`/${params.storeId}/categories/new`)}
        >
          <Plus className="mr-2 h-4 w-4" /> Nueva
        </Button>
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
          <Heading title="API" description="API Calls for Categories" />
          <Separator />
          <ApiList entityName="categories" entityIdName="categoryId" />
        </>
      )}
    </>
  );
};
