"use client";

/**
 * ClientSwitcher - Allows switching between different client databases
 */

import React, { useState, useRef, useEffect } from "react";
import { useFilterStore } from "@/stores/filterStore";
import { clsx } from "clsx";
import { clearCache } from "@/lib/cache/apiCache";

interface ClientSwitcherProps {
  disabled?: boolean;
  className?: string;
  variant?: "default" | "panel";
  showIcon?: boolean;
}

export const CLIENTS = [
  {
    id: "mausa",
    name: "Mausa",
    icon: "🏢",
    apiUrl:
      import.meta.env.NEXT_PUBLIC_API_URL_MAUSA ||
      "https://backend.mausa.org/insights/api",
  },
  {
    id: "amoud",
    name: "Amoud",
    icon: "🏛️",
    apiUrl:
      import.meta.env.NEXT_PUBLIC_API_URL_AMOUD ||
      "https://backend.amoud.org/insights/api",
  },
  {
    id: "afghan",
    name: "Afghan Relief",
    icon: "🏫",
    apiUrl:
      import.meta.env.NEXT_PUBLIC_API_URL_AFGHAN ||
      "https://afghan-relief.org/backend/insights/api",
  },
  {
    id: "rusard",
    name: "Rusard",
    icon: "🏥",
    apiUrl:
      import.meta.env.NEXT_PUBLIC_API_URL_RUSARD ||
      "https://rusard.org/backend/insights/api",
  },
];

export default function ClientSwitcher({
  disabled = false,
  className,
  variant = "default",
  showIcon = true,
}: ClientSwitcherProps) {
  const { selectedClient, setSelectedClient } = useFilterStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedClientData =
    CLIENTS.find((c) => c.id === selectedClient) || CLIENTS[0]!;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleChange = (clientId: string) => {
    if (clientId === selectedClient) {
      setIsOpen(false);
      return;
    }

    setIsSwitching(true);
    setSelectedClient(clientId);
    setIsOpen(false);

    // Clear ALL cache when switching clients (both new format and legacy)
    clearCache();

    // Also clear any legacy cache keys
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("api-cache-") || key.startsWith("insights_cache_")) {
        localStorage.removeItem(key);
      }
    });

    // Force page reload to fetch data from new API
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const isPanel = variant === "panel";

  return (
    <div className={clsx("relative", className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && !isSwitching && setIsOpen(!isOpen)}
        disabled={disabled || isSwitching}
        className={clsx(
          "w-full min-w-[160px] text-left flex items-center justify-between gap-2 transition-all duration-200",
          isPanel
            ? "px-3 py-2 text-xs bg-white border border-gray-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
            : "px-4 py-2.5 text-sm bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20",
          (disabled || isSwitching) &&
            "bg-gray-50 text-gray-500 cursor-not-allowed opacity-60",
          !disabled && !isSwitching && "cursor-pointer"
        )}
      >
        <div className="flex items-center gap-2">
          {isSwitching ? (
            <svg
              className="animate-spin h-4 w-4 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : showIcon ? (
            <span className={clsx(isPanel ? "text-sm" : "text-base")}>
              {selectedClientData.icon}
            </span>
          ) : null}
          <span className="text-gray-900">
            {isSwitching ? "Switching..." : selectedClientData.name}
          </span>
        </div>
        {!isSwitching && (
          <svg
            className={clsx(
              "w-4 h-4 transition-transform duration-200",
              isOpen && "transform rotate-180",
              isPanel ? "text-gray-400" : "text-gray-500"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && !isSwitching && (
        <div
          className={clsx(
            "absolute z-50 w-full bg-white border border-gray-200",
            isPanel ? "mt-1 rounded-md shadow-md" : "mt-2 rounded-lg shadow-lg"
          )}
        >
          <div className="py-1">
            {CLIENTS.map((client) => (
              <button
                key={client.id}
                type="button"
                onClick={() => handleChange(client.id)}
                className={clsx(
                  "w-full text-left flex items-center gap-2 transition-colors duration-150",
                  isPanel ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm",
                  selectedClient === client.id
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                {showIcon ? (
                  <span className={clsx(isPanel ? "text-sm" : "text-base")}>
                    {client.icon}
                  </span>
                ) : null}
                <span>{client.name}</span>
                {selectedClient === client.id && (
                  <svg
                    className="w-4 h-4 ml-auto text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Hook to get the current client's API URL
 */
export function useClientApiUrl(): string {
  const { selectedClient } = useFilterStore();

  const client = CLIENTS.find((c) => c.id === selectedClient);
  return (
    client?.apiUrl || import.meta.env.NEXT_PUBLIC_PHP_API_BASE_URL || "/php-api"
  );
}
