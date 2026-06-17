import { Rocket } from 'lucide-react';

import { EmptyState } from '@/components/common/empty-state';
import { PageHeader } from '@/components/common/page-header';

export default function HomePage() {
  return (
    <div>
      <PageHeader
        eyebrow="Backend Architecture Lab"
        title="Your learning cockpit"
        description="The dashboard is coming online. Seed the database to populate concepts, labs, and case studies."
      />
      <EmptyState
        icon={Rocket}
        title="Dashboard under construction"
        description="Run pnpm db:push && pnpm db:seed, then this becomes your progress overview."
      />
    </div>
  );
}
