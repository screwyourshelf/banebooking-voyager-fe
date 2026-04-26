import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FormLayout, FormActions, FormSubmitButton } from "@/components/forms";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import {
  LogIn,
  LogOut,
  Calendar,
  CalendarCheck,
  CircleUser,
  Wrench,
  Menu,
  Home,
  Trophy,
} from "lucide-react";
import { GoogleIcon } from "@/components/icons";

import { useAuth } from "@/hooks/useAuth";
import { useLogin } from "@/hooks/useLogin";
import { useKlubb } from "@/hooks/useKlubb";
import { useBruker } from "@/hooks/useBruker";
import { harHandling } from "@/utils/handlingUtils";
import { Kapabiliteter } from "@/utils/kapabiliteter";
import { prefetchRoute } from "@/utils/prefetchRoute";

import NavbarBrandMedKlubb from "./NavbarBrandMedKlubb";
import ModeToggle from "./ModeToggle";
import { NotifikasjonDrawer } from "@/features/feed/components";
import { useSlug } from "@/hooks/useSlug";

function erGyldigEpost(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function prefetch(path: string) {
  return {
    onMouseEnter: () => prefetchRoute(path),
    onTouchStart: () => prefetchRoute(path),
  };
}

export default function Navbar() {
  const slug = useSlug();

  const { data: klubb } = useKlubb();
  const { currentUser, signOut } = useAuth();
  const { bruker } = useBruker();

  const {
    email,
    setEmail,
    otp,
    setOtp,
    status,
    step,
    erBusy,
    handleGoogleLogin,
    sendOtp,
    verifyOtp,
  } = useLogin();

  const [feilEmail, setFeilEmail] = useState<string | null>(null);
  const [feilOtp, setFeilOtp] = useState<string | null>(null);

  // Reset validation errors when step changes (render-time adjust)
  const [prevStep, setPrevStep] = useState(step);
  if (step !== prevStep) {
    setPrevStep(step);
    setFeilEmail(null);
    setFeilOtp(null);
  }

  const h = bruker?.kapabiliteter ?? [];
  const erAdmin = harHandling(h, Kapabiliteter.klubb.admin);

  const harAdminSeksjon =
    harHandling(h, Kapabiliteter.klubb.admin) ||
    harHandling(h, Kapabiliteter.baner.admin) ||
    harHandling(h, Kapabiliteter.grener.admin) ||
    harHandling(h, Kapabiliteter.brukere.admin) ||
    harHandling(h, Kapabiliteter.arrangement.se);

  const stoppDropdownKeybindings = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key.length === 1) e.stopPropagation();
  };

  const emailInputProps = useMemo(
    () => ({
      type: "text" as const,
      inputMode: "email" as const,
      autoComplete: "email" as const,
      className: "text-sm h-8",
      onKeyDown: stoppDropdownKeybindings,
    }),
    []
  );

  const otpInputProps = useMemo(
    () => ({
      type: "text" as const,
      inputMode: "numeric" as const,
      autoComplete: "one-time-code" as const,
      maxLength: 6,
      className: "text-sm h-8",
      onKeyDown: stoppDropdownKeybindings,
    }),
    []
  );

  function submitSendOtp(e: React.FormEvent) {
    e.preventDefault();
    const v = email.trim();

    if (!v) return setFeilEmail("E-post er påkrevd.");
    if (!erGyldigEpost(v)) return setFeilEmail("Ugyldig e-postadresse.");

    setFeilEmail(null);
    void sendOtp();
  }

  function submitVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const v = otp.trim();

    if (!v) return setFeilOtp("Kode er påkrevd.");
    if (!/^\d{6}$/.test(v)) return setFeilOtp("Koden må være 6 siffer.");

    setFeilOtp(null);
    void verifyOtp();
  }

  return (
    <div className="w-full flex justify-between items-center px-2 py-1">
      <NavbarBrandMedKlubb klubbnavn={klubb?.navn ?? "\u00A0"} />

      <nav className="hidden sm:flex items-center gap-0.5 mx-4">
        <Button variant="ghost" size="sm" className="h-8 text-sm" asChild>
          <Link to={`/${slug}`}>Book bane</Link>
        </Button>
        <Button variant="ghost" size="sm" className="h-8 text-sm" asChild>
          <Link to={`/${slug}/arrangementer`} {...prefetch("arrangementer")}>
            Arrangementer
          </Link>
        </Button>
      </nav>

      <div className="flex items-center gap-1 ml-auto">
        <ModeToggle />
        <NotifikasjonDrawer />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              aria-label="Åpne meny"
              aria-haspopup="menu"
              className="h-8 px-2 flex items-center gap-2"
            >
              <Menu className="size-4 text-muted-foreground sm:hidden" />

              <span className="hidden sm:inline-flex items-center gap-2 text-xs">
                {currentUser ? (
                  <>
                    <CircleUser className="size-4 text-muted-foreground" />
                    <span className="max-w-[10rem] truncate">{currentUser.email}</span>
                  </>
                ) : (
                  <>
                    <LogIn className="size-4 text-muted-foreground" />
                    Logg inn
                  </>
                )}
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-64 space-y-0.5">
            {currentUser ? (
              <>
                <div className="sm:hidden">
                  <DropdownMenuItem asChild>
                    <Link to={`/${slug}`}>
                      <Home className="mr-2 size-4" />
                      Book bane
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/${slug}/arrangementer`} {...prefetch("arrangementer")}>
                      <Trophy className="mr-2 size-4" />
                      Arrangementer
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </div>

                <DropdownMenuItem asChild>
                  <Link to={`/${slug}/minside`} {...prefetch("minside")}>
                    <CircleUser className="mr-2 size-4" />
                    Min side
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link to={`/${slug}/bookinger`} {...prefetch("bookinger")}>
                    <CalendarCheck className="mr-2 size-4" />
                    Mine bookinger
                  </Link>
                </DropdownMenuItem>

                {harAdminSeksjon && (
                  <>
                    <DropdownMenuSeparator />

                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                      {erAdmin ? "Admin" : "Utvidet tilgang"}
                    </div>

                    {harHandling(h, Kapabiliteter.klubb.admin) && (
                      <DropdownMenuItem asChild>
                        <Link to={`/${slug}/admin/klubb`} {...prefetch("admin/klubb")}>
                          <Wrench className="mr-2 size-4" />
                          Klubb
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {harHandling(h, Kapabiliteter.baner.admin) && (
                      <DropdownMenuItem asChild>
                        <Link to={`/${slug}/admin/baner`} {...prefetch("admin/baner")}>
                          <Wrench className="mr-2 size-4" />
                          Baner
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {harHandling(h, Kapabiliteter.grener.admin) && (
                      <DropdownMenuItem asChild>
                        <Link to={`/${slug}/admin/grener`} {...prefetch("admin/grener")}>
                          <Wrench className="mr-2 size-4" />
                          Grener
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {harHandling(h, Kapabiliteter.brukere.admin) && (
                      <DropdownMenuItem asChild>
                        <Link to={`/${slug}/admin/brukere`} {...prefetch("admin/brukere")}>
                          <Wrench className="mr-2 size-4" />
                          Brukere
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {harHandling(h, Kapabiliteter.arrangement.se) && (
                      <DropdownMenuItem asChild>
                        <Link to={`/${slug}/arrangement`} {...prefetch("arrangement")}>
                          <Calendar className="mr-2 size-4" />
                          Arrangement
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => signOut()} disabled={erBusy}>
                  <LogOut className="mr-2 size-4" />
                  Logg ut
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <div className="sm:hidden">
                  <DropdownMenuItem asChild>
                    <Link to={`/${slug}`}>
                      <Home className="mr-2 size-4" />
                      Book bane
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/${slug}/arrangementer`} {...prefetch("arrangementer")}>
                      <Trophy className="mr-2 size-4" />
                      Arrangementer
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </div>

                <p className="text-xs text-muted-foreground px-2 pb-1">
                  Ved å logge inn samtykker du til våre{" "}
                  <Link to={`/${slug}/vilkaar`} className="underline">
                    vilkår
                  </Link>
                  .
                </p>

                <DropdownMenuItem onClick={handleGoogleLogin} disabled={erBusy}>
                  <GoogleIcon className="mr-2 size-5" />
                  Logg inn med Google
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {step === "input" ? (
                  <FormLayout density="compact" className="px-2 w-full" onSubmit={submitSendOtp}>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Logg inn med e-post</div>

                      <Field data-invalid={!!feilEmail}>
                        <Input
                          id="email"
                          value={email}
                          onChange={(e) => {
                            const v = e.target.value;
                            setEmail(v);
                            if (feilEmail) setFeilEmail(null);
                          }}
                          aria-invalid={!!feilEmail}
                          {...emailInputProps}
                        />

                        {feilEmail ? <FieldError>{feilEmail}</FieldError> : null}
                      </Field>
                    </div>

                    <FormActions align="left" spaced={false} className="w-full">
                      <FormSubmitButton
                        fullWidth
                        isLoading={status === "sending"}
                        loadingText="Sender..."
                      >
                        Send kode
                      </FormSubmitButton>
                    </FormActions>
                  </FormLayout>
                ) : (
                  <FormLayout density="compact" className="px-2 w-full" onSubmit={submitVerifyOtp}>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Skriv inn koden fra e-posten</div>

                      <Field data-invalid={!!feilOtp}>
                        <Input
                          id="otp"
                          value={otp}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const v = raw.replace(/\D/g, "").slice(0, 6);
                            setOtp(v);
                            if (feilOtp) setFeilOtp(null);
                          }}
                          aria-invalid={!!feilOtp}
                          {...otpInputProps}
                        />

                        {feilOtp ? <FieldError>{feilOtp}</FieldError> : null}
                      </Field>
                    </div>

                    <FormActions align="left" spaced={false} className="w-full">
                      <FormSubmitButton
                        fullWidth
                        isLoading={status === "verifying"}
                        loadingText="Verifiserer..."
                      >
                        Verifiser kode
                      </FormSubmitButton>
                    </FormActions>
                  </FormLayout>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
