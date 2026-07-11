"use client";

import { GooeyToaster } from "goey-toast";

type ToasterProps = React.ComponentProps<typeof GooeyToaster>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <GooeyToaster
      position="top-right"
      richColors
      {...props}
    />
  );
};

export { Toaster };
