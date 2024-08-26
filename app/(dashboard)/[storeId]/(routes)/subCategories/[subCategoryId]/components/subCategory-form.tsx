"use client";

import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Trash } from "lucide-react";
import { Category, SubCategory } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { AlertModal } from "@/components/modals/alert-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Description from "@/components/pro/description";
import Card from "@/components/common/card";
import InputPro from "@/components/pro/input";
import StickyFooterPanel from "@/components/pro/sticky-footer-panel";
import ButtonPro from "@/components/pro/button";

const formSchema = z.object({
  name: z.string().min(1, { message: "Requerido" }),
  categoryId: z.string().min(1, { message: "Requerido" }),
});

type SubCategoryFormValues = z.infer<typeof formSchema>;

interface SubCategoryFormProps {
  initialData: SubCategory | null;
  categories: Category[];
}

export const SubCategoryForm: React.FC<SubCategoryFormProps> = ({
  initialData,
  categories,
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Editar SubCategoria" : "Crear SubCategoria";
  const description = initialData
    ? "Editar una SubCategoria Existente."
    : "Añadir Nueva SubCategoria";
  const toastMessage = initialData
    ? "SubCategoria Actualizada."
    : "SubCategoria Creada.";
  const action = initialData ? "Guardar Cambios" : "Crear";

  const form = useForm<SubCategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      categoryId: "",
    },
  });
  const {
    register,
    formState: { errors },
  } = form;
  const onSubmit = async (data: SubCategoryFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/subCategories/${params.subCategoryId}`,
          data
        );
      } else {
        await axios.post(`/api/${params.storeId}/subCategories`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/subCategories`);
      router.refresh();
      toast.success(toastMessage);
    } catch (error: any) {
      const errorMessage =
        error.response?.data || "Algo salió mal. Inténtalo de nuevo.";
      toast.error(errorMessage);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `/api/${params.storeId}/subCategories/${params.categoryId}`
      );
      router.refresh();
      router.push(`/${params.storeId}/subCategories`);
      toast.success("Category deleted.");
    } catch (error: any) {
      toast.error(
        "Asegúrese de eliminar todos los productos que utilizan esta subCategoria."
      );
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
            <Description
              title={"SubCategoría"}
              details={"Agregar el nombre de la Subcategoría"}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />
            <Card className="w-full sm:w-8/12 md:w-2/3">
              <InputPro
                label={"Nombre SubCategoría"}
                {...register("name", { required: "form:error-name-required" })}
                error={errors.name?.message!}
                variant="outline"
                className="mb-5"
              />
            </Card>
          </div>
          <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
            <Description
              title={"Categoría Padre"}
              details={
                "Seleccione la categoría Padre asociada a esta subcategoría"
              }
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />
            <Card className="w-full sm:w-8/12 md:w-2/3">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria Padre</FormLabel>
                    <Select
                      disabled={loading}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            defaultValue={field.value}
                            placeholder="Seleccionar Categoría"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>
          </div>
          <StickyFooterPanel className="z-0">
            <div className="text-end">
              {initialData && (
                <ButtonPro
                  variant="outline"
                  onClick={router.back}
                  className="text-sm me-4 md:text-base"
                  type="button"
                >
                  {"Volver"}
                </ButtonPro>
              )}

              <ButtonPro className="text-sm md:text-base">
                {initialData ? "Actualizar" : "Agregar"} {"SubCategoría"}
              </ButtonPro>
            </div>
          </StickyFooterPanel>
          {/* <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Nombre de la categoria"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria Padre</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value || ""}
                    defaultValue={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value || ""}
                          placeholder="Seleccionar Categoria"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div> */}
          {/* <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button> */}
        </form>
      </Form>
    </>
  );
};
