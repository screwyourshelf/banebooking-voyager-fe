import { Navigate, Outlet, useParams } from "react-router-dom";
import SlugProvider from "@/providers/SlugProvider";
import { config } from "@/config";

export default function SlugGate() {
    const { slug } = useParams<{ slug?: string }>();

    if (!slug) {
        const last = localStorage.getItem("slug");
        const target = last || config.defaultSlug;
        return <Navigate to={`/${target}`} replace />;
    }

    return (
        <SlugProvider slug={slug}>
            <Outlet />
        </SlugProvider>
    );
}
