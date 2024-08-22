"use client";

import { useRouter, usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

import Image from "next/image";

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();
  const backHome = () => {
    const parts = pathname.split("/");
    const extractedId = parts[1];
    router.push(`/${extractedId}/products`);
  };
  return (
    <>
      <main className="relative isolate min-h-full">
        <Image
          fill
          src="https://images.unsplash.com/photo-1545972154-9bb223aac798?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=3050&q=80&exp=8&con=-15&sat=-75"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-top"
          alt="404"
        />
        <div className="mx-auto max-w-7xl px-6 py-32 text-center sm:py-40 lg:px-8">
          <p className="text-base font-semibold leading-8 text-white">404</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Pagina no encontrada
          </h1>
          <p className="mt-4 text-base text-white/70 sm:mt-6">
            Lo sentimos, la página que busca no existe o ha sido movida.
          </p>
          <div className="mt-10 flex justify-center gap-2">
            <Button onClick={() => router.back()} variant="default" size="lg">
              Volver Atras
            </Button>
            <Button onClick={() => backHome()} variant="ghost" size="lg">
              Volver al Inicio
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
