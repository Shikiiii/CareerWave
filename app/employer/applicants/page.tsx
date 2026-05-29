import { ApplicantManagement } from "@/components/employer/applicant-management";

export const metadata = {
  title: "Applicants | CareerWave",
  description: "Review and manage job applications for your CareerWave listings.",
};

export default function EmployerApplicantsPage() {
  return <ApplicantManagement />;
}
