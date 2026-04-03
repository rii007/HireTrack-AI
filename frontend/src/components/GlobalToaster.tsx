import { Toaster } from "sonner";
import { useTheme } from "../state/ThemeContext";

export function GlobalToaster() {
  const { resolved } = useTheme();
  return <Toaster richColors position="top-right" closeButton theme={resolved} />;
}
