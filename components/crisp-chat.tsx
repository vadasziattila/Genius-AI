"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

export const CrispChat = () => {
    useEffect(() => {
        Crisp.configure("5bbf8f50-1c63-44dd-8a3c-b91765618205");
    }, []);

    return null;
}