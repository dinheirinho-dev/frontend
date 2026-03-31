'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function usePro() {
    const { userId, isLoaded } = useAuth();
    const [isPro, setIsPro] = useState(false);
    const [planTier, setPlanTier] = useState('FREE');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded) return;

        if (!userId) {
            setIsLoading(false);
            return;
        }

        const fetchBillingStatus = async () => {
            try {
                const response = await fetch(`${API_URL}/billing/status`, {
                    headers: { 'x-clerk-id': userId },
                });

                if (response.ok) {
                    const data = await response.json();
                    setIsPro(data.subscription_status === 'ACTIVE');
                    setPlanTier(data.plan_tier);
                }
            } catch (error) {
                console.error('Erro ao buscar status da assinatura:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBillingStatus();
    }, [userId, isLoaded]);

    return { isPro, planTier, isLoading };
}
