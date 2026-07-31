import LabsListing from "@/components/labs/LabsListing";
import { getAllLabs } from "@/lib/labs";

export const metadata = {
  title: "Labs",
  description: "Prototype playgrounds and interactive data experiments.",
};

export default function LabsPage() {
  const labs = getAllLabs();
  return <LabsListing labs={labs} />;
}
