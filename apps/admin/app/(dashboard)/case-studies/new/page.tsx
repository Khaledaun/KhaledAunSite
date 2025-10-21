import CaseStudyForm from '@/components/CaseStudyForm';

export default function NewCaseStudyPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">New Case Study</h1>
        <p className="mt-2 text-gray-600">
          Document a successful case with Problem → Strategy → Outcome framework
        </p>
      </div>

      <CaseStudyForm mode="create" />
    </div>
  );
}

