import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
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
    FaUser,
    FaFacebook,
    FaSignInAlt,
    FaSignOutAlt,
    FaCalendarAlt,
    FaUserCircle,
    FaWrench,
    FaBars,
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import { useAuth } from "../hooks/useAuth";
import { useLogin } from "../hooks/useLogin";
import { useKlubb } from "../hooks/useKlubb";
import { useBruker } from "../hooks/useBruker";
import NavbarBrandMedKlubb from "./NavbarBrandMedKlubb";
import { useSlug } from "@/hooks/useSlug";


function erGyldigEpost(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
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
        handleFacebookLogin,
        sendOtp,
        verifyOtp,
    } = useLogin();

    const [feilEmail, setFeilEmail] = useState<string | null>(null);
    const [feilOtp, setFeilOtp] = useState<string | null>(null);

    useEffect(() => {
        setFeilEmail(null);
        setFeilOtp(null);
    }, [step]);

    const erAdmin = bruker?.roller?.includes("KlubbAdmin") ?? false;
    const harUtvidetTilgang = bruker?.roller?.includes("Utvidet") ?? false;

    const stoppDropdownKeybindings = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key.length === 1) e.stopPropagation();
    };

    const emailInputProps = useMemo(
        () => ({
            type: "text" as const,
            inputMode: "email" as const,
            autoComplete: "email" as const,
            placeholder: "din@epost.no",
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

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-8 px-2 flex items-center gap-2 sm:text-xs sm:px-2">
                        <FaBars className="text-gray-600 sm:hidden" />
                        <span className="hidden sm:inline-flex items-center gap-2">
                            {currentUser ? (
                                <>
                                    <FaUser className="text-gray-500" />
                                    {currentUser.email}
                                </>
                            ) : (
                                <>
                                    <FaSignInAlt className="text-gray-500" />
                                    Logg inn
                                </>
                            )}
                        </span>
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-64 space-y-0.5">
                    {currentUser ? (
                        <>
                            <DropdownMenuItem asChild>
                                <Link to={`/${slug}/minside`}>
                                    <FaUserCircle className="mr-2" />
                                    Min side
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild>
                                <Link to={`/${slug}`}>
                                    <FaCalendarAlt className="mr-2" />
                                    Book bane
                                </Link>
                            </DropdownMenuItem>

                            {(erAdmin || harUtvidetTilgang) && (
                                <>
                                    <DropdownMenuSeparator />
                                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                                        {erAdmin ? "Admin" : "Utvidet tilgang"}
                                    </div>

                                    {erAdmin && (
                                        <>
                                            <DropdownMenuItem asChild>
                                                <Link to={`/${slug}/admin/klubb`}>
                                                    <FaWrench className="mr-2" />
                                                    Klubb
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link to={`/${slug}/admin/baner`}>
                                                    <FaWrench className="mr-2" />
                                                    Baner
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link to={`/${slug}/admin/brukere`}>
                                                    <FaWrench className="mr-2" />
                                                    Brukere
                                                </Link>
                                            </DropdownMenuItem>
                                        </>
                                    )}

                                    <DropdownMenuItem asChild>
                                        <Link to={`/${slug}/arrangement`}>
                                            <FaCalendarAlt className="mr-2" />
                                            Arrangement
                                        </Link>
                                    </DropdownMenuItem>
                                </>
                            )}

                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => signOut()} disabled={erBusy}>
                                <FaSignOutAlt className="mr-2" />
                                Logg ut
                            </DropdownMenuItem>
                        </>
                    ) : (
                        <>
                            <p className="text-xs text-gray-500 px-2 pb-1">
                                Ved å logge inn samtykker du til våre{" "}
                                <Link to={`/${slug}/vilkaar`} className="underline">
                                    vilkår
                                </Link>
                                .
                            </p>

                            <DropdownMenuItem onClick={handleGoogleLogin} disabled={erBusy}>
                                <FcGoogle size={18} className="mr-2" />
                                Logg inn med Google
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={handleFacebookLogin} disabled={erBusy}>
                                <FaFacebook size={18} className="mr-2" />
                                Logg inn med Facebook
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
                                        <FormSubmitButton fullWidth isLoading={status === "sending"} loadingText="Sender...">
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
                                        <FormSubmitButton fullWidth isLoading={status === "verifying"} loadingText="Verifiserer...">
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
    );
}
