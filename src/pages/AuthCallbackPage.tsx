import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallbackPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const slug = localStorage.getItem('slug');
        const redirectTo = slug ? `/${slug}` : '/';
        navigate(redirectTo, { replace: true });
    }, [navigate]);

    return <div className="p-4 text-center">Logger inn …</div>;
}
