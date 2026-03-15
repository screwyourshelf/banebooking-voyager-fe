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
  if (status === "PaameldingAapen") return <AdminPaameldingView turnering={turnering} />;

  return <AdminAvsluttetView turnering={turnering} />;
}
