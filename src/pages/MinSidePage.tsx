import { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMineBookinger } from '../hooks/useMineBookinger.js';
import { useArrangement } from '../hooks/useArrangement.js';
import { useMeg } from '../hooks/useMeg.js';
import { SlugContext } from '../layouts/Layout.js';

import LoaderSkeleton from '@/components/LoaderSkeleton.js';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table.js';
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from '@/components/ui/tabs.js';
import { Card, CardContent } from '@/components/ui/card.js';
import { Button } from '@/components/ui/button.js';
import { FormField } from '@/components/FormField.js';
import { FieldWrapper } from '@/components/FieldWrapper.js';
import { formatDatoKort } from '../utils/datoUtils.js';

import SlettMegKnapp from '../components/SlettMegKnapp.js';

const MAX_LENGTH = 50;
const NAVN_REGEX = /^[\p{L}\d\s.@'_%+-]{2,}$/u;

export default function MinSidePage() {
    const { slug: slugFraParams } = useParams<{ slug: string }>();
    const slug = useContext(SlugContext) ?? slugFraParams;

    const [tab, setTab] = useState('profil');

    const { bruker, laster: lasterMeg, oppdaterVisningsnavn, slettMeg, lastNedEgenData } = useMeg(slug);
    const [visningsnavn, setVisningsnavn] = useState('');
    const [feil, setFeil] = useState<string | null>(null);

    const { bookinger, laster: loadingBookinger } = useMineBookinger(slug);
    const { arrangementer, isLoading: loadingArrangementer } = useArrangement(slug);
    const [brukEpostSomVisningsnavn, setBrukEpostSomVisningsnavn] = useState(false);

    useEffect(() => {
        if (bruker) {
            const navn = bruker.visningsnavn?.trim();
            if (!navn || navn === bruker.epost) {
                setBrukEpostSomVisningsnavn(true);
                setVisningsnavn('');
            } else {
                setVisningsnavn(navn);
                setBrukEpostSomVisningsnavn(false);
            }
        }
    }, [bruker]);

    const validerOgLagre = () => {
        if (!bruker) return;

        if (brukEpostSomVisningsnavn) {
            setFeil(null);
            oppdaterVisningsnavn(bruker.epost);
            return;
        }

        const navn = visningsnavn.trim();

        if (navn.length === 0) {
            setFeil('Visningsnavn kan ikke være tomt.');
            return;
        }

        if (navn.length < 3) {
            setFeil('Visningsnavn må være minst 3 tegn.');
            return;
        }

        if (!NAVN_REGEX.test(navn)) {
            setFeil('Visningsnavn inneholder ugyldige tegn.');
            return;
        }

        if (navn.length > MAX_LENGTH) {
            setFeil(`Visningsnavn kan ikke være lengre enn ${MAX_LENGTH} tegn.`);
            return;
        }

        setFeil(null);
        oppdaterVisningsnavn(navn);
    };

    const kanLagre = bruker
        ? brukEpostSomVisningsnavn
            ? bruker.visningsnavn !== bruker.epost
            : visningsnavn.trim() !== bruker.visningsnavn
        : false;

    return (
        <div className="max-w-screen-md mx-auto px-2 py-4">
            <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="profil">Min profil</TabsTrigger>
                    <TabsTrigger value="bookinger">Mine bookinger</TabsTrigger>
                    <TabsTrigger value="arrangementer">Arrangementer</TabsTrigger>
                </TabsList>

                <TabsContent value="profil">
                    <Card>
                        <CardContent className="p-4 space-y-6">
                            {lasterMeg || !bruker ? (
                                <LoaderSkeleton />
                            ) : (
                                <>
                                    <form
                                        className="space-y-4"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            validerOgLagre();
                                        }}
                                    >
                                        <FormField
                                            id="visningsnavn"
                                            label="Visningsnavn"
                                            value={brukEpostSomVisningsnavn ? '' : visningsnavn}
                                            maxLength={MAX_LENGTH}
                                            placeholder={bruker?.epost || 'f.eks. Ola Nordmann'}
                                            onChange={(e) => {
                                                setVisningsnavn(e.target.value);
                                                setBrukEpostSomVisningsnavn(false);
                                            }}
                                            disabled={brukEpostSomVisningsnavn}
                                            error={feil}
                                            helpText="Navnet vises i grensesnittet, og settes automatisk til e-post ved første innlogging. Du kan endre det her. Eller velg å bruke e-post i stedet."
                                        />

                                        <label className="flex items-center space-x-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={brukEpostSomVisningsnavn}
                                                onChange={(e) => {
                                                    setBrukEpostSomVisningsnavn(e.target.checked);
                                                    if (e.target.checked) setVisningsnavn('');
                                                }}
                                            />
                                            <span>Bruk e-post som visningsnavn</span>
                                        </label>

                                        <Button type="submit" size="sm" disabled={!kanLagre}>
                                            Lagre
                                        </Button>
                                    </form>

                                    <div className="pt-4 border-t mt-4 space-y-4">
                                        <FieldWrapper id="epost" label="Brukernavn / ID">
                                            <p className="text-sm text-foreground">{bruker.epost}</p>
                                        </FieldWrapper>

                                        <FieldWrapper
                                            id="rolle"
                                            label="Rolle (i klubben)"
                                            helpText="Roller tildeles av klubbens administrator og kan ikke endres manuelt."
                                        >
                                            <p className="text-sm text-foreground">{bruker.roller.join(', ')}</p>
                                        </FieldWrapper>
                                    </div>

                                    <div className="pt-4 border-t mt-4 space-y-4">
                                        <FieldWrapper
                                            id="vilkaar"
                                            label="Vilkår for bruk"
                                            helpText="Du aksepterer vilkårene automatisk ved første innlogging."
                                        >
                                            {bruker.vilkaarAkseptertDato ? (
                                                <p className="text-sm text-foreground">
                                                    Akseptert {formatDatoKort(bruker.vilkaarAkseptertDato)}{' '}
                                                    {bruker.vilkaarVersjon && `(versjon ${bruker.vilkaarVersjon})`}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-muted-foreground italic">
                                                    Ikke registrert
                                                </p>
                                            )}
                                            <p className="text-sm mt-1">
                                                <a
                                                    href={`${import.meta.env.BASE_URL}${slug}/vilkaar`}
                                                    className="underline text-primary hover:text-primary/80"
                                                >
                                                    Les vilkårene
                                                </a>
                                            </p>
                                        </FieldWrapper>

                                        <FieldWrapper
                                            id="last-ned-data"
                                            label="Last ned dine data"
                                            helpText="Du kan laste ned alle registrerte opplysninger og bookinger i JSON-format."
                                        >
                                            <Button onClick={lastNedEgenData} size="sm" variant="outline">
                                                Last ned data
                                            </Button>
                                        </FieldWrapper>

                                        <FieldWrapper
                                            id="slett-bruker"
                                            label="Slett bruker"
                                            helpText="Dette sletter brukeren din og all tilknyttet data permanent. Dette kan ikke angres."
                                        >
                                            <SlettMegKnapp slettMeg={slettMeg} />
                                        </FieldWrapper>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="bookinger">
                    <Card>
                        <CardContent className="p-4 space-y-4">
                            {loadingBookinger ? (
                                <LoaderSkeleton />
                            ) : bookinger.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">
                                    Du har ingen kommende bookinger.
                                </p>
                            ) : (
                                <div className="overflow-auto max-h-[60vh] border-b border-x rounded-b-md">
                                    <Table className="text-sm">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Dato</TableHead>
                                                <TableHead>Tid</TableHead>
                                                <TableHead>Bane</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {bookinger.map((b, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell>{formatDatoKort(b.dato)}</TableCell>
                                                    <TableCell>{b.startTid}–{b.sluttTid}</TableCell>
                                                    <TableCell>{b.baneNavn}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="arrangementer">
                    <Card>
                        <CardContent className="p-4 space-y-4">
                            {loadingArrangementer ? (
                                <LoaderSkeleton />
                            ) : arrangementer.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">
                                    Ingen arrangementer registrert.
                                </p>
                            ) : (
                                <div className="overflow-auto max-h-[60vh] border-b border-x rounded-b-md">
                                    <Table className="text-sm">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-1/3">Hva</TableHead>
                                                <TableHead className="w-1/3">Når</TableHead>
                                                <TableHead className="w-1/3">Om</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {arrangementer.map((arr) => {
                                                const start = new Date(arr.startDato);
                                                const today = new Date();
                                                const dagerIgjen = Math.max(
                                                    0,
                                                    Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                                                );

                                                return (
                                                    <TableRow key={arr.id}>
                                                        <TableCell className="whitespace-normal break-words">
                                                            <div className="font-medium">{arr.tittel}</div>
                                                            {arr.beskrivelse && (
                                                                <div className="text-muted-foreground text-xs whitespace-normal break-words">
                                                                    {arr.beskrivelse}
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="whitespace-normal break-words text-sm">
                                                            {arr.startDato === arr.sluttDato
                                                                ? formatDatoKort(arr.startDato)
                                                                : `${formatDatoKort(arr.startDato)} - ${formatDatoKort(arr.sluttDato)}`}
                                                        </TableCell>
                                                        <TableCell className="whitespace-nowrap">
                                                            {dagerIgjen} {dagerIgjen === 1 ? 'dag' : 'dager'}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
