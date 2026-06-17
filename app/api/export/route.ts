import { buildExport } from '@/lib/export/json';

export const dynamic = 'force-dynamic';

export async function GET() {
  const backup = await buildExport();
  const filename = `backend-lab-backup-${new Date().toISOString().slice(0, 10)}.json`;
  return new Response(JSON.stringify(backup, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
