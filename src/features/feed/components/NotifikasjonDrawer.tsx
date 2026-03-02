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

export default function NotifikasjonDrawer() {
  const { feed = [], isLoading } = useFeed();

  if (isLoading || feed.length === 0) return null;

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifikasjoner">
          <BellRing />
          {feed.length > 0 && (
            <span className="absolute -top-0 -right-0 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {feed.length}
            </span>
          )}
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Notifikasjoner</DrawerTitle>
          <DrawerDescription>
            {`${feed.length} melding${feed.length === 1 ? "" : "er"}`}
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
