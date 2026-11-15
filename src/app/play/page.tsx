import type { Metadata } from "next";
import { LaunchExperience } from "@/components/loading/LaunchExperience";
export const metadata: Metadata = { title: "Launch experience", description: "Enter the ELYSIUM IV three-Sol Mars rover exploration." };
export default function PlayPage() { return <LaunchExperience />; }
