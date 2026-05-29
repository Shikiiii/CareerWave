import { EditJobPage } from "@/components/employer/edit-job-page";

export default async function EmployerEditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditJobPage jobId={id} />;
}
