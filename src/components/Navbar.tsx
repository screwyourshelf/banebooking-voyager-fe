import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu.js";
import { Button } from "@/components/ui/button.js";
import { FormField } from "@/components/FormField.js";

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

import { useAuth } from "../hooks/useAuth.js";
import { useLogin } from "../hooks/useLogin.js";
import { useKlubb } from "../hooks/useKlubb.js";
import { useBruker } from "../hooks/useBruker.js";
import NavbarBrandMedKlubb from "./NavbarBrandMedKlubb.js";
import Spinner from "./ui/spinner.js";
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
                                <Link to={`/${slug}/kommendeArrangement`}>
                                    <FaCalendarAlt className="mr-2" />
                                    Kommende arrangementer
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
                                <form noValidate className="space-y-2 px-2 w-full" onSubmit={submitSendOtp}>
                                    <FormField
                                        id="email"
                                        label="Logg inn med e-post"
                                        value={email}
                                        error={feilEmail}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (feilEmail) setFeilEmail(null);
                                        }}
                                        inputProps={emailInputProps}
                                    />

                                    <Button type="submit" size="sm" disabled={status === "sending"} className="w-full h-8 text-sm">
                                        {status === "sending" ? (
                                            <>
                                                <Spinner />
                                                <span className="ml-2">Sender...</span>
                                            </>
                                        ) : (
                                            "Send kode"
                                        )}
                                    </Button>
                                </form>
                            ) : (
                                <form noValidate className="space-y-2 px-2 w-full" onSubmit={submitVerifyOtp}>
                                    <FormField
                                        id="otp"
                                        label="Skriv inn koden fra e-posten"
                                        value={otp}
                                        error={feilOtp}
                                        onChange={(e) => {
                                            const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                                            setOtp(v);
                                            if (feilOtp) setFeilOtp(null);
                                        }}
                                        inputProps={otpInputProps}
                                    />

                                    <Button type="submit" size="sm" disabled={status === "verifying"} className="w-full h-8 text-sm">
                                        {status === "verifying" ? (
                                            <>
                                                <Spinner />
                                                <span className="ml-2">Verifiserer...</span>
                                            </>
                                        ) : (
                                            "Verifiser kode"
                                        )}
                                    </Button>
                                </form>
                            )}
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
