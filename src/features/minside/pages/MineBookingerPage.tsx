import Page from "@/components/Page";
import MineBookingerView from "@/features/minside/views/mine-bookinger/MineBookingerView";

export default function MineBookingerPage() {
  return (
    <Page width="xl" className="mine-bookings-page-frame">
      <MineBookingerView />
    </Page>
  );
}
