import { BellRing, InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";
import { useFeed } from "@/hooks/useFeed";

type Props = {
  trigger?: "icon" | "text";
};

export default function NotifikasjonDrawer({ trigger = "icon" }: Props) {
  const { feed = [], isLoading } = useFeed();

  if (isLoading || feed.length === 0) return null;

  return (
    <Drawer direction="right" modal>
      <DrawerTrigger asChild>
        {trigger === "text" ? (
          <Button variant="ghost" size="sm" className="feed-notice__more">
            Se alle ({feed.length})
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={`Nyheter fra klubben, ${feed.length} ${feed.length === 1 ? "nyhet" : "nyheter"}`}
          >
            <BellRing className="size-[var(--app-topbar-action-icon-size)]" />
            <span className="app-topbar__notification-count" aria-hidden="true">
              {feed.length > 99 ? "99+" : feed.length}
            </span>
          </Button>
        )}
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Nyheter fra klubben</DrawerTitle>
          <DrawerDescription>
            {`${feed.length} ${feed.length === 1 ? "nyhet" : "nyheter"}`}
          </DrawerDescription>
        </DrawerHeader>

        <div className="no-scrollbar overflow-y-auto px-4">
          {feed.map((item) => {
            const itemId = item.lenke || item.tittel;

            return (
              <Alert key={itemId} className="mb-2">
                <InfoIcon />
                <AlertTitle>{item.tittel}</AlertTitle>
                <AlertDescription>
                  {item.innhold}
                  {item.lenke && (
                    <>
                      {" "}
                      <a
                        href={item.lenke}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Les mer
                      </a>
                    </>
                  )}
                </AlertDescription>
              </Alert>
            );
          })}
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Lukk</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
