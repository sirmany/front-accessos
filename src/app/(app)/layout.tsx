import { AppLayout } from "@/components/layout/AppLayout";
import React from "react";

export default function AuthenticatedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
