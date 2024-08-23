import Link from "@/components/pro/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "next-i18next";

export type IFooterProp = {
  className?: string;
};

const Footer: React.FC<IFooterProp> = ({ className }) => {
  const date = new Date();

  return (
    <footer className="mt-auto shadow">
      <div className="mx-auto w-full">
        <div className="flex items-center justify-between shadow px-5 py-6 md:px-8">
          <span className="text-sm text-body sm:text-center">
            ©2024{" "}
            <Link className="font-medium text-heading" href="">
              VinKlick
            </Link>
            . Copyright ©. Todos los derechos reservados.
          </span>
          <div className="flex space-x-6 text-sm font-medium text-body sm:justify-center">
            Version 1.0
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
