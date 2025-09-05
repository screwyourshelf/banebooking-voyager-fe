import { Link, useParams } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu.js';

import { Button } from '@/components/ui/button.js';
import { Input } from '@/components/ui/input.js';

import {
    FaUser, FaFacebook, FaSignInAlt, FaSignOutAlt,
    FaCalendarAlt, FaUserCircle, FaWrench, FaBars
} from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

import { useAuth } from '../hooks/useAuth.js';
import { useLogin } from '../hooks/useLogin.js';
import { useKlubb } from '../hooks/useKlubb.js';
import { useBruker } from '../hooks/useBruker.js';
import NavbarBrandMedKlubb from './NavbarBrandMedKlubb.js';
import Spinner from './ui/spinner.js';
import LoaderSkeleton from './LoaderSkeleton.js';

export default function Navbar() {
    const { slug } = useParams<{ slug: string }>();
    const { data: klubb, isLoading } = useKlubb(slug);
    const { currentUser, signOut } = useAuth();
    const { bruker } = useBruker(slug);

    const {
        email,
        setEmail,
        otp,
        setOtp,
        status,
        step,
        handleGoogleLogin,
        handleFacebookLogin,
        sendOtp,
        verifyOtp
    } = useLogin(slug);

    const erAdmin = bruker?.roller.includes('KlubbAdmin') ?? false;
    const harUtvidetTilgang = bruker?.roller.includes('Utvidet') ?? false;

    return (
        <div className="max-w-screen-lg mx-auto flex justify-between items-center px-2 py-1">
            <NavbarBrandMedKlubb
                slug={slug}
                klubbnavn={isLoading ? <LoaderSkeleton /> : klubb?.navn ?? "Ukjent klubb"}
            />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className="h-8 px-2 flex items-center gap-2 sm:text-xs sm:px-2"
                    >
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
                            {slug && (
                                <>
                                    <DropdownMenuItem asChild>
                                        <Link to={`/${slug}/minside`}>
                                            <FaUserCircle className="mr-2" />Min side
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to={`/${slug}/kommendeArrangement`}>
                                            <FaCalendarAlt className="mr-2" />Kommende arrangementer
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to={`/${slug}`}>
                                            <FaCalendarAlt className="mr-2" />Book bane
                                        </Link>
                                    </DropdownMenuItem>                               
                                </>
                            )}

                            {(erAdmin || harUtvidetTilgang) && (
                                <>
                                    <DropdownMenuSeparator />
                                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                                        {erAdmin ? 'Admin' : 'Utvidet tilgang'}
                                    </div>

                                    {erAdmin && (
                                        <>
                                            <DropdownMenuItem asChild>
                                                <Link to={`/${slug}/admin/klubb`}>
                                                    <FaWrench className="mr-2" />Klubb
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link to={`/${slug}/admin/baner`}>
                                                    <FaWrench className="mr-2" />Baner
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link to={`/${slug}/admin/brukere`}>
                                                    <FaWrench className="mr-2" />Brukere
                                                </Link>
                                            </DropdownMenuItem>
                                        </>
                                    )}

                                    <DropdownMenuItem asChild>
                                        <Link to={`/${slug}/arrangement`}>
                                            <FaCalendarAlt className="mr-2" />Arrangement
                                        </Link>
                                    </DropdownMenuItem>
                                </>
                            )}

                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => signOut(slug)}>
                                <FaSignOutAlt className="mr-2" />Logg ut
                            </DropdownMenuItem>
                        </>
                    ) : (
                        <>
                            <p className="text-xs text-gray-500 px-2 pb-1">
                                Ved å logge inn samtykker du til våre{' '}
                                <Link to={`/${slug}/vilkaar`} className="underline">
                                    vilkår
                                </Link>.
                            </p>
                            <DropdownMenuItem onClick={handleGoogleLogin} disabled={status === 'sending'}>
                                <FcGoogle size={18} className="mr-2" />Logg inn med Google
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={handleFacebookLogin} disabled={status === 'sending'}>
                                <FaFacebook size={18} className="mr-2" />Logg inn med Facebook
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {step === 'input' && (
                                <form onSubmit={sendOtp} className="space-y-1 px-2 w-full">
                                    <label htmlFor="email" className="text-xs text-gray-600">
                                        Logg inn med e-post
                                    </label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="din@epost.no"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key.length === 1) e.stopPropagation();
                                        }}
                                        required
                                        className="text-sm h-8"
                                    />
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={status === 'sending'}
                                        className="w-full h-8 text-sm"
                                    >
                                        {status === 'sending' ? (
                                            <>
                                                <Spinner />
                                                <span className="ml-2">Sender...</span>
                                            </>
                                        ) : (
                                            'Send kode'
                                        )}
                                    </Button>
                                </form>
                            )}

                            {step === 'verify' && (
                                <form onSubmit={verifyOtp} className="space-y-1 px-2 w-full">
                                    <label htmlFor="otp" className="text-xs text-gray-600">
                                        Skriv inn koden fra e-posten
                                    </label>
                                    <Input
                                        id="otp"
                                        type="text"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key.length === 1) e.stopPropagation();
                                        }}
                                        required
                                        className="text-sm h-8"
                                    />
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={status === 'verifying'}
                                        className="w-full h-8 text-sm"
                                    >
                                        {status === 'verifying' ? (
                                            <>
                                                <Spinner />
                                                <span className="ml-2">Verifiserer...</span>
                                            </>
                                        ) : (
                                            'Verifiser kode'
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
