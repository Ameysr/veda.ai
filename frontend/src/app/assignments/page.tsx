import type { Metadata } from "next";
import HomePage from "../page";

export const metadata: Metadata = {
  title: "VedaAI | Assignments",
  description: "Manage and track all your class assignments in one place.",
};

export default function AssignmentsPage() {
  return <HomePage />;
}
