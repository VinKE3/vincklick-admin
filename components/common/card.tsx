import cn from "classnames";
import { twMerge } from "tailwind-merge";

type Props = {
  className?: string;
  [key: string]: unknown;
};
const Card: React.FC<Props> = ({ className, ...props }) => {
  return (
    <div
      className={twMerge(
        cn(
          "rounded bg-zinc-50 dark:bg-black dark:border dark:border-slate-300 p-5 shadow",
          className
        )
      )}
      {...props}
    />
  );
};

export default Card;
