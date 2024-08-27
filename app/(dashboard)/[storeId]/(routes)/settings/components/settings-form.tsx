"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Trash } from "lucide-react";
import { Store } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

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
import { ApiAlert } from "@/components/ui/api-alert";
import { useOrigin } from "@/hooks/use-origin";
import Description from "@/components/pro/description";
import Card from "@/components/common/card";
import InputPro from "@/components/pro/input";
import StickyFooterPanel from "@/components/pro/sticky-footer-panel";
import ButtonPro from "@/components/pro/button";

const formSchema = z.object({
  name: z.string().min(2, { message: "Mínimo 2 letras" }),
});

type SettingsFormValues = z.infer<typeof formSchema>;

interface SettingsFormProps {
  initialData: Store;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();
  const origin = useOrigin();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });
  const {
    register,
    formState: { errors },
  } = form;
  const onSubmit = async (data: SettingsFormValues) => {
    try {
      setLoading(true);
      await axios.patch(`/api/stores/${params.storeId}`, data);
      router.refresh();
      toast.success("TNombre actualizado.");
    } catch (error: any) {
      toast.error("Algo salió mal. Inténtalo de nuevo");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/stores/${params.storeId}`);
      router.refresh();
      router.push("/");
      toast.success("Tienda Eliminada.");
    } catch (error: any) {
      toast.error(
        "Asegúrese de eliminar categorias y productos asociadas a esta Tienda."
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
        <Heading
          title="Configuración de la Tienda"
          description="Gestione las preferencias de la tienda"
        />
        <Button
          disabled={loading}
          variant="destructive"
          size="sm"
          onClick={() => setOpen(true)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base ">
            <Description
              title={"Configuración"}
              details={"Gestione el nombre de la tienda"}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />
            <Card className="w-full sm:w-8/12 md:w-2/3">
              <InputPro
                label={"Nombre"}
                {...register("name", { required: "form:error-name-required" })}
                error={errors.name?.message!}
                variant="outline"
                className="mb-5"
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
                {initialData ? "Actualizar" : "Agregar"} {"Tienda"}
              </ButtonPro>
            </div>
          </StickyFooterPanel>
          {/* <Button disabled={loading} className="ml-auto" type="submit">
            Guardar Cambios
          </Button> */}
        </form>
      </Form>
      <Separator />
      <ApiAlert
        title="NEXT_PUBLIC_API_URL"
        variant="public"
        description={`${origin}/api/${params.storeId}`}
      />
    </>
  );
};
