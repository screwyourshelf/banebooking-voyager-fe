import type { TurneringRespons } from "@/types";
import AdminOppsettView from "./AdminOppsettView";
import AdminPaameldingView from "./AdminPaameldingView";
import AdminKampgjennomforingView from "./AdminKampgjennomforingView";
import AdminAvsluttetView from "./AdminAvsluttetView";

type Props = {
  turnering: TurneringRespons;
};

export default function TurneringAdminView({ turnering }: Props) {
  const { status } = turnering;

  if (status === "Oppsett") return <AdminOppsettView turnering={turnering} />;
  if (status === "PaameldingAapen" || status === "PaameldingLukket")
    return <AdminPaameldingView turnering={turnering} />;
  if (status === "DrawPublisert" || status === "Pagaar")
    return <AdminKampgjennomforingView turnering={turnering} />;
  return <AdminAvsluttetView turnering={turnering} />;
}
